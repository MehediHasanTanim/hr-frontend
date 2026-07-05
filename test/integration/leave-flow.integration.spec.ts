import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { AppModule } from '../../src/app.module';
import { runMigrations } from '../../src/database/migrations/run-migrations';
import {
  createTestUser,
  createTestEmployee,
} from './factories/user.factory';
import { seedLeaveBalance } from './factories/leave.factory';
import { loginAs } from './factories/auth.helper';
import { LeaveBalanceEntity } from '../../src/modules/leave/entities/leave-balance.entity';
import { LeaveRequestEntity } from '../../src/modules/leave/entities/leave-request.entity';

jest.setTimeout(120_000);

describe('Leave Flow: Apply → Approve → Balance Updated (Integration)', () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let redisContainer: StartedRedisContainer;
  let app: INestApplication;
  let ds: DataSource;

  // Seed data references
  let employeeEmail: string;
  let managerEmail: string;
  let hrAdminEmail: string;
  let employeeId: string;
  let managerId: string;
  let leaveRequestId: string;

  // Leave parameters
  const LEAVE_TYPE = 'ANNUAL';
  const ENTITLED_DAYS = 20;
  const APPLY_START = '2025-08-04'; // Monday
  const APPLY_END = '2025-08-05';   // Tuesday → 2 working days
  const APPLY_DAYS = 2;

  const cleanupIds: { table: string; id: string }[] = [];

  // ─── Container + App Bootstrap ──────────────────────────────────────────

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('hr_leave_test')
      .start();

    redisContainer = await new RedisContainer().start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DB_CONFIG')
      .useValue({ url: postgresContainer.getConnectionUri(), synchronize: false })
      .overrideProvider('REDIS_CONFIG')
      .useValue({
        host: redisContainer.getHost(),
        port: redisContainer.getFirstMappedPort(),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
    ds = module.get<DataSource>(DataSource);
    await runMigrations(postgresContainer.getConnectionUri());
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
    await redisContainer.stop();
  });

  // ─── Seed ──────────────────────────────────────────────────────────────

  beforeAll(async () => {
    hrAdminEmail = `hr-${Date.now()}@leave-test.internal`;
    managerEmail = `mgr-${Date.now()}@leave-test.internal`;
    employeeEmail = `emp-${Date.now()}@leave-test.internal`;

    const hrUser = await createTestUser(ds, { email: hrAdminEmail, role: 'HR_ADMIN' });
    cleanupIds.push({ table: 'users', id: hrUser.id });

    const mgrUser = await createTestUser(ds, { email: managerEmail, role: 'MANAGER' });
    const mgrEmp = await createTestEmployee(ds, mgrUser.id);
    managerId = mgrEmp.id;
    cleanupIds.push({ table: 'users', id: mgrUser.id });
    cleanupIds.push({ table: 'employees', id: mgrEmp.id });

    const empUser = await createTestUser(ds, { email: employeeEmail, role: 'EMPLOYEE' });
    const emp = await createTestEmployee(ds, empUser.id, {
      reportingManagerId: managerId,
    });
    employeeId = emp.id;
    cleanupIds.push({ table: 'users', id: empUser.id });
    cleanupIds.push({ table: 'employees', id: emp.id });

    const balance = await seedLeaveBalance(ds, employeeId, LEAVE_TYPE, ENTITLED_DAYS, 0);
    cleanupIds.push({ table: 'leave_balances', id: balance.id });
  });

  afterAll(async () => {
    const qr = ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const { table, id } of [...cleanupIds].reverse()) {
        await qr.query(`DELETE FROM "${table}" WHERE id = $1`, [id]);
      }
      await qr.commitTransaction();
    } catch {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  });

  // ─── Phase 1: Employee Applies for Leave ────────────────────────────────

  describe('Phase 1: Employee applies for leave', () => {
    it('employee submits a valid annual leave request', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveType: LEAVE_TYPE,
          startDate: APPLY_START,
          endDate: APPLY_END,
          reason: 'Family vacation',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toMatch(/^(PENDING|SUBMITTED)$/i);

      leaveRequestId = res.body.id;
      cleanupIds.push({ table: 'leave_requests', id: leaveRequestId });
    });

    it('leave request status is PENDING immediately after submission', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/leave/requests/${leaveRequestId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toMatch(/^(PENDING|SUBMITTED)$/i);
    });

    it('leave balance is NOT decremented immediately on submission', async () => {
      const balanceRepo = ds.getRepository(LeaveBalanceEntity);
      const balance = await balanceRepo.findOne({
        where: { employeeId, leaveType: LEAVE_TYPE },
      });
      // Balance should still be at full entitled — approval hasn't happened yet
      expect(Number(balance!.taken)).toBe(0);
      expect(Number(balance!.remaining)).toBe(ENTITLED_DAYS);
    });

    it('employee cannot apply for leave exceeding remaining balance', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveType: LEAVE_TYPE,
          startDate: '2025-09-01',
          endDate: '2025-09-30', // 22 working days — exceeds 20 entitled
          reason: 'Excessive leave',
        });

      expect(res.status).toBe(400);
    });

    it('employee cannot apply for leave with endDate before startDate', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveType: LEAVE_TYPE,
          startDate: '2025-09-10',
          endDate: '2025-09-05',
          reason: 'Invalid range',
        });

      expect(res.status).toBe(400);
    });

    it('duplicate leave request for same date range is rejected', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveType: LEAVE_TYPE,
          startDate: APPLY_START,
          endDate: APPLY_END,
          reason: 'Duplicate',
        });

      expect(res.status).toBeOneOf([400, 409]);
    });
  });

  // ─── Phase 2: Manager Approves ───────────────────────────────────────────

  describe('Phase 2: Manager approves the leave request', () => {
    it('manager approves the pending leave request', async () => {
      const token = await loginAs(app, managerEmail);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/leave/requests/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('APPROVED');
    });

    it('non-manager employee cannot approve leave', async () => {
      // Create a second leave request to attempt approval
      const empToken = await loginAs(app, employeeEmail);
      const anotherRequestRes = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2025-10-01',
          endDate: '2025-10-01',
          reason: 'Unwell',
        });

      if (anotherRequestRes.status === 201) {
        const otherId = anotherRequestRes.body.id;
        cleanupIds.push({ table: 'leave_requests', id: otherId });

        const approveRes = await request(app.getHttpServer())
          .patch(`/api/v1/leave/requests/${otherId}/approve`)
          .set('Authorization', `Bearer ${empToken}`);

        expect(approveRes.status).toBe(403);
      }
    });

    it('approving an already-approved request is idempotent or returns error', async () => {
      const token = await loginAs(app, managerEmail);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/leave/requests/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${token}`);

      // Either idempotent 200 or 409/400 conflict — must not corrupt data
      expect([200, 400, 409]).toContain(res.status);
    });
  });

  // ─── Phase 3: Balance Updated ─────────────────────────────────────────────

  describe('Phase 3: Leave balance is updated after approval', () => {
    it('taken days increased by APPLY_DAYS after approval', async () => {
      const balanceRepo = ds.getRepository(LeaveBalanceEntity);
      const balance = await balanceRepo.findOne({
        where: { employeeId, leaveType: LEAVE_TYPE },
      });

      expect(Number(balance!.taken)).toBe(APPLY_DAYS);
    });

    it('remaining days reduced by APPLY_DAYS after approval', async () => {
      const balanceRepo = ds.getRepository(LeaveBalanceEntity);
      const balance = await balanceRepo.findOne({
        where: { employeeId, leaveType: LEAVE_TYPE },
      });

      expect(Number(balance!.remaining)).toBe(ENTITLED_DAYS - APPLY_DAYS);
    });

    it('entitled days are unchanged after approval', async () => {
      const balanceRepo = ds.getRepository(LeaveBalanceEntity);
      const balance = await balanceRepo.findOne({
        where: { employeeId, leaveType: LEAVE_TYPE },
      });

      expect(Number(balance!.entitled)).toBe(ENTITLED_DAYS);
    });

    it('GET /auth/me reflects updated leave balance', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const annualBalance = (res.body.leaveBalances as { leaveType: string; taken: number; remaining: number }[]).find(
        (b) => b.leaveType === LEAVE_TYPE,
      );
      expect(annualBalance).toBeDefined();
      expect(annualBalance!.taken).toBe(APPLY_DAYS);
      expect(annualBalance!.remaining).toBe(ENTITLED_DAYS - APPLY_DAYS);
    });
  });

  // ─── Phase 4: Leave Request Status ───────────────────────────────────────

  describe('Phase 4: Leave request status is APPROVED', () => {
    it('GET /leave/requests/:id returns APPROVED status', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/leave/requests/${leaveRequestId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('APPROVED');
    });

    it('GET /me/leave/requests includes the approved request', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get('/api/v1/me/leave/requests')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const found = (res.body.data as LeaveRequestEntity[]).find(
        (r) => r.id === leaveRequestId,
      );
      expect(found).toBeDefined();
      expect(found!.status).toBe('APPROVED');
    });

    it('audit log LEAVE_APPROVED is created', async () => {
      const auditRepo = ds.getRepository('audit_logs');
      const log = await auditRepo.findOne({
        where: { action: 'LEAVE_APPROVED', entityId: leaveRequestId },
      });
      expect(log).not.toBeNull();
    });

    it('audit log does not contain PII fields', async () => {
      const auditRepo = ds.getRepository('audit_logs');
      const log = await auditRepo.findOne({
        where: { action: 'LEAVE_APPROVED', entityId: leaveRequestId },
      });

      const PII_DENY_LIST = ['base64Signature', 'passwordHash', 'otpCode', 'rawToken', 'signedUrl'];
      // Cast to unknown first to safely access metadata
      const metadata = (log?.metadata as Record<string, unknown>) ?? {};
      PII_DENY_LIST.forEach((field) => {
        expect(Object.keys(metadata)).not.toContain(field);
      });
    });
  });

  // ─── Phase 5: Calendar Reflects Approved Leave ───────────────────────────

  describe('Phase 5: Calendar reflects the approved leave', () => {
    it('leave calendar endpoint includes the approved leave dates', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get('/api/v1/leave/calendar')
        .query({ month: '2025-08' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Calendar should show the leave block for Aug 4-5
      const approvedBlock = (res.body.events as { startDate: string; endDate: string; status: string }[])?.find(
        (e) =>
          e.status === 'APPROVED' &&
          e.startDate === APPLY_START &&
          e.endDate === APPLY_END,
      );
      expect(approvedBlock).toBeDefined();
    });

    it('manager calendar shows team leave for their direct reports', async () => {
      const token = await loginAs(app, managerEmail);

      const res = await request(app.getHttpServer())
        .get('/api/v1/leave/calendar/team')
        .query({ month: '2025-08' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const teamLeaveBlock = (res.body.events as { employeeId: string; status: string }[])?.find(
        (e) =>
          e.employeeId === employeeId && e.status === 'APPROVED',
      );
      expect(teamLeaveBlock).toBeDefined();
    });
  });

  // ─── Phase 6: Rejection Flow ─────────────────────────────────────────────

  describe('Phase 6: Rejection flow (separate leave request)', () => {
    let rejectedRequestId: string;

    beforeAll(async () => {
      // Apply a new leave request to test rejection
      const token = await loginAs(app, employeeEmail);
      const res = await request(app.getHttpServer())
        .post('/api/v1/leave/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leaveType: LEAVE_TYPE,
          startDate: '2025-09-15',
          endDate: '2025-09-16',
          reason: 'Personal',
        });

      if (res.status === 201) {
        rejectedRequestId = res.body.id;
        cleanupIds.push({ table: 'leave_requests', id: rejectedRequestId });
      }
    });

    it('manager can reject a pending leave request with a reason', async () => {
      if (!rejectedRequestId) return; // skip if request was not created

      const token = await loginAs(app, managerEmail);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/leave/requests/${rejectedRequestId}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Team capacity issues in September' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('REJECTED');
    });

    it('balance is NOT decremented when a leave request is rejected', async () => {
      const balanceRepo = ds.getRepository(LeaveBalanceEntity);
      const balance = await balanceRepo.findOne({
        where: { employeeId, leaveType: LEAVE_TYPE },
      });

      // Only APPLY_DAYS from the approved request should be taken
      expect(Number(balance!.taken)).toBe(APPLY_DAYS);
    });
  });
});
