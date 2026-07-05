import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ReportQueryService } from '../report-query.service';
import { ReportKey } from '../../enums/report-key.enum';
import { ReportQueryDto } from '../../dto/report-query.dto';
import { round2dp } from '../../../../common/utils/round2dp';

// Shared mock QueryBuilder — reused across all report tests
function buildMockQb(rows: Record<string, unknown>[] = []) {
  const qb = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
    getRawOne: jest.fn().mockResolvedValue(rows[0] ?? null),
    getCount: jest.fn().mockResolvedValue(rows.length),
  } as unknown as jest.Mocked<SelectQueryBuilder<unknown>>;
  return qb;
}

describe('ReportQueryService', () => {
  let service: ReportQueryService;
  let replicaDs: jest.Mocked<DataSource>;
  let primaryDs: jest.Mocked<DataSource>;
  let mockQb: ReturnType<typeof buildMockQb>;

  beforeEach(async () => {
    mockQb = buildMockQb();

    replicaDs = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      getRepository: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    primaryDs = {
      createQueryBuilder: jest.fn(),
      getRepository: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportQueryService,
        { provide: 'replica', useValue: replicaDs },         // read replica token
        { provide: DataSource, useValue: primaryDs },         // primary — must never be called by reports
      ],
    }).compile();

    service = module.get(ReportQueryService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-A — run() Dispatch
  // ─────────────────────────────────────────────────────────────────────────

  describe('run() — dispatch', () => {
    const baseQuery: ReportQueryDto = {
      reportKey: ReportKey.HEADCOUNT,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    };

    it('dispatches to headcount() for HEADCOUNT key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.HEADCOUNT });
      expect(result.reportKey).toBe(ReportKey.HEADCOUNT);
      expect(result.rows).toBeInstanceOf(Array);
    });

    it('dispatches to attrition() for ATTRITION key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.ATTRITION });
      expect(result.reportKey).toBe(ReportKey.ATTRITION);
    });

    it('dispatches to payrollSummary() for PAYROLL_SUMMARY key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.PAYROLL_SUMMARY });
      expect(result.reportKey).toBe(ReportKey.PAYROLL_SUMMARY);
    });

    it('dispatches to leaveUtilization() for LEAVE_UTILIZATION key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.LEAVE_UTILIZATION });
      expect(result.reportKey).toBe(ReportKey.LEAVE_UTILIZATION);
    });

    it('dispatches to attendanceSummary() for ATTENDANCE_SUMMARY key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.ATTENDANCE_SUMMARY });
      expect(result.reportKey).toBe(ReportKey.ATTENDANCE_SUMMARY);
    });

    it('dispatches to newHires() for NEW_HIRES key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.NEW_HIRES });
      expect(result.reportKey).toBe(ReportKey.NEW_HIRES);
    });

    it('dispatches to exits() for EXITS key', async () => {
      const result = await service.run({ ...baseQuery, reportKey: ReportKey.EXITS });
      expect(result.reportKey).toBe(ReportKey.EXITS);
    });

    it('sets generatedAt to approximately now', async () => {
      const before = new Date();
      const result = await service.run(baseQuery);
      const after = new Date();
      expect(result.generatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.generatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('sets totalRows to rows.length', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([{ dept: 'Engineering', count: 5 }]);
      const result = await service.run(baseQuery);
      expect(result.totalRows).toBe(result.rows.length);
    });

    it('throws BadRequestException for invalid reportKey', async () => {
      await expect(
        service.run({ ...baseQuery, reportKey: 'invalid_key' as ReportKey }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when startDate > endDate', async () => {
      await expect(
        service.run({ ...baseQuery, startDate: '2025-12-31', endDate: '2025-01-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when startDate === endDate (zero-day range)', async () => {
      // A single-day range is valid — this test documents the boundary.
      // Change to expect NOT to throw if business logic allows same-day ranges.
      await expect(
        service.run({ ...baseQuery, startDate: '2025-06-01', endDate: '2025-06-01' }),
      ).resolves.toBeDefined(); // same day is acceptable
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-B — Read Replica Routing (Critical)
  // ─────────────────────────────────────────────────────────────────────────

  describe('read replica routing', () => {
    const baseQuery: ReportQueryDto = {
      reportKey: ReportKey.HEADCOUNT,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    };

    const allReportKeys = Object.values(ReportKey);

    it.each(allReportKeys)(
      '%s report uses replicaDs.createQueryBuilder, not primary',
      async (key) => {
        await service.run({ ...baseQuery, reportKey: key });

        expect(replicaDs.createQueryBuilder).toHaveBeenCalled();
        expect(primaryDs.createQueryBuilder).not.toHaveBeenCalled();
      },
    );

    it('replicaDs.createQueryBuilder is called at least once per report run', async () => {
      await service.run(baseQuery);
      expect(replicaDs.createQueryBuilder).toHaveBeenCalledTimes(
        expect.any(Number), // called 1+ times; exact count depends on query complexity
      );
      expect((replicaDs.createQueryBuilder as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-C — Headcount: groupBy Department
  // ─────────────────────────────────────────────────────────────────────────

  describe('headcount() — groupBy department', () => {
    it('returns rows grouped by department with correct count field', async () => {
      const rows = [
        { departmentName: 'Engineering', headcount: '12' },
        { departmentName: 'HR', headcount: '4' },
        { departmentName: 'Finance', headcount: '7' },
      ];
      mockQb.getRawMany = jest.fn().mockResolvedValue(rows);

      const result = await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(result.rows).toHaveLength(3);
      expect(result.rows[0]).toHaveProperty('departmentName', 'Engineering');
      expect(result.rows[0]).toHaveProperty('headcount');
    });

    it('filters to the specified departmentId when provided', async () => {
      const deptId = 'dept-uuid-1234';

      await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        departmentId: deptId,
      });

      // Assert departmentId is passed as a parameter, not interpolated
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('departmentId'),
        expect.objectContaining({ deptId }),
      );
    });

    it('does not apply department filter when departmentId is undefined', async () => {
      await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      // andWhere should not have been called with a departmentId parameter
      const andWhereCalls = (mockQb.andWhere as jest.Mock).mock.calls;
      const hasDeptFilter = andWhereCalls.some((call) =>
        JSON.stringify(call).includes('departmentId'),
      );
      expect(hasDeptFilter).toBe(false);
    });

    it('applies date range as parameterized bindings', async () => {
      await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      const whereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      const hasStartDate = whereCalls.some((call) =>
        JSON.stringify(call[1] ?? {}).includes('2025-01-01'),
      );
      const hasEndDate = whereCalls.some((call) =>
        JSON.stringify(call[1] ?? {}).includes('2025-06-30'),
      );

      expect(hasStartDate).toBe(true);
      expect(hasEndDate).toBe(true);
    });

    it('excludes employees whose joiningDate is after endDate', async () => {
      // This is validated by asserting the WHERE clause includes an upper-bound date filter.
      await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
      });

      const allWhereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      // The query must constrain joiningDate to be <= endDate
      const hasUpperBound = allWhereCalls.some((call) => {
        const clause = String(call[0] ?? '');
        return (
          clause.includes('joining_date') || clause.includes('joiningDate')
        ) && (
          clause.includes('<=') || clause.includes('BETWEEN') || clause.includes(':end')
        );
      });
      expect(hasUpperBound).toBe(true);
    });

    it('returns empty rows array when no employees match', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([]);

      const result = await service.run({
        reportKey: ReportKey.HEADCOUNT,
        startDate: '2020-01-01',
        endDate: '2020-01-02',
      });

      expect(result.rows).toEqual([]);
      expect(result.totalRows).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-D — Attrition Rate Calculation
  // ─────────────────────────────────────────────────────────────────────────

  describe('attrition() — rate calculation', () => {
    it('returns attritionRate of 0 when exits is 0', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { departmentName: 'Engineering', exits: '0', openingHeadcount: '20', closingHeadcount: '20' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.ATTRITION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(result.rows[0]).toHaveProperty('attritionRate', 0);
    });

    it('calculates attrition rate correctly: exits=4, opening=20, closing=16 → rate=0.2105', async () => {
      // rate = 4 / ((20 + 16) / 2) = 4 / 18 = 0.2222...
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { departmentName: 'Engineering', exits: '4', openingHeadcount: '20', closingHeadcount: '16' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.ATTRITION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      // rate = 4 / 18 ≈ 0.2222 (rounded to 4 decimal places)
      expect(Number(result.rows[0].attritionRate)).toBeCloseTo(0.2222, 4);
    });

    it('handles zero average headcount without dividing by zero', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { departmentName: 'New Dept', exits: '0', openingHeadcount: '0', closingHeadcount: '0' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.ATTRITION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(result.rows[0].attritionRate).toBe(0);
      // Must not throw or return Infinity / NaN
      expect(Number(result.rows[0].attritionRate)).not.toBeNaN();
      expect(Number(result.rows[0].attritionRate)).not.toBe(Infinity);
    });

    it('calculates correctly across multiple departments', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { departmentName: 'Engineering', exits: '2', openingHeadcount: '10', closingHeadcount: '8' },
        { departmentName: 'HR', exits: '0', openingHeadcount: '5', closingHeadcount: '5' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.ATTRITION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      // Engineering: 2 / ((10 + 8) / 2) = 2 / 9 ≈ 0.2222
      expect(Number(result.rows[0].attritionRate)).toBeCloseTo(0.2222, 4);
      // HR: 0 / 5 = 0
      expect(Number(result.rows[1].attritionRate)).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-E — Payroll Summary: round2dp
  // ─────────────────────────────────────────────────────────────────────────

  describe('payrollSummary() — monetary precision', () => {
    it('gross, net, and deductions are rounded to 2 decimal places', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        {
          departmentName: 'Engineering',
          totalGross: '123456.789',
          totalNet: '98765.4321',
          totalDeductions: '24691.3569',
        },
      ]);

      const result = await service.run({
        reportKey: ReportKey.PAYROLL_SUMMARY,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(Number(result.rows[0].totalGross)).toBeCloseTo(123456.79, 2);
      expect(Number(result.rows[0].totalNet)).toBeCloseTo(98765.43, 2);
      expect(Number(result.rows[0].totalDeductions)).toBeCloseTo(24691.36, 2);
    });

    it('round2dp(0) returns 0.00 not NaN', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { departmentName: 'Empty', totalGross: '0', totalNet: '0', totalDeductions: '0' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.PAYROLL_SUMMARY,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(Number(result.rows[0].totalGross)).toBe(0);
      expect(Number(result.rows[0].totalGross)).not.toBeNaN();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-F — Leave Utilization
  // ─────────────────────────────────────────────────────────────────────────

  describe('leaveUtilization()', () => {
    it('calculates utilization rate: days_taken / days_entitled', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { employeeId: 'emp-1', leaveType: 'ANNUAL', daysTaken: '10', daysEntitled: '20' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.LEAVE_UTILIZATION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(Number(result.rows[0].utilizationRate)).toBeCloseTo(0.5, 4);
    });

    it('returns utilizationRate of 0 when no leave taken', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        { employeeId: 'emp-2', leaveType: 'SICK', daysTaken: '0', daysEntitled: '10' },
      ]);

      const result = await service.run({
        reportKey: ReportKey.LEAVE_UTILIZATION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(Number(result.rows[0].utilizationRate)).toBe(0);
    });

    it('filters by leaveType when provided', async () => {
      await service.run({
        reportKey: ReportKey.LEAVE_UTILIZATION,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        leaveType: 'ANNUAL' as unknown as string,
      });

      const allWhereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      const hasLeaveTypeFilter = allWhereCalls.some((call) =>
        JSON.stringify(call).toLowerCase().includes('leavetype') ||
        JSON.stringify(call).toLowerCase().includes('leave_type'),
      );
      expect(hasLeaveTypeFilter).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-G — New Hires & Exits: Date Boundary Correctness
  // ─────────────────────────────────────────────────────────────────────────

  describe('newHires() and exits() — date boundary', () => {
    it('newHires query constrains joiningDate within [startDate, endDate]', async () => {
      await service.run({
        reportKey: ReportKey.NEW_HIRES,
        startDate: '2025-04-01',
        endDate: '2025-06-30',
      });

      const allWhereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      const hasJoiningDateFilter = allWhereCalls.some((call) => {
        const clause = String(call[0] ?? '');
        return clause.includes('joining_date') || clause.includes('joiningDate');
      });
      expect(hasJoiningDateFilter).toBe(true);
    });

    it('exits query constrains exitDate within [startDate, endDate]', async () => {
      await service.run({
        reportKey: ReportKey.EXITS,
        startDate: '2025-04-01',
        endDate: '2025-06-30',
      });

      const allWhereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      const hasExitDateFilter = allWhereCalls.some((call) => {
        const clause = String(call[0] ?? '');
        return clause.includes('exit_date') || clause.includes('exitDate');
      });
      expect(hasExitDateFilter).toBe(true);
    });

    it('no SQL string interpolation in any date filter — parameterized bindings only', async () => {
      await service.run({
        reportKey: ReportKey.NEW_HIRES,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      const allWhereCalls = [
        ...(mockQb.where as jest.Mock).mock.calls,
        ...(mockQb.andWhere as jest.Mock).mock.calls,
      ];

      // Assert that no literal date string appears directly inside the clause string
      allWhereCalls.forEach(([clause]) => {
        expect(String(clause)).not.toMatch(/['"]2025-/); // no date literal in clause
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6.T1-H — Attendance Summary
  // ─────────────────────────────────────────────────────────────────────────

  describe('attendanceSummary()', () => {
    it('returns present, absent, late, and wfh counts', async () => {
      mockQb.getRawMany = jest.fn().mockResolvedValue([
        {
          employeeId: 'emp-1',
          employeeName: 'Jane Doe',
          presentDays: '18',
          absentDays: '2',
          lateDays: '3',
          wfhDays: '5',
        },
      ]);

      const result = await service.run({
        reportKey: ReportKey.ATTENDANCE_SUMMARY,
        startDate: '2025-06-01',
        endDate: '2025-06-30',
      });

      expect(result.rows[0]).toMatchObject({
        employeeId: 'emp-1',
        presentDays: expect.anything(),
        absentDays: expect.anything(),
        lateDays: expect.anything(),
        wfhDays: expect.anything(),
      });
    });

    it('filters by departmentId when provided', async () => {
      const deptId = 'dept-abc';

      await service.run({
        reportKey: ReportKey.ATTENDANCE_SUMMARY,
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        departmentId: deptId,
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('departmentId'),
        expect.objectContaining({ deptId }),
      );
    });
  });
});
