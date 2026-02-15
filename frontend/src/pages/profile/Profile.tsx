import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore, useAuthStore } from '../../store';
import {
  User, Heart, Shield, Bell, Globe, Palette, Download, Trash2,
  Save, Camera, Mail, Phone, MapPin, Calendar, Activity, AlertTriangle,
  Lock, Eye, EyeOff, LogOut, ChevronRight, Copy
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Profile() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useUIStore();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'emergency' | 'preferences' | 'security'>('personal');
  const [familyCode] = useState('HLX-7A9B2C');
  const [copiedCode, setCopiedCode] = useState(false);

  const personalInfo = {
    name: user?.name || 'Ahmed Ali',
    email: user?.email || 'ahmed@example.com',
    phone: '+966 50 123 4567',
    dob: '1990-05-15',
    gender: language === 'ar' ? 'ذكر' : 'Male',
    location: language === 'ar' ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia',
    height: 175,
    weight: 78,
  };

  const medicalInfo = {
    conditions: language === 'ar' ? ['ضغط دم مرتفع', 'سكري نوع 2'] : ['Hypertension', 'Type 2 Diabetes'],
    allergies: language === 'ar' ? ['بنسلين'] : ['Penicillin'],
    bloodType: 'O+',
    medications: language === 'ar' ? ['ليزينوبريل 10mg', 'ميتفورمين 500mg', 'أسبرين 81mg'] : ['Lisinopril 10mg', 'Metformin 500mg', 'Aspirin 81mg'],
  };

  const emergencyContact = {
    name: language === 'ar' ? 'محمد علي' : 'Mohamed Ali',
    phone: '+966 50 987 6543',
    relation: language === 'ar' ? 'أخ' : 'Brother',
  };

  const tabs = [
    { id: 'personal' as const, label: language === 'ar' ? 'شخصي' : 'Personal', icon: User },
    { id: 'medical' as const, label: language === 'ar' ? 'طبي' : 'Medical', icon: Heart },
    { id: 'emergency' as const, label: language === 'ar' ? 'طوارئ' : 'Emergency', icon: AlertTriangle },
    { id: 'preferences' as const, label: language === 'ar' ? 'التفضيلات' : 'Preferences', icon: Palette },
    { id: 'security' as const, label: language === 'ar' ? 'الأمان' : 'Security', icon: Lock },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCopiedCode(true);
    toast.success(language === 'ar' ? 'تم نسخ الرمز!' : 'Code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <motion.div className="page-container" initial="initial" animate="animate">
      <motion.div {...fadeInUp}>
        <h1 className="section-title flex items-center gap-2">
          <User className="text-healix-400" size={28} />
          {t('profile.title')}
        </h1>
        <p className="section-subtitle">{t('profile.subtitle')}</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div {...fadeInUp} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center text-3xl font-black text-white">
              {personalInfo.name.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-dark-600 border border-white/10 flex items-center justify-center hover:bg-dark-500 transition-colors">
              <Camera size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="text-center sm:text-left [dir=rtl]:sm:text-right">
            <h2 className="text-xl font-bold text-white">{personalInfo.name}</h2>
            <p className="text-sm text-gray-400">{personalInfo.email}</p>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
              <span className="badge-success">{language === 'ar' ? 'حساب نشط' : 'Active Account'}</span>
              <span className="text-xs text-gray-500">{language === 'ar' ? 'عضو منذ 2024' : 'Member since 2024'}</span>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button className="btn-primary text-sm flex items-center gap-2">
              <Save size={14} /> {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>

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

      {/* Personal Info */}
      {activeTab === 'personal' && (
        <motion.div {...fadeInUp} className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white mb-4">{language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input type="text" defaultValue={personalInfo.name} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" defaultValue={personalInfo.email} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الهاتف' : 'Phone'}</label>
              <input type="tel" defaultValue={personalInfo.phone} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
              <input type="date" defaultValue={personalInfo.dob} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الجنس' : 'Gender'}</label>
              <select className="input-field" defaultValue={personalInfo.gender}>
                <option>{language === 'ar' ? 'ذكر' : 'Male'}</option>
                <option>{language === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الموقع' : 'Location'}</label>
              <input type="text" defaultValue={personalInfo.location} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الطول (سم)' : 'Height (cm)'}</label>
              <input type="number" defaultValue={personalInfo.height} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
              <input type="number" defaultValue={personalInfo.weight} className="input-field" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Medical Info */}
      {activeTab === 'medical' && (
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">{language === 'ar' ? 'الحالات الطبية' : 'Medical Conditions'}</h3>
            <div className="flex flex-wrap gap-2">
              {medicalInfo.conditions.map((c, i) => (
                <span key={i} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">{c}</span>
              ))}
              <button className="px-3 py-1.5 border border-dashed border-gray-600/50 rounded-xl text-sm text-gray-400 hover:text-white hover:border-healix-500/30 transition-colors">+ {language === 'ar' ? 'إضافة' : 'Add'}</button>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">{language === 'ar' ? 'الحساسية' : 'Allergies'}</h3>
            <div className="flex flex-wrap gap-2">
              {medicalInfo.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">{a}</span>
              ))}
              <button className="px-3 py-1.5 border border-dashed border-gray-600/50 rounded-xl text-sm text-gray-400 hover:text-white hover:border-healix-500/30 transition-colors">+ {language === 'ar' ? 'إضافة' : 'Add'}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-3">{language === 'ar' ? 'فصيلة الدم' : 'Blood Type'}</h3>
              <div className="text-3xl font-black text-healix-400">{medicalInfo.bloodType}</div>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-3">{language === 'ar' ? 'الأدوية الحالية' : 'Current Medications'}</h3>
              <div className="space-y-2">
                {medicalInfo.medications.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-healix-500" /> {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Emergency Contact */}
      {activeTab === 'emergency' && (
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="glass-card p-6 border-rose-500/10">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-400" />
              {language === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                <input type="text" defaultValue={emergencyContact.name} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'الهاتف' : 'Phone'}</label>
                <input type="tel" defaultValue={emergencyContact.phone} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'العلاقة' : 'Relation'}</label>
                <input type="text" defaultValue={emergencyContact.relation} className="input-field" />
              </div>
            </div>
          </div>
          <div className="glass-card p-6 gradient-border">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-healix-400" />
              {language === 'ar' ? 'رمز المراقبة العائلية' : 'Family Monitoring Code'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{language === 'ar' ? 'شارك هذا الرمز مع العائلة لمتابعة صحتك' : 'Share this code with family to monitor your health'}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-dark-600/60 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest text-white">
                {familyCode}
              </div>
              <button onClick={handleCopyCode} className="btn-primary !py-3">
                <Copy size={18} className={copiedCode ? 'text-emerald-400' : ''} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-healix-400" />
              {language === 'ar' ? 'اللغة' : 'Language'}
            </h3>
            <div className="flex gap-3">
              <button onClick={() => language !== 'en' && toggleLanguage()}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${language === 'en' ? 'border-healix-500/30 bg-healix-500/10 text-healix-400' : 'border-white/5 text-gray-400 hover:border-white/10'}`}>
                <span className="text-lg font-bold block">English</span>
                <span className="text-xs mt-1 block">EN</span>
              </button>
              <button onClick={() => language !== 'ar' && toggleLanguage()}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${language === 'ar' ? 'border-healix-500/30 bg-healix-500/10 text-healix-400' : 'border-white/5 text-gray-400 hover:border-white/10'}`}>
                <span className="text-lg font-bold block">العربية</span>
                <span className="text-xs mt-1 block">ع</span>
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-healix-400" />
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </h3>
            <div className="space-y-4">
              {[
                { label: language === 'ar' ? 'تذكير الأدوية' : 'Medication reminders', default: true },
                { label: language === 'ar' ? 'تنبيهات صحية' : 'Health alerts', default: true },
                { label: language === 'ar' ? 'تقارير أسبوعية' : 'Weekly reports', default: true },
                { label: language === 'ar' ? 'توصيات الذكاء الاصطناعي' : 'AI recommendations', default: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-dark-600 rounded-full peer peer-checked:bg-healix-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Download size={18} className="text-healix-400" />
              {language === 'ar' ? 'تصدير البيانات' : 'Data Export'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{language === 'ar' ? 'حمل نسخة من جميع بياناتك الصحية' : 'Download a copy of all your health data'}</p>
            <div className="flex gap-3">
              <button className="btn-primary text-sm flex items-center gap-2"><Download size={14} /> PDF</button>
              <button className="btn-secondary text-sm flex items-center gap-2"><Download size={14} /> JSON</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-healix-400" />
              {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <input type="password" className="input-field" />
              </div>
              <button className="btn-primary text-sm">{language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}</button>
            </div>
          </div>

          <div className="glass-card p-6 border-rose-500/10">
            <h3 className="font-semibold text-rose-400 mb-2 flex items-center gap-2">
              <Trash2 size={18} />
              {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}</p>
            <button className="btn-danger text-sm">{language === 'ar' ? 'حذف الحساب نهائياً' : 'Permanently Delete Account'}</button>
          </div>

          <div className="glass-card p-6">
            <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
