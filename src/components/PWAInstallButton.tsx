import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, HelpCircle, AlertCircle } from 'lucide-react';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, don't show
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all shrink-0"
        title="نصب آسان روی صفحه گوشی"
      >
        <Download className="w-3.5 h-3.5" />
        <span>نصب روی گوشی</span>
      </button>

      {/* Troubleshooting and Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">راهنمای رفع خطای نصب در مرورگر</h3>
                  <p className="text-[11px] text-slate-400">علت خطا و روش حل ۱۰۰٪ قطعی</p>
                </div>
              </div>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-start gap-1.5 text-amber-300 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>چرا قبلاً پیام «این app نمیتونه نصب بشه» می‌داد؟</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                مرورگر کروم اندروید برای نصب وب‌اپ‌ها نیاز به ۲ مورد اجباری دارد:
                <br />
                ۱. <strong>آیکون‌های با فرمت PNG</strong> (که قبلاً فقط SVG بود و اکنون آیکون‌های استاندارد ۱۹۲ و ۵۱۲ پیکسلی به پروژه اضافه شدند).
                <br />
                ۲. <strong>سرویس‌ورکر فعال (Service Worker)</strong> (که هم‌اکنون به طور کامل راه‌اندازی و ثبت شد).
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block">مراحل نصب بدون خطا روی گوشی:</span>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                <div>
                  <strong>۱.</strong> صفحه برنامه را در مرورگر کروم گوشی یک بار <strong>رفرش (Reload)</strong> کنید تا سرویس‌ورکر و آیکون جدید لود شود.
                </div>
                <div>
                  <strong>۲.</strong> منوی <strong>سه‌نقطه (⋮)</strong> بالای مرورگر را بزنید.
                </div>
                <div>
                  <strong>۳.</strong> گزینه <strong>«افزودن به صفحه اصلی» (Add to Home screen)</strong> یا <strong>«نصب برنامه»</strong> را انتخاب کنید.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
