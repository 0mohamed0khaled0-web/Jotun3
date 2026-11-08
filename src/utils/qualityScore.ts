import { PatrolRecord } from '../types';

export interface QualityAnalysis {
  score: number;
  grade: string;
  gradeColor: string;
  badgeBg: string;
  scannedZonesCount: number;
  totalZones: number;
  scannedRatio: number;
  metersCompletedCount: number;
  metersWithPhotoCount: number;
  totalMeters: number;
  notesCount: number;
  pendingActions: string[];
}

export function calculatePatrolQuality(patrol: PatrolRecord): QualityAnalysis {
  const totalZones = patrol.zones.length || 9;
  const scannedZones = patrol.zones.filter((z) => z.isScanned);
  const scannedZonesCount = scannedZones.length;

  // 1. Zones scanning weight (45 points max)
  const zoneScanScore = (scannedZonesCount / totalZones) * 45;

  // 2. Zone inspection checklists & status evaluated (20 points max)
  let totalChecklistItems = 0;
  let checkedItems = 0;
  let evaluatedZones = 0;

  patrol.zones.forEach((z) => {
    if (z.status !== 'unvisited') {
      evaluatedZones++;
    }
    z.checklist.forEach((item) => {
      totalChecklistItems++;
      if (item.checked) checkedItems++;
    });
  });

  const checklistScore = totalChecklistItems > 0 ? (checkedItems / totalChecklistItems) * 12 : 0;
  const evaluationScore = totalZones > 0 ? (evaluatedZones / totalZones) * 8 : 0;
  const zoneHealthScore = checklistScore + evaluationScore;

  // 3. Meters documentation & photography weight (35 points max)
  const metersList = [patrol.meters.jockey, patrol.meters.diesel1, patrol.meters.diesel2];
  let metersCompleted = 0;
  let metersWithPhoto = 0;

  metersList.forEach((m) => {
    const hasValues = Boolean(m.pressureBar && m.hoursOrPsi);
    const hasPhoto = Boolean(m.photoUrl);
    if (hasValues) metersCompleted++;
    if (hasPhoto) metersWithPhoto++;
  });

  // 15 pts for values + 20 pts for mandatory meter camera photos
  const meterValuesScore = (metersCompleted / 3) * 15;
  const meterPhotosScore = (metersWithPhoto / 3) * 20;
  const metersScore = meterValuesScore + meterPhotosScore;

  // Raw score
  const rawScore = Math.round(zoneScanScore + zoneHealthScore + metersScore);
  const score = Math.min(100, Math.max(0, rawScore));

  // Count notes
  const notesCount =
    patrol.zones.filter((z) => z.notes.trim().length > 0).length +
    (patrol.generalNotes.trim() ? 1 : 0);

  // Recommendations / Pending Actions
  const pendingActions: string[] = [];
  const unscannedZones = patrol.zones.filter((z) => !z.isScanned);
  if (unscannedZones.length > 0) {
    pendingActions.push(`متبقي مسح كيو ار لـ ${unscannedZones.length} مناطق (${unscannedZones.map((z) => z.name).slice(0, 3).join('، ')}${unscannedZones.length > 3 ? '...' : ''})`);
  }

  if (!patrol.meters.jockey.photoUrl) {
    pendingActions.push('التقاط صورة عداد مضخة الجوكي');
  }
  if (!patrol.meters.diesel1.photoUrl) {
    pendingActions.push('التقاط صورة عداد مضخة ديزل 1');
  }
  if (!patrol.meters.diesel2.photoUrl) {
    pendingActions.push('التقاط صورة عداد مضخة ديزل 2');
  }
  if (patrol.guards.length === 0) {
    pendingActions.push('تحديد فرد الأمن القائم بالجولة');
  }
  if (!patrol.hseOfficer) {
    pendingActions.push('تحديد مسؤول الأمن الصناعي (HSE)');
  }

  // Grade determination
  let grade = 'غير مكتمل';
  let gradeColor = 'text-rose-400';
  let badgeBg = 'bg-rose-500/15 border-rose-500/30';

  if (score >= 95) {
    grade = 'جولة نموذجية ممتازة (100%)';
    gradeColor = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/15 border-emerald-500/30';
  } else if (score >= 80) {
    grade = 'جولة منضبطة جيدة جداً';
    gradeColor = 'text-teal-400';
    badgeBg = 'bg-teal-500/15 border-teal-500/30';
  } else if (score >= 65) {
    grade = 'جولة مقبولة (تتطلب استكمال)';
    gradeColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/30';
  } else if (score >= 40) {
    grade = 'جولة متوسطة (نواقص هامة)';
    gradeColor = 'text-orange-400';
    badgeBg = 'bg-orange-500/15 border-orange-500/30';
  } else {
    grade = 'جولة غير مكتملة';
    gradeColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/15 border-rose-500/30';
  }

  return {
    score,
    grade,
    gradeColor,
    badgeBg,
    scannedZonesCount,
    totalZones,
    scannedRatio: scannedZonesCount / totalZones,
    metersCompletedCount: metersCompleted,
    metersWithPhotoCount: metersWithPhoto,
    totalMeters: 3,
    notesCount,
    pendingActions,
  };
}
