import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore, useAuthStore } from '../../store';
import {
  Heart, Activity, Brain, Wind, Thermometer, Footprints,
  Flame, Gauge, Moon, Droplets, ShieldAlert, TrendingUp,
  Pill, Dumbbell, RefreshCw, Scan, AlertTriangle, CheckCircle,
  ChevronRight, Eye,
} from 'lucide-react';
import api from '../../services/api';

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */
interface VitalsData {
  heart_rate?: number;
  spo2?: number;
  stress_level?: number;
  steps?: number;
  calories_burned?: number;
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  hrv?: number;
  body_temp?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  timestamp?: string;
}

interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  medical_conditions?: string[];
  allergies?: string[];
  blood_type?: string;
  fitness_level?: string;
  fitness_goals?: string[];
  sleep_hours?: number;
  stress_level?: number;
  diet_type?: string;
  water_intake?: number;
}

interface MedicationData {
  name: string;
  name_ar?: string;
  dosage: string;
  time: string;
  status?: string;
  color?: string;
}

interface PredictionData {
  current_risk: number;
  predicted_risk: number;
  risk_factors: { name: string; value: number; name_ar?: string }[];
  recommendations: string[];
}

interface AlertData {
  type: string;
  message: string;
  severity: string;
  created_at: string;
}

/* ═══════════════════════════════════════════════════════════
   Data Point Component — floating label on the body
   ═══════════════════════════════════════════════════════════ */
function DataPoint({ top, left, label, value, unit, color, icon: Icon, status, delay = 0, side = 'right' }: {
  top: string; left: string; label: string; value: string | number; unit?: string;
  color: string; icon: any; status?: 'normal' | 'warning' | 'critical'; delay?: number; side?: 'left' | 'right';
}) {
  const statusColor = status === 'critical' ? '#f43f5e' : status === 'warning' ? '#fbbf24' : color;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: side === 'right' ? -20 : 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 120 }}
      className="absolute pointer-events-none z-20"
      style={{ top, left }}
    >
      <div className={`flex items-center gap-1.5 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
        {/* Pulse dot */}
        <div className="relative flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}60` }} />
          {status === 'critical' && <div className="absolute -inset-1 rounded-full animate-ping" style={{ backgroundColor: `${statusColor}30` }} />}
        </div>

        {/* Connecting line */}
        <div className="w-10 h-px flex-shrink-0" style={{ backgroundColor: `${statusColor}40` }} />

        {/* Info card */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-white/[0.06] rounded-lg px-2.5 py-1.5 min-w-[100px]"
          style={{ borderColor: `${statusColor}15` }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon size={9} style={{ color: statusColor }} />
            <span className="text-[8px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold font-mono" style={{ color: statusColor }}>{value}</span>
            {unit && <span className="text-[8px] text-slate-600">{unit}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Full Body SVG — larger version for VR page
   ═══════════════════════════════════════════════════════════ */
function FullBodySVG({ heartRate = 72, color = '#06b6d4' }: { heartRate?: number; color?: string }) {
  const cx = 200, headY = 55;
  const neckY = headY + 22, shoulderY = neckY + 10;
  const torsoBottom = shoulderY + 75, hipY = torsoBottom + 5;
  const spring = { type: 'spring' as const, stiffness: 60, damping: 12 };

  return (
    <svg viewBox="0 0 400 360" className="w-full h-full">
      <defs>
        <linearGradient id="vrBodyFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="vrOutline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.12" />
        </linearGradient>
        <filter id="vrGlow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="vrShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor */}
      <ellipse cx={cx} cy="345" rx="80" ry="10" fill="url(#vrShadow)" />

      {/* LEGS */}
      <line x1={cx - 14} y1={hipY} x2={cx - 20} y2="250" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
      <line x1={cx - 20} y1="250" x2={cx - 22} y2="320" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      <line x1={cx + 14} y1={hipY} x2={cx + 20} y2="250" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
      <line x1={cx + 20} y1="250" x2={cx + 22} y2="320" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Feet */}
      <ellipse cx={cx - 22} cy="325" rx="10" ry="4" fill="#475569" opacity="0.4" />
      <ellipse cx={cx + 22} cy="325" rx="10" ry="4" fill="#475569" opacity="0.4" />

      {/* TORSO */}
      <path d={`M${cx - 30} ${shoulderY} Q${cx - 36} ${shoulderY + 20} ${cx - 24} ${torsoBottom} L${cx + 24} ${torsoBottom} Q${cx + 36} ${shoulderY + 20} ${cx + 30} ${shoulderY} Z`}
        fill="url(#vrBodyFill)" stroke="url(#vrOutline)" strokeWidth="1" />
      {/* Center line */}
      <line x1={cx} y1={shoulderY + 5} x2={cx} y2={shoulderY + 35} stroke={color} strokeWidth="0.4" opacity="0.1" />
      {/* Chest curves */}
      <path d={`M${cx - 18} ${shoulderY + 10} Q${cx} ${shoulderY + 18} ${cx + 18} ${shoulderY + 10}`}
        fill="none" stroke={color} strokeWidth="0.4" opacity="0.08" />

      {/* SHOULDERS */}
      <ellipse cx={cx - 33} cy={shoulderY + 3} rx="12" ry="8" fill="#1e293b" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <ellipse cx={cx + 33} cy={shoulderY + 3} rx="12" ry="8" fill="#1e293b" stroke={color} strokeWidth="0.6" opacity="0.5" />

      {/* ARMS */}
      <line x1={cx - 30} y1={shoulderY + 6} x2={cx - 50} y2={shoulderY + 55} stroke="#475569" strokeWidth="10" strokeLinecap="round" />
      <line x1={cx - 50} y1={shoulderY + 55} x2={cx - 55} y2={shoulderY + 95} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <line x1={cx + 30} y1={shoulderY + 6} x2={cx + 50} y2={shoulderY + 55} stroke="#475569" strokeWidth="10" strokeLinecap="round" />
      <line x1={cx + 50} y1={shoulderY + 55} x2={cx + 55} y2={shoulderY + 95} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      {/* Hands */}
      <circle cx={cx - 55} cy={shoulderY + 97} r="5" fill={color} opacity="0.3" />
      <circle cx={cx + 55} cy={shoulderY + 97} r="5" fill={color} opacity="0.3" />

      {/* JOINTS */}
      {[
        [cx - 50, shoulderY + 55], [cx + 50, shoulderY + 55],
        [cx - 20, 250], [cx + 20, 250],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.5" fill="#0f172a" stroke={color} strokeWidth="0.7" opacity="0.5" />
          <circle cx={x} cy={y} r="2" fill={color} opacity="0.3" />
        </g>
      ))}

      {/* NECK */}
      <line x1={cx} y1={neckY - 3} x2={cx} y2={shoulderY} stroke="#475569" strokeWidth="7" strokeLinecap="round" />

      {/* HEAD */}
      <ellipse cx={cx} cy={headY} rx="18" ry="22" fill="url(#vrBodyFill)" stroke="url(#vrOutline)" strokeWidth="1" />
      <path d={`M${cx - 10} ${headY - 3} Q${cx} ${headY + 3} ${cx + 10} ${headY - 3}`}
        fill="none" stroke={color} strokeWidth="0.7" opacity="0.3" />
      <circle cx={cx - 6} cy={headY - 4} r="1.8" fill={color} opacity="0.5" />
      <circle cx={cx + 6} cy={headY - 4} r="1.8" fill={color} opacity="0.5" />

      {/* HEARTBEAT in chest */}
      <motion.circle
        cx={cx} cy={shoulderY + 25} r="5"
        fill="#f43f5e" opacity={0.25}
        animate={{ r: [5, 7, 5], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 60 / Math.max(heartRate, 40), repeat: Infinity }}
      />

      {/* Brain activity indicator */}
      <motion.ellipse
        cx={cx} cy={headY} rx="14" ry="18"
        fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.15"
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Side Panel Card
   ═══════════════════════════════════════════════════════════ */
function InfoCard({ title, icon: Icon, color, children, loading }: {
  title: string; icon: any; color: string; children: React.ReactNode; loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-semibold text-slate-300">{title}</span>
        {loading && <RefreshCw size={10} className="text-slate-600 animate-spin ml-auto" />}
      </div>
      <div className="px-4 py-3 text-xs">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main VR Page
   ═══════════════════════════════════════════════════════════ */
export default function VRDigitalTwin() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const { user } = useAuthStore();
  const isAr = language === 'ar';

  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'vitals' | 'profile' | 'meds' | 'risk'>('vitals');
  const [rotateY, setRotateY] = useState(0);

  // Fetch all data from DB
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchVitals, 30000); // refresh vitals every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchVitals(),
      fetchProfile(),
      fetchMedications(),
      fetchPrediction(),
      fetchAlerts(),
    ]);
    setLoading(false);
  };

  const fetchVitals = async () => {
    try {
      const res = await api.get('/vitals/current');
      setVitals(res.data);
    } catch (err) {
      console.warn('Failed to fetch vitals:', err);
      // Set defaults so the page isn't empty
      setVitals({
        heart_rate: 72, spo2: 98, stress_level: 3,
        steps: 6500, calories_burned: 420,
        blood_pressure_sys: 118, blood_pressure_dia: 75,
        hrv: 45, body_temp: 36.6,
        sleep_hours: 7, sleep_quality: 78,
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
      // Use auth store user as fallback
      if (user) {
        setProfile({ name: user.name } as UserProfile);
      }
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications/');
      setMedications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch medications:', err);
      setMedications([]);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await api.get('/predictions/risk');
      setPrediction(res.data);
    } catch (err) {
      console.warn('Failed to fetch prediction:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/vitals/alerts');
      setAlerts(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      console.warn('Failed to fetch alerts:', err);
    }
  };

  // Determine status for each vital
  const getHeartStatus = (hr?: number): 'normal' | 'warning' | 'critical' => {
    if (!hr) return 'normal';
    if (hr > 120 || hr < 50) return 'critical';
    if (hr > 100 || hr < 55) return 'warning';
    return 'normal';
  };
  const getO2Status = (o2?: number): 'normal' | 'warning' | 'critical' => {
    if (!o2) return 'normal';
    if (o2 < 92) return 'critical';
    if (o2 < 95) return 'warning';
    return 'normal';
  };
  const getBPStatus = (sys?: number): 'normal' | 'warning' | 'critical' => {
    if (!sys) return 'normal';
    if (sys > 140 || sys < 90) return 'critical';
    if (sys > 130 || sys < 100) return 'warning';
    return 'normal';
  };
  const getTempStatus = (t?: number): 'normal' | 'warning' | 'critical' => {
    if (!t) return 'normal';
    if (t > 38.5 || t < 35) return 'critical';
    if (t > 37.5 || t < 36) return 'warning';
    return 'normal';
  };
  const getStressStatus = (s?: number): 'normal' | 'warning' | 'critical' => {
    if (!s) return 'normal';
    if (s >= 8) return 'critical';
    if (s >= 6) return 'warning';
    return 'normal';
  };

  const riskColor = prediction
    ? prediction.current_risk > 70 ? '#f43f5e' : prediction.current_risk > 40 ? '#fbbf24' : '#34d399'
    : '#06b6d4';

  const panels = [
    { key: 'vitals', label: isAr ? 'العلامات الحيوية' : 'Vitals', icon: Heart },
    { key: 'profile', label: isAr ? 'الملف الشخصي' : 'Profile', icon: Eye },
    { key: 'meds', label: isAr ? 'الأدوية' : 'Medications', icon: Pill },
    { key: 'risk', label: isAr ? 'تقييم المخاطر' : 'Risk', icon: TrendingUp },
  ];

  return (
    <div className="page-container min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scan size={22} className="text-cyan-400" />
            {isAr ? 'التوأم الرقمي ثلاثي الأبعاد' : '3D Digital Twin'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'عرض تفاعلي لجميع بياناتك الصحية في الوقت الفعلي' : 'Interactive real-time view of all your health data'}
          </p>
        </div>
        <button onClick={fetchAllData}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.05] text-slate-400 text-xs hover:text-white transition-all">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          {/* Panel Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-slate-800/30 border border-white/[0.04]">
            {panels.map(p => (
              <button key={p.key} onClick={() => setActivePanel(p.key as any)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                  activePanel === p.key ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <p.icon size={10} />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activePanel === 'vitals' && (
              <motion.div key="vitals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <InfoCard title={isAr ? 'نبض القلب' : 'Heart Rate'} icon={Heart} color="#f43f5e" loading={loading}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{vitals?.heart_rate ?? '--'}</span>
                    <span className="text-slate-500">bpm</span>
                  </div>
                  <div className="mt-1.5 text-slate-500">HRV: <span className="text-slate-300 font-mono">{vitals?.hrv ?? '--'}</span> ms</div>
                </InfoCard>

                <InfoCard title={isAr ? 'ضغط الدم' : 'Blood Pressure'} icon={Gauge} color="#3b82f6" loading={loading}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{vitals?.blood_pressure_sys ?? '--'}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-lg font-bold text-white">{vitals?.blood_pressure_dia ?? '--'}</span>
                    <span className="text-slate-500 ml-1">mmHg</span>
                  </div>
                </InfoCard>

                <InfoCard title={isAr ? 'الأكسجين' : 'Oxygen (SpO₂)'} icon={Wind} color="#06b6d4" loading={loading}>
                  <span className="text-lg font-bold text-white">{vitals?.spo2 ?? '--'}</span>
                  <span className="text-slate-500 ml-1">%</span>
                </InfoCard>

                <InfoCard title={isAr ? 'الحرارة' : 'Temperature'} icon={Thermometer} color="#f59e0b" loading={loading}>
                  <span className="text-lg font-bold text-white">{vitals?.body_temp ?? '--'}</span>
                  <span className="text-slate-500 ml-1">°C</span>
                </InfoCard>

                <InfoCard title={isAr ? 'التوتر' : 'Stress Level'} icon={Brain} color="#a78bfa" loading={loading}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{vitals?.stress_level ?? '--'}</span>
                    <span className="text-slate-500">/10</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 ml-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${((vitals?.stress_level || 0) / 10) * 100}%`,
                          backgroundColor: (vitals?.stress_level || 0) >= 7 ? '#f43f5e' : (vitals?.stress_level || 0) >= 5 ? '#fbbf24' : '#34d399',
                        }} />
                    </div>
                  </div>
                </InfoCard>

                <InfoCard title={isAr ? 'النشاط' : 'Activity'} icon={Footprints} color="#34d399" loading={loading}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-slate-500 text-[10px]">{isAr ? 'خطوات' : 'Steps'}</div>
                      <div className="text-sm font-bold text-white font-mono">{vitals?.steps?.toLocaleString() ?? '--'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">{isAr ? 'سعرات' : 'Calories'}</div>
                      <div className="text-sm font-bold text-white font-mono">{vitals?.calories_burned ?? '--'}</div>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard title={isAr ? 'النوم' : 'Sleep'} icon={Moon} color="#818cf8" loading={loading}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-slate-500 text-[10px]">{isAr ? 'ساعات' : 'Hours'}</div>
                      <div className="text-sm font-bold text-white">{vitals?.sleep_hours ?? profile?.sleep_hours ?? '--'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">{isAr ? 'جودة' : 'Quality'}</div>
                      <div className="text-sm font-bold text-white">{vitals?.sleep_quality ? `${vitals.sleep_quality}%` : '--'}</div>
                    </div>
                  </div>
                </InfoCard>
              </motion.div>
            )}

            {activePanel === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <InfoCard title={isAr ? 'البيانات الشخصية' : 'Personal Info'} icon={Eye} color="#06b6d4" loading={loading}>
                  <div className="space-y-2">
                    {[
                      { k: isAr ? 'الاسم' : 'Name', v: profile?.name || user?.name },
                      { k: isAr ? 'العمر' : 'Age', v: profile?.age ? `${profile.age} ${isAr ? 'سنة' : 'yrs'}` : '--' },
                      { k: isAr ? 'الجنس' : 'Gender', v: profile?.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : profile?.gender === 'female' ? (isAr ? 'أنثى' : 'Female') : '--' },
                      { k: isAr ? 'الوزن' : 'Weight', v: profile?.weight ? `${profile.weight} kg` : '--' },
                      { k: isAr ? 'الطول' : 'Height', v: profile?.height ? `${profile.height} cm` : '--' },
                      { k: 'BMI', v: profile?.weight && profile?.height ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '--' },
                      { k: isAr ? 'فصيلة الدم' : 'Blood Type', v: profile?.blood_type || '--' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-white/[0.03] last:border-0">
                        <span className="text-slate-500">{item.k}</span>
                        <span className="text-slate-200 font-medium">{item.v || '--'}</span>
                      </div>
                    ))}
                  </div>
                </InfoCard>

                <InfoCard title={isAr ? 'اللياقة' : 'Fitness'} icon={Dumbbell} color="#34d399" loading={loading}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? 'المستوى' : 'Level'}</span>
                      <span className="text-slate-200 capitalize">{profile?.fitness_level || '--'}</span>
                    </div>
                    {profile?.fitness_goals && profile.fitness_goals.length > 0 && (
                      <div>
                        <span className="text-slate-500">{isAr ? 'الأهداف' : 'Goals'}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.fitness_goals.map((g, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/10">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? 'نوع الغذاء' : 'Diet'}</span>
                      <span className="text-slate-200 capitalize">{profile?.diet_type || '--'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? 'شرب المياه' : 'Water'}</span>
                      <span className="text-slate-200">{profile?.water_intake ? `${profile.water_intake}L` : '--'}</span>
                    </div>
                  </div>
                </InfoCard>

                {profile?.medical_conditions && profile.medical_conditions.length > 0 && (
                  <InfoCard title={isAr ? 'الحالات الطبية' : 'Medical Conditions'} icon={ShieldAlert} color="#f43f5e" loading={loading}>
                    <div className="flex flex-wrap gap-1">
                      {profile.medical_conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] border border-rose-500/10">
                          {c}
                        </span>
                      ))}
                    </div>
                  </InfoCard>
                )}

                {profile?.allergies && profile.allergies.length > 0 && (
                  <InfoCard title={isAr ? 'الحساسيات' : 'Allergies'} icon={AlertTriangle} color="#f59e0b" loading={loading}>
                    <div className="flex flex-wrap gap-1">
                      {profile.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/10">
                          {a}
                        </span>
                      ))}
                    </div>
                  </InfoCard>
                )}
              </motion.div>
            )}

            {activePanel === 'meds' && (
              <motion.div key="meds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <InfoCard title={isAr ? 'الأدوية الحالية' : 'Current Medications'} icon={Pill} color="#8b5cf6" loading={loading}>
                  {medications.length === 0 ? (
                    <p className="text-slate-500 text-center py-2">{isAr ? 'لا توجد أدوية' : 'No medications'}</p>
                  ) : (
                    <div className="space-y-2">
                      {medications.map((med, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-white/[0.04]"
                          style={{ background: `${med.color || '#8b5cf6'}08` }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: med.color || '#8b5cf6' }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-slate-200 font-medium truncate">{isAr && med.name_ar ? med.name_ar : med.name}</div>
                            <div className="text-[10px] text-slate-500">{med.dosage} • {med.time}</div>
                          </div>
                          {med.status === 'taken' ? (
                            <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                          ) : med.status === 'missed' ? (
                            <AlertTriangle size={12} className="text-rose-400 flex-shrink-0" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </InfoCard>
              </motion.div>
            )}

            {activePanel === 'risk' && (
              <motion.div key="risk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <InfoCard title={isAr ? 'تقييم المخاطر' : 'Risk Assessment'} icon={TrendingUp} color={riskColor} loading={loading}>
                  {prediction ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                            <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <circle cx="25" cy="25" r="20" fill="none" stroke={riskColor} strokeWidth="4"
                              strokeDasharray={`${prediction.current_risk * 1.26} ${126 - prediction.current_risk * 1.26}`}
                              strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold" style={{ color: riskColor }}>
                              {Math.round(prediction.current_risk)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">{isAr ? 'المخاطر الحالية' : 'Current Risk'}</div>
                          <div className="text-white font-bold">{Math.round(prediction.current_risk)}%</div>
                          <div className="text-slate-500 text-[10px] mt-1">{isAr ? 'المتوقعة' : 'Predicted'}: {Math.round(prediction.predicted_risk)}%</div>
                        </div>
                      </div>

                      {prediction.risk_factors?.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-slate-500 uppercase">{isAr ? 'عوامل الخطر' : 'Risk Factors'}</div>
                          {prediction.risk_factors.slice(0, 5).map((rf, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="flex justify-between text-[10px] mb-0.5">
                                  <span className="text-slate-400">{isAr && rf.name_ar ? rf.name_ar : rf.name}</span>
                                  <span className="text-slate-500">{Math.round(rf.value)}%</span>
                                </div>
                                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                                  <div className="h-full rounded-full" style={{
                                    width: `${rf.value}%`,
                                    backgroundColor: rf.value > 60 ? '#f43f5e' : rf.value > 30 ? '#fbbf24' : '#34d399',
                                  }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-3">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                  )}
                </InfoCard>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <InfoCard title={isAr ? 'التنبيهات' : 'Alerts'} icon={AlertTriangle} color="#f59e0b" loading={loading}>
                    <div className="space-y-1.5">
                      {alerts.map((al, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${
                          al.severity === 'high' ? 'border-rose-500/10 bg-rose-500/[0.03]' : 'border-amber-500/10 bg-amber-500/[0.03]'
                        }`}>
                          <AlertTriangle size={10} className={al.severity === 'high' ? 'text-rose-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
                          <span className="text-[10px] text-slate-400 leading-relaxed">{al.message}</span>
                        </div>
                      ))}
                    </div>
                  </InfoCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ CENTER — 3D BODY ═══ */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.04]"
            style={{
              background: 'linear-gradient(180deg, rgba(6,182,212,0.02) 0%, rgba(10,14,26,0.7) 100%)',
              minHeight: '65vh',
            }}>

            {/* Background grid */}
            <div className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
                backgroundSize: '35px 35px',
              }} />

            {/* Scan effect */}
            <motion.div
              className="absolute inset-x-0 h-[12%] pointer-events-none z-10"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(6,182,212,0.06), transparent)' }}
              animate={{ top: ['0%', '88%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: `${riskColor}06` }} />
            </div>

            {/* The body figure */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
              <motion.div
                className="w-[70%] max-w-[350px] h-full"
                animate={{ rotateY: rotateY }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <FullBodySVG heartRate={vitals?.heart_rate} color="#06b6d4" />
              </motion.div>

              {/* ── DATA POINTS on the body ── */}
              {vitals && (
                <>
                  {/* Brain — right of head */}
                  <DataPoint top="9%" left="53%" label={isAr ? 'نشاط الدماغ' : 'BRAIN'}
                    value={getStressStatus(vitals.stress_level) === 'normal' ? (isAr ? 'طبيعي' : 'Normal') : (isAr ? 'مرتفع' : 'Elevated')}
                    color="#a78bfa" icon={Brain} status={getStressStatus(vitals.stress_level)} delay={0.3} />

                  {/* Stress — left of head */}
                  <DataPoint top="9%" left="22%" label={isAr ? 'التوتر' : 'STRESS'}
                    value={`${vitals.stress_level ?? '--'}/10`}
                    color="#a78bfa" icon={Brain} status={getStressStatus(vitals.stress_level)} delay={0.5} side="left" />

                  {/* SpO₂ — right chest/lung area */}
                  <DataPoint top="22%" left="54%" label={isAr ? 'الأكسجين' : 'SpO₂'}
                    value={vitals.spo2 ?? '--'} unit="%"
                    color="#06b6d4" icon={Wind} status={getO2Status(vitals.spo2)} delay={0.7} />

                  {/* Heart — left chest */}
                  <DataPoint top="26%" left="21%" label={isAr ? 'نبض القلب' : 'HEART'}
                    value={vitals.heart_rate ?? '--'} unit="bpm"
                    color="#f43f5e" icon={Heart} status={getHeartStatus(vitals.heart_rate)} delay={0.9} side="left" />

                  {/* Blood Pressure — left arm area */}
                  <DataPoint top="33%" left="17%" label={isAr ? 'ضغط الدم' : 'BP'}
                    value={vitals.blood_pressure_sys && vitals.blood_pressure_dia ? `${vitals.blood_pressure_sys}/${vitals.blood_pressure_dia}` : '--'}
                    unit="mmHg" color="#3b82f6" icon={Gauge} status={getBPStatus(vitals.blood_pressure_sys)} delay={1.1} side="left" />

                  {/* Temperature — right torso */}
                  <DataPoint top="36%" left="54%" label={isAr ? 'الحرارة' : 'TEMP'}
                    value={vitals.body_temp ?? '--'} unit="°C"
                    color="#f59e0b" icon={Thermometer} status={getTempStatus(vitals.body_temp)} delay={1.3} />

                  {/* Calories — left abdomen */}
                  <DataPoint top="46%" left="21%" label={isAr ? 'سعرات' : 'CALORIES'}
                    value={vitals.calories_burned ?? '--'} unit="kcal"
                    color="#fb923c" icon={Flame} delay={1.5} side="left" />

                  {/* Steps — right leg area */}
                  <DataPoint top="68%" left="53%" label={isAr ? 'الخطوات' : 'STEPS'}
                    value={vitals.steps?.toLocaleString() ?? '--'}
                    color="#34d399" icon={Footprints} delay={1.7} />
                </>
              )}
            </div>

            {/* Rotation controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {[-30, -15, 0, 15, 30].map(angle => (
                <button key={angle} onClick={() => setRotateY(angle)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-mono transition-all ${
                    rotateY === angle
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/60 text-slate-500 border border-white/[0.04] hover:text-white'
                  }`}>
                  {angle}°
                </button>
              ))}
            </div>

            {/* Status badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
                <Activity size={9} className="text-cyan-400" />
                <span>BIO-SYNC: {loading ? 'SYNCING...' : 'ACTIVE'}</span>
              </div>
              {vitals?.timestamp && (
                <div className="text-[8px] font-mono text-slate-600 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-white/[0.04]">
                  {isAr ? 'آخر تحديث' : 'Last'}: {new Date(vitals.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            {/* Risk indicator top-right */}
            {prediction && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/[0.05]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: riskColor, boxShadow: `0 0 6px ${riskColor}50` }} />
                <span className="text-[10px] font-mono" style={{ color: riskColor }}>
                  {isAr ? 'مخاطر' : 'RISK'}: {Math.round(prediction.current_risk)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="lg:col-span-3 space-y-3 order-3">
          {/* Profile summary */}
          <InfoCard title={isAr ? 'ملخص المريض' : 'Patient Summary'} icon={Eye} color="#06b6d4" loading={loading}>
            <div className="text-center mb-3">
              <div className="w-14 h-14 rounded-full mx-auto bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center text-lg font-bold text-white">
                {(profile?.name || user?.name || '?')[0].toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-white mt-2">{profile?.name || user?.name}</div>
              <div className="text-[10px] text-slate-500">
                {profile?.age ? `${profile.age} ${isAr ? 'سنة' : 'yrs'}` : ''} 
                {profile?.gender ? ` • ${profile.gender === 'male' ? (isAr ? 'ذكر' : 'M') : (isAr ? 'أنثى' : 'F')}` : ''}
                {profile?.blood_type ? ` • ${profile.blood_type}` : ''}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: isAr ? 'وزن' : 'Weight', val: profile?.weight ? `${profile.weight}kg` : '--' },
                { label: isAr ? 'طول' : 'Height', val: profile?.height ? `${profile.height}cm` : '--' },
                { label: 'BMI', val: profile?.weight && profile?.height ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '--' },
                { label: isAr ? 'لياقة' : 'Fitness', val: profile?.fitness_level || '--' },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-slate-800/30 border border-white/[0.03]">
                  <div className="text-[9px] text-slate-500">{s.label}</div>
                  <div className="text-xs font-bold text-white capitalize">{s.val}</div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* Quick vitals overview (horizontal bars) */}
          <InfoCard title={isAr ? 'نظرة عامة' : 'Vitals Overview'} icon={Activity} color="#06b6d4" loading={loading}>
            <div className="space-y-2.5">
              {[
                { label: isAr ? 'نبض' : 'HR', val: vitals?.heart_rate, max: 200, color: '#f43f5e', unit: 'bpm' },
                { label: 'SpO₂', val: vitals?.spo2, max: 100, color: '#06b6d4', unit: '%' },
                { label: 'HRV', val: vitals?.hrv, max: 100, color: '#3b82f6', unit: 'ms' },
                { label: isAr ? 'توتر' : 'Stress', val: vitals?.stress_level, max: 10, color: '#a78bfa', unit: '/10' },
                { label: isAr ? 'حرارة' : 'Temp', val: vitals?.body_temp, max: 42, color: '#f59e0b', unit: '°C' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-300 font-mono">{item.val ?? '--'} {item.unit}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: item.val ? `${(item.val / item.max) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: 0.1 * i }}
                      style={{ backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* Medications count */}
          <InfoCard title={isAr ? 'الأدوية' : 'Medications'} icon={Pill} color="#8b5cf6" loading={loading}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-white">{medications.length}</span>
                <span className="text-slate-500 ml-1 text-[10px]">{isAr ? 'دواء نشط' : 'active'}</span>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-xs font-bold">
                  {medications.filter(m => m.status === 'taken').length}/{medications.length}
                </div>
                <div className="text-[9px] text-slate-500">{isAr ? 'تم أخذها' : 'taken'}</div>
              </div>
            </div>
          </InfoCard>

          {/* Risk quick view */}
          {prediction && (
            <InfoCard title={isAr ? 'مستوى الخطر' : 'Risk Level'} icon={ShieldAlert} color={riskColor} loading={loading}>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                    <circle cx="25" cy="25" r="20" fill="none" stroke={riskColor} strokeWidth="3.5"
                      strokeDasharray={`${prediction.current_risk * 1.26} ${126 - prediction.current_risk * 1.26}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color: riskColor }}>{Math.round(prediction.current_risk)}%</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  {prediction.current_risk > 70
                    ? (isAr ? 'مستوى خطر مرتفع — يرجى مراجعة الطبيب' : 'High risk — consult your doctor')
                    : prediction.current_risk > 40
                    ? (isAr ? 'مستوى خطر متوسط — راقب صحتك' : 'Moderate risk — monitor your health')
                    : (isAr ? 'مستوى خطر منخفض — حالة جيدة' : 'Low risk — you\'re doing well')}
                </div>
              </div>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
