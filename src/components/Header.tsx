import React from 'react';
import { ShieldCheck, QrCode, FileText, Printer, Users, History, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'patrol' | 'meters' | 'zones' | 'report';
  setActiveTab: (tab: 'patrol' | 'meters' | 'zones' | 'report') => void;
  onOpenScanner: () => void;
  onOpenQrPrint: () => void;
  onOpenPersonnel: () => void;
  onOpenHistory: () => void;
  qualityScore: number;
  unscannedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  onOpenQrPrint,
  onOpenPersonnel,
  onOpenHistory,
  qualityScore,
  unscannedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar Contract) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl tracking-tighter shadow-md shadow-amber-500/20">
              J
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                منظومة مرور أمن يوتن
              </span>
              <span className="text-xs text-amber-400 font-medium whitespace-nowrap">
                Jotun Security & HSE Patrol
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, concise tabs) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('patrol')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'patrol'
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>الجولة الحالية</span>
            </button>

            <button
              onClick={() => setActiveTab('zones')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'zones'
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>المناطق الـ 9</span>
              {unscannedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-300 rounded font-mono">
                  {unscannedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('meters')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'meters'
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>عدادات الطلمبات (3)</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>تقرير وتصدير الصورة</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick QR Scan Button */}
            <button
              onClick={onOpenScanner}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>مسح الكيو ار</span>
            </button>

            {/* Personnel Manager */}
            <button
              onClick={onOpenPersonnel}
              title="إدارة أفراد الأمن والسلامة الصناعية"
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors shrink-0"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* QR Sheet Print */}
            <button
              onClick={onOpenQrPrint}
              title="طباعة بطاقات كيو ار للموقع"
              className="hidden sm:flex p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors shrink-0"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Patrol History */}
            <button
              onClick={onOpenHistory}
              title="سجل الجولات السابقة"
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors shrink-0"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('patrol')}
            className={`py-1 px-2.5 rounded ${activeTab === 'patrol' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'}`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`py-1 px-2.5 rounded flex items-center gap-1 ${activeTab === 'zones' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'}`}
          >
            المناطق ({unscannedCount})
          </button>
          <button
            onClick={() => setActiveTab('meters')}
            className={`py-1 px-2.5 rounded ${activeTab === 'meters' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'}`}
          >
            العدادات (3)
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-1 px-2.5 rounded flex items-center gap-1 ${activeTab === 'report' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'}`}
          >
            تصدير الصورة
          </button>
        </div>
      </div>
    </header>
  );
};
