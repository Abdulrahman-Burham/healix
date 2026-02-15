import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Pill, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Bell,
  Calendar, TrendingUp, Users, Copy, Eye, EyeOff, ChevronDown
} from 'lucide-react';
import api from '../../services/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Medication {
  id: string;
  name: string;
  nameAr: string;
  dosage: string;
  frequency: string;
  frequencyAr: string;
  time: string;
  instructions: string;
  instructionsAr: string;
  status: 'taken' | 'missed' | 'upcoming' | 'late';
  takenAt?: string;
  color: string;
}

export default function Medications() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'family'>('today');
  const [showAddForm, setShowAddForm] = useState(false);
  const [familyCode] = useState('HLX-7A9B2C');
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const medications: Medication[] = [
    {
      id: '1', name: 'Lisinopril', nameAr: 'ليزينوبريل',
      dosage: '10mg', frequency: 'Once daily', frequencyAr: 'مرة يومياً',
      time: '08:00', instructions: 'Take with water on empty stomach',
      instructionsAr: 'يؤخذ مع الماء على معدة فارغة',
      status: 'taken', takenAt: '08:05', color: '#06b6d4'
    },
    {
      id: '2', name: 'Metformin', nameAr: 'ميتفورمين',
      dosage: '500mg', frequency: 'Twice daily', frequencyAr: 'مرتين يومياً',
      time: '08:00', instructions: 'Take with breakfast',
      instructionsAr: 'يؤخذ مع الإفطار',
      status: 'taken', takenAt: '08:12', color: '#10b981'
    },
    {
      id: '3', name: 'Aspirin', nameAr: 'أسبرين',
      dosage: '81mg', frequency: 'Once daily', frequencyAr: 'مرة يومياً',
      time: '13:00', instructions: 'Take with lunch',
      instructionsAr: 'يؤخذ مع الغداء',
      status: 'late', color: '#f59e0b'
    },
    {
      id: '4', name: 'Atorvastatin', nameAr: 'أتورفاستاتين',
      dosage: '20mg', frequency: 'Once daily (evening)', frequencyAr: 'مرة يومياً (مساءً)',
      time: '21:00', instructions: 'Take at bedtime',
      instructionsAr: 'يؤخذ وقت النوم',
      status: 'upcoming', color: '#8b5cf6'
    },
    {
      id: '5', name: 'Vitamin D3', nameAr: 'فيتامين د3',
      dosage: '5000 IU', frequency: 'Once daily', frequencyAr: 'مرة يومياً',
      time: '08:00', instructions: 'Take with fatty meal',
      instructionsAr: 'يؤخذ مع وجبة تحتوي على دهون',
      status: 'taken', takenAt: '08:20', color: '#f97316'
    },
    {
      id: '6', name: 'Omega-3', nameAr: 'أوميغا 3',
      dosage: '1000mg', frequency: 'Twice daily', frequencyAr: 'مرتين يومياً',
      time: '13:00', instructions: 'Take with meals',
      instructionsAr: 'يؤخذ مع الوجبات',
      status: 'missed', color: '#ef4444'
    },
  ];

  const taken = medications.filter(m => m.status === 'taken').length;
  const missed = medications.filter(m => m.status === 'missed').length;
  const upcoming = medications.filter(m => m.status === 'upcoming').length;
  const late = medications.filter(m => m.status === 'late').length;
  const compliance = Math.round((taken / medications.length) * 100);

  const weeklyCompliance = [
    { day: language === 'ar' ? 'سبت' : 'Sat', value: 100 },
    { day: language === 'ar' ? 'أحد' : 'Sun', value: 85 },
    { day: language === 'ar' ? 'إثنين' : 'Mon', value: 100 },
    { day: language === 'ar' ? 'ثلاثاء' : 'Tue', value: 70 },
    { day: language === 'ar' ? 'أربعاء' : 'Wed', value: 100 },
    { day: language === 'ar' ? 'خميس' : 'Thu', value: 85 },
    { day: language === 'ar' ? 'جمعة' : 'Fri', value: compliance },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'taken': return { label: language === 'ar' ? 'تم التناول' : 'Taken', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'missed': return { label: language === 'ar' ? 'فائت' : 'Missed', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
      case 'late': return { label: language === 'ar' ? 'متأخر' : 'Late', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'upcoming': return { label: language === 'ar' ? 'قادم' : 'Upcoming', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      default: return { label: '', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  const tabs = [
    { id: 'today' as const, label: language === 'ar' ? 'اليوم' : 'Today', icon: Calendar },
    { id: 'all' as const, label: language === 'ar' ? 'جميع الأدوية' : 'All Medications', icon: Pill },
    { id: 'family' as const, label: language === 'ar' ? 'مراقبة العائلة' : 'Family Monitoring', icon: Users },
  ];

  return (
    <motion.div className="page-container" initial="initial" animate="animate">
      <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Pill className="text-healix-400" size={28} />
            {t('medications.title')}
          </h1>
          <p className="section-subtitle">{t('medications.subtitle')}</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          {t('medications.addMedication')}
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: language === 'ar' ? 'تم التناول' : 'Taken', value: taken, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
          { label: language === 'ar' ? 'فائت' : 'Missed', value: missed, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: XCircle },
          { label: language === 'ar' ? 'متأخر' : 'Late', value: late, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
          { label: language === 'ar' ? 'قادم' : 'Upcoming', value: upcoming, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
        ].map((stat, i) => (
          <motion.div key={i} {...fadeInUp} className="glass-card p-5 text-center">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Compliance Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeInUp} className="glass-card p-6 flex flex-col items-center">
          <p className="text-sm text-gray-400 mb-4">{t('medications.compliance')}</p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={compliance >= 80 ? '#10b981' : compliance >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${compliance * 2.64} ${264 - compliance * 2.64}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{compliance}%</span>
              <span className="text-[10px] text-gray-400">{language === 'ar' ? 'الالتزام' : 'Compliance'}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">{taken}/{medications.length} {language === 'ar' ? 'تم اليوم' : 'taken today'}</div>
        </motion.div>

        <motion.div {...fadeInUp} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">{language === 'ar' ? 'الالتزام الأسبوعي' : 'Weekly Compliance'}</h3>
          <div className="flex items-end gap-2 h-40">
            {weeklyCompliance.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-xs font-bold ${d.value >= 80 ? 'text-emerald-400' : d.value >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {d.value}%
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.value}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`w-full rounded-t-lg ${
                    d.value >= 80 ? 'bg-gradient-to-t from-emerald-500/30 to-emerald-500/60' :
                    d.value >= 50 ? 'bg-gradient-to-t from-amber-500/30 to-amber-500/60' :
                    'bg-gradient-to-t from-rose-500/30 to-rose-500/60'
                  }`}
                />
                <span className="text-[10px] text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setActiveTab(tb.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tb.id ? 'bg-healix-500/20 text-healix-400 border border-healix-500/30' : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
            }`}>
            <tb.icon size={16} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 gradient-border">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-healix-400" />
              {t('medications.addMedication')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder={language === 'ar' ? 'اسم الدواء' : 'Medication name'} className="input-field" />
              <input type="text" placeholder={language === 'ar' ? 'الجرعة' : 'Dosage (e.g., 10mg)'} className="input-field" />
              <select className="input-field">
                <option>{language === 'ar' ? 'مرة يومياً' : 'Once daily'}</option>
                <option>{language === 'ar' ? 'مرتين يومياً' : 'Twice daily'}</option>
                <option>{language === 'ar' ? 'ثلاث مرات يومياً' : 'Three times daily'}</option>
                <option>{language === 'ar' ? 'عند الحاجة' : 'As needed'}</option>
              </select>
              <input type="time" className="input-field" />
              <input type="text" placeholder={language === 'ar' ? 'تعليمات خاصة' : 'Special instructions'} className="input-field md:col-span-2" />
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medication List - Today */}
      {activeTab === 'today' && (
        <div className="space-y-3">
          {medications.map((med, i) => {
            const cfg = getStatusConfig(med.status);
            return (
              <motion.div key={med.id} {...fadeInUp} transition={{ delay: i * 0.05 }}
                className={`glass-card p-5 border ${
                  med.status === 'late' ? 'border-amber-500/20 animate-pulse' : 'border-white/5'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: med.color + '20' }}>
                      <Pill size={22} style={{ color: med.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {language === 'ar' ? med.nameAr : med.name}
                        <span className="text-sm text-gray-400 font-normal ml-2">{med.dosage}</span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? med.frequencyAr : med.frequency}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{language === 'ar' ? med.instructionsAr : med.instructions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-300">{med.time}</span>
                      </div>
                      {med.takenAt && (
                        <span className="text-[10px] text-emerald-400">{language === 'ar' ? 'تم في ' : 'Taken at '}{med.takenAt}</span>
                      )}
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${cfg.bg}`}>
                      <cfg.icon size={14} className={cfg.color} />
                      <span className={cfg.color}>{cfg.label}</span>
                    </div>
                    {(med.status === 'upcoming' || med.status === 'late') && (
                      <button className="btn-primary text-xs !py-1.5 !px-3">
                        {language === 'ar' ? 'تم التناول' : 'Mark Taken'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All Medications Tab */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med, i) => (
            <motion.div key={med.id} {...fadeInUp} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: med.color + '20' }}>
                  <Pill size={18} style={{ color: med.color }} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{language === 'ar' ? med.nameAr : med.name}</h4>
                  <span className="text-xs text-gray-400">{med.dosage}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between"><span>{language === 'ar' ? 'التكرار' : 'Frequency'}</span><span className="text-gray-300">{language === 'ar' ? med.frequencyAr : med.frequency}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'الوقت' : 'Time'}</span><span className="text-gray-300">{med.time}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'التعليمات' : 'Instructions'}</span><span className="text-gray-300 text-right max-w-[60%]">{language === 'ar' ? med.instructionsAr : med.instructions}</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 text-xs text-healix-400 py-2 rounded-lg border border-healix-500/20 hover:bg-healix-500/10 transition-colors">{language === 'ar' ? 'تعديل' : 'Edit'}</button>
                <button className="flex-1 text-xs text-rose-400 py-2 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors">{language === 'ar' ? 'حذف' : 'Delete'}</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Family Monitoring Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <motion.div {...fadeInUp} className="glass-card p-6 gradient-border">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-healix-400" />
              <h3 className="text-white font-semibold">{t('medications.familyCode')}</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {language === 'ar' ? 'شارك هذا الرمز مع أفراد عائلتك لمتابعة التزامك بالأدوية' : 'Share this code with family members to monitor your medication compliance'}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-dark-600/60 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest">
                {showCode ? familyCode : '•••••••••'}
              </div>
              <button onClick={() => setShowCode(!showCode)} className="p-3 rounded-xl bg-dark-600/60 hover:bg-dark-600 transition-colors">
                {showCode ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
              <button onClick={handleCopyCode} className="p-3 rounded-xl bg-healix-500/20 hover:bg-healix-500/30 transition-colors">
                <Copy size={18} className={copiedCode ? 'text-emerald-400' : 'text-healix-400'} />
              </button>
            </div>
            {copiedCode && <span className="text-xs text-emerald-400 mt-2 block">{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>}
          </motion.div>

          <motion.div {...fadeInUp} className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">{language === 'ar' ? 'ربط حساب عائلي' : 'Link Family Account'}</h3>
            <div className="flex gap-3">
              <input type="text" placeholder={language === 'ar' ? 'أدخل رمز العائلة' : 'Enter family code'} className="input-field flex-1" />
              <button className="btn-primary">{language === 'ar' ? 'ربط' : 'Link'}</button>
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="glass-card p-6 bg-dark-700/30 border-dashed border-gray-600/50 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{language === 'ar' ? 'لم يتم ربط حسابات عائلية بعد' : 'No family accounts linked yet'}</p>
            <p className="text-gray-500 text-xs mt-1">{language === 'ar' ? 'شارك الرمز أعلاه لبدء المتابعة' : 'Share your code above to start monitoring'}</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
