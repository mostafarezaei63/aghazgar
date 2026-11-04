import { useState, useMemo } from 'react';
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  isoToJalali,
  jalaliToISO,
  toPersianDigits,
  getTodayISODate,
  getJalaliMonthMatrix,
  isTaskOnDate,
} from '../utils/persianDate';
import { Task } from '../types';
import { Calendar, ChevronRight, ChevronLeft, X, Plus, Check } from 'lucide-react';

interface FullPersianCalendarModalProps {
  selectedDate: string; // ISO date
  tasks: Task[];
  onClose: () => void;
  onSelectDate: (isoDate: string) => void;
  onScheduleNewTaskWithDateTime?: (isoDate: string, time: string) => void;
}

export function FullPersianCalendarModal({
  selectedDate,
  tasks,
  onClose,
  onSelectDate,
  onScheduleNewTaskWithDateTime,
}: FullPersianCalendarModalProps) {
  // Current view year & month based on selectedDate or today
  const initialJalali = useMemo(() => isoToJalali(selectedDate || getTodayISODate()), [selectedDate]);

  const [viewYear, setViewYear] = useState<number>(initialJalali.year);
  const [viewMonth, setViewMonth] = useState<number>(initialJalali.month);
  const [activeDate, setActiveDate] = useState<string>(selectedDate || getTodayISODate());
  const [selectedTime] = useState<string>('09:00');

  const todayISO = getTodayISODate();
  const availableYears = [1403, 1404, 1405, 1406, 1407, 1408];

  // Generate matrix for current month
  const cells = useMemo(() => {
    return getJalaliMonthMatrix(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Count tasks per date in this month (including recurring tasks)
  const taskCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    cells.forEach((cell) => {
      if (cell) {
        const matching = tasks.filter((t) => isTaskOnDate(t, cell.iso)).length;
        if (matching > 0) {
          map[cell.iso] = matching;
        }
      }
    });
    return map;
  }, [cells, tasks]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Quick jump to today
  const handleJumpToday = () => {
    const todayJ = isoToJalali(todayISO);
    setViewYear(todayJ.year);
    setViewMonth(todayJ.month);
    setActiveDate(todayISO);
  };

  const handleDayClick = (iso: string) => {
    setActiveDate(iso);
  };

  const handleConfirmSelect = () => {
    onSelectDate(activeDate);
    onClose();
  };

  const handleCreateTask = () => {
    if (onScheduleNewTaskWithDateTime) {
      onScheduleNewTaskWithDateTime(activeDate, selectedTime);
    } else {
      onSelectDate(activeDate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تقویم شمسی و برنامه‌ریزی ماهانه</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation & Selectors */}
        <div className="pt-3 pb-2 flex items-center justify-between gap-1.5">
          {/* Next month button (RTL: right arrow goes to next month) */}
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title="ماه بعد"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Month & Year Select Dropdowns */}
          <div className="flex items-center gap-1.5">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="p-1.5 px-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none"
            >
              {PERSIAN_MONTHS.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="p-1.5 px-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {toPersianDigits(y)}
                </option>
              ))}
            </select>

            <button
              onClick={handleJumpToday}
              className="py-1.5 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 text-[11px] font-bold transition-colors"
              title="بازگشت به امروز"
            >
              امروز
            </button>
          </div>

          {/* Prev month button (RTL: left arrow goes to prev month) */}
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title="ماه قبل"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center py-1.5 border-b border-slate-800/60 text-xs font-semibold">
          {PERSIAN_WEEKDAYS_SHORT.map((w, idx) => (
            <div
              key={idx}
              className={`py-1 text-[11px] ${
                idx === 6 ? 'text-rose-400 font-bold' : 'text-slate-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Monthly Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 pb-3">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-10 rounded-xl bg-transparent" />;
            }

            const isSelected = cell.iso === activeDate;
            const taskCount = taskCountMap[cell.iso] || 0;
            const isFriday = idx % 7 === 6;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => handleDayClick(cell.iso)}
                className={`relative h-11 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 text-xs font-bold ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300'
                    : cell.isToday
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                    : isFriday
                    ? 'bg-slate-800/50 text-rose-300/90 hover:bg-slate-800'
                    : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{toPersianDigits(cell.dayNumber)}</span>

                {/* Task Count badge/dot */}
                {taskCount > 0 && (
                  <span
                    className={`text-[9px] font-mono leading-none px-1 rounded-full ${
                      isSelected
                        ? 'bg-slate-950 text-emerald-400'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {toPersianDigits(taskCount)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleConfirmSelect}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700/80"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>مشاهده تقویم این روز</span>
          </button>

          <button
            type="button"
            onClick={handleCreateTask}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت کار جدید در این تاریخ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
