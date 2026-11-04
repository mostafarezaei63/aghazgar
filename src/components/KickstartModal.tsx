import { useState, useEffect } from 'react';
import { Task } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { toPersianDigits, evaluatePunctuality, calculateDelayMinutes } from '../utils/persianDate';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface KickstartModalProps {
  task: Task;
  onClose: () => void;
  onInitiateComplete: (taskId: string, delayMinutes: number, pointsEarned: number) => void;
  onCancelWithPenalty?: (taskId: string) => void;
}

export function KickstartModal({
  task,
  onClose,
  onInitiateComplete,
  onCancelWithPenalty,
}: KickstartModalProps) {
  const TOTAL_SECONDS = 120; // 2 minutes activation rule
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [isCompletedPhase, setIsCompletedPhase] = useState(false);

  // Calculate punctuality at this moment
  const delayMinutes = calculateDelayMinutes(task.scheduledTime);
  const evaluation = evaluatePunctuality(delayMinutes);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsCompletedPhase(true);
            soundManager.playKickstartSuccess();
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
            return 0;
          }
          if (prev % 10 === 0) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const progressPct = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const handleConfirmInitiation = () => {
    if (evaluation.isReward) {
      soundManager.playRewardChime();
    } else {
      soundManager.playPenaltyTone();
    }
    onInitiateComplete(task.id, delayMinutes, evaluation.points);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>پروتکل فعال‌سازی آنی (قانون ۲ دقیقه)</span>
        </div>

        <h3 className="text-xl font-bold text-white mt-1 mb-1">{task.title}</h3>
        <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>زمان مقرر شروع: {toPersianDigits(task.scheduledTime)}</span>
          <span>·</span>
          <span>وضعیت شروع: {evaluation.label}</span>
        </p>

        {/* Circular Countdown Progress */}
        <div className="relative w-48 h-48 my-3 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="7"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke={isCompletedPhase ? '#10b981' : '#06b6d4'}
              strokeWidth="7"
              strokeDasharray={263.89}
              strokeDashoffset={263.89 - (263.89 * progressPct) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Time inside circle */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold text-white tracking-wider font-mono">
              {toPersianDigits(String(mins).padStart(2, '0'))}:{toPersianDigits(String(secs).padStart(2, '0'))}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {isCompletedPhase ? 'سد مقاومت شکسته شد!' : 'فقط این ۲ دقیقه را آغاز کن'}
            </span>
          </div>
        </div>

        {/* Scientific Anti-Procrastination Guidance */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 my-3 text-right w-full text-xs text-slate-300 leading-relaxed">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>راهنمای روانی شروع بدون اهمال‌کاری:</span>
          </div>
          تنها وظیفه شما در این ۲ دقیقه این است که ابزار کار را باز کرده و نخستین حرکت فیزیکی را انجام دهید. نیاز به تمام کردن کار نیست؛ شروع کردن ۹۰٪ سختی مسیر است!
        </div>

        {/* Punctuality and Points Preview */}
        <div className={`w-full p-2.5 rounded-xl border mb-4 text-xs font-medium flex items-center justify-between ${evaluation.colorClass}`}>
          <span>{evaluation.label}</span>
          <span className="font-bold">
            {evaluation.points > 0 ? `+${toPersianDigits(evaluation.points)} امتیاز پاداش` : `${toPersianDigits(evaluation.points)} امتیاز جریمه`}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Main Confirmation Button */}
          <button
            onClick={handleConfirmInitiation}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>ثبت رسمی شروع کار و دریافت امتیاز</span>
          </button>

          {/* Pause / Resume Controls during 2-minute timer */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>مکث تایمر</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>ادامه تایمر</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
