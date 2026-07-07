// src/types/feedback.ts
// Sprint 8 — Continuous Feedback & 1:1 Meetings types

export type FeedbackVisibility = 'private_to_recipient' | 'shared_with_manager' | 'public_to_team';
export type FeedbackCategory = 'praise' | 'constructive' | 'general';
export type ActionItemStatus = 'open' | 'completed';

export interface Feedback {
  id: string;
  givenBy: string;
  givenByName: string;
  receivedBy: string;
  receivedByName?: string;
  visibility: FeedbackVisibility;
  category: FeedbackCategory;
  message: string;
  relatedGoalId: string | null;
  createdAt: string;
}

export interface OneOnOneMeeting {
  id: string;
  managerId: string;
  employeeId: string;
  employeeName?: string;
  managerName?: string;
  meetingDate: string;
  notes: string;
  actionItems: MeetingActionItem[];
}

export interface MeetingActionItem {
  id: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  dueDate: string | null;
  status: ActionItemStatus;
}
