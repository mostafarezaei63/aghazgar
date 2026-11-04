import { useState } from 'react';
import { Volume2, VolumeX, Flame, Award, Bell } from 'lucide-react';
import { toPersianDigits, formatPersianFullDate } from '../utils/persianDate';
import { soundManager } from '../utils/audio';

interface AndroidHeaderProps {
  score: number;
  streak: number;
  onOpenNotificationSettings?: () => void;
}

export function AndroidHeader({
  score,
  streak,
  onOpenNotificationSettings,
}: AndroidHeaderProps) {
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setSoundEnabled(next);
    if (next) {
      soundManager.playTick();
    }
  };

  return (
    <header
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 28px)' }}
      className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 select-none transition-all"
    >
      {/* Main Top Bar: 1-line brand, info, and controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
            آ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">آغازگر</h1>
              <span className="text-[11px] text-emerald-400/90 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                تمرکز بر شروع به موقع
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {formatPersianFullDate()}
            </p>
          </div>
        </div>

        {/* Action Controls & Score Display */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs font-semibold" title="روزهای متوالی شروع به موقع">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{toPersianDigits(streak)} روز</span>
          </div>

          {/* Discipline Score */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-bold" title="امتیاز انضباط رفتاری">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toPersianDigits(score)}</span>
          </div>

          {/* Notification settings button */}
          {onOpenNotificationSettings && (
            <button
              onClick={onOpenNotificationSettings}
              aria-label="تنظیمات یادآوری و اعلان"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 flex items-center justify-center transition-colors"
              title="تنظیمات اعلان گوشی و تست یادآوری"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'قطع صدا' : 'وصل صدا'}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
}
