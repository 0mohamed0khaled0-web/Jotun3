import React, { useRef } from 'react';
import { Camera, Gauge, Fuel, Clock, AlertTriangle, CheckCircle, Trash2, Image } from 'lucide-react';
import { MeterReading } from '../types';

interface MeterSectionProps {
  meters: {
    jockey: MeterReading;
    diesel1: MeterReading;
    diesel2: MeterReading;
  };
  onUpdateMeter: (id: 'jockey' | 'diesel1' | 'diesel2', updated: MeterReading) => void;
}

export const MeterSection: React.FC<MeterSectionProps> = ({ meters, onUpdateMeter }) => {
  // Helper to handle capturing or uploading photo for a meter
  const handlePhotoCapture = (
    meterId: 'jockey' | 'diesel1' | 'diesel2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Watermark on canvas with pump title, timestamp, and site name
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // Draw bottom watermark bar
          const bannerHeight = Math.max(48, Math.floor(img.height * 0.08));
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(0, img.height - bannerHeight, img.width, bannerHeight);

          // Watermark text
          const fontSize = Math.max(14, Math.floor(bannerHeight * 0.38));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = '#f59e0b';
          const nowStr = new Date().toLocaleString('ar-EG');
          const meterName = meters[meterId].name;
          const text = `موقع يوتن | ${meterName} | توثيق: ${nowStr}`;
          ctx.fillText(text, 20, img.height - bannerHeight / 2 + fontSize / 3);

          const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onUpdateMeter(meterId, {
            ...meters[meterId],
            photoUrl: watermarkedDataUrl,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (meterId: 'jockey' | 'diesel1' | 'diesel2') => {
    onUpdateMeter(meterId, {
      ...meters[meterId],
      photoUrl: undefined,
      timestamp: undefined,
    });
  };

  const meterCards: Array<{
    id: 'jockey' | 'diesel1' | 'diesel2';
    data: MeterReading;
    accentColor: string;
    badgeBg: string;
    isDiesel: boolean;
  }> = [
    {
      id: 'jockey',
      data: meters.jockey,
      accentColor: 'border-blue-500/40',
      badgeBg: 'bg-blue-500/10 text-blue-400',
      isDiesel: false,
    },
    {
      id: 'diesel1',
      data: meters.diesel1,
      accentColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/10 text-amber-400',
      isDiesel: true,
    },
    {
      id: 'diesel2',
      data: meters.diesel2,
      accentColor: 'border-orange-500/40',
      badgeBg: 'bg-orange-500/10 text-orange-400',
      isDiesel: true,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              غرفة طلمبات مكافحة الحريق - توثيق العدادات الثلاثة
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تصوير وتسجيل قراءات عداد مضخة الجوكي + عدادين الديزل (شرط إلزامي لاكتمال جودة الجولة)
          </p>
        </div>

        {/* Meters status summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-slate-400">العدادات الموثقة بالصور:</span>
            <span className="font-bold text-amber-400 font-mono">
              {[meters.jockey, meters.diesel1, meters.diesel2].filter((m) => !!m.photoUrl).length} / 3
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 3 Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {meterCards.map(({ id, data, accentColor, badgeBg, isDiesel }) => {
          const fileInputRef = useRef<HTMLInputElement | null>(null);

          return (
            <div
              key={id}
              className={`bg-slate-800/80 rounded-2xl border ${accentColor} p-5 flex flex-col justify-between shadow-lg relative overflow-hidden`}
            >
              {/* Card top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${badgeBg}`}>
                      {id === 'jockey' ? 'طلمبة كهرباء مساعدة' : id === 'diesel1' ? 'طلمبة ديزل رئيسية 1' : 'طلمبة ديزل احتياطية 2'}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{data.name}</h4>
                    <p className="text-[11px] text-slate-400">{data.subTitle}</p>
                  </div>

                  {data.photoUrl ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>موثق بالصورة</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>الصورة مطلوبة</span>
                    </span>
                  )}
                </div>

                {/* Photo Viewport / Capture Trigger */}
                <div className="mb-4">
                  {data.photoUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black">
                      <img
                        src={data.photoUrl}
                        alt={data.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>إعادة التصوير</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                      <div className="absolute bottom-1 right-2 text-[10px] bg-slate-950/80 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                        {data.timestamp || 'تم التوثيق'}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors mb-2">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                        التقاط صورة عداد {data.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        اضغط لفتح الكاميرا أو إرفاق صورة العداد
                      </span>
                    </button>
                  )}

                  {/* Hidden File input for camera capture */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoCapture(id, e)}
                    className="hidden"
                  />
                </div>

                {/* Metric input fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        ضغط الشبكة (Bar):
                      </label>
                      <input
                        type="text"
                        value={data.pressureBar}
                        onChange={(e) =>
                          onUpdateMeter(id, { ...data, pressureBar: e.target.value })
                        }
                        placeholder="10.5 Bar"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        {isDiesel ? 'ساعات التشغيل:' : 'الضغط (PSI):'}
                      </label>
                      <input
                        type="text"
                        value={data.hoursOrPsi}
                        onChange={(e) =>
                          onUpdateMeter(id, { ...data, hoursOrPsi: e.target.value })
                        }
                        placeholder={isDiesel ? '340 ساعة' : '150 PSI'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {isDiesel && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-amber-400" />
                          <span>مستوى وقود الديزل بالتانك:</span>
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{data.fuelLevel || '90%'}</span>
                      </label>
                      <input
                        type="text"
                        value={data.fuelLevel || ''}
                        onChange={(e) =>
                          onUpdateMeter(id, { ...data, fuelLevel: e.target.value })
                        }
                        placeholder="مثال: 95% أو ممتلئ"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  {/* Operational status radio */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      حالة المضخة الحالية:
                    </label>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => onUpdateMeter(id, { ...data, status: 'operational' })}
                        className={`py-1 rounded font-medium transition-colors ${
                          data.status === 'operational'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        جاهزة (Auto)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateMeter(id, { ...data, status: 'idle' })}
                        className={`py-1 rounded font-medium transition-colors ${
                          data.status === 'idle'
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        في الخدمة
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateMeter(id, { ...data, status: 'maintenance' })}
                        className={`py-1 rounded font-medium transition-colors ${
                          data.status === 'maintenance'
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        صيانة
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      ملاحظات ظابط الأمن:
                    </label>
                    <input
                      type="text"
                      value={data.notes || ''}
                      onChange={(e) =>
                        onUpdateMeter(id, { ...data, notes: e.target.value })
                      }
                      placeholder="حالة الشواحن، المحابس، بطاريات البدء..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
