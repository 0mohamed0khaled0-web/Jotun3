import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Camera, Check, ChevronDown, ChevronUp, Image, Trash2 } from 'lucide-react';
import { ZoneInspection } from '../types';

interface ZoneCardProps {
  zone: ZoneInspection;
  onUpdateZone: (updated: ZoneInspection) => void;
  onOpenScannerForZone: (zoneId: string) => void;
  index: number;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  onUpdateZone,
  onOpenScannerForZone,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!zone.isScanned);

  const quickObservations = [
    'الموقع آمن ومستقر تماماً',
    'تراكم مخلفات أو منصات تعيق الممر',
    'كشاف الإنارة تالف بحاجة لصيانة',
    'تسريب سوائل / مياه على الأرضية',
    'مخرج الطوارئ أو باب الحريق مغلق',
    'عدم التزام بمهمات السلامة PPE',
  ];

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = zone.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateZone({ ...zone, checklist: updatedChecklist });
  };

  // Add quick observation text
  const addQuickObservation = (text: string) => {
    const current = zone.notes.trim();
    const updated = current ? `${current} - ${text}` : text;
    onUpdateZone({ ...zone, notes: updated });
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateZone({ ...zone, photoUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const removePhoto = () => {
    onUpdateZone({ ...zone, photoUrl: undefined });
  };

  const statusColors = {
    normal: 'border-emerald-500/40 bg-emerald-500/5',
    notice: 'border-amber-500/40 bg-amber-500/5',
    critical: 'border-rose-500/50 bg-rose-500/10',
    unvisited: 'border-slate-800 bg-slate-900/60',
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        statusColors[zone.status]
      } ${zone.isScanned ? 'ring-1 ring-emerald-500/20' : ''}`}
    >
      {/* Zone Card Header */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg font-bold flex items-center justify-center shrink-0 text-sm ${
              zone.isScanned
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-tight">{zone.name}</h4>
              <span className="text-[11px] font-mono text-slate-400">({zone.code})</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{zone.description}</p>
          </div>
        </div>

        {/* Scan Status & Scan Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {zone.isScanned ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم المسح ({zone.scannedAt || 'تم'})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenScannerForZone(zone.id)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>مسح الكيو ار</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
            title={isExpanded ? 'طي التفاصيل' : 'عرض الملاحظات والفحص'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Checklist & Notes Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3.5 bg-slate-950/30">
          
          {/* Status selector */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">حالة الموقع بعد التفتيش:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onUpdateZone({ ...zone, status: 'normal' })}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  zone.status === 'normal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ✓ آمن وسليم
              </button>
              <button
                type="button"
                onClick={() => onUpdateZone({ ...zone, status: 'notice' })}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  zone.status === 'notice'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ⚠ ملاحظات بسيطة
              </button>
              <button
                type="button"
                onClick={() => onUpdateZone({ ...zone, status: 'critical' })}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  zone.status === 'critical'
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🚨 ملاحظة حرجة / خطر
              </button>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-400">قائمة فحص السلامة والأمان السريع:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {zone.checklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    item.checked
                      ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-800"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes and observations (تدوين أي ملاحظة على الموقع) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              تدوين ملاحظات ظابط الأمن على الموقع:
            </label>
            <textarea
              rows={2}
              placeholder="اكتب أي ملاحظة أمنية، عطل في الإنارة، انسكابات، أو وضع غير طبيعي تم رصده..."
              value={zone.notes}
              onChange={(e) => onUpdateZone({ ...zone, notes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 py-0.5">اقتراحات سريعة:</span>
              {quickObservations.map((obs, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addQuickObservation(obs)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  + {obs}
                </button>
              ))}
            </div>
          </div>

          {/* Photo attachment for zone */}
          <div className="pt-2 flex items-center justify-between">
            {zone.photoUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                  <img
                    src={zone.photoUrl}
                    alt={zone.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs text-emerald-400 block font-medium">✓ تم إرفاق صورة للموقع</span>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف الصورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                <span>إرفاق صورة ملاحظة (كاميرا / ألبوم)</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}

            {!zone.isScanned && (
              <button
                type="button"
                onClick={() => onOpenScannerForZone(zone.id)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                مسح الكيو ار الآن ←
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
