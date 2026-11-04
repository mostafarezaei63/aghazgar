import { useState } from 'react';
import { CustomReward, CustomPenalty, RewardDeliveryMode } from '../types';
import { Gift, ShieldAlert, Plus, CheckCircle, Clock, Zap, Sparkles, AlertOctagon, Trash2 } from 'lucide-react';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CustomRewardsPenaltiesViewProps {
  rewards: CustomReward[];
  penalties: CustomPenalty[];
  score: number;
  streak: number;
  onAddReward: (reward: Omit<CustomReward, 'id' | 'unlockedCount'>) => void;
  onAddPenalty: (penalty: Omit<CustomPenalty, 'id' | 'enforcedCount'>) => void;
  onDeleteReward: (id: string) => void;
  onDeletePenalty: (id: string) => void;
  onClaimReward: (id: string) => void;
  onAcknowledgePenalty: (id: string) => void;
}

export function CustomRewardsPenaltiesView({
  rewards,
  penalties,
  score,
  streak,
  onAddReward,
  onAddPenalty,
  onDeleteReward,
  onDeletePenalty,
  onClaimReward,
  onAcknowledgePenalty,
}: CustomRewardsPenaltiesViewProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'penalties'>('rewards');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);

  // New reward form state
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<RewardDeliveryMode>('free_slot');
  const [pointsReq, setPointsReq] = useState(50);

  // New penalty form state
  const [penaltyTitle, setPenaltyTitle] = useState('');
  const [penaltyDesc, setPenaltyDesc] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<'moderate_delay' | 'severe_delay' | 'unfinished_task'>('moderate_delay');

  const handleAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    onAddReward({
      title: rewardTitle.trim(),
      description: rewardDesc.trim(),
      deliveryMode,
      pointsRequired: Number(pointsReq),
    });

    setRewardTitle('');
    setRewardDesc('');
    setShowAddRewardModal(false);
    soundManager.playTick();
  };

  const handleAddPenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyTitle.trim()) return;

    onAddPenalty({
      title: penaltyTitle.trim(),
      description: penaltyDesc.trim(),
      triggerCondition,
    });

    setPenaltyTitle('');
    setPenaltyDesc('');
    setShowAddPenaltyModal(false);
    soundManager.playTick();
  };

  const getModeLabel = (mode: RewardDeliveryMode) => {
    switch (mode) {
      case 'immediate':
        return { label: 'پاداش آنی (بلافاصله پس از شروع)', icon: Zap, color: 'text-amber-400 bg-amber-950/40 border-amber-500/20' };
      case 'free_slot':
        return { label: 'در زمان خالی تقویم (استراحت مغزی)', icon: Clock, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' };
      case 'daily_review':
        return { label: 'جمع‌بندی شبانه (پس از تحقق اهداف)', icon: Sparkles, color: 'text-blue-400 bg-blue-950/40 border-blue-500/20' };
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'moderate_delay':
        return 'تعلل بین ۱۰ تا ۳۰ دقیقه در شروع';
      case 'severe_delay':
        return 'اهمال‌کاری بیش از ۳۰ دقیقه';
      case 'unfinished_task':
        return 'رها کردن تسک اولویت بالا در طول روز';
      default:
        return cond;
    }
  };

  return (
    <div className="pb-36 pt-3 px-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl space-y-4">
      {/* Top Behavioral Header */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">پاداش‌ها و جریمه‌های واقعی شما</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-800 px-2.5 py-1 rounded-xl">
            {toPersianDigits(score)} امتیاز انضباط
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          انگیزه مغز با پاداش‌های واقعی ملموس (مانند استراحت لذت‌بخش در زمان‌های خالی) و جریمه‌های بازدارنده شخصی چندبرابر می‌شود.
        </p>

        {/* Tab Switcher: Rewards vs Penalties */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>پاداش‌های واقعی ({toPersianDigits(rewards.length)})</span>
          </button>
          <button
            onClick={() => setActiveTab('penalties')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'penalties'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>جریمه‌های واقعی ({toPersianDigits(penalties.length)})</span>
          </button>
        </div>
      </div>

      {/* Rewards Tab Content */}
      {activeTab === 'rewards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">لیست پاداش‌های ثبت‌شده شما</span>
            <button
              onClick={() => setShowAddRewardModal(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت پاداش جدید</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {rewards.map((r) => {
              const meta = getModeLabel(r.deliveryMode);
              const ModeIcon = meta.icon;
              const canClaim = score >= r.pointsRequired;

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium mb-1 ${meta.color}`}>
                        <ModeIcon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{r.title}</h3>
                      {r.description && (
                        <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteReward(r.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      نیاز: {toPersianDigits(r.pointsRequired)} امتیاز انضباط | دریافتی‌ها: {toPersianDigits(r.unlockedCount)} بار
                    </span>

                    <button
                      onClick={() => {
                        onClaimReward(r.id);
                        confetti({ particleCount: 50, spread: 60 });
                        soundManager.playRewardChime();
                      }}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>دریافت و اعمال پاداش</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Penalties Tab Content */}
      {activeTab === 'penalties' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">لیست جریمه‌های بازدارنده انتخابی شما</span>
            <button
              onClick={() => setShowAddPenaltyModal(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت جریمه جدید</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {penalties.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900 border border-rose-950/40 space-y-2.5 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-lg border text-[10px] font-medium text-rose-400 bg-rose-950/40 border-rose-500/20 mb-1">
                      شرط اعمال: {getConditionLabel(p.triggerCondition)}
                    </span>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    {p.description && (
                      <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeletePenalty(p.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    دفعات اجرا شده: {toPersianDigits(p.enforcedCount)} بار
                  </span>

                  <button
                    onClick={() => {
                      onAcknowledgePenalty(p.id);
                      soundManager.playPenaltyTone();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-300 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>تعهد و اجرای جریمه</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Custom Reward */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-right">
            <h3 className="text-sm font-bold text-white mb-3">ثبت پاداش واقعی جدید</h3>
            <form onSubmit={handleAddRewardSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">عنوان پاداش ملموس *</label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="مثال: ۱۵ دقیقه بازی ویدیویی یا نوشیدن چای لاهیجان..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">روش زمان‌بندی و دریافت علمی پاداش</label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value as RewardDeliveryMode)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="free_slot">در زمان خالی تقویم (توصیه علمی: استراحت میان کارها)</option>
                  <option value="immediate">پاداش آنی (بلافاصله بعد از شروع به موقع)</option>
                  <option value="daily_review">جمع‌بندی شبانه (در صورت تکمیل بالای ۸۰٪)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">امتیاز انضباط لازم برای باز شدن</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="10"
                  value={pointsReq}
                  onChange={(e) => setPointsReq(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">توضیح یا یادداشت دلخواه</label>
                <textarea
                  rows={2}
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="این پاداش چگونه به شادابی مغز شما کمک می‌کند؟"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                >
                  ذخیره پاداش
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Penalty */}
      {showAddPenaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-right">
            <h3 className="text-sm font-bold text-white mb-3">ثبت جریمه واقعی بازدارنده</h3>
            <form onSubmit={handleAddPenaltySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">عنوان جریمه بازدارنده *</label>
                <input
                  type="text"
                  required
                  value={penaltyTitle}
                  onChange={(e) => setPenaltyTitle(e.target.value)}
                  placeholder="مثال: محرومیت از گوشی، پرداخت وجه به صدقه، ۳۰ حرکت شنا..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">شرط فعال‌سازی جریمه</label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value as 'moderate_delay' | 'severe_delay' | 'unfinished_task')}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:border-rose-500 focus:outline-none"
                >
                  <option value="moderate_delay">تعلل ۱۰ تا ۳۰ دقیقه در شروع</option>
                  <option value="severe_delay">اهمال‌کاری بیش از ۳۰ دقیقه</option>
                  <option value="unfinished_task">رها کردن یا اتمام نیافتن کار مهم</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">توضیح نحوه اجرا</label>
                <textarea
                  rows={2}
                  value={penaltyDesc}
                  onChange={(e) => setPenaltyDesc(e.target.value)}
                  placeholder="نکته: جریمه باید فوری و قابل انجام در دنیای واقعی باشد."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white"
                >
                  ذخیره جریمه
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPenaltyModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
