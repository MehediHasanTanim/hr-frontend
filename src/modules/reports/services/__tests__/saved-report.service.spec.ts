import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { SavedReportService } from '../saved-report.service';
import { SavedReportEntity } from '../../entities/saved-report.entity';
import { AuditLogService } from '../../../../common/services/audit-log.service';
import { ReportQueryService } from '../report-query.service';
import { QUEUE_NAMES } from '../../../../common/queue-names';
import { ReportKey } from '../../enums/report-key.enum';
import { ExportFormat } from '../../enums/export-format.enum';
import { SaveReportDto } from '../../dto/save-report.dto';
import { TriggerExportDto } from '../../dto/trigger-export.dto';

describe('SavedReportService', () => {
  let service: SavedReportService;
  let savedReportRepo: jest.Mocked<Repository<SavedReportEntity>>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let reportExportQueue: jest.Mocked<Queue>;

  const ACTOR_ID = 'actor-uuid-001';
  const OTHER_ACTOR_ID = 'actor-uuid-002';

  const mockSavedReport = (): SavedReportEntity => ({
    id: 'report-uuid-001',
    name: 'Monthly Headcount',
    reportKey: ReportKey.HEADCOUNT,
    parameters: { reportKey: ReportKey.HEADCOUNT, startDate: '2025-01-01', endDate: '2025-06-30' },
    createdById: ACTOR_ID,
    // cast to any for the relation — not the SUT, safe in test
    createdBy: { id: ACTOR_ID } as unknown as Record<string, unknown>,
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01'),
  } as unknown as SavedReportEntity);

  beforeEach(async () => {
    savedReportRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<SavedReportEntity>>;

    auditLogService = {
      logAsync: jest.fn().mockResolvedValue(undefined),
      log: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogService>;

    reportExportQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-id-123' } as unknown as Job),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedReportService,
        { provide: getRepositoryToken(SavedReportEntity), useValue: savedReportRepo },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: getQueueToken(QUEUE_NAMES.REPORT_EXPORT), useValue: reportExportQueue },
        { provide: ReportQueryService, useValue: {} },
      ],
    }).compile();

    service = module.get(SavedReportService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── save() ────────────────────────────────────────────────────────────────

  describe('save()', () => {
    const dto: SaveReportDto = {
      name: 'Monthly Headcount',
      reportKey: ReportKey.HEADCOUNT,
      parameters: { reportKey: ReportKey.HEADCOUNT, startDate: '2025-01-01', endDate: '2025-06-30' },
    };

    it('creates and persists the saved report entity', async () => {
      const created = mockSavedReport();
      savedReportRepo.create.mockReturnValue(created);
      savedReportRepo.save.mockResolvedValue(created);

      const result = await service.save(dto, ACTOR_ID);

      expect(savedReportRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: dto.name, createdById: ACTOR_ID }),
      );
      expect(savedReportRepo.save).toHaveBeenCalledWith(created);
      expect(result.id).toBe(created.id);
    });

    it('calls auditLogService.logAsync with action REPORT_DEFINITION_SAVED', async () => {
      const created = mockSavedReport();
      savedReportRepo.create.mockReturnValue(created);
      savedReportRepo.save.mockResolvedValue(created);

      await service.save(dto, ACTOR_ID);

      await new Promise<void>((r) => setImmediate(r));
      expect(auditLogService.logAsync).toHaveBeenCalledTimes(1);
      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_DEFINITION_SAVED', actorId: ACTOR_ID }),
      );
    });

    it('audit log metadata does not contain PII fields', async () => {
      const created = mockSavedReport();
      savedReportRepo.create.mockReturnValue(created);
      savedReportRepo.save.mockResolvedValue(created);

      await service.save(dto, ACTOR_ID);
      await new Promise<void>((r) => setImmediate(r));

      const call = (auditLogService.logAsync as jest.Mock).mock.calls[0][0] as {
        metadata: Record<string, unknown>;
      };
      const PII_DENY_LIST = ['base64Signature', 'passwordHash', 'otpCode', 'rawToken', 'signedUrl'];
      PII_DENY_LIST.forEach((field) => {
        expect(Object.keys(call.metadata ?? {})).not.toContain(field);
      });
    });

    it('returns the persisted entity', async () => {
      const created = mockSavedReport();
      savedReportRepo.create.mockReturnValue(created);
      savedReportRepo.save.mockResolvedValue(created);

      const result = await service.save(dto, ACTOR_ID);
      expect(result).toBe(created);
    });
  });

  // ─── list() ────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('returns saved reports belonging to the actor', async () => {
      const reports = [mockSavedReport()];
      savedReportRepo.find.mockResolvedValue(reports);

      const result = await service.list(ACTOR_ID);

      expect(savedReportRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ createdById: ACTOR_ID }) }),
      );
      expect(result).toEqual(reports);
    });

    it('returns empty array when actor has no saved reports', async () => {
      savedReportRepo.find.mockResolvedValue([]);
      const result = await service.list(ACTOR_ID);
      expect(result).toEqual([]);
    });
  });

  // ─── findOneOrFail() ────────────────────────────────────────────────────────

  describe('findOneOrFail()', () => {
    it('returns the saved report when it belongs to actor', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      const result = await service.findOneOrFail(report.id, ACTOR_ID);
      expect(result).toBe(report);
    });

    it('throws NotFoundException when report does not exist', async () => {
      savedReportRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneOrFail('non-existent', ACTOR_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when report belongs to a different actor', async () => {
      // findOne returns null because the query filters by createdById === actorId
      savedReportRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneOrFail('report-uuid-001', OTHER_ACTOR_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── delete() ────────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('deletes the report when actor is the owner', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);
      savedReportRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.delete(report.id, ACTOR_ID);

      expect(savedReportRepo.delete).toHaveBeenCalledWith(report.id);
    });

    it('throws when actor does not own the report', async () => {
      savedReportRepo.findOne.mockResolvedValue(null); // filtered out by ownership

      await expect(service.delete('report-uuid-001', OTHER_ACTOR_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(savedReportRepo.delete).not.toHaveBeenCalled();
    });

    it('calls auditLogService.logAsync with action REPORT_DEFINITION_DELETED', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);
      savedReportRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.delete(report.id, ACTOR_ID);

      await new Promise<void>((r) => setImmediate(r));
      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_DEFINITION_DELETED' }),
      );
    });
  });

  // ─── triggerExport() ────────────────────────────────────────────────────────

  describe('triggerExport()', () => {
    const dto: TriggerExportDto = { format: ExportFormat.XLSX };

    it('enqueues a job on QUEUE_NAMES.REPORT_EXPORT with correct payload', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      await service.triggerExport(report.id, ACTOR_ID, dto);

      expect(reportExportQueue.add).toHaveBeenCalledWith(
        QUEUE_NAMES.REPORT_EXPORT,
        expect.objectContaining({
          savedReportId: report.id,
          format: ExportFormat.XLSX,
          recipientId: ACTOR_ID, // defaults to actorId when not provided
        }),
        expect.objectContaining({ attempts: 3 }),
      );
    });

    it('uses dto.recipientId when explicitly provided', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);
      const customRecipient = 'recipient-uuid-999';

      await service.triggerExport(report.id, ACTOR_ID, { ...dto, recipientId: customRecipient });

      expect(reportExportQueue.add).toHaveBeenCalledWith(
        QUEUE_NAMES.REPORT_EXPORT,
        expect.objectContaining({ recipientId: customRecipient }),
        expect.anything(),
      );
    });

    it('defaults recipientId to actorId when dto.recipientId is omitted', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      await service.triggerExport(report.id, ACTOR_ID, { format: ExportFormat.PDF });

      expect(reportExportQueue.add).toHaveBeenCalledWith(
        QUEUE_NAMES.REPORT_EXPORT,
        expect.objectContaining({ recipientId: ACTOR_ID }),
        expect.anything(),
      );
    });

    it('returns jobId from BullMQ job', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      const result = await service.triggerExport(report.id, ACTOR_ID, dto);

      expect(result.jobId).toBe('job-id-123');
      expect(result.message).toBeDefined();
    });

    it('throws NotFoundException when saved report does not exist', async () => {
      savedReportRepo.findOne.mockResolvedValue(null);

      await expect(service.triggerExport('missing-id', ACTOR_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(reportExportQueue.add).not.toHaveBeenCalled();
    });

    it('calls auditLogService.logAsync with action REPORT_EXPORT_TRIGGERED', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      await service.triggerExport(report.id, ACTOR_ID, dto);

      await new Promise<void>((r) => setImmediate(r));
      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_EXPORT_TRIGGERED', actorId: ACTOR_ID }),
      );
    });

    it('job payload includes triggeredAt as an ISO date string', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      await service.triggerExport(report.id, ACTOR_ID, dto);

      const call = (reportExportQueue.add as jest.Mock).mock.calls[0];
      const payload = call[1] as { triggeredAt: string };
      expect(() => new Date(payload.triggeredAt)).not.toThrow();
      expect(new Date(payload.triggeredAt).toISOString()).toBe(payload.triggeredAt);
    });

    it('enqueues with exponential backoff config', async () => {
      const report = mockSavedReport();
      savedReportRepo.findOne.mockResolvedValue(report);

      await service.triggerExport(report.id, ACTOR_ID, dto);

      const options = (reportExportQueue.add as jest.Mock).mock.calls[0][2] as {
        backoff: { type: string };
      };
      expect(options.backoff.type).toBe('exponential');
    });
  });
});
