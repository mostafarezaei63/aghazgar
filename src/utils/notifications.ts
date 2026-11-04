import { soundManager } from './audio';
import { Task } from '../types';
import { getTodayISODate, isTaskOnDate, toPersianDigits } from './persianDate';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private firedAlerts: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
    this.initLocalNotifications();
  }

  private async initLocalNotifications() {
    try {
      if (typeof window !== 'undefined') {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      }
    } catch {
      // Running in browser or native plugin unavailable
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
      return this.permission;
    }
    return 'denied';
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      let webGranted = true;
      if ('Notification' in window) {
        const status = await Notification.requestPermission();
        this.permission = status;
        webGranted = status === 'granted';
      }

      try {
        const capPerm = await LocalNotifications.requestPermissions();
        if (capPerm.display === 'granted') {
          webGranted = true;
        }
      } catch {
        // Ignored
      }

      return webGranted;
    } catch (e) {
      console.error('Notification permission request failed', e);
      return false;
    }
  }

  /**
   * Schedule a native OS background notification using Capacitor Local Notifications
   */
  public async scheduleNativeTaskAlarm(task: Task) {
    try {
      if (!task.date || !task.scheduledTime) return;
      const [y, m, d] = task.date.split('-').map(Number);
      const [sh, sm] = task.scheduledTime.split(':').map(Number);
      if (isNaN(y) || isNaN(sh)) return;

      const taskDate = new Date(y, m - 1, d, sh, sm, 0);
      const leadTimeMinutes = task.reminderMinutesBefore ?? 10;
      const alarmDate = new Date(taskDate.getTime() - leadTimeMinutes * 60000);

      if (alarmDate.getTime() <= Date.now()) {
        return; // Already past
      }

      const numericId = Math.abs(
        Array.from(task.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
      );

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ نوبت شروع کار: ${task.title}`,
            body: `${leadTimeMinutes} دقیقه تا زمان موعود شروع کار (${task.scheduledTime}) باقی مانده است.`,
            id: numericId,
            schedule: { at: alarmDate },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            extra: { taskId: task.id },
          },
        ],
      });
    } catch (err) {
      console.warn('Native local notification scheduling note:', err);
    }
  }

  /**
   * Dispatches a system notification, audio tone, and haptic vibration
   */
  public sendReminderNotification(taskTitle: string, minutesUntil: number, repeatInterval?: number) {
    const title = `⏰ نوبت شروع کار: ${taskTitle}`;
    const body =
      minutesUntil <= 0
        ? `زمان موعود فرارسید! لطفاً همین الان کار را آغاز کنید تا پاداش انضباط را کسب کنید.`
        : `${toPersianDigits(minutesUntil)} دقیقه تا زمان موعود شروع کار باقی مانده است. ${
            repeatInterval ? `(تکرار هشدار هر ${toPersianDigits(repeatInterval)} دقیقه تا آغاز)` : ''
          }`;

    // 1. Android / Web Native System Notification
    if (typeof window !== 'undefined') {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification(title, {
            body,
            icon: '/icon.svg',
            tag: `task-reminder-${Date.now()}`,
            requireInteraction: true,
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        }
      } catch (err) {
        console.warn('System notification error:', err);
      }
    }

    // 2. Play Audio Alert
    if (minutesUntil <= 0) {
      soundManager.playPenaltyTone();
    } else {
      soundManager.playRewardChime();
    }

    // 3. Android Haptic Vibration
    soundManager.vibrate([200, 100, 200, 100, 200]);
  }

  /**
   * Background Alarm Checker: Evaluates active tasks every 15s and triggers alarms on exact times
   */
  public checkActiveTasks(
    tasks: Task[],
    onAlarmTrigger?: (task: Task, message: string) => void
  ) {
    const todayISO = getTodayISODate();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check tasks that belong to today and are not completed/in-progress yet
    const pendingTasks = tasks.filter(
      (t) =>
        isTaskOnDate(t, todayISO) &&
        t.status !== 'completed' &&
        t.status !== 'in_progress' &&
        t.progressPercentage < 100
    );

    for (const task of pendingTasks) {
      if (!task.scheduledTime) continue;
      const [sh, sm] = task.scheduledTime.split(':').map(Number);
      if (isNaN(sh) || isNaN(sm)) continue;

      const schedMinutes = sh * 60 + sm;
      const diff = schedMinutes - currentMinutes;

      const leadTime = task.reminderMinutesBefore ?? 10;
      const repeatInterval = task.reminderRepeatInterval || 2;

      // Case 1: Early reminder
      if (leadTime > 0 && diff === leadTime) {
        const alertKey = `${task.id}_${todayISO}_lead_${currentMinutes}`;
        if (!this.firedAlerts.has(alertKey)) {
          this.firedAlerts.add(alertKey);
          this.sendReminderNotification(task.title, diff, repeatInterval);
          if (onAlarmTrigger) {
            onAlarmTrigger(task, `${toPersianDigits(diff)} دقیقه تا موعد شروع کار باقی مانده است.`);
          }
        }
      }

      // Case 2: Exact start time
      if (diff === 0) {
        const alertKey = `${task.id}_${todayISO}_exact_${currentMinutes}`;
        if (!this.firedAlerts.has(alertKey)) {
          this.firedAlerts.add(alertKey);
          this.sendReminderNotification(task.title, 0, repeatInterval);
          if (onAlarmTrigger) {
            onAlarmTrigger(task, 'زمان موعود شروع کار فرارسید! شروع ۲ دقیقه‌ای را کلیک کنید.');
          }
        }
      }

      // Case 3: Overdue / Procrastination repeat alert
      if (diff < 0 && repeatInterval > 0) {
        const overdueMinutes = Math.abs(diff);
        if (overdueMinutes <= 30 && overdueMinutes % repeatInterval === 0) {
          const alertKey = `${task.id}_${todayISO}_overdue_${currentMinutes}`;
          if (!this.firedAlerts.has(alertKey)) {
            this.firedAlerts.add(alertKey);
            this.sendReminderNotification(task.title, diff, repeatInterval);
            if (onAlarmTrigger) {
              onAlarmTrigger(
                task,
                `هشدار: ${toPersianDigits(overdueMinutes)} دقیقه از موعد شروع گذشته است! لطفاً شروع کنید.`
              );
            }
          }
        }
      }
    }
  }

  public testNotification(): boolean {
    this.sendReminderNotification('تست یادآوری و اعلان آغازگر', 5, 2);
    return true;
  }
}

export const notificationService = new NotificationService();
