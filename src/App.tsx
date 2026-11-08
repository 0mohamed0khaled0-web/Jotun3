import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { PatrolInfoBar } from './components/PatrolInfoBar';
import { QualityScoreWidget } from './components/QualityScoreWidget';
import { ZoneCard } from './components/ZoneCard';
import { MeterSection } from './components/MeterSection';
import { PatrolReportExport } from './components/PatrolReportExport';
import { QRScannerModal } from './components/QRScannerModal';
import { PersonnelManagerModal } from './components/PersonnelManagerModal';
import { QRPrintModal } from './components/QRPrintModal';
import { PatrolHistoryModal } from './components/PatrolHistoryModal';
import {
  SecurityGuard,
  HseOfficer,
  PatrolRecord,
  ZoneInspection,
  MeterReading,
  ShiftType,
} from './types';
import {
  getStoredGuards,
  saveStoredGuards,
  getStoredHseOfficers,
  saveStoredHseOfficers,
  getActivePatrol,
  saveActivePatrol,
  createNewPatrol,
  getPatrolHistory,
  savePatrolToHistory,
} from './utils/storage';
import { calculatePatrolQuality } from './utils/qualityScore';
import {
  QrCode,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Clock,
} from 'lucide-react';

export default function App() {
  // State
  const [guards, setGuards] = useState<SecurityGuard[]>(getStoredGuards);
  const [hseOfficers, setHseOfficers] = useState<HseOfficer[]>(getStoredHseOfficers);
  const [patrol, setPatrol] = useState<PatrolRecord>(getActivePatrol);
  const [history, setHistory] = useState<PatrolRecord[]>(getPatrolHistory);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'patrol' | 'meters' | 'zones' | 'report'>('patrol');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetZoneId, setScannerTargetZoneId] = useState<string | null>(null);
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(false);
  const [isQrPrintOpen, setIsQrPrintOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persist active patrol
  useEffect(() => {
    saveActivePatrol(patrol);
  }, [patrol]);

  // Persist personnel
  const handleUpdateGuards = (updated: SecurityGuard[]) => {
    setGuards(updated);
    saveStoredGuards(updated);
  };

  const handleUpdateHse = (updated: HseOfficer[]) => {
    setHseOfficers(updated);
    saveStoredHseOfficers(updated);
  };

  // Quality calculation
  const quality = calculatePatrolQuality(patrol);

  // Unscanned zones count
  const unscannedCount = patrol.zones.filter((z) => !z.isScanned).length;

  // Handlers for Patrol Updates
  const handleDateChange = (date: string) => {
    setPatrol((prev) => ({ ...prev, date }));
  };

  const handleShiftChange = (shift: ShiftType) => {
    setPatrol((prev) => ({ ...prev, shift }));
  };

  const handleStartTimeChange = (startTime: string) => {
    setPatrol((prev) => ({ ...prev, startTime }));
  };

  const handleEndTimeChange = (endTime: string) => {
    setPatrol((prev) => ({ ...prev, endTime }));
  };

  const handleGuardsChange = (selectedGuards: string[]) => {
    setPatrol((prev) => ({ ...prev, guards: selectedGuards }));
  };

  const handleHseChange = (hseOfficer: string) => {
    setPatrol((prev) => ({ ...prev, hseOfficer }));
  };

  // Zone Scanned callback
  const handleZoneScanned = (zoneId: string, quickNotes?: string) => {
    const nowTime = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setPatrol((prev) => {
      const updatedZones = prev.zones.map((zone) => {
        if (zone.id === zoneId) {
          const notes = quickNotes
            ? zone.notes
              ? `${zone.notes} - ${quickNotes}`
              : quickNotes
            : zone.notes;

          return {
            ...zone,
            isScanned: true,
            scannedAt: nowTime,
            status: zone.status === 'unvisited' ? ('normal' as const) : zone.status,
            notes,
          };
        }
        return zone;
      });

      return {
        ...prev,
        zones: updatedZones,
      };
    });
  };

  // Update specific zone
  const handleUpdateZone = (updatedZone: ZoneInspection) => {
    setPatrol((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)),
    }));
  };

  // Update specific meter
  const handleUpdateMeter = (
    id: 'jockey' | 'diesel1' | 'diesel2',
    updatedMeter: MeterReading
  ) => {
    setPatrol((prev) => ({
      ...prev,
      meters: {
        ...prev.meters,
        [id]: updatedMeter,
      },
    }));
  };

  // Open scanner for specific zone
  const openScannerForZone = (zoneId: string) => {
    setScannerTargetZoneId(zoneId);
    setIsScannerOpen(true);
  };

  // Save current patrol to history
  const handleSaveToHistory = () => {
    const scoredPatrol: PatrolRecord = {
      ...patrol,
      qualityScore: quality.score,
      completedAt: new Date().toISOString(),
      isCompleted: true,
    };
    savePatrolToHistory(scoredPatrol);
    setHistory(getPatrolHistory());
  };

  // Start a fresh new patrol
  const handleStartNewPatrol = () => {
    if (
      confirm(
        'هل تريد بدء جولة مرورية جديدة؟ سيتم أرشفة الجولة الحالية وتصفير بيانات الفحص.'
      )
    ) {
      handleSaveToHistory();
      const newP = createNewPatrol(
        patrol.guards.length > 0 ? patrol.guards : [guards[0]?.name || ''],
        patrol.hseOfficer || hseOfficers[0]?.name || '',
        patrol.shift
      );
      setPatrol(newP);
      setActiveTab('patrol');
    }
  };

  // Quick Demo Auto-fill (Great for testing the app with 100% complete data instantly)
  const handleSimulateFullPatrol = () => {
    const nowTime = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setPatrol((prev) => {
      const fullyScannedZones = prev.zones.map((z, idx) => ({
        ...z,
        isScanned: true,
        scannedAt: `${(7 + Math.floor(idx / 2)).toString().padStart(2, '0')}:${((idx * 6) % 60).toString().padStart(2, '0')}`,
        status: (idx === 2 ? 'notice' : 'normal') as 'notice' | 'normal',
        notes:
          idx === 2
            ? 'تراكم بسيط لمنصات خشبية بجوار رصيف التحميل وتم إخطار المشرف'
            : 'الموقع آمن ومطابق لاشتراطات السلامة بالكامل',
        checklist: z.checklist.map((c) => ({ ...c, checked: true })),
      }));

      // Generate SVG placeholder mock photos if empty
      const makeMockPhoto = (title: string, color: string) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
          <rect width="400" height="240" fill="${color}"/>
          <circle cx="200" cy="120" r="70" fill="#ffffff" opacity="0.1"/>
          <text x="200" y="110" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">توثيق عداد ${title}</text>
          <text x="200" y="140" font-family="sans-serif" font-size="14" fill="#f59e0b" text-anchor="middle">موقع دهانات يوتن - غرفة الطلمبات</text>
          <text x="200" y="170" font-family="monospace" font-size="12" fill="#cbd5e1" text-anchor="middle">${nowTime}</text>
        </svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      };

      return {
        ...prev,
        startTime: '07:00',
        endTime: nowTime,
        zones: fullyScannedZones,
        meters: {
          jockey: {
            ...prev.meters.jockey,
            pressureBar: '10.5',
            hoursOrPsi: '150 PSI',
            photoUrl: prev.meters.jockey.photoUrl || makeMockPhoto('الجوكي', '#0284c7'),
            timestamp: nowTime,
          },
          diesel1: {
            ...prev.meters.diesel1,
            pressureBar: '11.0',
            hoursOrPsi: '342 ساعة',
            fuelLevel: '95%',
            photoUrl: prev.meters.diesel1.photoUrl || makeMockPhoto('الديزل 1', '#d97706'),
            timestamp: nowTime,
          },
          diesel2: {
            ...prev.meters.diesel2,
            pressureBar: '11.0',
            hoursOrPsi: '286 ساعة',
            fuelLevel: '90%',
            photoUrl: prev.meters.diesel2.photoUrl || makeMockPhoto('الديزل 2', '#ea580c'),
            timestamp: nowTime,
          },
        },
        generalNotes:
          'تمت جولة التفتيش الأمني الشاملة على موقع يوتن، ومراجعة ضغوط شبكة الحريق وتوثيق العدادات الثلاثة، ولم تُسجل أي خروقات أمنية.',
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => {
          setScannerTargetZoneId(null);
          setIsScannerOpen(true);
        }}
        onOpenQrPrint={() => setIsQrPrintOpen(true)}
        onOpenPersonnel={() => setIsPersonnelOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        qualityScore={quality.score}
        unscannedCount={unscannedCount}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Patrol Context & Timing Bar */}
        <PatrolInfoBar
          date={patrol.date}
          setDate={handleDateChange}
          shift={patrol.shift}
          setShift={handleShiftChange}
          startTime={patrol.startTime}
          setStartTime={handleStartTimeChange}
          endTime={patrol.endTime}
          setEndTime={handleEndTimeChange}
          selectedGuards={patrol.guards}
          setSelectedGuards={handleGuardsChange}
          selectedHse={patrol.hseOfficer}
          setSelectedHse={handleHseChange}
          allGuards={guards}
          allHse={hseOfficers}
          onOpenPersonnelManager={() => setIsPersonnelOpen(true)}
        />

        {/* Quality Score Indicator */}
        <QualityScoreWidget
          analysis={quality}
          onNavigateToMeters={() => setActiveTab('meters')}
          onNavigateToZones={() => setActiveTab('zones')}
        />

        {/* Tab 1: Current Patrol Overview Dashboard */}
        {activeTab === 'patrol' && (
          <div className="space-y-6">
            
            {/* Quick Action Cards Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Scan Next Zone Card */}
              <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">مسح كيو ار المناطق</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {unscannedCount > 0
                      ? `متبقي ${unscannedCount} مناطق لم تُمسح بعد بموقع يوتن.`
                      : '✓ تم مسح جميع المناطق الـ 9 بنجاح!'}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTargetZoneId(null);
                      setIsScannerOpen(true);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>فتح ماسح الكاميرا الآن</span>
                  </button>
                </div>
              </div>

              {/* Pump Meters Documentation Card */}
              <div className="bg-gradient-to-br from-blue-500/15 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">توثيق وتصوير العدادات (3)</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    عداد الجوكي + عدادين الديزل لمضخات مكافحة الحريق بغرفة الطلمبات.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('meters')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Gauge className="w-4 h-4" />
                    <span>تسجيل وتصوير العدادات</span>
                  </button>
                </div>
              </div>

              {/* Export Full Image Report Card */}
              <div className="bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">تصدير صورة تفاصيل الجولة</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    توليد صورة رسمية عالية الدقة جاهزة للإرسال لإدارة المصنع وواتساب.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>معاينة وتصدير التقرير</span>
                  </button>
                </div>
              </div>

            </div>

            {/* General Notes for Patrol */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-sm">
              <label className="text-sm font-bold text-white block mb-2 flex items-center justify-between">
                <span>الملاحظات العامة لضابط الأمن والسلامة على الجولة:</span>
                <span className="text-xs text-slate-400 font-normal">
                  تظهر في التقرير المصدر
                </span>
              </label>
              <textarea
                rows={2}
                value={patrol.generalNotes}
                onChange={(e) =>
                  setPatrol((prev) => ({ ...prev, generalNotes: e.target.value }))
                }
                placeholder="اكتب التقييم العام لحالة المصنع، تواجد فرق العمل، حالة الطقس أو أي توصيات أمنية..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Preview of the 9 Zones in compact cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    حالة مناطق موقع يوتن الـ 9
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('zones')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  عرض كافة القوائم والتفاصيل ←
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patrol.zones.map((zone, idx) => (
                  <div
                    key={zone.id}
                    onClick={() => openScannerForZone(zone.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      zone.isScanned
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{zone.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {zone.code}
                          </span>
                        </div>
                      </div>
                      {zone.isScanned ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                          تم المسح {zone.scannedAt || ''}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                          بانتظار المسح
                        </span>
                      )}
                    </div>
                    {zone.notes && (
                      <p className="text-[11px] text-slate-300 mt-2 truncate bg-slate-900/60 p-1.5 rounded">
                        ملاحظة: {zone.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Footer Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateFullPatrol}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="تعبئة بيانات نموذجية مكتملة لكافة العدادات والمناطق لسرعة التجربة والمعاينة"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تعبئة تجريبية نموذجية (100%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrPrintOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة بطاقات كيو ار</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartNewPatrol}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بدء جولة جديدة وأرشفة الحالية</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: The 9 Zones Inspection List */}
        {activeTab === 'zones' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>مناطق التفتيش الميداني الـ 9 بموقع يوتن</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  قم بمسح رمز QR عند كل منطقة وتدوين حالة الأمان وفحص بنود السلامة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannerTargetZoneId(null);
                    setIsScannerOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>مسح كيو ار بالكاميرا</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {patrol.zones.map((zone, index) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onUpdateZone={handleUpdateZone}
                  onOpenScannerForZone={openScannerForZone}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: The 3 Fire Pump Meters */}
        {activeTab === 'meters' && (
          <MeterSection
            meters={patrol.meters}
            onUpdateMeter={handleUpdateMeter}
          />
        )}

        {/* Tab 4: Official Report Card & PNG Image Exporter */}
        {activeTab === 'report' && (
          <PatrolReportExport
            patrol={patrol}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>نظام إدارة الجولات المرورية والتفتيش الأمني - موقع يوتن (Jotun)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Security & HSE Inspection Management System
          </span>
        </div>
      </footer>

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        zones={patrol.zones}
        onZoneScanned={handleZoneScanned}
        targetZoneId={scannerTargetZoneId}
      />

      <PersonnelManagerModal
        isOpen={isPersonnelOpen}
        onClose={() => setIsPersonnelOpen(false)}
        guards={guards}
        onUpdateGuards={handleUpdateGuards}
        hseOfficers={hseOfficers}
        onUpdateHse={handleUpdateHse}
      />

      <QRPrintModal
        isOpen={isQrPrintOpen}
        onClose={() => setIsQrPrintOpen(false)}
        zones={patrol.zones}
      />

      <PatrolHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadPatrol={(p) => setPatrol(p)}
        onStartNewPatrol={handleStartNewPatrol}
      />

    </div>
  );
}
