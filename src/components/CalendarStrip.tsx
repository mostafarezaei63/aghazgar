import { useMemo } from 'react';
import {
  getCurrentWeekDays,
  formatPersianDateString,
  toPersianDigits,
  getTodayISODate,
} from '../utils/persianDate';
import { Calendar, CalendarDays } from 'lucide-react';

interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  taskCountsByDate: Record<string, number>;
  onOpenFullCalendar?: () => void;
}

export function CalendarStrip({
  selectedDate,
  onSelectDate,
  taskCountsByDate,
  onOpenFullCalendar,
}: CalendarStripProps) {
  const todayISO = getTodayISODate();
  const todayFormatted = useMemo(() => formatPersianDateString(todayISO), [todayISO]);

  // Exact 7 days of the current week (from Saturday شنبه to Friday جمعه)
  const currentWeekDays = useMemo(() => getCurrentWeekDays(todayISO), [todayISO]);

  return (
    <div className="bg-slate-900 border-y border-slate-800/80 px-2 sm:px-3 py-2.5 select-none space-y-2.5">
      {/* Top Row: Fixed Today's Date Button & Full Calendar Button */}
      <div className="flex items-center justify-between px-1 text-xs">
        {/* Fixed Today's Date Button: Always shows current date, click opens today's tasks */}
        <button
          type="button"
          onClick={() => onSelectDate(todayISO)}
          className="flex items-center gap-2 text-slate-200 hover:text-emerald-400 font-semibold text-right transition-all group active:scale-95"
          title="مشاهده کارهای امروز (روز جاری)"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-emerald-300">
              {todayFormatted}
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-medium">
              امروز
            </span>
          </div>
        </button>

        {/* Full Persian Calendar Button */}
        <button
          type="button"
          onClick={onOpenFullCalendar}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 hover:border-emerald-500 text-emerald-400 text-xs font-bold active:scale-95 transition-all shadow-sm"
          title="باز کردن تقویم ماهانه شمسی و برنامه‌ریزی برای ماه‌های آینده"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>تقویم</span>
        </button>
      </div>

      {/* Current Week (Saturday to Friday) - Exactly 7 days, no scroll */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {currentWeekDays.map((day) => {
          const isSelected = day.iso === selectedDate;
          const count = taskCountsByDate[day.iso] || 0;

          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelectDate(day.iso)}
              className={`py-2 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 text-center ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300'
                  : day.isToday
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                  : day.isFriday
                  ? 'bg-slate-800/50 text-rose-300/90 hover:bg-slate-800'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className={`text-[10px] tracking-tight ${
                  isSelected
                    ? 'font-bold'
                    : day.isFriday
                    ? 'text-rose-400 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {day.dayName.slice(0, 3)}
              </span>
              <span className="text-sm font-bold font-mono my-0.5">
                {day.dayNumber}
              </span>
              {count > 0 ? (
                <span
                  className={`text-[9px] font-mono leading-none px-1 rounded-full ${
                    isSelected
                      ? 'bg-slate-950 text-emerald-400 font-bold'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              ) : (
                <span className="h-2.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
