import { useState } from 'react';
import { Task } from '../types';
import { Percent, Check, X } from 'lucide-react';
import { toPersianDigits } from '../utils/persianDate';

interface ProgressModalProps {
  task: Task;
  onClose: () => void;
  onUpdateProgress: (taskId: string, percentage: number) => void;
}

export function ProgressModal({ task, onClose, onUpdateProgress }: ProgressModalProps) {
  const [percent, setPercent] = useState<number>(task.progressPercentage);

  const presets = [0, 25, 50, 75, 90, 100];

  const handleSave = () => {
    onUpdateProgress(task.id, percent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative text-right">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ثبت مراحل انجام شده کار</h3>
              <p className="text-[11px] text-slate-400">پیش از آغاز کار بعدی، درصد پیشرفت را معین کنید</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2">
          <span className="text-xs font-semibold text-slate-200 block truncate mb-1">
            {task.title}
          </span>
          <span className="text-[11px] text-slate-400">
            زمان مقرر: ساعت {toPersianDigits(task.scheduledTime)}
          </span>
        </div>

        {/* Large Percentage Display & Slider */}
        <div className="my-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
          <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight mb-2">
            {toPersianDigits(percent)}٪
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          {/* Quick preset chips */}
          <div className="flex items-center justify-between gap-1.5 mt-4">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPercent(p)}
                className={`flex-1 py-1 text-xs rounded-lg font-mono transition-colors ${
                  percent === p
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {toPersianDigits(p)}٪
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>ثبت درصد و خروج</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
