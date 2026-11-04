import { useState, useMemo, useEffect } from 'react';
import { Task } from '../types';
import {
  Play,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Timer,
  ArrowRightLeft,
  FileText,
  Percent,
} from 'lucide-react';
import {
  toPersianDigits,
  isTaskOnDate,
  getCurrentWeekDays,
  getTodayISODate,
} from '../utils/persianDate';
import { calculateFreeTimeSlots } from '../utils/storage';
import { CalendarStrip } from './CalendarStrip';
import { FullPersianCalendarModal } from './FullPersianCalendarModal';
import { TaskDetailsModal } from './TaskDetailsModal';

interface TodayTasksViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenKickstart: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onOpenCreateModal: (defaultTime?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAutoReschedule: () => void;
  onRolloverToTomorrow: () => void;
  onCompleteTask: (taskId: string) => void;
  isFullCalendarOpen?: boolean;
  onOpenFullCalendar?: () => void;
  onCloseFullCalendar?: () => void;
}

export function TodayTasksView({
  tasks,
  selectedDate,
  onSelectDate,
  onOpenKickstart,
  onOpenProgressModal,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onAutoReschedule,
  onRolloverToTomorrow,
  onCompleteTask,
  isFullCalendarOpen: isFullCalendarOpenProp,
  onOpenFullCalendar: onOpenFullCalendarProp,
  onCloseFullCalendar: onCloseFullCalendarProp,
}: TodayTasksViewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedDetailsTask, setSelectedDetailsTask] = useState<Task | null>(null);
  const [internalCalendarOpen, setInternalCalendarOpen] = useState(false);

  const calendarOpen =
    isFullCalendarOpenProp !== undefined ? isFullCalendarOpenProp : internalCalendarOpen;
  const openCalendar = onOpenFullCalendarProp || (() => setInternalCalendarOpen(true));
  const closeCalendar = onCloseFullCalendarProp || (() => setInternalCalendarOpen(false));

  // Live 10-second ticker for active timers
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Filter tasks for the selected date and sort chronologically by time
  const dayTasks = useMemo(() => {
    return tasks
      .filter((t) => isTaskOnDate(t, selectedDate))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [tasks, selectedDate]);

  // Compute tasks count per date for calendar dots
  const taskCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    const visibleDays = getCurrentWeekDays(getTodayISODate());
    visibleDays.forEach((d) => {
      const c = tasks.filter((t) => isTaskOnDate(t, d.iso)).length;
      if (c > 0) counts[d.iso] = c;
    });
    return counts;
  }, [tasks]);

  // Active Workdesk Tasks: Any tasks currently in_progress (< 100%) stay pinned on the active desk
  const activeWorkdeskTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'in_progress' && t.progressPercentage < 100);
  }, [tasks]);

  // Calculate free time gaps for this date
  const isToday = selectedDate === getTodayISODate();
  const freeSlots = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const minStartMinutes = isToday ? Math.ceil((nowMinutes + 5) / 5) * 5 : undefined;
    return calculateFreeTimeSlots(dayTasks, minStartMinutes);
  }, [dayTasks, isToday, currentTimestamp]);

  // Count unfinished tasks
  const unfinishedTasks = useMemo(() => {
    return dayTasks.filter((t) => t.progressPercentage < 100 && t.status !== 'completed');
  }, [dayTasks]);

  const handleScheduleFromFullCalendar = (date: string, time: string) => {
    onSelectDate(date);
    onOpenCreateModal(time);
    closeCalendar();
  };

  // Helper to compute elapsed time since start (initiatedAt)
  const getElapsedTimeLabel = (initiatedAt?: string) => {
    if (!initiatedAt) return null;
    const diffMs = currentTimestamp - new Date(initiatedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'لحظاتی پیش شروع شد';
    if (diffMins < 60) return `${toPersianDigits(diffMins)} دقیقه از شروع گذشته`;
    const hrs = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return `${toPersianDigits(hrs)} ساعت و ${toPersianDigits(remMins)} دقیقه از شروع گذشت`;
  };

  return (
    <div className="pb-36 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl space-y-3">
      {/* Interactive Calendar Strip with Full Calendar Opener */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        taskCountsByDate={taskCountsByDate}
        onOpenFullCalendar={openCalendar}
      />

      <div className="px-4 space-y-3">
        {/* Pinned Active Workdesk Section */}
        {activeWorkdeskTasks.length > 0 && (
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/60 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>میز کار فعال (کارهای در حال انجام)</span>
                  <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    {toPersianDigits(activeWorkdeskTasks.length)} کار
                  </span>
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">تا زمان ثبت اتمام کار روی میز می‌ماند</span>
            </div>

            <div className="space-y-2.5">
              {activeWorkdeskTasks.map((task) => {
                const elapsedTime = getElapsedTimeLabel(task.initiatedAt);
                return (
                  <div key={task.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span
                        onClick={() => setSelectedDetailsTask(task)}
                        className="font-bold text-white text-sm cursor-pointer hover:text-emerald-300 truncate"
                      >
                        {task.title}
                      </span>
                      {elapsedTime && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg font-bold animate-pulse border border-emerald-500/40 shrink-0">
                          <Timer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{elapsedTime}</span>
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">پیشرفت مرحله‌ای</span>
                        <span className="font-mono text-emerald-400 font-bold">{toPersianDigits(task.progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${task.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Desk Quick Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenProgressModal(task)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                      >
                        <Percent className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ثبت درصد پیشرفت</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCompleteTask(task.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تکمیل ۱۰۰٪ و اتمام</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Free Time Slots & Auto-Reschedule & Carryover Strip */}
        {unfinishedTasks.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {freeSlots.length > 0
                    ? `${toPersianDigits(freeSlots.length)} بازه خالی در تقویم`
                    : 'بازه‌های تقویم پر است'}
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                {toPersianDigits(unfinishedTasks.length)} کار ناتمام آماده برنامه‌ریزی و انتقال
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {freeSlots.length > 0 && (
                <button
                  type="button"
                  onClick={onAutoReschedule}
                  className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="جای‌گذاری خودکار کارهای ناتمام امروز در ساعت‌های خالی آینده"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>جای‌گذاری خودکار</span>
                </button>
              )}

              <button
                type="button"
                onClick={onRolloverToTomorrow}
                className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="انتقال هوشمند کارهای ناتمام به بازه‌های خالی روز بعد"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>انتقال به فردا</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimal Summary Task List */}
        <div className="space-y-2.5">
          {dayTasks.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs space-y-2">
              <p>هیچ کاری برای این تاریخ در تقویم ثبت نشده است.</p>
            </div>
          ) : (
            dayTasks.map((task) => {
              const isMenuOpen = activeMenuId === task.id;
              const isCompleted = task.progressPercentage === 100 || task.status === 'completed';
              const isInProgress = task.status === 'in_progress';
              const elapsedTimeText = getElapsedTimeLabel(task.initiatedAt);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all relative ${
                    isCompleted
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-85'
                      : isInProgress
                      ? 'bg-slate-900 border-emerald-500/50 ring-2 ring-emerald-500/25 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Summary Card Header: Time, Title, and 3-dots Menu */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Scheduled Time */}
                      <span className="font-mono text-emerald-400 font-bold bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs shrink-0">
                        {toPersianDigits(task.scheduledTime)}
                      </span>

                      {/* Task Title (Clicking opens details) */}
                      <h3
                        onClick={() => setSelectedDetailsTask(task)}
                        className={`text-sm font-bold text-white truncate cursor-pointer hover:text-emerald-300 transition-colors ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                        title="مشاهده جزئیات کامل این کار"
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* 3-dots Options Menu containing "جزئیات تسک" */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : task.id)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                        title="گزینه‌ها"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute left-0 top-9 z-30 w-36 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-1 text-xs animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedDetailsTask(task);
                            }}
                            className="w-full px-3 py-2.5 text-right hover:bg-slate-700 text-slate-100 flex items-center gap-2 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>جزئیات تسک</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditTask(task);
                            }}
                            className="w-full px-3 py-2.5 text-right hover:bg-slate-700 text-slate-200 flex items-center gap-2 font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>ویرایش تسک</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteTask(task.id);
                            }}
                            className="w-full px-3 py-2.5 text-right hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف تسک</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Card Footer: Timer & Start Action */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    {/* Timer / Duration Badge */}
                    {isInProgress && elapsedTimeText ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 rounded-xl font-bold animate-pulse">
                        <Timer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تایمر: {elapsedTimeText}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{toPersianDigits(task.estimatedMinutes)} دقیقه</span>
                      </span>
                    )}

                    {/* Start Action / Completion Checkmark */}
                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => onOpenKickstart(task)}
                        className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isInProgress ? 'ادامه کار' : 'شروع کار'}</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>انجام شد (۱۰۰٪)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Details Modal (جزئیات تسک) */}
      {selectedDetailsTask && (
        <TaskDetailsModal
          task={selectedDetailsTask}
          onClose={() => setSelectedDetailsTask(null)}
          onOpenKickstart={onOpenKickstart}
          onOpenProgressModal={onOpenProgressModal}
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
        />
      )}

      {/* Full Monthly Persian Calendar Modal */}
      {calendarOpen && (
        <FullPersianCalendarModal
          selectedDate={selectedDate}
          tasks={tasks}
          onClose={closeCalendar}
          onSelectDate={onSelectDate}
          onScheduleNewTaskWithDateTime={handleScheduleFromFullCalendar}
        />
      )}
    </div>
  );
}
