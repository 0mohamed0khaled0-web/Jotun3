import React, { useState } from 'react';
import { X, UserPlus, Trash2, Shield, HardHat, Check, RotateCcw } from 'lucide-react';
import { SecurityGuard, HseOfficer } from '../types';
import { INITIAL_SECURITY_GUARDS, INITIAL_HSE_OFFICERS } from '../data/defaultData';

interface PersonnelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  guards: SecurityGuard[];
  onUpdateGuards: (guards: SecurityGuard[]) => void;
  hseOfficers: HseOfficer[];
  onUpdateHse: (officers: HseOfficer[]) => void;
}

export const PersonnelManagerModal: React.FC<PersonnelManagerModalProps> = ({
  isOpen,
  onClose,
  guards,
  onUpdateGuards,
  hseOfficers,
  onUpdateHse,
}) => {
  const [activeTab, setActiveTab] = useState<'guards' | 'hse'>('guards');
  const [newGuardName, setNewGuardName] = useState('');
  const [newHseName, setNewHseName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Add Guard
  const handleAddGuard = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGuardName.trim();
    if (!trimmed) return;
    if (guards.some((g) => g.name === trimmed)) {
      alert('الاسم موجود بالفعل في القائمة');
      return;
    }
    const newGuard: SecurityGuard = {
      id: `g-${Date.now()}`,
      name: trimmed,
      isActive: true,
    };
    onUpdateGuards([...guards, newGuard]);
    setNewGuardName('');
  };

  // Remove Guard
  const handleRemoveGuard = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف "${name}" من أفراد الأمن؟`)) {
      onUpdateGuards(guards.filter((g) => g.id !== id));
    }
  };

  // Add HSE
  const handleAddHse = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newHseName.trim();
    if (!trimmed) return;
    if (hseOfficers.some((h) => h.name === trimmed)) {
      alert('الاسم موجود بالفعل في قائمة الأمن الصناعي');
      return;
    }
    const newOfficer: HseOfficer = {
      id: `hse-${Date.now()}`,
      name: trimmed,
      isActive: true,
    };
    onUpdateHse([...hseOfficers, newOfficer]);
    setNewHseName('');
  };

  // Remove HSE
  const handleRemoveHse = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف "${name}" من مشرفي الأمن الصناعي؟`)) {
      onUpdateHse(hseOfficers.filter((h) => h.id !== id));
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('هل تريد استعادة القائمة الافتراضية الأصلية لأفراد الأمن والأمن الصناعي؟')) {
      onUpdateGuards(INITIAL_SECURITY_GUARDS);
      onUpdateHse(INITIAL_HSE_OFFICERS);
    }
  };

  const filteredGuards = guards.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredHse = hseOfficers.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">إدارة كادر الأمن والسلامة الصناعية</h3>
              <p className="text-xs text-slate-400">إضافة أو إزالة أفراد الأمن وضباط السلامة بموقع يوتن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-3 bg-slate-950/40 border-b border-slate-800/80 gap-2">
          <button
            onClick={() => setActiveTab('guards')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guards'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>أفراد الأمن ({guards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hse')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hse'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>الأمن الصناعي والسلامة ({hseOfficers.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Add form */}
          {activeTab === 'guards' ? (
            <form onSubmit={handleAddGuard} className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب اسم فرد أمن جديد..."
                value={newGuardName}
                onChange={(e) => setNewGuardName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة اسم</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddHse} className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب اسم مسؤول الأمن الصناعي الجديد..."
                value={newHseName}
                onChange={(e) => setNewHseName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة للأمن الصناعي</span>
              </button>
            </form>
          )}

          {/* Search box */}
          <div>
            <input
              type="text"
              placeholder="بحث في الأسماء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* List items */}
          <div className="space-y-1.5">
            {activeTab === 'guards' ? (
              filteredGuards.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">لا توجد أسماء مطابقة</div>
              ) : (
                filteredGuards.map((guard, index) => (
                  <div
                    key={guard.id}
                    className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-700/80 text-slate-300 text-xs flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-100">{guard.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGuard(guard.id, guard.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="حذف الاسم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            ) : filteredHse.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">لا توجد أسماء مطابقة</div>
            ) : (
              filteredHse.map((officer, index) => (
                <div
                  key={officer.id}
                  className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 text-xs flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-slate-100">{officer.name}</span>
                      <span className="text-[11px] text-emerald-400 block">أخصائي السلامة والصحة المهنية (HSE)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHse(officer.id, officer.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="حذف الاسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة القائمة الأصلية ليوتن</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
          >
            إغلاق وحفظ
          </button>
        </div>

      </div>
    </div>
  );
};
