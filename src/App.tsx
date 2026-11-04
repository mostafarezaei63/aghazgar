import { useState, useEffect, useMemo, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Task, CustomReward, CustomPenalty, StartPunctuality } from './types';
import {
  getStoredTasks,
  saveTasks,
  getStoredRewards,
  saveRewards,
  getStoredPenalties,
  savePenalties,
  getStoredScore,
  saveScore,
  getStoredStreak,
  saveStreak,
  generateHistoricalMetrics,
  autoRescheduleUnfinishedTasks,
  autoRolloverPastUnfinishedTasks,
  rolloverUnfinishedTasksToTomorrow,
} from './utils/storage';
import { getTodayISODate } from './utils/persianDate';
import { AndroidNavBar, NavTab } from './components/AndroidNavBar';
import { TodayTasksView } from './components/TodayTasksView';
import { PerformanceCurveChart } from './components/PerformanceCurveChart';
import { CustomRewardsPenaltiesView } from './components/CustomRewardsPenaltiesView';
import { SettingsView } from './components/SettingsView';
import { KickstartModal } from './components/KickstartModal';
import { ProgressModal } from './components/ProgressModal';
import { TaskFormModal } from './components/TaskFormModal';
import { BellRing, X } from 'lucide-react';
import { soundManager } from './utils/audio';
import { notificationService } from './utils/notifications';
import { StatusBar, Style } from '@capacitor/status-bar';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [rewards, setRewards] = useState<CustomReward[]>(getStoredRewards);
  const [penalties, setPenalties] = useState<CustomPenalty[]>(getStoredPenalties);
  const [score, setScore] = useState<number>(getStoredScore);
  const [streak, setStreak] = useState<number>(getStoredStreak);

  // Initialize native status bar style (light icons on dark #0f172a background)
  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0f172a' });
      StatusBar.setOverlaysWebView({ overlay: false });
    } catch {
      // Ignored in browser
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayISODate);
  const [currentTab, setCurrentTab] = useState<NavTab>('tasks');

  const [kickstartTask, setKickstartTask] = useState<Task | null>(null);
  const [progressTask, setProgressTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialCreateTime, setInitialCreateTime] = useState<string | undefined>(undefined);
  const [activeAlarm, setActiveAlarm] = useState<{ task: Task; message: string } | null>(null);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState<boolean>(false);
  const [exitToast, setExitToast] = useState<boolean>(false);
  const lastBackPressRef = useRef<number>(0);

  // Keep latest navigation state in a ref for the back button listener
  const navStateRef = useRef({
    isFullCalendarOpen,
    kickstartTask,
    progressTask,
    isTaskFormOpen,
    activeAlarm,
    currentTab,
  });

  useEffect(() => {
    navStateRef.current = {
      isFullCalendarOpen,
      kickstartTask,
      progressTask,
      isTaskFormOpen,
      activeAlarm,
      currentTab,
    };
  }, [isFullCalendarOpen, kickstartTask, progressTask, isTaskFormOpen, activeAlarm, currentTab]);

  // Standard Mobile Back Button Handler (Capacitor Native Android + Browser History)
  useEffect(() => {
    const handleGoBack = () => {
      const state = navStateRef.current;

      // Priority 1: Close Full Calendar if open
      if (state.isFullCalendarOpen) {
        setIsFullCalendarOpen(false);
        soundManager.playTick();
        return;
      }

      // Priority 2: Close Kickstart 2-min activation modal if open
      if (state.kickstartTask) {
        setKickstartTask(null);
        soundManager.playTick();
        return;
      }

      // Priority 3: Close Progress % modal if open
      if (state.progressTask) {
        setProgressTask(null);
        soundManager.playTick();
        return;
      }

      // Priority 4: Close Task creation/edit modal if open
      if (state.isTaskFormOpen) {
        setIsTaskFormOpen(false);
        setEditingTask(null);
        setInitialCreateTime(undefined);
        soundManager.playTick();
        return;
      }

      // Priority 5: Dismiss active in-app alarm banner if open
      if (state.activeAlarm) {
        setActiveAlarm(null);
        return;
      }

      // Priority 6: If on another tab (analytics, rewards, settings), go back to main 'tasks' tab
      if (state.currentTab !== 'tasks') {
        setCurrentTab('tasks');
        soundManager.playTick();
        return;
      }

      // Priority 7: Root view reached. Press back twice within 2 seconds to exit app!
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        try {
          CapApp.exitApp();
        } catch {
          // In standard web browser
        }
      } else {
        lastBackPressRef.current = now;
        setExitToast(true);
        soundManager.vibrate(60);
        setTimeout(() => {
          setExitToast(false);
        }, 2000);
      }
    };

    // 1. Android Native Hardware / Gesture Back Button via Capacitor
    let capListenerPromise: Promise<any> | null = null;
    try {
      capListenerPromise = CapApp.addListener('backButton', () => {
        handleGoBack();
      });
    } catch {
      // Not running in native Capacitor
    }

    // 2. Web browser popstate support
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleGoBack();
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capListenerPromise) {
        capListenerPromise.then((l) => l?.remove?.()).catch(() => {});
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 1-year historical dataset for the curve chart
  const historicalMetrics = useMemo(() => generateHistoricalMetrics(), []);

  // Automated Carryover: Automatically rolls over any past unfinished tasks into today's empty calendar slots by priority!
  useEffect(() => {
    const { updatedTasks, rolledOverCount } = autoRolloverPastUnfinishedTasks(tasks);
    if (rolledOverCount > 0) {
      setTasks(updatedTasks);
    }
  }, []);

  // Sync state to local storage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveRewards(rewards);
  }, [rewards]);

  useEffect(() => {
    savePenalties(penalties);
  }, [penalties]);

  useEffect(() => {
    saveScore(score);
  }, [score]);

  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  // Real-time task alarm and reminder monitor: checks every 15 seconds
  useEffect(() => {
    notificationService.checkActiveTasks(tasks, (task, message) => {
      setActiveAlarm({ task, message });
    });

    const interval = setInterval(() => {
      notificationService.checkActiveTasks(tasks, (task, message) => {
        setActiveAlarm({ task, message });
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Handler: When user completes the 2-minute kickstart or confirms initiation
  const handleInitiateComplete = (taskId: string, delayMinutes: number, pointsEarned: number) => {
    const punctuality: StartPunctuality =
      delayMinutes <= -5
        ? 'early'
        : delayMinutes <= 3
        ? 'on_time'
        : delayMinutes <= 10
        ? 'slight_delay'
        : delayMinutes <= 30
        ? 'moderate_delay'
        : 'severe_delay';

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'in_progress' as const,
          initiatedAt: new Date().toISOString(),
          delayMinutes,
          startPunctuality: punctuality,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setScore((prev) => Math.max(0, prev + pointsEarned));
    setKickstartTask(null);

    // If severe procrastination, automatically flag penalty
    if (punctuality === 'severe_delay' && penalties.length > 0) {
      soundManager.playPenaltyTone();
    }
  };

  // Handler: Update stages/progress percentage
  const handleUpdateProgress = (taskId: string, percentage: number) => {
    const isCompleted = percentage === 100;
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          progressPercentage: percentage,
          status: isCompleted ? ('completed' as const) : t.status,
          completedAt: isCompleted ? new Date().toISOString() : t.completedAt,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    if (isCompleted) {
      setScore((prev) => prev + 25);
      soundManager.playRewardChime();
    } else {
      soundManager.playTick();
    }
  };

  // Handler: Auto-reschedule unfinished tasks into empty calendar slots by priority
  const handleAutoReschedule = () => {
    const { updatedTasks, rescheduledCount } = autoRescheduleUnfinishedTasks(tasks, selectedDate);
    if (rescheduledCount > 0) {
      setTasks(updatedTasks);
      soundManager.playRewardChime();
      alert(`${rescheduledCount} کار ناتمام به ترتیب اولویت در زمان‌های خالی تقویم قرار گرفتند.`);
    } else {
      alert('کار ناتمامی برای جای‌گذاری یا زمان خالی کافی در تقویم امروز یافت نشد.');
    }
  };

  // Handler: Rollover unfinished tasks of selectedDate to tomorrow
  const handleRolloverToTomorrow = () => {
    const { updatedTasks, movedCount, targetDate } = rolloverUnfinishedTasksToTomorrow(tasks, selectedDate);
    if (movedCount > 0) {
      setTasks(updatedTasks);
      soundManager.playRewardChime();
      alert(`${movedCount} کار ناتمام با موفقیت به بازه‌های خالی روز بعد (${targetDate}) منتقل شدند.`);
    } else {
      alert('کار ناتمامی برای انتقال به روز بعد وجود ندارد.');
    }
  };

  // Handler: Directly complete task 100% from active workdesk
  const handleCompleteTaskDirectly = (taskId: string) => {
    handleUpdateProgress(taskId, 100);
  };

  // Handler: Create or Update Task
  const handleSaveTaskForm = (taskData: Omit<Task, 'id' | 'status'> & { id?: string }) => {
    let savedTask: Task;
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskData.id) {
            savedTask = { ...t, ...taskData };
            return savedTask;
          }
          return t;
        })
      );
    } else {
      savedTask = {
        ...taskData,
        id: `t-${Date.now()}`,
        status: 'scheduled',
      };
      setTasks((prev) => [...prev, savedTask]);
    }

    if (savedTask!) {
      notificationService.scheduleNativeTaskAlarm(savedTask);
    }

    setIsTaskFormOpen(false);
    setEditingTask(null);
    soundManager.playTick();
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    soundManager.playTick();
  };

  // Handlers for Custom Rewards
  const handleAddReward = (rewardData: Omit<CustomReward, 'id' | 'unlockedCount'>) => {
    const newR: CustomReward = {
      ...rewardData,
      id: `r-${Date.now()}`,
      unlockedCount: 0,
    };
    setRewards((prev) => [...prev, newR]);
  };

  const handleDeleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClaimReward = (id: string) => {
    setRewards((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, unlockedCount: r.unlockedCount + 1, lastClaimedAt: new Date().toISOString() } : r
      )
    );
  };

  // Handlers for Custom Penalties
  const handleAddPenalty = (penaltyData: Omit<CustomPenalty, 'id' | 'enforcedCount'>) => {
    const newP: CustomPenalty = {
      ...penaltyData,
      id: `p-${Date.now()}`,
      enforcedCount: 0,
    };
    setPenalties((prev) => [...prev, newP]);
  };

  const handleDeletePenalty = (id: string) => {
    setPenalties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAcknowledgePenalty = (id: string) => {
    setPenalties((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, enforcedCount: p.enforcedCount + 1, lastEnforcedAt: new Date().toISOString() } : p
      )
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-emerald-500/30">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex flex-col min-h-screen relative bg-slate-950 pt-[max(env(safe-area-inset-top,0px),12px)] pb-28">
        {/* Real-time In-App Floating Alarm Banner */}
        {activeAlarm && (
          <div className="fixed top-3 left-4 right-4 z-50 max-w-md mx-auto p-3.5 rounded-2xl bg-slate-900/98 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/80 backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in text-right">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse shrink-0">
                <BellRing className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white truncate max-w-[190px]">
                  ⏰ {activeAlarm.task.title}
                </h4>
                <p className="text-[11px] text-emerald-400/90 font-medium">{activeAlarm.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setKickstartTask(activeAlarm.task);
                  setActiveAlarm(null);
                }}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
              >
                شروع ۲ دقیقه‌ای
              </button>
              <button
                onClick={() => setActiveAlarm(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="w-full flex-1">
          {currentTab === 'tasks' && (
            <TodayTasksView
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenKickstart={(task) => setKickstartTask(task)}
              onOpenProgressModal={(task) => setProgressTask(task)}
              onOpenCreateModal={(time) => {
                setInitialCreateTime(time);
                setEditingTask(null);
                setIsTaskFormOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskFormOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onAutoReschedule={handleAutoReschedule}
              onRolloverToTomorrow={handleRolloverToTomorrow}
              onCompleteTask={handleCompleteTaskDirectly}
              isFullCalendarOpen={isFullCalendarOpen}
              onOpenFullCalendar={() => setIsFullCalendarOpen(true)}
              onCloseFullCalendar={() => setIsFullCalendarOpen(false)}
            />
          )}

          {currentTab === 'analytics' && (
            <div className="pb-36 pt-3 px-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl space-y-4">
              <PerformanceCurveChart historicalData={historicalMetrics} />
            </div>
          )}

          {currentTab === 'rewards' && (
            <CustomRewardsPenaltiesView
              rewards={rewards}
              penalties={penalties}
              score={score}
              streak={streak}
              onAddReward={handleAddReward}
              onAddPenalty={handleAddPenalty}
              onDeleteReward={handleDeleteReward}
              onDeletePenalty={handleDeletePenalty}
              onClaimReward={handleClaimReward}
              onAcknowledgePenalty={handleAcknowledgePenalty}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              tasks={tasks}
              rewards={rewards}
              penalties={penalties}
              score={score}
              onRestoreData={(restored) => {
                setTasks(restored.tasks);
                setRewards(restored.rewards);
                setPenalties(restored.penalties);
                setScore(restored.score);
              }}
              onResetData={() => {
                localStorage.clear();
                window.location.reload();
              }}
            />
          )}
        </main>

        {/* Double-Back Exit Toast (Standard Android UX) */}
        {exitToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-2xl bg-slate-900/98 border border-slate-700/80 shadow-2xl text-slate-200 text-xs font-semibold backdrop-blur-md animate-fade-in flex items-center gap-2 pointer-events-none select-none text-center whitespace-nowrap">
            <span>برای خروج از برنامه، دوباره کلید برگشت را بزنید</span>
          </div>
        )}

        {/* Bottom Android Navigation Bar with Center New Task Action */}
        <AndroidNavBar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            soundManager.playTick();
          }}
          onOpenCreateTask={() => {
            setInitialCreateTime(undefined);
            setEditingTask(null);
            setIsTaskFormOpen(true);
            soundManager.playTick();
          }}
        />

        {/* Kickstart Modal (2-Minute Zero-Resistance Activation) */}
        {kickstartTask && (
          <KickstartModal
            task={kickstartTask}
            onClose={() => setKickstartTask(null)}
            onInitiateComplete={handleInitiateComplete}
          />
        )}

        {/* Progress Percentage Modal (Recording Stage % Before Next Task) */}
        {progressTask && (
          <ProgressModal
            task={progressTask}
            onClose={() => setProgressTask(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {/* Task Creation & Calendar Scheduling Modal */}
        {isTaskFormOpen && (
          <TaskFormModal
            initialTask={editingTask}
            selectedDate={selectedDate}
            initialTime={initialCreateTime}
            onClose={() => {
              setIsTaskFormOpen(false);
              setEditingTask(null);
              setInitialCreateTime(undefined);
            }}
            onSave={(taskData) => {
              handleSaveTaskForm(taskData);
              setInitialCreateTime(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
