export type ShiftType = 'morning' | 'evening' | 'night';

export interface SecurityGuard {
  id: string;
  name: string;
  isActive: boolean;
}

export interface HseOfficer {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ZoneChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ZoneInspection {
  id: string;
  code: string;
  name: string;
  description: string;
  isScanned: boolean;
  scannedAt?: string;
  status: 'normal' | 'notice' | 'critical' | 'unvisited';
  notes: string;
  photoUrl?: string;
  checklist: ZoneChecklistItem[];
}

export interface MeterReading {
  id: 'jockey' | 'diesel1' | 'diesel2';
  name: string;
  subTitle: string;
  pressureBar: string;
  hoursOrPsi: string;
  fuelLevel?: string; // For diesel pumps
  status: 'operational' | 'idle' | 'maintenance';
  photoUrl?: string;
  timestamp?: string;
  notes?: string;
}

export interface PatrolRecord {
  id: string;
  patrolNumber: string;
  date: string;
  shift: ShiftType;
  startTime: string;
  endTime: string;
  guards: string[]; // names of guards
  hseOfficer: string; // name of HSE officer
  qualityScore: number;
  zones: ZoneInspection[];
  meters: {
    jockey: MeterReading;
    diesel1: MeterReading;
    diesel2: MeterReading;
  };
  generalNotes: string;
  completedAt?: string;
  isCompleted: boolean;
}
