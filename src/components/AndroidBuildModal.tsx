import { useState } from 'react';
import { Smartphone, CheckCircle2, Copy, Check, Download, Terminal, FolderCheck, X, Sparkles } from 'lucide-react';

interface AndroidBuildModalProps {
  onClose: () => void;
}

export function AndroidBuildModal({ onClose }: AndroidBuildModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '۱. همگام‌سازی آخرین تغییرات کد با پروژه اندروید',
      command: 'npm run cap:sync',
      desc: 'فایل‌های کامپایل‌شده وب (HTML/JS/CSS) به پوشه دارایی‌های اندروید (android/app/src/main/assets) منتقل می‌شوند.',
    },
    {
      title: '۲. باز کردن پروژه در Android Studio',
      command: 'npx cap open android',
      desc: 'پروژه مستقیماً داخل نرم‌افزار اندروید استودیو باز می‌شود و Gradle آن را لود می‌کند.',
    },
    {
      title: '۳. گرفتن فایل خروجی APK با ۱ کلیک',
      command: 'Build > Build Bundle(s) / APK(s) > Build APK(s)',
      desc: 'فایل خروجی آماده نصب در مسیر android/app/build/outputs/apk/debug/app-debug.apk ذخیره خواهد شد.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-right">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تبدیل به پروژه Android Studio و خروجی APK</h3>
              <p className="text-[11px] text-emerald-400">ساختار بومی Capacitor با موفقیت آماده شد</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info card */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">شناسه بسته (Package ID):</span>
            <span className="font-mono text-emerald-300 font-bold">com.aghazgar.app</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">نام برنامه:</span>
            <span className="text-white font-bold">آغازگر (Aghazgar)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">مسیر پروژه بومی:</span>
            <span className="font-mono text-slate-300">/android</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-bold text-slate-200 block">
            مراحل تولید فایل APK در کامپیوتر شما:
          </span>

          {steps.map((s, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs">
              <span className="font-bold text-white block">{s.title}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400">
                <span className="truncate">{s.command}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(s.command, idx)}
                  className="p-1 hover:text-white transition-colors"
                  title="کپی دستور"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* APK Direct Installation Tip */}
        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مزیت Capacitor در این پروژه:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            کدها، استایل‌ها، فونت وزیرمتن و منطق ضد اهمال‌کاری عیناً در قالب وب‌ویوی بومی اندروید قرار گرفته و به عنوان یک اپلیکیشن کاملاً مستقل، آفلاین و بدون وابستگی به اینترنت نصب و اجرا می‌شود.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
}
