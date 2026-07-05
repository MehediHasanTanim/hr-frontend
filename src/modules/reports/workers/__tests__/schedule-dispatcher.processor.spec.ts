import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleDispatcherProcessor } from '../schedule-dispatcher.processor';
import { ReportScheduleService } from '../../services/report-schedule.service';
import { ReportScheduleEntity } from '../../entities/report-schedule.entity';
import { ExportFormat } from '../../enums/export-format.enum';
import { ReportKey } from '../../enums/report-key.enum';

describe('ScheduleDispatcherProcessor', () => {
  let processor: ScheduleDispatcherProcessor;
  let reportScheduleService: jest.Mocked<ReportScheduleService>;

  const mockDueSchedule = (id: string): ReportScheduleEntity =>
    ({
      id,
      savedReportId: 'saved-report-uuid',
      cronExpression: '0 9 * * MON',
      format: ExportFormat.XLSX,
      isActive: true,
      nextRunAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    } as unknown as ReportScheduleEntity);

  beforeEach(async () => {
    reportScheduleService = {
      findDueSchedules: jest.fn().mockResolvedValue([]),
      enqueueBySchedule: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ReportScheduleService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleDispatcherProcessor,
        { provide: ReportScheduleService, useValue: reportScheduleService },
      ],
    }).compile();

    processor = module.get(ScheduleDispatcherProcessor);
  });

  afterEach(() => jest.clearAllMocks());

  describe('tick()', () => {
    it('calls findDueSchedules once per tick', async () => {
      await processor.tick();
      expect(reportScheduleService.findDueSchedules).toHaveBeenCalledTimes(1);
    });

    it('calls enqueueBySchedule for each due schedule', async () => {
      const dueSchedules = [mockDueSchedule('s-001'), mockDueSchedule('s-002')];
      reportScheduleService.findDueSchedules.mockResolvedValue(dueSchedules);

      await processor.tick();

      expect(reportScheduleService.enqueueBySchedule).toHaveBeenCalledTimes(2);
      expect(reportScheduleService.enqueueBySchedule).toHaveBeenCalledWith('s-001');
      expect(reportScheduleService.enqueueBySchedule).toHaveBeenCalledWith('s-002');
    });

    it('does NOT call enqueueBySchedule when no schedules are due', async () => {
      reportScheduleService.findDueSchedules.mockResolvedValue([]);

      await processor.tick();

      expect(reportScheduleService.enqueueBySchedule).not.toHaveBeenCalled();
    });

    it('uses Promise.allSettled — one failing enqueue does not prevent others', async () => {
      const dueSchedules = [
        mockDueSchedule('s-fail'),
        mockDueSchedule('s-ok-1'),
        mockDueSchedule('s-ok-2'),
      ];
      reportScheduleService.findDueSchedules.mockResolvedValue(dueSchedules);
      reportScheduleService.enqueueBySchedule
        .mockRejectedValueOnce(new Error('BullMQ error'))   // s-fail throws
        .mockResolvedValue(undefined);                       // s-ok-1 and s-ok-2 succeed

      // Must not throw even though one schedule failed
      await expect(processor.tick()).resolves.toBeUndefined();

      // All three schedules were attempted
      expect(reportScheduleService.enqueueBySchedule).toHaveBeenCalledTimes(3);
    });

    it('resolves even when ALL enqueues fail', async () => {
      const dueSchedules = [mockDueSchedule('s-001'), mockDueSchedule('s-002')];
      reportScheduleService.findDueSchedules.mockResolvedValue(dueSchedules);
      reportScheduleService.enqueueBySchedule.mockRejectedValue(new Error('Queue down'));

      await expect(processor.tick()).resolves.toBeUndefined();
    });

    it('resolves when findDueSchedules returns an empty array', async () => {
      reportScheduleService.findDueSchedules.mockResolvedValue([]);
      await expect(processor.tick()).resolves.toBeUndefined();
    });
  });
});
