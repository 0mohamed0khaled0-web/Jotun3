import React from 'react';
import { X, Printer, Download, QrCode, Shield, Check } from 'lucide-react';
import { ZoneInspection } from '../types';
import { generateQrSvg } from '../utils/qrGenerator';

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ZoneInspection[];
}

export const QRPrintModal: React.FC<QRPrintModalProps> = ({ isOpen, onClose, zones }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar (hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                طباعة بطاقات كيو ار الرسمية لموقع يوتن (9 مناطق)
              </h3>
              <p className="text-xs text-slate-400">
                جاهزة للطباعة والتغليف والتعليق في نقاط التفتيش بالمصنع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكل (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Grid of 9 Cards */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">
            {zones.map((zone, idx) => {
              const svgString = generateQrSvg(zone.code, 180);

              return (
                <div
                  key={zone.id}
                  className="bg-white text-slate-900 rounded-2xl p-4 border-2 border-slate-300 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden print:border-black print:break-inside-avoid"
                  style={{ minHeight: '340px' }}
                >
                  {/* Card Header Badge */}
                  <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        J
                      </div>
                      <span className="text-[11px] font-black tracking-tight text-slate-800">
                        موقع دهانات يوتن
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                      نقطة تفتيش #{idx + 1}
                    </span>
                  </div>

                  {/* Zone Name */}
                  <div className="my-1">
                    <h4 className="text-xl font-black text-slate-900">{zone.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-[220px] line-clamp-2">
                      {zone.description}
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 my-2">
                    <div
                      dangerouslySetInnerHTML={{ __html: svgString }}
                      className="w-36 h-36 flex items-center justify-center"
                    />
                  </div>

                  {/* Code string */}
                  <div className="w-full pt-2 border-t border-slate-200 mt-auto">
                    <div className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
                      {zone.code}
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                      يُمسح بكاميرا منظومة أمن يوتن أثناء المرور
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>نصيحة: يمكنك طباعة الصفحة وتغليف البطاقات حرارياً وتثبيتها بجوار بوابات المناطق الـ 9.</span>
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
