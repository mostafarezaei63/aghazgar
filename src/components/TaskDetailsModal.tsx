import { Task } from '../types';
import {
  X,
  Clock,
  Calendar,
  Tag,
  AlertTriangle,
  Repeat,
  BellRing,
  Percent,
  Play,
  CheckCircle2,
  Edit2,
  Timer,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import {
  toPersianDigits,
  formatPersianDateString,
} from '../utils/persianDate';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onOpenKickstart: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

export function TaskDetailsModal({
  task,
  onClose,
  onOpenKickstart,
  onOpenProgressModal,
  onEditTask,
  onCompleteTask,
}: TaskDetailsModalProps) {
  const isCompleted = task.progressPercentage === 100 || task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent_important':
        return { label: 'فوری و مهم', color: 'bg-rose-950/40 text-rose-300 border-rose-500/40' };
      case 'important':
        return { label: 'مهم', color: 'bg-blue-950/40 text-blue-300 border-blue-500/40' };
      case 'routine':
        return { label: 'روتین روزمره', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' };
      case 'low':
      default:
        return { label: 'عادی', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const priorityInfo = getPriorityLabel(task.priority);

  const getStatusLabel = () => {
    if (isCompleted) return { label: 'تکمیل‌شده (۱۰۰٪)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' };
    if (isInProgress) return { label: 'در حال انجام', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' };
    if (task.status === 'rescheduled') return { label: 'جابه‌جاشده در تقویم', color: 'text-blue-400 bg-blue-950/60 border-blue-500/40' };
    return { label: 'برنامه‌ریزی‌شده', color: 'text-slate-300 bg-slate-800 border-slate-700' };
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/85 backdrop-blur-md overflow-hidden p-0 sm:p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">جزئیات تسک</h3>
              <p className="text-[11px] text-slate-400">شناسنامه کامل و تنظیمات این کار</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {/* Main Title & Status Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-white leading-snug">
                {task.title}
              </h2>
              <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold shrink-0 ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {task.isCarriedOver && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/50 border border-amber-500/30 p-2 rounded-xl font-medium">
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>این کار از روزهای قبل انتقال یافته و در زمان خالی امروز جای‌گذاری شده است.</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>میزان پیشرفت مرحله‌ای</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {toPersianDigits(task.progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${task.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Date, Time & Priority Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Scheduled Date & Time */}
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>تاریخ و ساعت</span>
              </span>
              <p className="font-bold text-white text-xs">
                {formatPersianDateString(task.date)}
              </p>
              <p className="font-mono text-emerald-400 font-bold text-xs">
                ساعت {toPersianDigits(task.scheduledTime)} ({toPersianDigits(task.estimatedMinutes)} دقیقه)
              </p>
            </div>

            {/* Priority & Category */}
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>اولویت و دسته</span>
              </span>
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${priorityInfo.color}`}>
                  {priorityInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                دسته‌بندی: {task.category}
              </p>
            </div>
          </div>

          {/* Additional Description / Notes */}
          {task.description && (
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">
                توضیحات تکمیلی:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Recurrence & Reminder Settings Grid */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block border-b border-slate-700/60 pb-1.5">
              تنظیمات هوشمند تکرار و هشدار
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Repeat className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  تکرار: {' '}
                  <strong className="text-white">
                    {task.recurrence && task.recurrence.type !== 'none'
                      ? task.recurrence.type === 'daily'
                        ? 'هر روز'
                        : task.recurrence.type === 'weekly'
                        ? 'هفتگی'
                        : 'ماهانه'
                      : 'یکباره'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <BellRing className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  زنگ: {' '}
                  <strong className="text-white">
                    {toPersianDigits(task.reminderMinutesBefore)} دقیقه قبل
                  </strong>
                </span>
              </div>
            </div>

            {task.reminderRepeatInterval > 0 && (
              <p className="text-[10px] text-amber-300/90 pt-1">
                *(در صورت عدم شروع، هشدار هر {toPersianDigits(task.reminderRepeatInterval)} دقیقه یک‌بار تکرار می‌شود)
              </p>
            )}
          </div>

          {/* Initiation & Delay Info if started */}
          {task.initiatedAt && (
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                <span>وضعیت زمان شروع واقعی</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                {task.delayMinutes !== undefined && task.delayMinutes <= 0
                  ? 'این کار سر وقت یا پیش‌دستانه آغاز شده است.'
                  : `با ${toPersianDigits(task.delayMinutes || 0)} دقیقه تأخیر از زمان موعود شروع شد.`}
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/95 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKickstart(task);
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isInProgress ? 'ادامه کار' : 'شروع کار'}</span>
              </button>
            ) : (
              <div className="py-2.5 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تکمیل‌شده</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProgressModal(task);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
            >
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>ثبت پیشرفت</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditTask(task);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700/80 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>ویرایش این تسک</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
