import { useState } from 'react';
import { Priority, Task, RecurrenceType, TaskRecurrence } from '../types';
import { X, CalendarClock, Bell, Clock, Repeat, Check, AlignRight } from 'lucide-react';
import { toPersianDigits, getTodayISODate, isoToJalali, PERSIAN_WEEKDAYS } from '../utils/persianDate';
import { PersianDatePicker } from './PersianDatePicker';

interface TaskFormModalProps {
  initialTask?: Task | null;
  selectedDate: string;
  initialTime?: string;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'status'> & { id?: string }) => void;
}

export function TaskFormModal({
  initialTask,
  selectedDate,
  initialTime,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [date, setDate] = useState(initialTask?.date || selectedDate || getTodayISODate());
  const [scheduledTime, setScheduledTime] = useState(
    initialTask?.scheduledTime || initialTime || '14:00'
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTask?.estimatedMinutes || 30);
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'important');
  const [category, setCategory] = useState(initialTask?.category || 'کاری');
  const [progressPercentage, setProgressPercentage] = useState(initialTask?.progressPercentage || 0);

  // Reminders & repeat until start
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(initialTask?.reminderMinutesBefore ?? 10);
  const [reminderRepeatInterval, setReminderRepeatInterval] = useState(initialTask?.reminderRepeatInterval ?? 2);

  // Recurrence settings (هر روز / روزهای مشخص از هر هفته / روزهای مشخص از هر ماه)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    initialTask?.recurrence?.type || 'none'
  );
  // Default weekly days: Saturday to Wednesday (شنبه تا چهارشنبه: 0, 1, 2, 3, 4)
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    initialTask?.recurrence?.weeklyDays || [0, 1, 2, 3, 4]
  );
  // Default monthly day: current day of Persian month (1..31)
  const [monthlyDay, setMonthlyDay] = useState<number>(
    initialTask?.recurrence?.monthlyDay || isoToJalali(date).day || 1
  );

  const categories = ['کاری', 'پروژه', 'سلامت', 'یادگیری', 'شخصی'];

  const priorityOptions: { value: Priority; label: string; desc: string; color: string }[] = [
    { value: 'urgent_important', label: 'فوری و مهم', desc: 'اولویت اول جای‌گذاری', color: 'border-rose-500/40 text-rose-300 bg-rose-950/20' },
    { value: 'important', label: 'مهم', desc: 'پیشرفت استراتژیک', color: 'border-blue-500/40 text-blue-300 bg-blue-950/20' },
    { value: 'routine', label: 'روتین روزمره', desc: 'انضباط مداوم', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' },
    { value: 'low', label: 'عادی', desc: 'کارهای ثانویه', color: 'border-slate-700 text-slate-300 bg-slate-900/40' },
  ];

  const toggleWeeklyDay = (dayIndex: number) => {
    if (weeklyDays.includes(dayIndex)) {
      if (weeklyDays.length > 1) {
        setWeeklyDays(weeklyDays.filter((d) => d !== dayIndex));
      }
    } else {
      setWeeklyDays([...weeklyDays, dayIndex].sort());
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledTime || !date) return;

    const recurrence: TaskRecurrence | undefined =
      recurrenceType !== 'none'
        ? {
            type: recurrenceType,
            weeklyDays: recurrenceType === 'weekly' ? weeklyDays : undefined,
            monthlyDay: recurrenceType === 'monthly' ? Number(monthlyDay) : undefined,
          }
        : undefined;

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      scheduledTime,
      estimatedMinutes: Number(estimatedMinutes),
      priority,
      category,
      progressPercentage: Number(progressPercentage),
      reminderMinutesBefore: Number(reminderMinutesBefore),
      reminderRepeatInterval: Number(reminderRepeatInterval),
      recurrence,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/85 backdrop-blur-md overflow-hidden p-0 sm:p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialTask ? 'ویرایش کار و زمان‌بندی' : 'ثبت کار جدید در تقویم شمسی'}
              </h3>
              <p className="text-[11px] text-slate-400">تنظیم دقیق زمان، مقاومت شروع را کاهش می‌دهد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              عنوان کار *
            </label>
            <input
              type="text"
              required
              enterKeyHint="next"
              value={title}
              onFocus={handleInputFocus}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: طراحی ماژول، ورزش عصرگاهی، مطالعه فصل ۳..."
              className="w-full h-12 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none placeholder:text-slate-500 transition-all"
            />
          </div>

          {/* Persian Date Picker */}
          <PersianDatePicker value={date} onChange={setDate} />

          {/* Scheduled Time & Duration Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>ساعت موعود شروع *</span>
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onFocus={handleInputFocus}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-slate-800 border border-emerald-500/40 text-white font-mono text-center text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                مدت تخمینی (دقیقه)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="5"
                max="360"
                step="5"
                value={estimatedMinutes}
                onFocus={handleInputFocus}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Repeat className="w-4 h-4" />
                <span>تنظیم تکرار خودکار در تقویم</span>
              </div>
              <span className="text-[10px] text-slate-400">تکرار منظم در روزهای آینده</span>
            </div>

            {/* Recurrence Mode Selector */}
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={() => setRecurrenceType('none')}
                className={`py-2 px-1 rounded-lg transition-all font-medium text-center ${
                  recurrenceType === 'none'
                    ? 'bg-slate-700 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                یکباره
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType('daily')}
                className={`py-2 px-1 rounded-lg transition-all font-medium text-center ${
                  recurrenceType === 'daily'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                هر روز
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType('weekly')}
                className={`py-2 px-1 rounded-lg transition-all font-medium text-center ${
                  recurrenceType === 'weekly'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                هفتگی
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType('monthly')}
                className={`py-2 px-1 rounded-lg transition-all font-medium text-center ${
                  recurrenceType === 'monthly'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ماهانه
              </button>
            </div>

            {/* Sub-settings: Specific Weekdays */}
            {recurrenceType === 'weekly' && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  روزهای تکرار در هر هفته:
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {PERSIAN_WEEKDAYS.map((dayName, idx) => {
                    const isSelected = weeklyDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleWeeklyDay(idx)}
                        className={`py-2 px-0.5 rounded-lg text-xs font-bold transition-all active:scale-95 text-center flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:bg-slate-700'
                        }`}
                      >
                        <span>{dayName.slice(0, 2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-settings: Specific Monthly Day */}
            {recurrenceType === 'monthly' && (
              <div className="pt-1 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-300">
                  تکرار در روز چندم هر ماه شمسی؟
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">روز</span>
                  <select
                    value={monthlyDay}
                    onChange={(e) => setMonthlyDay(Number(e.target.value))}
                    className="p-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {toPersianDigits(d)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Smart Lead Notification & Nag-Reminder Interval */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Bell className="w-4 h-4" />
                <span>تنظیمات هوشمند هشدار و زنگ</span>
              </div>
              <span className="text-[10px] text-slate-400">پیشگیری از غافلگیری و اهمال‌کاری</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  زنگ چند دقیقه قبل؟
                </label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full h-11 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value={0}>دقیقاً سر ساعت (بدون پیش‌هشدار)</option>
                  <option value={5}>۵ دقیقه قبل (آمادگی ذهنی)</option>
                  <option value={10}>۱۰ دقیقه قبل (پیشنهادی)</option>
                  <option value={15}>۱۵ دقیقه قبل</option>
                  <option value={30}>۳۰ دقیقه قبل</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  تکرار هشدار در صورت تعلل:
                </label>
                <select
                  value={reminderRepeatInterval}
                  onChange={(e) => setReminderRepeatInterval(Number(e.target.value))}
                  className="w-full h-11 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value={0}>بدون تکرار</option>
                  <option value={2}>هر ۲ دقیقه یکبار (ضد اهمال‌کاری)</option>
                  <option value={3}>هر ۳ دقیقه یکبار</option>
                  <option value={5}>هر ۵ دقیقه یکبار</option>
                </select>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              ماتریس اولویت کار
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col ${
                    priority === opt.value
                      ? `${opt.color} ring-2 ring-emerald-500/50 font-bold`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">دسته‌بندی</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              توضیحات تکمیلی و گام‌های کلیدی (اختیاری)
            </label>
            <textarea
              rows={3}
              value={description}
              onFocus={handleInputFocus}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="یادداشت‌های مهم برای انجام کار..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none placeholder:text-slate-500 resize-none transition-all"
            />
          </div>

          {/* Sticky submit button container inside form */}
          <div className="pt-2 pb-6 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialTask ? 'ذخیره تغییرات' : 'ثبت در تقویم'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white hover:bg-slate-700 transition-all"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
