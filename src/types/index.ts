export type Priority = 'urgent_important' | 'important' | 'routine' | 'low';

export type TaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'rescheduled' | 'unfinished';

export type StartPunctuality = 'early' | 'on_time' | 'slight_delay' | 'moderate_delay' | 'severe_delay';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TaskRecurrence {
  type: RecurrenceType;
  // For weekly: array of 0..6 (0=شنبه, 1=یکشنبه, ..., 6=جمعه)
  weeklyDays?: number[];
  // For monthly: day of the Persian month (1 to 31)
  monthlyDay?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM e.g. "14:30"
  estimatedMinutes: number; // e.g. 45
  priority: Priority;
  category: string;
  progressPercentage: number; // 0 to 100%
  status: TaskStatus;

  // Recurrence rule
  recurrence?: TaskRecurrence;
  
  // Reminders & repeat
  reminderMinutesBefore: number; // e.g. 5, 10, 15
  reminderRepeatInterval: number; // e.g. 2, 5 (repeat every X minutes until started)
  
  // Initiation tracking
  initiatedAt?: string;
  startPunctuality?: StartPunctuality;
  delayMinutes?: number;
  
  // Completion
  completedAt?: string;
  actualDurationMinutes?: number;
  notes?: string;
  isCarriedOver?: boolean;
  originalDate?: string;
}

export type RewardDeliveryMode = 'immediate' | 'free_slot' | 'daily_review';

export interface CustomReward {
  id: string;
  title: string;
  description?: string;
  deliveryMode: RewardDeliveryMode; // سریع، در زمان خالی، یا جمع‌بندی شبانه
  pointsRequired: number; // e.g. 50
  unlockedCount: number;
  lastClaimedAt?: string;
}

export interface CustomPenalty {
  id: string;
  title: string;
  description?: string;
  triggerCondition: 'moderate_delay' | 'severe_delay' | 'unfinished_task';
  enforcedCount: number;
  lastEnforcedAt?: string;
}

export interface FreeTimeSlot {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
}

export interface MetricDataPoint {
  date: string; // YYYY-MM-DD or display label
  timestamp: number;
  punctualityRate: number; // 0-100%
  avgDelayMinutes: number; // minutes
  progressRate: number; // 0-100%
  disciplineScore: number;
}
