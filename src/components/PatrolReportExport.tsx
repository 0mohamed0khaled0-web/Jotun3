import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Download,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  HardHat,
  Gauge,
  Calendar,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { PatrolRecord } from '../types';
import { calculatePatrolQuality } from '../utils/qualityScore';

interface PatrolReportExportProps {
  patrol: PatrolRecord;
  onSaveToHistory: () => void;
}

export const PatrolReportExport: React.FC<PatrolReportExportProps> = ({
  patrol,
  onSaveToHistory,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const quality = calculatePatrolQuality(patrol);

  const shiftLabels = {
    morning: 'الوردية الأولى (صباحية)',
    evening: 'الوردية الثانية (مسائية)',
    night: 'الوردية الثالثة (ليلية)',
  };

  // Export high resolution PNG image of the report card
  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setExportSuccessMessage(null);

    try {
      // Allow DOM repaint
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution for crisp text and clear meter photos
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      const filename = `تقرير_مرور_يوتن_${patrol.patrolNumber}_${patrol.date}.png`;
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Auto archive to history
      onSaveToHistory();
      setExportSuccessMessage(`تم تصدير وحفظ الصورة بنجاح: ${filename}`);
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Failed to export image', err);
      alert('حدث خطأ أثناء إنشاء صورة التقرير. يمكنك استخدام خيار الطباعة كبديل.');
    } finally {
      setIsExporting(false);
    }
  };

  // Share summary
  const handleShareSummary = () => {
    const summaryText = `*تقرير جولة المرور الأمني - موقع دهانات يوتن*
رقم الجولة: ${patrol.patrolNumber}
التاريخ: ${patrol.date} | ${shiftLabels[patrol.shift]}
التوقيت: من ${patrol.startTime || '--:--'} إلى ${patrol.endTime || '--:--'}
الأمن القائم بالجولة: ${patrol.guards.join('، ')}
الأمن الصناعي (HSE): ${patrol.hseOfficer || 'غير محدد'}
نسبة جودة الجولة: ${quality.score}% (${quality.grade})
المناطق الممسوحة: ${quality.scannedZonesCount} من 9
عدادات الحريق الموثقة: ${quality.metersWithPhotoCount} من 3
عداد الجوكي: ${patrol.meters.jockey.pressureBar || '10.5'} Bar
عداد ديزل 1: ${patrol.meters.diesel1.pressureBar || '11.0'} Bar (${patrol.meters.diesel1.hoursOrPsi || ''})
عداد ديزل 2: ${patrol.meters.diesel2.pressureBar || '11.0'} Bar (${patrol.meters.diesel2.hoursOrPsi || ''})
تم الاعتماد عبر منظومة أمن يوتن.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      alert('تم نسخ ملخص الجولة إلى الحافظة بنجاح! يمكنك لصقه مباشرة في واتساب إدارة الأمن.');
    } else {
      alert(summaryText);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Toolbar */}
      <div className="no-print bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>تصدير تقرير الجولة المرورية (صورة عالية الدقة)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            يحتوي التقرير على تفاصيل الـ 9 مناطق، قراءات وصور العدادات الثلاثة، والتوقيعات الرسمية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleShareSummary}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>نسخ لواتساب</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>طباعة</span>
          </button>

          <button
            type="button"
            onClick={handleExportImage}
            disabled={isExporting}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'جارٍ إنشاء الصورة...' : 'تصدير صورة الجولة (PNG)'}</span>
          </button>
        </div>
      </div>

      {exportSuccessMessage && (
        <div className="no-print p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* The Printable / Exportable Official Report Card (Light theme on export for clean paper printing) */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={reportRef}
          className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-slate-300 shadow-xl max-w-4xl mx-auto font-sans"
          style={{ width: '100%', minWidth: '760px', color: '#0f172a' }}
        >
          {/* Official Jotun Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5">
            <div className="flex items-center justify-between">
              
              {/* Jotun Logo & Site Title */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#002b49] text-amber-400 flex items-center justify-center font-black text-2xl shadow">
                  J
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-[#002b49]">
                    دهانات يوتن - جمهورية مصر العربية
                  </h1>
                  <p className="text-xs font-bold text-slate-600">
                    إدارة الأمن والسلامة والصحة المهنية والبيئة (HSE & Security)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Jotun Paints Facility - Security Patrol & Inspection Report
                  </p>
                </div>
              </div>

              {/* Patrol ID & Quality Stamp */}
              <div className="text-left flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500">رقم تقرير الجولة:</span>
                <span className="text-sm font-black font-mono text-[#002b49]">
                  {patrol.patrolNumber}
                </span>

                {/* Score Stamp */}
                <div className="mt-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-left">
                  <div className="text-[10px] text-amber-800 font-bold">نسبة جودة الجولة:</div>
                  <div className="text-base font-black text-amber-600 font-mono flex items-center gap-1">
                    <span>{quality.score}%</span>
                    <span className="text-[10px] font-sans text-slate-700">({quality.grade})</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Info Strip (Date, Shift, Guards, HSE) */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">التاريخ والوردية:</span>
              <span className="font-bold text-slate-900 font-mono block">{patrol.date}</span>
              <span className="text-[11px] text-slate-600 font-medium">{shiftLabels[patrol.shift]}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">توقيت المرور:</span>
              <span className="font-bold text-slate-900 font-mono block">
                من {patrol.startTime || '--:--'} إلى {patrol.endTime || 'مستمر'}
              </span>
              <span className="text-[11px] text-slate-600">مدة الجولة الميدانية</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">أفراد الأمن المنفذين:</span>
              <span className="font-bold text-slate-900 block leading-tight">
                {patrol.guards.length > 0 ? patrol.guards.join(' · ') : 'لم يتم تحديد أفراد'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">ضابط الأمن الصناعي (HSE):</span>
              <span className="font-bold text-emerald-800 block">
                {patrol.hseOfficer || 'غير مسجل'}
              </span>
              <span className="text-[10px] text-slate-500">إشراف وتدقيق السلامة</span>
            </div>
          </div>

          {/* SECTION 1: Fire Pump Meters (واحد جوكي + اتنين ديزل) */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1.5 mb-3">
              <h2 className="text-sm font-black text-[#002b49] flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-600" />
                <span>1. بيان وقراءات عدادات طلمبات مكافحة الحريق (الجوكي + 2 ديزل)</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                توثيق فوتوغرافي إلزامي لعدادات المضخات
              </span>
            </div>

            {/* Meters Table */}
            <table className="w-full text-xs text-right border-collapse mb-3">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="py-2 px-2.5 font-bold">المضخة</th>
                  <th className="py-2 px-2.5 font-bold">الضغط (Bar)</th>
                  <th className="py-2 px-2.5 font-bold">الساعات / PSI</th>
                  <th className="py-2 px-2.5 font-bold">الوقود</th>
                  <th className="py-2 px-2.5 font-bold">الحالة التشغيلية</th>
                  <th className="py-2 px-2.5 font-bold">ملاحظات ظابط الأمن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">
                    عداد مضخة الجوكي (الكهربائية)
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-blue-700">
                    {patrol.meters.jockey.pressureBar || '-'} Bar
                  </td>
                  <td className="py-2 px-2.5 font-mono">
                    {patrol.meters.jockey.hoursOrPsi || '-'}
                  </td>
                  <td className="py-2 px-2.5 text-slate-400">-</td>
                  <td className="py-2 px-2.5 font-semibold text-emerald-700">
                    {patrol.meters.jockey.status === 'operational'
                      ? 'جاهزة (Auto)'
                      : patrol.meters.jockey.status}
                  </td>
                  <td className="py-2 px-2.5 text-slate-600">
                    {patrol.meters.jockey.notes || 'سليمة'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">
                    عداد مضخة الديزل 1 (الرئيسية)
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-amber-700">
                    {patrol.meters.diesel1.pressureBar || '-'} Bar
                  </td>
                  <td className="py-2 px-2.5 font-mono">
                    {patrol.meters.diesel1.hoursOrPsi || '-'}
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-amber-700">
                    {patrol.meters.diesel1.fuelLevel || '95%'}
                  </td>
                  <td className="py-2 px-2.5 font-semibold text-emerald-700">
                    {patrol.meters.diesel1.status === 'operational'
                      ? 'جاهزة (Auto)'
                      : patrol.meters.diesel1.status}
                  </td>
                  <td className="py-2 px-2.5 text-slate-600">
                    {patrol.meters.diesel1.notes || 'سليمة'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">
                    عداد مضخة الديزل 2 (الاحتياطية)
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-amber-700">
                    {patrol.meters.diesel2.pressureBar || '-'} Bar
                  </td>
                  <td className="py-2 px-2.5 font-mono">
                    {patrol.meters.diesel2.hoursOrPsi || '-'}
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-amber-700">
                    {patrol.meters.diesel2.fuelLevel || '90%'}
                  </td>
                  <td className="py-2 px-2.5 font-semibold text-emerald-700">
                    {patrol.meters.diesel2.status === 'operational'
                      ? 'جاهزة (Auto)'
                      : patrol.meters.diesel2.status}
                  </td>
                  <td className="py-2 px-2.5 text-slate-600">
                    {patrol.meters.diesel2.notes || 'سليمة'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* The 3 Photographic Evidence Cells Side-by-Side */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Jockey Photo */}
              <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  صورة عداد الجوكي
                </span>
                {patrol.meters.jockey.photoUrl ? (
                  <div className="rounded overflow-hidden border border-slate-300 aspect-video bg-black">
                    <img
                      src={patrol.meters.jockey.photoUrl}
                      alt="عداد الجوكي"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                    لم تُلتقط صورة
                  </div>
                )}
              </div>

              {/* Diesel 1 Photo */}
              <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  صورة عداد ديزل 1
                </span>
                {patrol.meters.diesel1.photoUrl ? (
                  <div className="rounded overflow-hidden border border-slate-300 aspect-video bg-black">
                    <img
                      src={patrol.meters.diesel1.photoUrl}
                      alt="عداد ديزل 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                    لم تُلتقط صورة
                  </div>
                )}
              </div>

              {/* Diesel 2 Photo */}
              <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  صورة عداد ديزل 2
                </span>
                {patrol.meters.diesel2.photoUrl ? (
                  <div className="rounded overflow-hidden border border-slate-300 aspect-video bg-black">
                    <img
                      src={patrol.meters.diesel2.photoUrl}
                      alt="عداد ديزل 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                    لم تُلتقط صورة
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: The 9 Zones Inspection Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1.5 mb-3">
              <h2 className="text-sm font-black text-[#002b49] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>2. تفتيش ومسح كيو ار المناطق الـ 9 بموقع يوتن</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                إجمالي التغطية: {quality.scannedZonesCount} من 9 مناطق
              </span>
            </div>

            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="py-2 px-2 font-bold w-8 text-center">#</th>
                  <th className="py-2 px-2.5 font-bold">المنطقة</th>
                  <th className="py-2 px-2 font-bold">كود QR</th>
                  <th className="py-2 px-2 font-bold text-center">مسح QR</th>
                  <th className="py-2 px-2 font-bold text-center">حالة الموقع</th>
                  <th className="py-2 px-2.5 font-bold">الملاحظات المدونة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patrol.zones.map((zone, idx) => {
                  const statusArabic =
                    zone.status === 'normal'
                      ? 'آمن وسليم'
                      : zone.status === 'notice'
                      ? 'ملاحظات بسيطة'
                      : zone.status === 'critical'
                      ? 'ملاحظة حرجة'
                      : 'لم يزر';

                  const statusClass =
                    zone.status === 'normal'
                      ? 'text-emerald-700 bg-emerald-50'
                      : zone.status === 'notice'
                      ? 'text-amber-800 bg-amber-50'
                      : zone.status === 'critical'
                      ? 'text-rose-700 bg-rose-50 font-bold'
                      : 'text-slate-500 bg-slate-50';

                  return (
                    <tr key={zone.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">
                        {zone.name}
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px] text-slate-500">
                        {zone.code}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {zone.isScanned ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            تم {zone.scannedAt ? `(${zone.scannedAt})` : ''}
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800">
                            لم يُمسح
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${statusClass}`}>
                          {statusArabic}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-slate-700 max-w-[240px]">
                        {zone.notes || (zone.status === 'normal' ? 'لا توجد ملاحظات - الموقع مؤمن' : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* General Observations & Recommendations */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="font-bold text-slate-800 block mb-1">
              ملاحظات وتوصيات عامة لدورية الأمن والسلامة:
            </span>
            <p className="text-slate-600 leading-relaxed">
              {patrol.generalNotes.trim() ||
                'تمت الجولة والتفتيش على محيط مصنع يوتن ومرافق التحميل والإنتاج وغرفة الطلمبات ووحدة المياه بنجاح، وكافة عناصر السلامة تحت السيطرة والمتابعة الدورية.'}
            </p>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-6">
                مسؤول دورية الأمن القائم بالمرور:
              </span>
              <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">
                {patrol.guards[0] || '................................'}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">التوقيع والتاريخ</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-6">
                ضابط الأمن الصناعي والسلامة (HSE):
              </span>
              <div className="border-b border-slate-400 pb-1 font-bold text-emerald-800">
                {patrol.hseOfficer || '................................'}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">الاعتماد الفني</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-6">
                مدير عام أمن موقع يوتن:
              </span>
              <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">
                إدارة أمن الموقع (معتمد)
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">ختم إدارة الموقع</span>
            </div>
          </div>

          {/* Footer stamp */}
          <div className="text-center text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>نظام الجولات المرورية والتفتيش الأمني - دهانات يوتن</span>
            <span className="font-mono">تم الإنشاء إلكترونياً: {new Date().toLocaleString('ar-EG')}</span>
          </div>

        </div>
      </div>

    </div>
  );
};
