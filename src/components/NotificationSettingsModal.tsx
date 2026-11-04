import { useState, useEffect } from 'react';
import { Bell, BellRing, Smartphone, Volume2, Vibrate, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { notificationService } from '../utils/notifications';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    if (granted) {
      notificationService.testNotification();
      setTestSent(true);
    }
  };

  const handleTestNotification = () => {
    notificationService.testNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-right">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">نحوه یادآوری در گوشی موبایل</h3>
              <p className="text-[11px] text-slate-400">تنظیمات اعلان، صدا و لرزش</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
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
              {permission === 'granted' ? 'فعال و مجاز' : 'نیاز به فعال‌سازی'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            یادآوری‌ها در زمان مقرر با ۳ روش همزمان روی موبایل هشدار می‌دهند:
          </p>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>۱. بنر سیستمی اعلان در نوار وضعیت بالای اندروید (System Notification)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span>۲. صدای هشدار ملایم و اختصاصی انگیزاننده</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Vibrate className="w-3.5 h-3.5 text-amber-400" />
              <span>۳. ویبره و لرزش ضربانی گوشی (Haptic Vibration)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <Bell className="w-4 h-4" />
              <span>فعال‌سازی مجوز اعلان در گوشی</span>
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              <span>ارسال اعلان تستی به گوشی (تست صدا و ویبره)</span>
            </button>
          )}

          {testSent && (
            <div className="text-[11px] text-emerald-400 text-center font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>اعلان و ویبره آزمایشی اجرا شد!</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800/40 text-slate-400 text-xs hover:text-white"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
