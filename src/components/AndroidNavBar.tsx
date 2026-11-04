import { Calendar, LineChart, Gift, Plus, Settings } from 'lucide-react';

export type NavTab = 'tasks' | 'analytics' | 'rewards' | 'settings';

interface AndroidNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCreateTask: () => void;
}

export function AndroidNavBar({ currentTab, onTabChange, onOpenCreateTask }: AndroidNavBarProps) {
  return (
    <nav
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-md border-t border-slate-800/80 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl select-none shadow-2xl shadow-black/60"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 sm:px-2">
        {/* Tab 1: کارهای تقویم */}
        <button
          onClick={() => onTabChange('tasks')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all active:scale-95 ${
            currentTab === 'tasks' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentTab === 'tasks' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate ${currentTab === 'tasks' ? 'font-bold' : 'font-normal'}`}>
            کارهای تقویم
          </span>
          {currentTab === 'tasks' && (
            <div className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        {/* Tab 2: نمودار منحنی */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all active:scale-95 ${
            currentTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentTab === 'analytics' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate ${currentTab === 'analytics' ? 'font-bold' : 'font-normal'}`}>
            نمودار منحنی
          </span>
          {currentTab === 'analytics' && (
            <div className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        {/* Center Action Button: کلید اضافه کردن کار جدید */}
        <button
          onClick={onOpenCreateTask}
          className="flex flex-col items-center justify-center relative -top-3.5 group active:scale-90 transition-all focus:outline-none"
          title="اضافه کردن کار جدید"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-4 ring-slate-900 group-hover:scale-105 group-hover:shadow-emerald-500/50 transition-all">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8]" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-emerald-400 tracking-tight">
            کار جدید
          </span>
        </button>

        {/* Tab 3: پاداش و جریمه */}
        <button
          onClick={() => onTabChange('rewards')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all active:scale-95 ${
            currentTab === 'rewards' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentTab === 'rewards' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate ${currentTab === 'rewards' ? 'font-bold' : 'font-normal'}`}>
            پاداش و جریمه
          </span>
          {currentTab === 'rewards' && (
            <div className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        {/* Tab 4: تنظیمات */}
        <button
          onClick={() => onTabChange('settings')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-all active:scale-95 ${
            currentTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentTab === 'settings' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate ${currentTab === 'settings' ? 'font-bold' : 'font-normal'}`}>
            تنظیمات
          </span>
          {currentTab === 'settings' && (
            <div className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
}
