import { StartPunctuality, TaskRecurrence } from '../types';

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/**
 * Standard Jalali <-> Gregorian algorithms
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 0) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  gy += Math.floor((days - 1) / 365);
  if (days > 0) days = (days - 1) % 365;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  return [gy, gm, days + 1];
}

export function isoToJalali(isoDate: string): {
  year: number;
  month: number;
  day: number;
  monthName: string;
  formatted: string;
} {
  try {
    const [gy, gm, gd] = isoDate.split('-').map(Number);
    const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
    return {
      year: jy,
      month: jm,
      day: jd,
      monthName: PERSIAN_MONTHS[jm - 1] || '',
      formatted: `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`,
    };
  } catch {
    return {
      year: 1405,
      month: 8,
      day: 2,
      monthName: 'آبان',
      formatted: '۲ آبان ۱۴۰۵',
    };
  }
}

export function jalaliToISO(jy: number, jm: number, jd: number): string {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  const mStr = String(gm).padStart(2, '0');
  const dStr = String(gd).padStart(2, '0');
  return `${gy}-${mStr}-${dStr}`;
}

export function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPersianDateString(isoDate: string): string {
  try {
    const { formatted } = isoToJalali(isoDate);
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
    return `${weekday}، ${formatted}`;
  } catch {
    return isoDate;
  }
}

export function formatPersianFullDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'امروز';
  }
}

export function getCurrentPersianTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function calculateDelayMinutes(scheduledTime: string, actualTime: Date = new Date()): number {
  const [schedH, schedM] = scheduledTime.split(':').map(Number);
  const actualH = actualTime.getHours();
  const actualM = actualTime.getMinutes();

  const schedTotal = schedH * 60 + schedM;
  const actualTotal = actualH * 60 + actualM;

  return actualTotal - schedTotal;
}

export function evaluatePunctuality(delayMinutes: number): {
  punctuality: StartPunctuality;
  points: number;
  label: string;
  isReward: boolean;
  colorClass: string;
  reason: string;
} {
  if (delayMinutes <= -5) {
    return {
      punctuality: 'early',
      points: 55,
      label: 'شروع پیش‌دستانه',
      isReward: true,
      colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      reason: `${toPersianDigits(Math.abs(delayMinutes))} دقیقه زودتر از موعد مقرر`,
    };
  }

  if (delayMinutes >= -4 && delayMinutes <= 3) {
    return {
      punctuality: 'on_time',
      points: 50,
      label: 'شروع دقیق سر وقت',
      isReward: true,
      colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      reason: 'شروع دقیق در ثانیه‌های آغازین',
    };
  }

  if (delayMinutes > 3 && delayMinutes <= 10) {
    return {
      punctuality: 'slight_delay',
      points: 20,
      label: 'تأخیر جزئی (پذیرفته)',
      isReward: true,
      colorClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      reason: `${toPersianDigits(delayMinutes)} دقیقه تاخیر در شروع`,
    };
  }

  if (delayMinutes > 10 && delayMinutes <= 30) {
    return {
      punctuality: 'moderate_delay',
      points: -15,
      label: 'تعلل و جریمه',
      isReward: false,
      colorClass: 'text-orange-400 bg-orange-950/40 border-orange-500/30',
      reason: `${toPersianDigits(delayMinutes)} دقیقه تعلل در آغاز کار`,
    };
  }

  return {
    punctuality: 'severe_delay',
    points: -35,
    label: 'اهمال‌کاری شدید',
    isReward: false,
    colorClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    reason: `بیش از ${toPersianDigits(delayMinutes)} دقیقه معطلی غیرمجاز`,
  };
}

// Generate calendar days around center date
export function getCalendarDays(centerDateStr: string = getTodayISODate(), rangeDays: number = 14): {
  iso: string;
  dayNumber: string;
  dayName: string;
  monthName: string;
  isToday: boolean;
}[] {
  const [cy, cm, cd] = centerDateStr.split('-').map(Number);
  const center = new Date(cy, cm - 1, cd);
  const todayISO = getTodayISODate();

  const results = [];
  for (let i = -3; i < rangeDays - 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${day}`;

    const { day: jDay, monthName: jMonth } = isoToJalali(iso);
    const dayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(d);

    results.push({
      iso,
      dayNumber: toPersianDigits(jDay),
      dayName,
      monthName: jMonth,
      isToday: iso === todayISO,
    });
  }
  return results;
}

/**
 * Returns the exact 7 days of the current week (from Saturday شنبه to Friday جمعه)
 */
export function getCurrentWeekDays(todayIsoStr: string = getTodayISODate()): {
  iso: string;
  dayNumber: string;
  dayName: string;
  shortDayName: string;
  isToday: boolean;
  isFriday: boolean;
}[] {
  const [y, m, d] = todayIsoStr.split('-').map(Number);
  const refDate = new Date(y, m - 1, d);
  const weekdayIdx = getPersianWeekdayIndex(todayIsoStr); // 0 (شنبه) to 6 (جمعه)
  const todayISO = getTodayISODate();

  // Find Saturday of the current week
  const saturday = new Date(refDate);
  saturday.setDate(saturday.getDate() - weekdayIdx);

  const persianDayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
  const persianShortNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(saturday);
    cur.setDate(cur.getDate() + i);

    const cy = cur.getFullYear();
    const cm = String(cur.getMonth() + 1).padStart(2, '0');
    const cd = String(cur.getDate()).padStart(2, '0');
    const iso = `${cy}-${cm}-${cd}`;

    const { day: jDay } = isoToJalali(iso);

    days.push({
      iso,
      dayNumber: toPersianDigits(jDay),
      dayName: persianDayNames[i],
      shortDayName: persianShortNames[i],
      isToday: iso === todayISO,
      isFriday: i === 6,
    });
  }

  return days;
}

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/**
 * Returns 0 for Saturday (شنبه), 1 for Sunday (یکشنبه), ..., 6 for Friday (جمعه)
 */
export function getPersianWeekdayIndex(isoDate: string): number {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const jsDay = new Date(y, m - 1, d).getDay(); // 0 is Sunday, 6 is Saturday
    return (jsDay + 1) % 7;
  } catch {
    return 0;
  }
}

/**
 * Determines whether a task (one-time or recurring) falls on a given ISO date
 */
export function isTaskOnDate(
  task: { date: string; recurrence?: TaskRecurrence },
  targetIsoDate: string
): boolean {
  if (task.date === targetIsoDate) return true;

  if (!task.recurrence || task.recurrence.type === 'none') {
    return false;
  }

  // Recurrence only applies on or after the initial start date
  if (targetIsoDate < task.date) {
    return false;
  }

  switch (task.recurrence.type) {
    case 'daily':
      return true;

    case 'weekly': {
      const weekdayIdx = getPersianWeekdayIndex(targetIsoDate);
      return Array.isArray(task.recurrence.weeklyDays) && task.recurrence.weeklyDays.includes(weekdayIdx);
    }

    case 'monthly': {
      const { day: targetJalaliDay } = isoToJalali(targetIsoDate);
      return targetJalaliDay === task.recurrence.monthlyDay;
    }

    default:
      return false;
  }
}

/**
 * Return number of days in a given Jalali year and month
 */
export function getJalaliMonthDaysCount(jYear: number, jMonth: number): number {
  if (jMonth <= 6) return 31;
  if (jMonth <= 11) return 30;
  // Approximate leap year check for Esfand
  const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(jYear % 33);
  return isLeap ? 30 : 29;
}

export interface JalaliCalendarCell {
  dayNumber: number;
  iso: string;
  isToday: boolean;
  isCurrentMonth: boolean;
}

/**
 * Generates the full 7-column grid of days for a given Jalali month
 */
export function getJalaliMonthMatrix(jYear: number, jMonth: number): (JalaliCalendarCell | null)[] {
  const maxDays = getJalaliMonthDaysCount(jYear, jMonth);
  const firstDayISO = jalaliToISO(jYear, jMonth, 1);
  const firstDayWeekday = getPersianWeekdayIndex(firstDayISO); // 0 (شنبه) to 6 (جمعه)
  const todayISO = getTodayISODate();

  const cells: (JalaliCalendarCell | null)[] = [];

  // Blank slots for days before the 1st
  for (let i = 0; i < firstDayWeekday; i++) {
    cells.push(null);
  }

  // Days of the month
  for (let d = 1; d <= maxDays; d++) {
    const iso = jalaliToISO(jYear, jMonth, d);
    cells.push({
      dayNumber: d,
      iso,
      isToday: iso === todayISO,
      isCurrentMonth: true,
    });
  }

  return cells;
}

/**
 * Returns the ISO string (YYYY-MM-DD) for the day after the given date
 */
export function getNextDayISODate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const nextDate = new Date(y, m - 1, d + 1);
  const ny = nextDate.getFullYear();
  const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
  const nd = String(nextDate.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

