import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, HelpCircle } from 'lucide-react';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already running as installed app or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setDismissed(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="mx-4 mt-2 mb-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>نصب برنامه روی گوشی سامسونگ</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30">
                آفلاین
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              اجرای مستقل و تمام‌صفحه بدون کادر و نوار آدرس مرورگر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نصب مستقیم</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-lg text-slate-500 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Modal if browser requires manual tap */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>راهنمای نصب در مرورگر سامسونگ / کروم</span>
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              اکنون با اضافه شدن فایل مانیفست استاندارد (`manifest`) و سرویس‌ورکر (`service worker`)، مرورگر گوشی شما این برنامه را به عنوان یک <strong>اپلیکیشن مستقل</strong> شناسایی می‌کند:
            </p>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs text-slate-200">
              <div className="font-semibold text-emerald-400">در مرورگر گوشی سامسونگ (Samsung Internet):</div>
              <p className="text-[11px] text-slate-300">
                ۱. روی منوی ۳ خط (پایین گوشه راست یا چپ) ضربه بزنید.<br />
                ۲. گزینه <strong>«افزودن صفحه به» (Add page to)</strong> را انتخاب کنید.<br />
                ۳. این بار گزینه <strong>«صفحه برنامه‌ها / صفحه اصلی (App screen)»</strong> را بزنید.
              </p>
              <div className="font-semibold text-emerald-400 pt-1">در مرورگر Google Chrome:</div>
              <p className="text-[11px] text-slate-300">
                روی منوی ۳ نقطه بالا ضربه بزنید و گزینه <strong>«نصب برنامه» (Install app)</strong> را بزنید.
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
