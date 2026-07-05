import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { ReportScheduleService } from '../report-schedule.service';
import { ReportScheduleEntity } from '../../entities/report-schedule.entity';
import { SavedReportEntity } from '../../entities/saved-report.entity';
import { AuditLogService } from '../../../../common/services/audit-log.service';
import { QUEUE_NAMES } from '../../../../common/queue-names';
import { ExportFormat } from '../../enums/export-format.enum';
import { ReportKey } from '../../enums/report-key.enum';
import { CreateReportScheduleDto } from '../../dto/create-report-schedule.dto';

describe('ReportScheduleService', () => {
  let service: ReportScheduleService;
  let scheduleRepo: jest.Mocked<Repository<ReportScheduleEntity>>;
  let savedReportRepo: jest.Mocked<Repository<SavedReportEntity>>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let reportExportQueue: jest.Mocked<Queue>;

  const ACTOR_ID = 'actor-uuid-001';
  const SAVED_REPORT_ID = 'saved-report-uuid-001';
  const VALID_CRON = '0 9 * * MON'; // Every Monday at 9am
  const INVALID_CRON = 'not-a-cron-expression';

  const mockSavedReport = (): SavedReportEntity => ({
    id: SAVED_REPORT_ID,
    name: 'Monthly Report',
    reportKey: ReportKey.HEADCOUNT,
    parameters: {},
    createdById: ACTOR_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as SavedReportEntity);

  const mockSchedule = (overrides: Partial<ReportScheduleEntity> = {}): ReportScheduleEntity => ({
    id: 'schedule-uuid-001',
    savedReportId: SAVED_REPORT_ID,
    savedReport: mockSavedReport(),
    cronExpression: VALID_CRON,
    format: ExportFormat.XLSX,
    recipientId: ACTOR_ID,
    isActive: true,
    lastRunAt: undefined,
    nextRunAt: new Date(Date.now() - 60_000), // 1 minute in the past — due now
    createdAt: new Date(),
    ...overrides,
  } as unknown as ReportScheduleEntity);

  beforeEach(async () => {
    scheduleRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<ReportScheduleEntity>>;

    savedReportRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<SavedReportEntity>>;

    auditLogService = {
      logAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogService>;

    reportExportQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-xyz' } as unknown as Job),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportScheduleService,
        { provide: getRepositoryToken(ReportScheduleEntity), useValue: scheduleRepo },
        { provide: getRepositoryToken(SavedReportEntity), useValue: savedReportRepo },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: getQueueToken(QUEUE_NAMES.REPORT_EXPORT), useValue: reportExportQueue },
      ],
    }).compile();

    service = module.get(ReportScheduleService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateReportScheduleDto = {
      savedReportId: SAVED_REPORT_ID,
      cronExpression: VALID_CRON,
      format: ExportFormat.XLSX,
    };

    it('creates schedule with valid cron expression', async () => {
      savedReportRepo.findOne.mockResolvedValue(mockSavedReport());
      const schedule = mockSchedule();
      scheduleRepo.create.mockReturnValue(schedule);
      scheduleRepo.save.mockResolvedValue(schedule);

      const result = await service.create(dto, ACTOR_ID);

      expect(scheduleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cronExpression: VALID_CRON, savedReportId: SAVED_REPORT_ID }),
      );
      expect(result.id).toBe(schedule.id);
    });

    it('throws BadRequestException for invalid cron expression', async () => {
      savedReportRepo.findOne.mockResolvedValue(mockSavedReport());

      await expect(
        service.create({ ...dto, cronExpression: INVALID_CRON }, ACTOR_ID),
      ).rejects.toThrow(BadRequestException);

      expect(scheduleRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when savedReport does not exist', async () => {
      savedReportRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, ACTOR_ID)).rejects.toThrow(NotFoundException);
    });

    it('computes nextRunAt from cronExpression on create', async () => {
      savedReportRepo.findOne.mockResolvedValue(mockSavedReport());
      scheduleRepo.create.mockImplementation((data) => data as ReportScheduleEntity);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      const result = await service.create(dto, ACTOR_ID);

      expect(result.nextRunAt).toBeInstanceOf(Date);
      expect(result.nextRunAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('sets isActive to true by default', async () => {
      savedReportRepo.findOne.mockResolvedValue(mockSavedReport());
      scheduleRepo.create.mockImplementation((data) => data as ReportScheduleEntity);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      const result = await service.create(dto, ACTOR_ID);
      expect(result.isActive).toBe(true);
    });
  });

  // ─── toggleActive() ────────────────────────────────────────────────────────

  describe('toggleActive()', () => {
    it('flips isActive from true to false', async () => {
      const schedule = mockSchedule({ isActive: true });
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      const result = await service.toggleActive(schedule.id, ACTOR_ID);
      expect(result.isActive).toBe(false);
    });

    it('flips isActive from false to true', async () => {
      const schedule = mockSchedule({ isActive: false });
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      const result = await service.toggleActive(schedule.id, ACTOR_ID);
      expect(result.isActive).toBe(true);
    });

    it('throws NotFoundException when schedule does not exist', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);
      await expect(service.toggleActive('non-existent', ACTOR_ID)).rejects.toThrow(NotFoundException);
    });

    it('persists the toggled value', async () => {
      const schedule = mockSchedule({ isActive: true });
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      await service.toggleActive(schedule.id, ACTOR_ID);
      expect(scheduleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  // ─── enqueueBySchedule() ───────────────────────────────────────────────────

  describe('enqueueBySchedule()', () => {
    it('adds a job to QUEUE_NAMES.REPORT_EXPORT with correct payload', async () => {
      const schedule = mockSchedule();
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      await service.enqueueBySchedule(schedule.id);

      expect(reportExportQueue.add).toHaveBeenCalledWith(
        QUEUE_NAMES.REPORT_EXPORT,
        expect.objectContaining({
          savedReportId: SAVED_REPORT_ID,
          format: ExportFormat.XLSX,
          recipientId: ACTOR_ID,
        }),
        expect.anything(),
      );
    });

    it('does NOT use an inline string instead of QUEUE_NAMES constant', async () => {
      const schedule = mockSchedule();
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      await service.enqueueBySchedule(schedule.id);

      const queueNameArg = (reportExportQueue.add as jest.Mock).mock.calls[0][0] as string;
      expect(queueNameArg).toBe(QUEUE_NAMES.REPORT_EXPORT);
    });

    it('updates lastRunAt to approximately now', async () => {
      const schedule = mockSchedule({ lastRunAt: undefined });
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);
      const before = new Date();

      await service.enqueueBySchedule(schedule.id);

      const savedArg = (scheduleRepo.save as jest.Mock).mock.calls[0][0] as ReportScheduleEntity;
      expect(savedArg.lastRunAt).toBeDefined();
      expect(savedArg.lastRunAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('computes nextRunAt from cronExpression after enqueue', async () => {
      const schedule = mockSchedule();
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      await service.enqueueBySchedule(schedule.id);

      const savedArg = (scheduleRepo.save as jest.Mock).mock.calls[0][0] as ReportScheduleEntity;
      expect(savedArg.nextRunAt).toBeInstanceOf(Date);
      expect(savedArg.nextRunAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('calls auditLogService.logAsync with action REPORT_SCHEDULE_TRIGGERED', async () => {
      const schedule = mockSchedule();
      scheduleRepo.findOne.mockResolvedValue(schedule);
      scheduleRepo.save.mockImplementation(async (e) => e as ReportScheduleEntity);

      await service.enqueueBySchedule(schedule.id);

      await new Promise<void>((r) => setImmediate(r));
      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_SCHEDULE_TRIGGERED' }),
      );
    });

    it('throws NotFoundException when schedule does not exist', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);
      await expect(service.enqueueBySchedule('missing')).rejects.toThrow(NotFoundException);
      expect(reportExportQueue.add).not.toHaveBeenCalled();
    });
  });

  // ─── findDueSchedules() ────────────────────────────────────────────────────

  describe('findDueSchedules()', () => {
    it('queries with isActive: true and nextRunAt <= now', async () => {
      scheduleRepo.find.mockResolvedValue([]);
      await service.findDueSchedules();

      expect(scheduleRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            nextRunAt: expect.anything(), // LessThanOrEqual(...)
          }),
        }),
      );
    });

    it('loads the savedReport relation', async () => {
      scheduleRepo.find.mockResolvedValue([]);
      await service.findDueSchedules();

      expect(scheduleRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: expect.arrayContaining(['savedReport']) }),
      );
    });

    it('returns schedules that are past their nextRunAt', async () => {
      const dueSchedule = mockSchedule({ nextRunAt: new Date(Date.now() - 5000) });
      scheduleRepo.find.mockResolvedValue([dueSchedule]);

      const result = await service.findDueSchedules();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(dueSchedule.id);
    });

    it('returns empty array when no schedules are due', async () => {
      scheduleRepo.find.mockResolvedValue([]);
      const result = await service.findDueSchedules();
      expect(result).toEqual([]);
    });
  });
});
