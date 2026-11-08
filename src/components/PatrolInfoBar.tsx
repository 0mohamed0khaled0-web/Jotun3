import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Shield, HardHat, ChevronDown, Check, UserPlus } from 'lucide-react';
import { ShiftType, SecurityGuard, HseOfficer } from '../types';

interface PatrolInfoBarProps {
  date: string;
  setDate: (date: string) => void;
  shift: ShiftType;
  setShift: (shift: ShiftType) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  selectedGuards: string[];
  setSelectedGuards: (guards: string[]) => void;
  selectedHse: string;
  setSelectedHse: (hse: string) => void;
  allGuards: SecurityGuard[];
  allHse: HseOfficer[];
  onOpenPersonnelManager: () => void;
}

export const PatrolInfoBar: React.FC<PatrolInfoBarProps> = ({
  date,
  setDate,
  shift,
  setShift,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  selectedGuards,
  setSelectedGuards,
  selectedHse,
  setSelectedHse,
  allGuards,
  allHse,
  onOpenPersonnelManager,
}) => {
  const [showGuardsMenu, setShowGuardsMenu] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Set current time helper
  const setCurrentTime = (target: 'start' | 'end') => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    if (target === 'start') setStartTime(timeStr);
    else setEndTime(timeStr);
  };

  // Toggle guard selection
  const toggleGuard = (guardName: string) => {
    if (selectedGuards.includes(guardName)) {
      if (selectedGuards.length > 1) {
        setSelectedGuards(selectedGuards.filter((g) => g !== guardName));
      }
    } else {
      setSelectedGuards([...selectedGuards, guardName]);
    }
  };

  const shiftLabels: Record<ShiftType, { title: string; hours: string }> = {
    morning: { title: 'الوردية الأولى (صباحية)', hours: '07:00 ص - 03:00 م' },
    evening: { title: 'الوردية الثانية (مسائية)', hours: '03:00 م - 11:00 م' },
    night: { title: 'الوردية الثالثة (ليلية)', hours: '11:00 م - 07:00 ص' },
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Date & Shift */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>تاريخ ووردية الجولة</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
            />
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="morning">وردية أولى (صباحي)</option>
              <option value="evening">وردية ثانية (مسائي)</option>
              <option value="night">وردية ثالثة (ليلي)</option>
            </select>
          </div>
          <div className="text-[11px] text-slate-400">
            {shiftLabels[shift].hours}
          </div>
        </div>

        {/* 2. Start & End Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>توقيت بدء وانتهاء الجولة</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setCurrentTime('start')}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-400 px-1 py-0.5 rounded"
                title="تعيين الوقت الحالي لبدء الجولة"
              >
                الآن
              </button>
            </div>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="--:--"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setCurrentTime('end')}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-1 py-0.5 rounded"
                title="تعيين الوقت الحالي لانتهاء الجولة"
              >
                الآن
              </button>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>بدء: <span className="font-mono text-slate-200">{startTime || 'غير محدد'}</span></span>
            <span>انتهاء: <span className="font-mono text-slate-200">{endTime || 'جارية...'}</span></span>
          </div>
        </div>

        {/* 3. Security Guards Selection */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>أفراد الأمن القائمين بالجولة</span>
            </label>
            <button
              onClick={onOpenPersonnelManager}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              <span>إدارة الأسماء</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowGuardsMenu(!showGuardsMenu)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-right text-slate-100 flex items-center justify-between focus:outline-none focus:border-amber-400"
          >
            <span className="truncate">
              {selectedGuards.length > 0
                ? selectedGuards.join('، ')
                : 'اختر فرد أو أفراد الأمن'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          </button>

          {/* Guards Dropdown Modal */}
          {showGuardsMenu && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto p-2">
              <div className="text-[11px] text-slate-400 px-2 py-1 border-b border-slate-800 mb-1 flex justify-between items-center">
                <span>اختر أفراد الأمن المناوبين:</span>
                <span className="text-amber-400">{selectedGuards.length} محدد</span>
              </div>
              <div className="space-y-1">
                {allGuards
                  .filter((g) => g.isActive)
                  .map((guard) => {
                    const isSelected = selectedGuards.includes(guard.name);
                    return (
                      <button
                        key={guard.id}
                        type="button"
                        onClick={() => toggleGuard(guard.name)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-right transition-colors ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 font-semibold'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span>{guard.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
              </div>
              <button
                type="button"
                onClick={() => setShowGuardsMenu(false)}
                className="w-full mt-2 py-1 text-center bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded font-medium"
              >
                تم الاختيار
              </button>
            </div>
          )}
          <div className="text-[11px] text-slate-400 truncate">
            {selectedGuards.length} فرد أمن مشارك في المرور
          </div>
        </div>

        {/* 4. Industrial Safety (الأمن الصناعي - HSE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأمن الصناعي والسلامة (HSE)</span>
            </label>
            <button
              onClick={onOpenPersonnelManager}
              className="text-[11px] text-emerald-400 hover:text-emerald-300"
            >
              <span>تعديل</span>
            </button>
          </div>

          <select
            value={selectedHse}
            onChange={(e) => setSelectedHse(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
          >
            <option value="">-- حدد ضابط السلامة والصحة المهنية --</option>
            {allHse
              .filter((h) => h.isActive)
              .map((officer) => (
                <option key={officer.id} value={officer.name}>
                  {officer.name} (سلامة وصحة مهنية)
                </option>
              ))}
          </select>

          <div className="text-[11px] text-slate-400">
            المشرف: <span className="text-emerald-400 font-medium">{selectedHse || 'لم يُحدد بعد'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
