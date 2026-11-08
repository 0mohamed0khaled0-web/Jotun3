import React from 'react';
import { Award, CheckCircle, AlertCircle, ArrowUpRight, Gauge, MapPin } from 'lucide-react';
import { QualityAnalysis } from '../utils/qualityScore';

interface QualityScoreWidgetProps {
  analysis: QualityAnalysis;
  onNavigateToMeters: () => void;
  onNavigateToZones: () => void;
}

export const QualityScoreWidget: React.FC<QualityScoreWidgetProps> = ({
  analysis,
  onNavigateToMeters,
  onNavigateToZones,
}) => {
  const {
    score,
    grade,
    gradeColor,
    badgeBg,
    scannedZonesCount,
    totalZones,
    metersWithPhotoCount,
    totalMeters,
    pendingActions,
  } = analysis;

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg mb-6 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Score Ring / Number */}
        <div className="flex items-center gap-5 w-full lg:w-auto justify-between sm:justify-start">
          <div className="relative flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-700/60"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-700 ease-out ${
                  score >= 90
                    ? 'stroke-emerald-400'
                    : score >= 70
                    ? 'stroke-amber-400'
                    : 'stroke-rose-400'
                }`}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {score}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">جودة الجولة</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400 font-semibold">مؤشر جودة وانضباط المرور:</span>
            </div>
            <h3 className={`text-base sm:text-lg font-black ${gradeColor}`}>
              {grade}
            </h3>
            <p className="text-xs text-slate-300">
              {score >= 95
                ? 'الجولة استوفت كافة متطلبات المسح والتصوير والتفتيش بموقع يوتن'
                : 'يتم احتساب النسبة بناءً على مسح الـ 9 مناطق وتوثيق العدادات الثلاثة وقوائم السلامة'}
            </p>
          </div>
        </div>

        {/* 2 Key KPI Badges */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
          {/* Zones scanned */}
          <button
            type="button"
            onClick={onNavigateToZones}
            className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 rounded-xl text-right transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>المناطق الممسوحة</span>
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {scannedZonesCount}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {totalZones}</span>
              {scannedZonesCount === totalZones ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-auto" />
              ) : null}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(scannedZonesCount / totalZones) * 100}%` }}
              />
            </div>
          </button>

          {/* Meters documented with photo */}
          <button
            type="button"
            onClick={onNavigateToMeters}
            className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 rounded-xl text-right transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصوير العدادات</span>
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {metersWithPhotoCount}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {totalMeters}</span>
              {metersWithPhotoCount === totalMeters ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 mr-auto" />
              ) : null}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(metersWithPhotoCount / totalMeters) * 100}%` }}
              />
            </div>
          </button>
        </div>

      </div>

      {/* Pending actions alerts banner */}
      {pendingActions.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-medium">
              نواقص مطلوبة لرفع نسبة الجودة إلى 100%:
            </span>
            <span className="text-slate-300">
              {pendingActions.slice(0, 2).join(' · ')}
              {pendingActions.length > 2 && ` (+${pendingActions.length - 2} إجراءات أخرى)`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
