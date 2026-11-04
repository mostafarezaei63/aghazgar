import { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Vibrate,
  Smartphone,
  Palette,
  Database,
  Download,
  Upload,
  RotateCcw,
  Info,
  ShieldCheck,
  Check,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { notificationService } from '../utils/notifications';
import { toPersianDigits } from '../utils/persianDate';
import { Task, CustomReward, CustomPenalty } from '../types';

interface SettingsViewProps {
  tasks: Task[];
  rewards: CustomReward[];
  penalties: CustomPenalty[];
  score: number;
  onRestoreData?: (data: { tasks: Task[]; rewards: CustomReward[]; penalties: CustomPenalty[]; score: number }) => void;
  onResetData?: () => void;
}

export function SettingsView({
  tasks,
  rewards,
  penalties,
  score,
  onRestoreData,
  onResetData,
}: SettingsViewProps) {
  // Sound states
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [countdownTicks, setCountdownTicks] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Notification states
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [defaultReminderTime, setDefaultReminderTime] = useState(10);
  const [defaultRepeatInterval, setDefaultRepeatInterval] = useState(2);

  // Theme states
  const [themeMode, setThemeMode] = useState<'slate' | 'amoled'>('slate');
  const [accentColor, setAccentColor] = useState<'emerald' | 'teal' | 'cyan'>('emerald');

  // Backup status message
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleToggleSound = (val: boolean) => {
    setSoundEnabled(val);
    soundManager.setSoundEnabled(val);
    if (val) {
      soundManager.playRewardChime();
    }
  };

  const handleTestSound = () => {
    soundManager.playRewardChime();
  };

  const handleTestTone = () => {
    soundManager.playPenaltyTone();
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    if (granted) {
      notificationService.testNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const handleTestNotification = () => {
    notificationService.testNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  // Export data as JSON
  const handleExportData = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '3.2',
        tasks,
        rewards,
        penalties,
        score,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aghazgar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage('فایل پشتیبان با موفقیت ذخیره شد.');
      setTimeout(() => setBackupMessage(null), 3000);
    } catch {
      setBackupMessage('خطا در خروجی گرفتن از داده‌ها.');
      setTimeout(() => setBackupMessage(null), 3000);
    }
  };

  // Import data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.tasks) && onRestoreData) {
          onRestoreData({
            tasks: parsed.tasks,
            rewards: parsed.rewards || rewards,
            penalties: parsed.penalties || penalties,
            score: parsed.score || score,
          });
          setBackupMessage('اطلاعات با موفقیت بازیابی شد.');
          setTimeout(() => setBackupMessage(null), 3000);
        } else {
          setBackupMessage('فرمت فایل پشتیبان نامعتبر است.');
          setTimeout(() => setBackupMessage(null), 3000);
        }
      } catch {
        setBackupMessage('خطا در خواندن فایل پشتیبان.');
        setTimeout(() => setBackupMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-36 pt-2 px-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl space-y-4 select-none text-right">
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تنظیمات برنامه آغازگر</h2>
            <p className="text-[11px] text-slate-400">مدیریت صدا، نوع هشدار، تم و پشتیبان‌گیری</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
          نسخه ۳.۲
        </span>
      </div>

      {/* Backup Notification Toast */}
      {backupMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold animate-fade-in">
          {backupMessage}
        </div>
      )}

      {/* 1. صدا و بازخورد صوتی */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Volume2 className="w-4 h-4" />
          <span>تنظیمات صدا و افکت‌های صوتی</span>
        </div>

        {/* Master Sound Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
          <div>
            <span className="text-white font-medium block">صدای عمومی برنامه</span>
            <span className="text-[11px] text-slate-400">پخش افکت‌های صوتی زنگ و تیک</span>
          </div>
          <button
            onClick={() => handleToggleSound(!soundEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Countdown Ticks */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
          <div>
            <span className="text-white font-medium block">صدای تیک ثانیه‌شمار</span>
            <span className="text-[11px] text-slate-400">صدای ریتمیک در شمارش معکوس ۲ دقیقه‌ای</span>
          </div>
          <button
            onClick={() => setCountdownTicks(!countdownTicks)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              countdownTicks && soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Vibration / Haptic Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
          <div>
            <span className="text-white font-medium block">ویبره و لرزش گوشی</span>
            <span className="text-[11px] text-slate-400">لرزش ضربانی همراه با هشدارهای آغاز کار</span>
          </div>
          <button
            onClick={() => {
              const next = !vibrationEnabled;
              setVibrationEnabled(next);
              if (next) soundManager.vibrate([60, 60, 60]);
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              vibrationEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Sound Test Buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={handleTestSound}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تست صدای پاداش</span>
          </button>
          <button
            onClick={handleTestTone}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تست زنگ هشدار</span>
          </button>
        </div>
      </div>

      {/* 2. نوع هشدار و اعلان‌ها */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Bell className="w-4 h-4" />
          <span>تنظیمات نوع هشدار و اعلان‌های موبایل</span>
        </div>

        {/* Permission Status */}
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">وضعیت مجوز اعلان در گوشی:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                permission === 'granted'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/30'
              }`}
            >
              {permission === 'granted' ? 'مجاز و فعال' : 'نیاز به فعال‌سازی'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>بنر اعلانات سیستمی اندروید در نوار وضعیت</span>
            </div>
            <div className="flex items-center gap-2">
              <Vibrate className="w-3 h-3 text-amber-400" />
              <span>لرزش ضربانی اختصاصی گوشی برای غلبه بر حواس‌پرتی</span>
            </div>
          </div>

          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>فعال‌سازی مجوز اعلان در اندروید</span>
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{testSent ? 'اعلان تست ارسال شد ✓' : 'ارسال اعلان تستی به گوشی'}</span>
            </button>
          )}
        </div>

        {/* Default Reminder Lead Time */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">زمان پیش‌فرض اولین هشدار</label>
            <select
              value={defaultReminderTime}
              onChange={(e) => setDefaultReminderTime(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value={0}>سر ساعت شروع</option>
              <option value={5}>۵ دقیقه قبل</option>
              <option value={10}>۱۰ دقیقه قبل (پیش‌فرض)</option>
              <option value={15}>۱۵ دقیقه قبل</option>
              <option value={30}>۳۰ دقیقه قبل</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تکرار خودکار هشدار تا شروع</label>
            <select
              value={defaultRepeatInterval}
              onChange={(e) => setDefaultRepeatInterval(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value={0}>بدون تکرار</option>
              <option value={2}>هر ۲ دقیقه (توصیه رفتارشناسی)</option>
              <option value={3}>هر ۳ دقیقه</option>
              <option value={5}>هر ۵ دقیقه</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. تم و ظاهر برنامه */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
          <Palette className="w-4 h-4" />
          <span>تم و ظاهر بصری</span>
        </div>

        {/* Theme mode selection */}
        <div className="space-y-1 text-xs">
          <label className="text-[11px] text-slate-400">حالت پس‌زمینه تیره (تمرکز عمیق):</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setThemeMode('slate')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                themeMode === 'slate'
                  ? 'border-emerald-500 bg-slate-800 text-white font-bold ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
            >
              <span>تم شب Slate (استاندارد)</span>
            </button>
            <button
              onClick={() => setThemeMode('amoled')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                themeMode === 'amoled'
                  ? 'border-emerald-500 bg-black text-white font-bold ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              <span>تم مشکی AMOLED (صرفه‌جویی باتری)</span>
            </button>
          </div>
        </div>

        {/* Accent Color Selection */}
        <div className="space-y-1.5 pt-1 text-xs">
          <label className="text-[11px] text-slate-400">رنگ شاخص برنامه:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setAccentColor('emerald')}
              className={`py-2 px-1 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all ${
                accentColor === 'emerald'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 font-bold'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>سبز زمردی</span>
            </button>
            <button
              onClick={() => setAccentColor('teal')}
              className={`py-2 px-1 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all ${
                accentColor === 'teal'
                  ? 'border-teal-500 bg-teal-950/40 text-teal-400 font-bold'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>فیروزه‌ای</span>
            </button>
            <button
              onClick={() => setAccentColor('cyan')}
              className={`py-2 px-1 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all ${
                accentColor === 'cyan'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 font-bold'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>آبی فیروزه</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. مدیریت داده‌ها و پشتیبان‌گیری */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Database className="w-4 h-4" />
          <span>پشتیبان‌گیری و انتقال داده‌ها</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 py-1">
          <span>کارهای ذخیره‌شده روی گوشی:</span>
          <span className="font-mono text-emerald-400 font-bold">
            {toPersianDigits(tasks.length)} کار
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Export JSON Button */}
          <button
            onClick={handleExportData}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>خروجی پشتیبان (JSON)</span>
          </button>

          {/* Import JSON Button */}
          <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer text-center">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>بازیابی پشتیبان</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Data Button */}
        {onResetData && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                if (window.confirm('آیا مطمئن هستید که می‌خواهید داده‌ها به حالت اولیه بازنشانی شوند؟')) {
                  onResetData();
                  setBackupMessage('داده‌ها بازنشانی شدند.');
                  setTimeout(() => setBackupMessage(null), 3000);
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 active:scale-95 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی به داده‌های اولیه برنامه</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. درباره برنامه و اصول روانشناسی */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>درباره آغازگر و امنیت داده‌ها</span>
        </div>

        <p className="leading-relaxed text-[11px]">
          برنامه <strong>آغازگر</strong> بر پایه تکنیک رفتاری «کاهش مقاومت آستانه شروع» طراحی شده است. تمرکز اصلی بر آغاز به موقع تسک‌ها در ۲ دقیقه اول موعد مقرر است.
        </p>

        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>۱۰۰٪ آفلاین، بدون ذخیره اطلاعات روی سرور خارجی و حفظ کامل حریم خصوصی</span>
        </div>
      </div>
    </div>
  );
}
