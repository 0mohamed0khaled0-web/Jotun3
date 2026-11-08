import { SecurityGuard, HseOfficer, PatrolRecord } from '../types';
import { INITIAL_SECURITY_GUARDS, INITIAL_HSE_OFFICERS, INITIAL_ZONES, INITIAL_METERS } from '../data/defaultData';

const GUARDS_KEY = 'jotun_guards_v1';
const HSE_KEY = 'jotun_hse_v1';
const ACTIVE_PATROL_KEY = 'jotun_active_patrol_v1';
const HISTORY_KEY = 'jotun_patrol_history_v1';

export function getStoredGuards(): SecurityGuard[] {
  try {
    const raw = localStorage.getItem(GUARDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse guards from storage', e);
  }
  return INITIAL_SECURITY_GUARDS;
}

export function saveStoredGuards(guards: SecurityGuard[]): void {
  try {
    localStorage.setItem(GUARDS_KEY, JSON.stringify(guards));
  } catch (e) {
    console.error('Failed to save guards to storage', e);
  }
}

export function getStoredHseOfficers(): HseOfficer[] {
  try {
    const raw = localStorage.getItem(HSE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse HSE officers from storage', e);
  }
  return INITIAL_HSE_OFFICERS;
}

export function saveStoredHseOfficers(officers: HseOfficer[]): void {
  try {
    localStorage.setItem(HSE_KEY, JSON.stringify(officers));
  } catch (e) {
    console.error('Failed to save HSE officers to storage', e);
  }
}

export function createNewPatrol(
  guards: string[],
  hseOfficer: string,
  shift: 'morning' | 'evening' | 'night' = 'morning'
): PatrolRecord {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);
  const patrolId = `JOTUN-P-${Date.now().toString().slice(-6)}`;

  return {
    id: patrolId,
    patrolNumber: `JT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    date: dateStr,
    shift,
    startTime: timeStr,
    endTime: '',
    guards,
    hseOfficer,
    qualityScore: 0,
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    meters: JSON.parse(JSON.stringify(INITIAL_METERS)),
    generalNotes: '',
    isCompleted: false,
  };
}

export function getActivePatrol(): PatrolRecord {
  try {
    const raw = localStorage.getItem(ACTIVE_PATROL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Failed to load active patrol', e);
  }
  const defaultGuards = INITIAL_SECURITY_GUARDS.slice(0, 2).map((g) => g.name);
  const defaultHse = INITIAL_HSE_OFFICERS[0].name;
  const newPatrol = createNewPatrol(defaultGuards, defaultHse);
  saveActivePatrol(newPatrol);
  return newPatrol;
}

export function saveActivePatrol(patrol: PatrolRecord): void {
  try {
    localStorage.setItem(ACTIVE_PATROL_KEY, JSON.stringify(patrol));
  } catch (e) {
    console.error('Failed to save active patrol', e);
  }
}

export function getPatrolHistory(): PatrolRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse patrol history', e);
  }
  return [];
}

export function savePatrolToHistory(patrol: PatrolRecord): void {
  try {
    const history = getPatrolHistory();
    const updated = [patrol, ...history.filter((p) => p.id !== patrol.id)];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save patrol to history', e);
  }
}
