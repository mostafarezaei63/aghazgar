import { useState, useMemo } from 'react';
import {
  PERSIAN_MONTHS,
  isoToJalali,
  jalaliToISO,
  toPersianDigits,
  getTodayISODate,
} from '../utils/persianDate';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

interface PersianDatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (isoDate: string) => void;
}

export function PersianDatePicker({ value, onChange }: PersianDatePickerProps) {
  // Convert current ISO date to Jalali
  const initialJalali = useMemo(() => isoToJalali(value || getTodayISODate()), [value]);

  const [jYear, setJYear] = useState<number>(initialJalali.year);
  const [jMonth, setJMonth] = useState<number>(initialJalali.month);
  const [jDay, setJDay] = useState<number>(initialJalali.day);

  // Maximum days in chosen Jalali month
  const maxDays = useMemo(() => {
    if (jMonth <= 6) return 31;
    if (jMonth <= 11) return 30;
    // Check leap year for Esfand (approximate 33-year cycle)
    const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(jYear % 33);
    return isLeap ? 30 : 29;
  }, [jMonth, jYear]);

  // Adjust day if month changed to fewer days
  const handleMonthChange = (newMonth: number) => {
    setJMonth(newMonth);
    const newMax = newMonth <= 6 ? 31 : newMonth <= 11 ? 30 : 29;
    const adjustedDay = Math.min(jDay, newMax);
    setJDay(adjustedDay);
    const iso = jalaliToISO(jYear, newMonth, adjustedDay);
    onChange(iso);
  };

  const handleYearChange = (newYear: number) => {
    setJYear(newYear);
    const iso = jalaliToISO(newYear, jMonth, jDay);
    onChange(iso);
  };

  const handleDayChange = (newDay: number) => {
    setJDay(newDay);
    const iso = jalaliToISO(jYear, jMonth, newDay);
    onChange(iso);
  };

  // Quick preset handlers
  const setQuickOffset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    const j = isoToJalali(iso);
    setJYear(j.year);
    setJMonth(j.month);
    setJDay(j.day);
    onChange(iso);
  };

  // Years array (current +- 3 years)
  const years = [1403, 1404, 1405, 1406, 1407];

  return (
    <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-2.5">
      {/* Header Label and Formatted Preview */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>تاریخ تقویم شمسی *</span>
        </label>
        <span className="text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-slate-700 font-sans">
          {toPersianDigits(jDay)} {PERSIAN_MONTHS[jMonth - 1]} {toPersianDigits(jYear)}
        </span>
      </div>

      {/* Pure Persian Solar Selectors: Day, Month, Year */}
      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">روز شمسی</label>
          <select
            value={jDay}
            onChange={(e) => handleDayChange(Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs focus:border-emerald-500 focus:outline-none"
          >
            {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {toPersianDigits(d)}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">ماه شمسی</label>
          <select
            value={jMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-center text-xs focus:border-emerald-500 focus:outline-none"
          >
            {PERSIAN_MONTHS.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">سال شمسی</label>
          <select
            value={jYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs focus:border-emerald-500 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {toPersianDigits(y)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick 1-tap shortcuts */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => setQuickOffset(0)}
          className="flex-1 py-1 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-[10px] text-slate-300 font-medium transition-colors"
        >
          امروز
        </button>
        <button
          type="button"
          onClick={() => setQuickOffset(1)}
          className="flex-1 py-1 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-[10px] text-slate-300 font-medium transition-colors"
        >
          فردا
        </button>
        <button
          type="button"
          onClick={() => setQuickOffset(2)}
          className="flex-1 py-1 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-[10px] text-slate-300 font-medium transition-colors"
        >
          پس‌فردا
        </button>
      </div>
    </div>
  );
}
