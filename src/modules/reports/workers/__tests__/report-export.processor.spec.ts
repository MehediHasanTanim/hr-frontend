import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportExportProcessor } from '../report-export.processor';
import { ReportQueryService } from '../../services/report-query.service';
import { SavedReportService } from '../../services/saved-report.service';
import { S3Service } from '../../../../common/services/s3.service';
import { NotificationService } from '../../../notifications/notification.service';
import { AuditLogService } from '../../../../common/services/audit-log.service';
import { ExportFormat } from '../../enums/export-format.enum';
import { ReportKey } from '../../enums/report-key.enum';
import { ReportExportJobPayload } from '../report-export.processor';
import { QUEUE_NAMES } from '../../../../common/queue-names';

describe('ReportExportProcessor', () => {
  let processor: ReportExportProcessor;
  let reportQueryService: jest.Mocked<ReportQueryService>;
  let savedReportService: jest.Mocked<SavedReportService>;
  let s3Service: jest.Mocked<S3Service>;
  let notificationService: jest.Mocked<NotificationService>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const SAVED_REPORT_ID = 'saved-report-uuid';
  const RECIPIENT_ID = 'recipient-uuid';

  const mockSavedReport = {
    id: SAVED_REPORT_ID,
    name: 'Monthly Headcount',
    reportKey: ReportKey.HEADCOUNT,
    parameters: { reportKey: ReportKey.HEADCOUNT, startDate: '2025-01-01', endDate: '2025-06-30' },
    createdById: 'creator-uuid',
  };

  const mockReportResult = {
    reportKey: ReportKey.HEADCOUNT,
    generatedAt: new Date(),
    rows: [
      { departmentName: 'Engineering', headcount: 12 },
      { departmentName: 'HR', headcount: 4 },
    ],
    totalRows: 2,
  };

  function buildJob(
    overrides: Partial<ReportExportJobPayload> = {},
  ): Job<ReportExportJobPayload> {
    return {
      data: {
        savedReportId: SAVED_REPORT_ID,
        format: ExportFormat.XLSX,
        recipientId: RECIPIENT_ID,
        triggeredAt: new Date().toISOString(),
        ...overrides,
      },
    } as Job<ReportExportJobPayload>;
  }

  beforeEach(async () => {
    reportQueryService = {
      run: jest.fn().mockResolvedValue(mockReportResult),
    } as unknown as jest.Mocked<ReportQueryService>;

    savedReportService = {
      findOneOrFail: jest.fn().mockResolvedValue(mockSavedReport),
    } as unknown as jest.Mocked<SavedReportService>;

    s3Service = {
      putObject: jest.fn().mockResolvedValue({ key: 'reports/saved-report-uuid/2025-07-01.xlsx' }),
      getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed'),
    } as unknown as jest.Mocked<S3Service>;

    notificationService = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationService>;

    auditLogService = {
      logAsync: jest.fn().mockResolvedValue(undefined),
      log: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportExportProcessor,
        { provide: ReportQueryService, useValue: reportQueryService },
        { provide: SavedReportService, useValue: savedReportService },
        { provide: S3Service, useValue: s3Service },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    processor = module.get(ReportExportProcessor);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('handle() — happy path', () => {
    it('calls savedReportService.findOneOrFail with the savedReportId', async () => {
      await processor.handle(buildJob());
      expect(savedReportService.findOneOrFail).toHaveBeenCalledWith(
        SAVED_REPORT_ID,
        expect.any(String),
      );
    });

    it('calls reportQueryService.run with the saved report parameters', async () => {
      await processor.handle(buildJob());
      expect(reportQueryService.run).toHaveBeenCalledWith(mockSavedReport.parameters);
    });

    it('calls s3Service.putObject with a Buffer', async () => {
      await processor.handle(buildJob());
      const [, buffer] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string, Buffer, string];
      expect(Buffer.isBuffer(buffer)).toBe(true);
    });

    it('S3 key starts with reports/{savedReportId}/', async () => {
      await processor.handle(buildJob());
      const [s3Key] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string];
      expect(s3Key).toMatch(new RegExp(`^reports/${SAVED_REPORT_ID}/`));
    });

    it('S3 key ends with .xlsx for XLSX format', async () => {
      await processor.handle(buildJob({ format: ExportFormat.XLSX }));
      const [s3Key] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string];
      expect(s3Key).toMatch(/\.xlsx$/);
    });

    it('S3 key ends with .pdf for PDF format', async () => {
      await processor.handle(buildJob({ format: ExportFormat.PDF }));
      const [s3Key] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string];
      expect(s3Key).toMatch(/\.pdf$/);
    });

    it('does NOT pass the signed URL to notificationService', async () => {
      await processor.handle(buildJob());
      const notifyCall = (notificationService.create as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(JSON.stringify(notifyCall)).not.toContain('X-Amz-Signature');
      expect(JSON.stringify(notifyCall)).not.toContain('signed');
    });

    it('does NOT persist signed URL in audit log metadata', async () => {
      await processor.handle(buildJob());
      await new Promise<void>((r) => setImmediate(r));
      const auditCall = (auditLogService.logAsync as jest.Mock).mock.calls[0][0] as {
        metadata: Record<string, unknown>;
      };
      expect(JSON.stringify(auditCall.metadata)).not.toContain('signedUrl');
      expect(JSON.stringify(auditCall.metadata)).not.toContain('X-Amz');
    });

    it('calls notificationService.create with REPORT_READY type when recipientId provided', async () => {
      await processor.handle(buildJob({ recipientId: RECIPIENT_ID }));

      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: RECIPIENT_ID,
          type: 'REPORT_READY',
        }),
      );
    });

    it('calls auditLogService.logAsync with action REPORT_EXPORT_COMPLETED', async () => {
      await processor.handle(buildJob());
      await new Promise<void>((r) => setImmediate(r));

      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_EXPORT_COMPLETED' }),
      );
    });

    it('audit log metadata contains s3Key, format, and rowCount', async () => {
      await processor.handle(buildJob());
      await new Promise<void>((r) => setImmediate(r));

      const call = (auditLogService.logAsync as jest.Mock).mock.calls[0][0] as {
        metadata: Record<string, unknown>;
      };
      expect(call.metadata).toMatchObject(
        expect.objectContaining({
          format: ExportFormat.XLSX,
          rowCount: mockReportResult.totalRows,
        }),
      );
      expect(call.metadata.s3Key).toBeDefined();
    });
  });

  // ─── recipientId omitted ───────────────────────────────────────────────────

  describe('handle() — no recipientId', () => {
    it('does NOT call notificationService.create when recipientId is undefined', async () => {
      await processor.handle(buildJob({ recipientId: undefined }));
      expect(notificationService.create).not.toHaveBeenCalled();
    });

    it('completes successfully without notification', async () => {
      await expect(
        processor.handle(buildJob({ recipientId: undefined })),
      ).resolves.toBeUndefined();
    });
  });

  // ─── Notification failure resilience ──────────────────────────────────────

  describe('handle() — notification failure', () => {
    it('does NOT throw when notificationService.create rejects', async () => {
      notificationService.create.mockRejectedValue(new Error('Notification service down'));

      await expect(processor.handle(buildJob())).resolves.toBeUndefined();
    });

    it('S3 upload still completes even when notification fails', async () => {
      notificationService.create.mockRejectedValue(new Error('Notification service down'));

      await processor.handle(buildJob());
      expect(s3Service.putObject).toHaveBeenCalled();
    });

    it('audit log is still written when notification fails', async () => {
      notificationService.create.mockRejectedValue(new Error('Notification service down'));

      await processor.handle(buildJob());
      await new Promise<void>((r) => setImmediate(r));

      expect(auditLogService.logAsync).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_EXPORT_COMPLETED' }),
      );
    });
  });

  // ─── Retry-eligible errors ─────────────────────────────────────────────────

  describe('handle() — errors that should re-throw for BullMQ retry', () => {
    it('re-throws when savedReportService.findOneOrFail throws NotFoundException', async () => {
      savedReportService.findOneOrFail.mockRejectedValue(new NotFoundException('Not found'));

      await expect(processor.handle(buildJob())).rejects.toThrow(NotFoundException);
    });

    it('re-throws when reportQueryService.run throws', async () => {
      reportQueryService.run.mockRejectedValue(new Error('DB query failed'));

      await expect(processor.handle(buildJob())).rejects.toThrow('DB query failed');
    });

    it('re-throws when s3Service.putObject throws', async () => {
      s3Service.putObject.mockRejectedValue(new Error('S3 unavailable'));

      await expect(processor.handle(buildJob())).rejects.toThrow('S3 unavailable');
    });
  });

  // ─── XLSX format ──────────────────────────────────────────────────────────

  describe('XLSX formatting', () => {
    it('produces a non-empty buffer for XLSX', async () => {
      await processor.handle(buildJob({ format: ExportFormat.XLSX }));
      const [, buffer] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string, Buffer, string];
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('uses application/vnd.openxmlformats content type for XLSX', async () => {
      await processor.handle(buildJob({ format: ExportFormat.XLSX }));
      const [, , contentType] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string, Buffer, string];
      expect(contentType).toContain('spreadsheetml');
    });
  });

  // ─── PDF format ───────────────────────────────────────────────────────────

  describe('PDF formatting', () => {
    it('produces a non-empty buffer for PDF', async () => {
      await processor.handle(buildJob({ format: ExportFormat.PDF }));
      const [, buffer] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string, Buffer, string];
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('uses application/pdf content type for PDF', async () => {
      await processor.handle(buildJob({ format: ExportFormat.PDF }));
      const [, , contentType] = (s3Service.putObject as jest.Mock).mock.calls[0] as [string, Buffer, string];
      expect(contentType).toBe('application/pdf');
    });
  });

  // ─── stripPii enforcement ─────────────────────────────────────────────────

  describe('PII stripping in audit log', () => {
    const PII_DENY_LIST = ['base64Signature', 'passwordHash', 'otpCode', 'rawToken', 'signedUrl'];

    it.each(PII_DENY_LIST)('metadata does not contain PII field: %s', async (field) => {
      await processor.handle(buildJob());
      await new Promise<void>((r) => setImmediate(r));

      const call = (auditLogService.logAsync as jest.Mock).mock.calls[0][0] as {
        metadata: Record<string, unknown>;
      };
      expect(Object.keys(call.metadata ?? {})).not.toContain(field);
    });
  });
});
