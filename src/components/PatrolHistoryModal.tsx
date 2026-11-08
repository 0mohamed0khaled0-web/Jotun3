import React from 'react';
import { X, History, PlusCircle, CheckCircle, Calendar, Shield, Trash2, ArrowUpRight } from 'lucide-react';
import { PatrolRecord } from '../types';

interface PatrolHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PatrolRecord[];
  onLoadPatrol: (patrol: PatrolRecord) => void;
  onStartNewPatrol: () => void;
  onClearHistory?: () => void;
}

export const PatrolHistoryModal: React.FC<PatrolHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadPatrol,
  onStartNewPatrol,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const shiftLabels = {
    morning: 'صباحية',
    evening: 'مسائية',
    night: 'ليلية',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">سجل وأرشيف الجولات المرورية</h3>
              <p className="text-xs text-slate-400">استعراض الجولات السابقة والاطلاع على جودة المرور</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStartNewPatrol();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>جولة جديدة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Patrols */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <p className="text-sm">لا توجد جولات مؤرشفة بعد.</p>
              <p className="text-xs text-slate-600">
                عند تصدير صورة التقرير أو إنهاء الجولة سيتم حفظها هنا تلقائياً.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const scannedCount = record.zones.filter((z) => z.isScanned).length;

              return (
                <div
                  key={record.id}
                  className="bg-slate-800/70 border border-slate-700 hover:border-slate-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {record.patrolNumber}
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs font-bold text-slate-200">
                        {record.date} ({shiftLabels[record.shift]})
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {record.startTime} - {record.endTime || 'مستمر'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.guards.join('، ') || 'أفراد الأمن'}</span>
                      {record.hseOfficer && (
                        <span className="text-emerald-400">| HSE: {record.hseOfficer}</span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>المناطق الممسوحة: <b className="text-slate-200">{scannedCount}/9</b></span>
                      <span>نسبة الجودة: <b className="text-amber-400 font-mono">{record.qualityScore || 0}%</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadPatrol(record);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>عرض وتصدير</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>يتم الاحتفاظ بآخر 30 جولة تلقائياً على هذا الجهاز</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
