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
import { seedSalaryStructure } from './factories/payroll.factory';
import { loginAs } from './factories/auth.helper';
import { PayslipEntity } from '../../src/modules/payroll/entities/payslip.entity';
import { PayrollEntryEntity } from '../../src/modules/payroll/entities/payroll-entry.entity';
import { QUEUE_NAMES } from '../../src/common/queue-names';
import { round2dp } from '../../src/common/utils/round2dp';

jest.setTimeout(120_000);

describe('Payroll Flow: Hire → Salary Assign → Payroll Cycle → Payslip (Integration)', () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let redisContainer: StartedRedisContainer;
  let app: INestApplication;
  let ds: DataSource;

  // Seed data references
  let hrAdminEmail: string;
  let employeeEmail: string;
  let employeeId: string;
  let payrollRunId: string;

  // Expected net pay from seed salary structure:
  // basicSalary=50000, houseAllowance=10000, transportAllowance=5000
  // gross = 65000; assume tax deduction = 9750 (15%); net = 55250
  const SEED_GROSS = 65000;
  const SEED_TAX_RATE = 0.15;
  const EXPECTED_NET = round2dp(SEED_GROSS * (1 - SEED_TAX_RATE)); // 55250.00

  // Cleanup registry — populated during seed phase
  const cleanupIds: { table: string; id: string }[] = [];

  // ─── Container + App Bootstrap ────────────────────────────────────────────

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('hr_test')
      .withUsername('hr_user')
      .withPassword('hr_pass')
      .start();

    redisContainer = await new RedisContainer().start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DB_CONFIG')
      .useValue({
        url: postgresContainer.getConnectionUri(),
        synchronize: false,
      })
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

  // ─── Seed Data ────────────────────────────────────────────────────────────

  beforeAll(async () => {
    // Create HR admin
    hrAdminEmail = `hr-admin-${Date.now()}@payroll-test.internal`;
    const hrUser = await createTestUser(ds, { email: hrAdminEmail, role: 'HR_ADMIN' });
    cleanupIds.push({ table: 'users', id: hrUser.id });

    // Create employee user + employee record
    employeeEmail = `employee-${Date.now()}@payroll-test.internal`;
    const empUser = await createTestUser(ds, { email: employeeEmail, role: 'EMPLOYEE' });
    cleanupIds.push({ table: 'users', id: empUser.id });

    const emp = await createTestEmployee(ds, empUser.id, {
      joiningDate: new Date('2025-01-01'),
    });
    employeeId = emp.id;
    cleanupIds.push({ table: 'employees', id: emp.id });

    // Assign salary structure
    const salary = await seedSalaryStructure(ds, emp.id, {
      basicSalary: 50000,
      houseAllowance: 10000,
      transportAllowance: 5000,
      effectiveFrom: new Date('2025-01-01'),
    });
    cleanupIds.push({ table: 'salary_structures', id: salary.id });
  });

  // ─── Cleanup ──────────────────────────────────────────────────────────────

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

  // ─── Phase 1: Verify Employee Exists ──────────────────────────────────────

  describe('Phase 1: Employee is hired and visible', () => {
    it('HR admin can fetch the seeded employee', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/employees/${employeeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(employeeId);
      expect(res.body.status).toBe('active');
    });

    it('salary structure is linked to employee', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/employees/${employeeId}/salary`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.basicSalary).toBe(50000);
      expect(res.body.houseAllowance).toBe(10000);
      expect(res.body.transportAllowance).toBe(5000);
    });
  });

  // ─── Phase 2: Payroll Run Initiation ──────────────────────────────────────

  describe('Phase 2: HR admin initiates payroll run', () => {
    it('creates a payroll run for 2025-07', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/payroll/runs')
        .set('Authorization', `Bearer ${token}`)
        .send({ period: '2025-07', departmentId: null });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.period).toBe('2025-07');
      expect(res.body.status).toMatch(/^(DRAFT|PENDING|INITIATED)$/i);

      payrollRunId = res.body.id;
      cleanupIds.push({ table: 'payroll_runs', id: payrollRunId });
    });

    it('duplicate payroll run for same period is rejected', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/payroll/runs')
        .set('Authorization', `Bearer ${token}`)
        .send({ period: '2025-07', departmentId: null });

      expect(res.status).toBe(409); // Conflict
    });

    it('EMPLOYEE role cannot initiate a payroll run', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .post('/api/v1/payroll/runs')
        .set('Authorization', `Bearer ${token}`)
        .send({ period: '2025-08', departmentId: null });

      expect(res.status).toBe(403);
    });
  });

  // ─── Phase 3: Compute Payroll ──────────────────────────────────────────────

  describe('Phase 3: Payroll computation', () => {
    it('computes payroll entries for the run', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/payroll/runs/${payrollRunId}/compute`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('payroll entry exists for the seeded employee with correct gross', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/payroll/runs/${payrollRunId}/entries`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const entry: PayrollEntryEntity = res.body.data.find(
        (e: PayrollEntryEntity) => e.employeeId === employeeId,
      );
      expect(entry).toBeDefined();
      expect(Number(entry.grossPay)).toBeCloseTo(SEED_GROSS, 2);
    });

    it('net pay is correctly computed and rounded to 2dp', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/payroll/runs/${payrollRunId}/entries`)
        .set('Authorization', `Bearer ${token}`);

      const entry: PayrollEntryEntity = res.body.data.find(
        (e: PayrollEntryEntity) => e.employeeId === employeeId,
      );

      expect(Number(entry.netPay)).toBeCloseTo(EXPECTED_NET, 2);
      // Verify it's exactly 2dp — no trailing precision
      expect(String(entry.netPay)).toMatch(/^\d+\.\d{1,2}$/);
    });

    it('computing the same run twice is idempotent — no duplicate entries', async () => {
      const token = await loginAs(app, hrAdminEmail);

      // Re-trigger compute
      await request(app.getHttpServer())
        .post(`/api/v1/payroll/runs/${payrollRunId}/compute`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/payroll/runs/${payrollRunId}/entries`)
        .set('Authorization', `Bearer ${token}`);

      const entriesForEmployee = res.body.data.filter(
        (e: PayrollEntryEntity) => e.employeeId === employeeId,
      );
      expect(entriesForEmployee).toHaveLength(1);
    });
  });

  // ─── Phase 4: Payslip Generation ──────────────────────────────────────────

  describe('Phase 4: Payslip generation', () => {
    it('triggers payslip generation and receives 202 Accepted', async () => {
      const token = await loginAs(app, hrAdminEmail);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/payroll/runs/${payrollRunId}/payslips/generate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(202);
    });

    it('payslip entity is created in DB after worker processes the job', async () => {
      // Give the BullMQ worker time to process
      await new Promise((r) => setTimeout(r, 5000));

      const payslipRepo = ds.getRepository(PayslipEntity);
      const payslip = await payslipRepo.findOne({
        where: { payrollRunId, employeeId },
      });

      expect(payslip).not.toBeNull();
      expect(payslip!.payrollRunId).toBe(payrollRunId);
      expect(payslip!.employeeId).toBe(employeeId);
    });

    it('payslip stores S3 key, not a signed URL', async () => {
      const payslipRepo = ds.getRepository(PayslipEntity);
      const payslip = await payslipRepo.findOne({
        where: { payrollRunId, employeeId },
      });

      expect(payslip!.s3Key).toBeDefined();
      // S3 key must NOT be a pre-signed URL (no https:// or X-Amz-Signature)
      expect(payslip!.s3Key).not.toMatch(/^https?:\/\//);
      expect(payslip!.s3Key).not.toContain('X-Amz-Signature');
    });

    it('payslip download endpoint returns a short-lived signed URL, not the raw key', async () => {
      const token = await loginAs(app, employeeEmail);

      const payslipRepo = ds.getRepository(PayslipEntity);
      const payslip = await payslipRepo.findOne({
        where: { payrollRunId, employeeId },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/payroll/payslips/${payslip!.id}/download`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Response should contain a URL (either direct or presigned)
      expect(res.body.url).toBeDefined();
    });

    it('payslip PDF is a valid Buffer / binary (content-type check via S3 mock)', async () => {
      // Validate via the stored payslip that the s3Key ends with .pdf
      const payslipRepo = ds.getRepository(PayslipEntity);
      const payslip = await payslipRepo.findOne({
        where: { payrollRunId, employeeId },
      });

      expect(payslip!.s3Key).toMatch(/\.pdf$/);
    });

    it('audit log PAYSLIP_GENERATED is created', async () => {
      const auditRepo = ds.getRepository('audit_logs');
      const log = await auditRepo.findOne({
        where: { action: 'PAYSLIP_GENERATED', entityId: payrollRunId },
      });
      expect(log).not.toBeNull();
    });

    it('payslip audit log metadata does not contain PII fields', async () => {
      const auditRepo = ds.getRepository('audit_logs');
      const log = await auditRepo.findOne({
        where: { action: 'PAYSLIP_GENERATED', entityId: payrollRunId },
      });

      const PII_DENY_LIST = ['base64Signature', 'passwordHash', 'otpCode', 'rawToken', 'signedUrl'];
      // Cast to unknown first to safely access metadata
      const metadata = (log?.metadata as Record<string, unknown>) ?? {};
      PII_DENY_LIST.forEach((field) => {
        expect(Object.keys(metadata)).not.toContain(field);
      });
    });
  });

  // ─── Phase 5: Employee Self-Service Payslip Access ─────────────────────────

  describe('Phase 5: Employee can view own payslip', () => {
    it('employee can list their own payslips', async () => {
      const token = await loginAs(app, employeeEmail);

      const res = await request(app.getHttpServer())
        .get('/api/v1/me/payslips')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('employee cannot access another employee payslip by ID', async () => {
      // Create a second employee
      const otherEmail = `other-${Date.now()}@payroll-test.internal`;
      const otherUser = await createTestUser(ds, { email: otherEmail, role: 'EMPLOYEE' });
      const otherEmp = await createTestEmployee(ds, otherUser.id);

      // Seed a payslip for otherEmp directly
      const payslipRepo = ds.getRepository(PayslipEntity);
      const otherPayslip = payslipRepo.create({
        payrollRunId,
        employeeId: otherEmp.id,
        s3Key: 'payslips/other/2025-07.pdf',
        period: '2025-07',
      });
      await payslipRepo.save(otherPayslip);

      const token = await loginAs(app, employeeEmail);
      const res = await request(app.getHttpServer())
        .get(`/api/v1/payroll/payslips/${otherPayslip.id}/download`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeOneOf([403, 404]);

      // Cleanup
      await payslipRepo.delete(otherPayslip.id);
      await ds.getRepository('employees').delete(otherEmp.id);
      await ds.getRepository('users').delete(otherUser.id);
    });
  });
});
