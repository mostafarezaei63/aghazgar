import { Task, CustomReward, CustomPenalty, FreeTimeSlot, MetricDataPoint } from '../types';
import { getTodayISODate, getNextDayISODate } from './persianDate';

const STORAGE_KEYS = {
  TASKS: 'aghazgar_v3_tasks',
  REWARDS: 'aghazgar_v3_rewards',
  PENALTIES: 'aghazgar_v3_penalties',
  SCORE: 'aghazgar_v3_score',
  STREAK: 'aghazgar_v3_streak',
};

const today = getTodayISODate();

const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'بررسی ایمیل‌ها و تنظیم اولویت‌های امروز',
    description: 'مشخص کردن ۳ اولویت مهم روز بدون چک کردن شبکه‌های اجتماعی',
    date: today,
    scheduledTime: '08:30',
    estimatedMinutes: 30,
    priority: 'urgent_important',
    category: 'کاری',
    progressPercentage: 100,
    status: 'completed',
    reminderMinutesBefore: 10,
    reminderRepeatInterval: 2,
    initiatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    startPunctuality: 'on_time',
    delayMinutes: 0,
    completedAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    actualDurationMinutes: 25,
  },
  {
    id: 't-2',
    title: 'توسعه ماژول احراز هویت و تست امنیت',
    description: 'کدنویسی بخش توکن‌ها و بررسی سناریوهای اکسپایر شدن',
    date: today,
    scheduledTime: '10:00',
    estimatedMinutes: 90,
    priority: 'urgent_important',
    category: 'پروژه',
    progressPercentage: 60,
    status: 'in_progress',
    reminderMinutesBefore: 15,
    reminderRepeatInterval: 5,
    initiatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    startPunctuality: 'early',
    delayMinutes: -3,
  },
  {
    id: 't-3',
    title: 'ورزش هوازی و تمرینات کششی',
    description: 'پیاده‌روی سریع و نرمش برای رفرش ذهن',
    date: today,
    scheduledTime: '13:00',
    estimatedMinutes: 30,
    priority: 'routine',
    category: 'سلامت',
    progressPercentage: 0,
    status: 'scheduled',
    reminderMinutesBefore: 10,
    reminderRepeatInterval: 3,
  },
  {
    id: 't-4',
    title: 'مطالعه ۲۰ صفحه کتاب تخصصی',
    description: 'مطالعه متمرکز و خلاصه‌نویسی نکات کلیدی',
    date: today,
    scheduledTime: '16:00',
    estimatedMinutes: 45,
    priority: 'important',
    category: 'یادگیری',
    progressPercentage: 0,
    status: 'scheduled',
    reminderMinutesBefore: 5,
    reminderRepeatInterval: 2,
  },
  {
    id: 't-5',
    title: 'جلسه بازبینی هفتگی با تیم',
    description: 'ارائه گزارش عملکرد و برنامه‌ریزی هفته پیش‌رو',
    date: today,
    scheduledTime: '18:30',
    estimatedMinutes: 45,
    priority: 'important',
    category: 'کاری',
    progressPercentage: 0,
    status: 'scheduled',
    reminderMinutesBefore: 15,
    reminderRepeatInterval: 5,
  },
];

const DEFAULT_REWARDS: CustomReward[] = [
  {
    id: 'r-1',
    title: '۲۰ دقیقه استراحت با فنجان قهوه اسپرسو و پادکست دلخواه',
    description: 'پاداش دوپامینی در وقت خالی روز جهت بازتوانی مغز',
    deliveryMode: 'free_slot',
    pointsRequired: 50,
    unlockedCount: 4,
    lastClaimedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'r-2',
    title: 'تماشای یک قسمت سریال یا ویدیوی یوتیوب محبوب',
    description: 'پاداش شبانه پس از ثبت حداقل ۸۰٪ پیشرفت در کارهای مهم',
    deliveryMode: 'daily_review',
    pointsRequired: 100,
    unlockedCount: 6,
  },
  {
    id: 'r-3',
    title: 'خرید یک خوراکی یا میوه تازه مورد علاقه',
    description: 'پاداش آنی پس از ۳ شروع متوالی سر وقت بدون تعلل',
    deliveryMode: 'immediate',
    pointsRequired: 75,
    unlockedCount: 2,
  },
];

const DEFAULT_PENALTIES: CustomPenalty[] = [
  {
    id: 'p-1',
    title: 'ممنوعیت کامل شبکه‌های اجتماعی و اسکرول تا فردا صبح',
    description: 'جریمه بازدارنده در صورت تعلل بیش از ۱۵ دقیقه در شروع کار فوری',
    triggerCondition: 'moderate_delay',
    enforcedCount: 1,
    lastEnforcedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'p-2',
    title: 'انجام ۴۰ حرکت شنا یا پیاده‌روی اجباری بدون هدفون',
    description: 'جریمه فیزیکی برای افزایش هوشیاری و غلبه بر تنبلی',
    triggerCondition: 'severe_delay',
    enforcedCount: 0,
  },
  {
    id: 'p-3',
    title: 'واریز ۵۰ هزار تومان به صندوق خیریه / صدقه',
    description: 'جریمه مالی در ازای رها کردن یا انجام ندادن کار اولویت بالا',
    triggerCondition: 'unfinished_task',
    enforcedCount: 1,
  },
];

// Generate 1-year realistic historical points for the line/spline chart
export function generateHistoricalMetrics(): MetricDataPoint[] {
  const points: MetricDataPoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  
  // We produce ~52 weekly data points over 1 year (365 days)
  for (let w = 52; w >= 0; w--) {
    const timestamp = now - w * 7 * dayMs;
    const dateObj = new Date(timestamp);
    const dateLabel = new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj);

    // Realistic progressive learning curve: start from ~55% punctuality to ~88%
    const progressFactor = (52 - w) / 52;
    const randomVariation = (Math.sin(w * 0.7) * 5);
    
    const punctualityRate = Math.min(96, Math.max(45, Math.round(58 + progressFactor * 30 + randomVariation)));
    const avgDelayMinutes = Math.max(1, Math.round(18 - progressFactor * 13 + (Math.cos(w * 0.5) * 2)));
    const progressRate = Math.min(95, Math.max(50, Math.round(62 + progressFactor * 26 + randomVariation * 0.8)));
    const disciplineScore = Math.round(200 + progressFactor * 650 + randomVariation * 10);

    points.push({
      date: dateLabel,
      timestamp,
      punctualityRate,
      avgDelayMinutes,
      progressRate,
      disciplineScore,
    });
  }

  return points;
}

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function getStoredRewards(): CustomReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (!raw) return DEFAULT_REWARDS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REWARDS;
  }
}

export function saveRewards(rewards: CustomReward[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
  } catch (e) {
    console.error('Failed to save rewards', e);
  }
}

export function getStoredPenalties(): CustomPenalty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENALTIES);
    if (!raw) return DEFAULT_PENALTIES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PENALTIES;
  }
}

export function savePenalties(penalties: CustomPenalty[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PENALTIES, JSON.stringify(penalties));
  } catch (e) {
    console.error('Failed to save penalties', e);
  }
}

export function getStoredScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORE);
    if (!raw) return 580;
    return parseInt(raw, 10);
  } catch {
    return 580;
  }
}

export function saveScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE, String(score));
  } catch (e) {
    console.error('Failed to save score', e);
  }
}

export function getStoredStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) return 5;
    return parseInt(raw, 10);
  } catch {
    return 5;
  }
}

export function saveStreak(streak: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
  } catch (e) {
    console.error('Failed to save streak', e);
  }
}

// Find empty calendar gaps during day hours (08:00 - 22:00)
// If minStartMinutes is provided (e.g. for today's current time), only returns future slots
export function calculateFreeTimeSlots(dayTasks: Task[], minStartMinutes?: number): FreeTimeSlot[] {
  // Sort tasks by scheduled time
  const sorted = [...dayTasks].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const slots: FreeTimeSlot[] = [];

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const toTimeString = (totalMinutes: number) => {
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const m = String(totalMinutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const defaultDayStart = toMinutes('08:00');
  let currentPointer = minStartMinutes !== undefined ? Math.max(defaultDayStart, minStartMinutes) : defaultDayStart;
  const dayEnd = toMinutes('22:00'); // Day end

  for (const t of sorted) {
    const taskStart = toMinutes(t.scheduledTime);
    const taskEnd = taskStart + t.estimatedMinutes;

    if (taskStart > currentPointer) {
      const gap = taskStart - currentPointer;
      if (gap >= 20) {
        slots.push({
          startTime: toTimeString(currentPointer),
          endTime: toTimeString(taskStart),
          durationMinutes: gap,
        });
      }
    }
    currentPointer = Math.max(currentPointer, taskEnd);
  }

  if (currentPointer < dayEnd) {
    const gap = dayEnd - currentPointer;
    if (gap >= 20) {
      slots.push({
        startTime: toTimeString(currentPointer),
        endTime: toTimeString(dayEnd),
        durationMinutes: gap,
      });
    }
  }

  return slots;
}

// Auto-reschedule unfinished tasks into empty calendar slots strictly AFTER current time based on priority
export function autoRescheduleUnfinishedTasks(
  allTasks: Task[],
  selectedDate: string
): { updatedTasks: Task[]; rescheduledCount: number } {
  const isToday = selectedDate === getTodayISODate();
  const now = new Date();
  // Round up to the next 5-minute mark after current time (e.g. 14:12 -> 14:20)
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minStartMinutes = isToday ? Math.ceil((nowMinutes + 5) / 5) * 5 : undefined;

  const dayTasks = allTasks.filter((t) => t.date === selectedDate);
  const freeSlots = calculateFreeTimeSlots(dayTasks, minStartMinutes);

  // Find tasks that are not 100% complete and are marked unfinished or scheduled past their time
  const unfinished = dayTasks.filter((t) => t.progressPercentage < 100 && t.status !== 'completed');

  // Priority order
  const priorityWeight: Record<string, number> = {
    urgent_important: 4,
    important: 3,
    routine: 2,
    low: 1,
  };

  unfinished.sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  let rescheduledCount = 0;
  let slotIndex = 0;

  const updatedTasks = allTasks.map((task) => {
    // Only reschedule tasks that need a slot
    if (
      task.date === selectedDate &&
      task.progressPercentage < 100 &&
      task.status !== 'completed' &&
      slotIndex < freeSlots.length
    ) {
      const targetSlot = freeSlots[slotIndex];
      if (targetSlot) {
        slotIndex++;
        rescheduledCount++;
        return {
          ...task,
          scheduledTime: targetSlot.startTime,
          status: 'rescheduled' as const,
        };
      }
    }
    return task;
  });

  return { updatedTasks, rescheduledCount };
}

// Automatically carry over any past unfinished tasks (from yesterday or older) into today's empty calendar slots
export function autoRolloverPastUnfinishedTasks(
  allTasks: Task[]
): { updatedTasks: Task[]; rolledOverCount: number } {
  const todayISO = getTodayISODate();
  const pastUnfinished = allTasks.filter(
    (t) => t.date < todayISO && t.progressPercentage < 100 && t.status !== 'completed'
  );

  if (pastUnfinished.length === 0) {
    return { updatedTasks: allTasks, rolledOverCount: 0 };
  }

  // Priority order: Urgent & Important first, then Important, Routine, Low
  const priorityWeight: Record<string, number> = {
    urgent_important: 4,
    important: 3,
    routine: 2,
    low: 1,
  };
  pastUnfinished.sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minStartMinutes = Math.ceil((nowMinutes + 5) / 5) * 5;

  const todayExistingTasks = allTasks.filter((t) => t.date === todayISO);
  const freeSlots = calculateFreeTimeSlots(todayExistingTasks, minStartMinutes);

  let rolledOverCount = 0;
  let slotIdx = 0;
  const pastIds = new Set(pastUnfinished.map((t) => t.id));

  const updatedTasks = allTasks.map((task) => {
    if (pastIds.has(task.id)) {
      rolledOverCount++;
      const slot = slotIdx < freeSlots.length ? freeSlots[slotIdx++] : null;
      return {
        ...task,
        date: todayISO,
        scheduledTime: slot ? slot.startTime : task.scheduledTime,
        status: 'rescheduled' as const,
        isCarriedOver: true,
        originalDate: task.originalDate || task.date,
      };
    }
    return task;
  });

  return { updatedTasks, rolledOverCount };
}

// Carry over unfinished tasks of a specific day to the next day's empty slots
export function rolloverUnfinishedTasksToTomorrow(
  allTasks: Task[],
  fromDate: string
): { updatedTasks: Task[]; movedCount: number; targetDate: string } {
  const targetDate = getNextDayISODate(fromDate);
  const unfinished = allTasks.filter(
    (t) => t.date === fromDate && t.progressPercentage < 100 && t.status !== 'completed'
  );

  if (unfinished.length === 0) {
    return { updatedTasks: allTasks, movedCount: 0, targetDate };
  }

  const priorityWeight: Record<string, number> = {
    urgent_important: 4,
    important: 3,
    routine: 2,
    low: 1,
  };
  unfinished.sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  const targetDayExistingTasks = allTasks.filter((t) => t.date === targetDate);
  const freeSlots = calculateFreeTimeSlots(targetDayExistingTasks);

  let movedCount = 0;
  let slotIdx = 0;
  const unfinishedIds = new Set(unfinished.map((t) => t.id));

  const updatedTasks = allTasks.map((task) => {
    if (unfinishedIds.has(task.id)) {
      movedCount++;
      const slot = slotIdx < freeSlots.length ? freeSlots[slotIdx++] : null;
      return {
        ...task,
        date: targetDate,
        scheduledTime: slot ? slot.startTime : task.scheduledTime,
        status: 'rescheduled' as const,
        isCarriedOver: true,
        originalDate: task.originalDate || task.date,
      };
    }
    return task;
  });

  return { updatedTasks, movedCount, targetDate };
}
