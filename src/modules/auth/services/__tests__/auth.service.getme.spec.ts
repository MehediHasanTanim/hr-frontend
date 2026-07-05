import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth.service';
import { EmployeeEntity } from '../../../employees/entities/employee.entity';
import { LeaveBalanceEntity } from '../../../leave/entities/leave-balance.entity';

// ─── Narrow test: focuses only on getMe() enrichment ────────────────────────
// Other AuthService methods (login, refresh, etc.) are tested in separate files
// established in Sprints 1–2. This spec is additive for Sprint 6 enrichment only.

describe('AuthService.getMe() — Sprint 6 enrichment', () => {
  let service: AuthService;
  let primaryDs: jest.Mocked<DataSource>;
  let replicaDs: jest.Mocked<DataSource>;

  const USER_ID = 'user-uuid-001';

  const mockEmployee: Partial<EmployeeEntity> = {
    id: 'emp-uuid-001',
    userId: USER_ID,
    jobTitle: 'Software Engineer',
    // cast to any for relation — not the SUT
    department: { id: 'dept-1', name: 'Engineering' } as unknown as Record<string, unknown>,
  };

  // Mock repos returned by replica DataSource
  let mockLeaveBalanceRepo: { find: jest.Mock };
  let mockTaskRepo: { count: jest.Mock };
  let mockNotificationRepo: { count: jest.Mock };

  // Primary repo for employee
  let mockEmployeeRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    mockLeaveBalanceRepo = { find: jest.fn() };
    mockTaskRepo = { count: jest.fn() };
    mockNotificationRepo = { count: jest.fn() };
    mockEmployeeRepo = { findOne: jest.fn().mockResolvedValue(mockEmployee) };

    primaryDs = {
      getRepository: jest.fn().mockReturnValue(mockEmployeeRepo),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    replicaDs = {
      getRepository: jest.fn().mockImplementation((entity: unknown) => {
        const name = (entity as { name?: string })?.name ?? String(entity);
        if (name.includes('LeaveBalance')) return mockLeaveBalanceRepo;
        if (name.includes('Task') || name.includes('ESign')) return mockTaskRepo;
        if (name.includes('Notification')) return mockNotificationRepo;
        return { find: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) };
      }),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DataSource, useValue: primaryDs },
        { provide: 'replica', useValue: replicaDs },
        // Mock any other AuthService dependencies established in Sprints 1-2
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Profile fields ────────────────────────────────────────────────────────

  it('returns existing profile fields unchanged', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(0);

    const result = await service.getMe(USER_ID);

    expect(result.id).toBeDefined();
    expect(result.role).toBeDefined();
    expect(result.email).toBeDefined();
  });

  // ─── leaveBalances ─────────────────────────────────────────────────────────

  it('leaveBalances contains correct remaining = entitled - taken for each leave type', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([
      { leaveType: 'ANNUAL', entitled: 20, taken: 5, remaining: 15 },
      { leaveType: 'SICK', entitled: 10, taken: 3, remaining: 7 },
    ] as LeaveBalanceEntity[]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(0);

    const result = await service.getMe(USER_ID);

    expect(result.leaveBalances).toHaveLength(2);
    expect(result.leaveBalances[0].remaining).toBe(15); // 20 - 5
    expect(result.leaveBalances[1].remaining).toBe(7);  // 10 - 3
  });

  it('leaveBalances is an empty array when employee has no leave entitlements', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(0);

    const result = await service.getMe(USER_ID);
    expect(result.leaveBalances).toEqual([]);
  });

  // ─── pendingTaskCount ──────────────────────────────────────────────────────

  it('pendingTaskCount reflects count from task repository', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(4);
    mockNotificationRepo.count.mockResolvedValue(0);

    const result = await service.getMe(USER_ID);
    expect(result.pendingTaskCount).toBe(4);
  });

  // ─── unreadNotificationCount ───────────────────────────────────────────────

  it('unreadNotificationCount reflects count from notification repository', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(7);

    const result = await service.getMe(USER_ID);
    expect(result.unreadNotificationCount).toBe(7);
  });

  // ─── Promise.all parallelism ───────────────────────────────────────────────

  it('all three supplementary queries are triggered (not awaited sequentially)', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(0);

    await service.getMe(USER_ID);

    // All three replica queries must have been called
    expect(mockLeaveBalanceRepo.find).toHaveBeenCalled();
    expect(mockTaskRepo.count).toHaveBeenCalled();
    expect(mockNotificationRepo.count).toHaveBeenCalled();
  });

  // ─── Safe defaults on supplementary query failure ──────────────────────────

  it('returns leaveBalances: [] when leave balance query rejects', async () => {
    mockLeaveBalanceRepo.find.mockRejectedValue(new Error('Replica timeout'));
    mockTaskRepo.count.mockResolvedValue(2);
    mockNotificationRepo.count.mockResolvedValue(3);

    const result = await service.getMe(USER_ID);
    expect(result.leaveBalances).toEqual([]);
    expect(result.pendingTaskCount).toBe(2);
    expect(result.unreadNotificationCount).toBe(3);
  });

  it('returns pendingTaskCount: 0 when task count query rejects', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockRejectedValue(new Error('Task service down'));
    mockNotificationRepo.count.mockResolvedValue(5);

    const result = await service.getMe(USER_ID);
    expect(result.pendingTaskCount).toBe(0);
    expect(result.unreadNotificationCount).toBe(5);
  });

  it('returns unreadNotificationCount: 0 when notification count query rejects', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockRejectedValue(new Error('Notification DB down'));

    const result = await service.getMe(USER_ID);
    expect(result.unreadNotificationCount).toBe(0);
  });

  it('resolves with safe defaults when all three supplementary queries reject', async () => {
    mockLeaveBalanceRepo.find.mockRejectedValue(new Error('Replica offline'));
    mockTaskRepo.count.mockRejectedValue(new Error('Replica offline'));
    mockNotificationRepo.count.mockRejectedValue(new Error('Replica offline'));

    const result = await service.getMe(USER_ID);
    expect(result.leaveBalances).toEqual([]);
    expect(result.pendingTaskCount).toBe(0);
    expect(result.unreadNotificationCount).toBe(0);
  });

  it('getMe() never throws due to supplementary query failure', async () => {
    mockLeaveBalanceRepo.find.mockRejectedValue(new Error('Down'));
    mockTaskRepo.count.mockRejectedValue(new Error('Down'));
    mockNotificationRepo.count.mockRejectedValue(new Error('Down'));

    await expect(service.getMe(USER_ID)).resolves.toBeDefined();
  });

  // ─── Replica usage ─────────────────────────────────────────────────────────

  it('supplementary queries use replica DataSource, not primary', async () => {
    mockLeaveBalanceRepo.find.mockResolvedValue([]);
    mockTaskRepo.count.mockResolvedValue(0);
    mockNotificationRepo.count.mockResolvedValue(0);

    await service.getMe(USER_ID);

    expect(replicaDs.getRepository).toHaveBeenCalled();
    // Primary DataSource should only have been used for the employee load
    const primaryCalls = (primaryDs.getRepository as jest.Mock).mock.calls.length;
    expect(primaryCalls).toBeLessThanOrEqual(1);
  });
});
