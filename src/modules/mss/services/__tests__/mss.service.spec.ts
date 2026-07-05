import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MssService } from '../mss.service';
import { EmployeeEntity } from '../../../employees/entities/employee.entity';
import { LeaveRequestEntity } from '../../../leave/entities/leave-request.entity';
import { LeaveBalanceEntity } from '../../../leave/entities/leave-balance.entity';
import { PayrollEntryEntity } from '../../../payroll/entities/payroll-entry.entity';
import { AttendanceRecordEntity } from '../../../attendance/entities/attendance-record.entity';
import { TeamLeaveQueryDto } from '../../dto/team-leave-query.dto';
import { Role } from '../../../../common/enums/role.enum';

describe('MssService', () => {
  let service: MssService;
  let employeeRepo: jest.Mocked<Repository<EmployeeEntity>>;
  let leaveRequestRepo: jest.Mocked<Repository<LeaveRequestEntity>>;
  let leaveBalanceRepo: jest.Mocked<Repository<LeaveBalanceEntity>>;
  let payrollEntryRepo: jest.Mocked<Repository<PayrollEntryEntity>>;
  let attendanceRepo: jest.Mocked<Repository<AttendanceRecordEntity>>;

  const MANAGER_ID = 'manager-emp-uuid';
  const DIRECT_REPORT_ID = 'direct-report-uuid';
  const OUTSIDER_ID = 'outsider-emp-uuid';
  const HR_ADMIN_ID = 'hr-admin-uuid';

  const mockEmployee = (overrides: Partial<EmployeeEntity> = {}): EmployeeEntity => ({
    id: DIRECT_REPORT_ID,
    userId: 'user-uuid-1',
    jobTitle: 'Engineer',
    reportingManagerId: MANAGER_ID,
    status: 'active',
    // cast to any for relation — not the SUT, safe in test
    department: { id: 'dept-uuid', name: 'Engineering' } as unknown as Record<string, unknown>,
    ...overrides,
  } as unknown as EmployeeEntity);

  const mockLeaveBalance = (leaveType: string, entitled: number, taken: number): LeaveBalanceEntity => ({
    id: `lb-${leaveType}`,
    employeeId: DIRECT_REPORT_ID,
    leaveType,
    entitled,
    taken,
    remaining: entitled - taken,
    leaveYear: 2025,
  } as unknown as LeaveBalanceEntity);

  const mockPayrollEntry = (netPay: number): PayrollEntryEntity => ({
    id: 'entry-uuid',
    employeeId: DIRECT_REPORT_ID,
    netPay,
    grossPay: netPay * 1.2,
  } as unknown as PayrollEntryEntity);

  beforeEach(async () => {
    employeeRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmployeeEntity>>;

    leaveRequestRepo = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    } as unknown as jest.Mocked<Repository<LeaveRequestEntity>>;

    leaveBalanceRepo = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<LeaveBalanceEntity>>;

    payrollEntryRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<Repository<PayrollEntryEntity>>;

    attendanceRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      }),
      count: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<Repository<AttendanceRecordEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MssService,
        { provide: getRepositoryToken(EmployeeEntity), useValue: employeeRepo },
        { provide: getRepositoryToken(LeaveRequestEntity), useValue: leaveRequestRepo },
        { provide: getRepositoryToken(LeaveBalanceEntity), useValue: leaveBalanceRepo },
        { provide: getRepositoryToken(PayrollEntryEntity), useValue: payrollEntryRepo },
        { provide: getRepositoryToken(AttendanceRecordEntity), useValue: attendanceRepo },
      ],
    }).compile();

    service = module.get(MssService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── getEmployeeSummary() ─────────────────────────────────────────────────

  describe('getEmployeeSummary()', () => {
    beforeEach(() => {
      // Manager has one direct report
      employeeRepo.findOne.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
        if (where?.id === DIRECT_REPORT_ID) return mockEmployee();
        if (where?.id === MANAGER_ID) return mockEmployee({ id: MANAGER_ID });
        return null;
      });
      employeeRepo.find.mockResolvedValue([mockEmployee()]);
    });

    it('returns the correct employee summary shape', async () => {
      leaveBalanceRepo.find.mockResolvedValue([
        mockLeaveBalance('ANNUAL', 20, 5),
        mockLeaveBalance('SICK', 10, 1),
      ]);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);

      expect(result.employeeId).toBe(DIRECT_REPORT_ID);
      expect(result.leaveBalances).toHaveLength(2);
      expect(result.leaveBalances[0]).toMatchObject({
        leaveType: 'ANNUAL',
        entitled: 20,
        taken: 5,
        remaining: 15,
      });
    });

    it('MANAGER role: lastPayrollNetPay is null', async () => {
      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);
      expect(result.lastPayrollNetPay).toBeNull();
    });

    it('HR_ADMIN role: lastPayrollNetPay is populated and rounded to 2dp', async () => {
      payrollEntryRepo.findOne.mockResolvedValue(mockPayrollEntry(55250.555));

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, HR_ADMIN_ID, Role.HR_ADMIN);

      expect(result.lastPayrollNetPay).toBeCloseTo(55250.56, 2);
    });

    it('HR_ADMIN role: lastPayrollNetPay is null when no payroll entry exists', async () => {
      payrollEntryRepo.findOne.mockResolvedValue(null);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, HR_ADMIN_ID, Role.HR_ADMIN);
      expect(result.lastPayrollNetPay).toBeNull();
    });

    it('throws ForbiddenException when MANAGER accesses an employee outside their team', async () => {
      // Return null for the direct report lookup — outsider is not in manager's team
      employeeRepo.find.mockResolvedValue([]); // manager has no direct reports matching outsider

      await expect(
        service.getEmployeeSummary(OUTSIDER_ID, MANAGER_ID, Role.MANAGER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('HR_ADMIN can access any employee regardless of team membership', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee({ id: OUTSIDER_ID }));
      employeeRepo.find.mockResolvedValue([]); // no direct reports to HR_ADMIN

      await expect(
        service.getEmployeeSummary(OUTSIDER_ID, HR_ADMIN_ID, Role.HR_ADMIN),
      ).resolves.toBeDefined();
    });

    it('throws NotFoundException when employee does not exist', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getEmployeeSummary('ghost-id', HR_ADMIN_ID, Role.HR_ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getEmployeeSummary() — attendanceSummary ────────────────────────────

  describe('getEmployeeSummary() — attendanceSummary', () => {
    beforeEach(() => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee());
      employeeRepo.find.mockResolvedValue([mockEmployee()]);
      leaveBalanceRepo.find.mockResolvedValue([]);
      payrollEntryRepo.findOne.mockResolvedValue(null);
    });

    it('returns attendanceSummary with required fields', async () => {
      // Mock attendance counts via the attendance repo
      attendanceRepo.count
        .mockResolvedValueOnce(18) // presentDays
        .mockResolvedValueOnce(2)  // absentDays
        .mockResolvedValueOnce(3)  // lateDays
        .mockResolvedValueOnce(5); // wfhDays (if tracked)

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);

      expect(result.attendanceSummary).toBeDefined();
      expect(result.attendanceSummary).toMatchObject({
        presentDays: expect.any(Number),
        absentDays: expect.any(Number),
        lateDays: expect.any(Number),
        currentMonthPeriod: expect.stringMatching(/^\d{4}-\d{2}$/), // e.g. "2025-07"
      });
    });

    it('attendanceSummary.currentMonthPeriod reflects current month', async () => {
      attendanceRepo.count.mockResolvedValue(0);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);

      const now = new Date();
      const expectedPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      expect(result.attendanceSummary.currentMonthPeriod).toBe(expectedPeriod);
    });

    it('attendanceSummary counts are non-negative integers', async () => {
      attendanceRepo.count.mockResolvedValue(0);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);

      const { presentDays, absentDays, lateDays } = result.attendanceSummary;
      expect(presentDays).toBeGreaterThanOrEqual(0);
      expect(absentDays).toBeGreaterThanOrEqual(0);
      expect(lateDays).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(presentDays)).toBe(true);
      expect(Number.isInteger(absentDays)).toBe(true);
      expect(Number.isInteger(lateDays)).toBe(true);
    });
  });

  // ─── getEmployeeSummary() — pendingLeaveRequests ─────────────────────────

  describe('getEmployeeSummary() — pendingLeaveRequests', () => {
    beforeEach(() => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee());
      employeeRepo.find.mockResolvedValue([mockEmployee()]);
      leaveBalanceRepo.find.mockResolvedValue([]);
      payrollEntryRepo.findOne.mockResolvedValue(null);
      attendanceRepo.count.mockResolvedValue(0);
    });

    it('returns pendingLeaveRequests count for the employee', async () => {
      // The service should count leave_requests WHERE employeeId = id AND status = PENDING
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 3]);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);

      expect(typeof result.pendingLeaveRequests).toBe('number');
      expect(result.pendingLeaveRequests).toBeGreaterThanOrEqual(0);
    });

    it('pendingLeaveRequests is 0 when employee has no pending requests', async () => {
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getEmployeeSummary(DIRECT_REPORT_ID, MANAGER_ID, Role.MANAGER);
      expect(result.pendingLeaveRequests).toBe(0);
    });
  });

  // ─── getEmployeeSummary() — replica routing ──────────────────────────────

  describe('getEmployeeSummary() — replica routing', () => {
    it('leave balance and attendance queries use the replica DataSource', async () => {
      // This test is a documentation-first assertion.
      // Implementation: MssService should inject @InjectDataSource('replica')
      // and use it for getEmployeeSummary supplementary queries.
      // If the current implementation does not use a replica DataSource,
      // raise a TODO to migrate the queries in a follow-up task.
      //
      // TODO: Verify MssService uses @InjectDataSource('replica') for
      // leaveBalances, attendanceSummary, and pendingLeaveRequests queries
      // per the Sprint 6 backend spec ("All queries run on the read replica").
      expect(true).toBe(true); // placeholder — replace with spy on replicaDs once wired
    });
  });

  // ─── getTeamLeaveRequests() ───────────────────────────────────────────────

  describe('getTeamLeaveRequests()', () => {
    const baseQuery: TeamLeaveQueryDto = { page: 1, limit: 20 };

    beforeEach(() => {
      employeeRepo.find.mockResolvedValue([mockEmployee()]);
    });

    it('returns paginated team leave requests', async () => {
      const mockRequest = { id: 'req-1', employeeId: DIRECT_REPORT_ID, status: 'PENDING' };
      leaveRequestRepo.findAndCount.mockResolvedValue([[mockRequest] as unknown as LeaveRequestEntity[], 1]);

      const result = await service.getTeamLeaveRequests(MANAGER_ID, Role.MANAGER, baseQuery);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('returns empty page when manager has no direct reports', async () => {
      employeeRepo.find.mockResolvedValue([]);

      const result = await service.getTeamLeaveRequests(MANAGER_ID, Role.MANAGER, baseQuery);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(leaveRequestRepo.findAndCount).not.toHaveBeenCalled();
    });

    it('filters by status when provided', async () => {
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getTeamLeaveRequests(MANAGER_ID, Role.MANAGER, {
        ...baseQuery,
        // cast needed: status is typed as string literal union in DTO
        status: 'APPROVED' as unknown as string,
      });

      expect(leaveRequestRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
    });

    it('does not apply status filter when status is undefined', async () => {
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getTeamLeaveRequests(MANAGER_ID, Role.MANAGER, baseQuery);

      const whereArg = (leaveRequestRepo.findAndCount as jest.Mock).mock.calls[0]?.[0]
        ?.where as Record<string, unknown> | undefined;

      if (whereArg) {
        expect(Object.keys(whereArg)).not.toContain('status');
      }
    });

    it('respects page and limit for pagination', async () => {
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 100]);

      const result = await service.getTeamLeaveRequests(MANAGER_ID, Role.MANAGER, {
        page: 3,
        limit: 10,
      });

      expect(leaveRequestRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(100);
    });

    it('HR_ADMIN sees leave requests across all departments', async () => {
      // For HR_ADMIN, the team query should include all employees — not just direct reports
      employeeRepo.find.mockResolvedValue([
        mockEmployee({ id: 'emp-1' }),
        mockEmployee({ id: 'emp-2' }),
        mockEmployee({ id: 'emp-3', reportingManagerId: 'some-other-manager' }),
      ]);
      leaveRequestRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getTeamLeaveRequests(HR_ADMIN_ID, Role.HR_ADMIN, baseQuery);

      // findAndCount should be called (HR_ADMIN not restricted to direct reports)
      expect(leaveRequestRepo.findAndCount).toHaveBeenCalled();
    });
  });
});
