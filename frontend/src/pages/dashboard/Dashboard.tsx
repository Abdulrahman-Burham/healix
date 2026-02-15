import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore, useVitalsStore, useUIStore } from '../../store';
import {
  Heart, Droplets, Brain, Flame, Footprints, Activity, Wind,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, Dumbbell,
  UtensilsCrossed, Pill, ChevronRight, Zap, Shield, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend,
  LineChart, Line,
} from 'recharts';
import api from '../../services/api';
import { HoloCard, HoloOrb, HoloParticles, HoloHeartbeat, HoloScanLine, HoloBgMesh } from '../../components/hologram/HologramEffects';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { current: vitals } = useVitalsStore();
  const { language } = useUIStore();

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(82);
  const [compliance, setCompliance] = useState(78);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [weeklyRes, exercisesRes, mealsRes, medsRes] = await Promise.all([
        api.get('/vitals/weekly-trends').catch(() => ({ data: [] })),
        api.get('/exercises/today').catch(() => ({ data: [] })),
        api.get('/nutrition/today').catch(() => ({ data: { meals: [] } })),
        api.get('/medications/today').catch(() => ({ data: [] })),
      ]);
      setWeeklyData(weeklyRes.data);
      setTodayExercises(exercisesRes.data);
      setTodayMeals(mealsRes.data.meals || mealsRes.data);
      setMedications(medsRes.data);
    } catch (err) {
      // Use fallback data
    }
  };

  // Fallback vitals for display
  const v = vitals || {
    heartRate: 72, hrv: 45, oxygenSaturation: 98, stressLevel: 3,
    caloriesBurned: 420, steps: 6840, activeMinutes: 45,
    bloodPressureSystolic: 120, bloodPressureDiastolic: 80, status: 'normal' as const,
  };

  const vitalCards = [
    {
      label: t('dashboard.heartRate'),
      value: v.heartRate,
      unit: t('dashboard.bpm'),
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      trend: '+2',
      trendDir: 'up' as const,
      animate: v.status === 'critical',
    },
    {
      label: t('dashboard.oxygen'),
      value: `${v.oxygenSaturation}%`,
      unit: 'SpO₂',
      icon: Wind,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      trend: 'Stable',
      trendDir: 'stable' as const,
    },
    {
      label: t('dashboard.stress'),
      value: v.stressLevel,
      unit: '/10',
      icon: Brain,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      trend: '-1',
      trendDir: 'down' as const,
    },
    {
      label: t('dashboard.calories'),
      value: v.caloriesBurned,
      unit: t('common.kcal'),
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      trend: '+120',
      trendDir: 'up' as const,
    },
    {
      label: t('dashboard.steps'),
      value: v.steps.toLocaleString(),
      unit: '',
      icon: Footprints,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trend: '+1.2k',
      trendDir: 'up' as const,
    },
    {
      label: t('dashboard.bloodPressure'),
      value: `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`,
      unit: 'mmHg',
      icon: Activity,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      trend: 'Normal',
      trendDir: 'stable' as const,
    },
  ];

  // Fallback weekly data
  const chartData = weeklyData.length > 0 ? weeklyData : [
    { day: language === 'ar' ? 'السبت' : 'Sat', heartRate: 68, steps: 5200, calories: 320, stress: 4 },
    { day: language === 'ar' ? 'الأحد' : 'Sun', heartRate: 72, steps: 7100, calories: 450, stress: 3 },
    { day: language === 'ar' ? 'الاثنين' : 'Mon', heartRate: 75, steps: 8400, calories: 520, stress: 5 },
    { day: language === 'ar' ? 'الثلاثاء' : 'Tue', heartRate: 70, steps: 6800, calories: 410, stress: 4 },
    { day: language === 'ar' ? 'الأربعاء' : 'Wed', heartRate: 73, steps: 9200, calories: 580, stress: 3 },
    { day: language === 'ar' ? 'الخميس' : 'Thu', heartRate: 69, steps: 7500, calories: 460, stress: 2 },
    { day: language === 'ar' ? 'الجمعة' : 'Fri', heartRate: 71, steps: 6400, calories: 390, stress: 3 },
  ];

  const statusColor = v.status === 'critical' ? 'text-rose-400' : v.status === 'warning' ? 'text-amber-400' : 'text-emerald-400';
  const statusBg = v.status === 'critical' ? 'bg-rose-500/10' : v.status === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  return (
    <motion.div className="page-container relative" initial="initial" animate="animate" variants={stagger}>
      {/* Holographic Background Mesh */}
      <HoloBgMesh />
      <HoloParticles count={15} color="#06b6d4" />

      {/* Welcome Header — Holographic */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('dashboard.welcome')}, <span className="holo-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {language === 'ar' ? 'إليك ملخص صحتك اليوم' : "Here's your health summary for today"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`holo-badge ${
            v.status === 'critical' ? '!border-rose-500/30 !text-rose-400' : v.status === 'warning' ? '!border-amber-500/30 !text-amber-400' : ''
          }`}>
            {v.status === 'critical' ? <AlertTriangle size={14} className="text-rose-400" /> :
             v.status === 'warning' ? <AlertTriangle size={14} className="text-amber-400" /> :
             <Shield size={14} className="text-emerald-400" />}
            <span className="font-medium">
              {t(`dashboard.status.${v.status}`)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <Clock size={12} className="inline mr-1" />
            {new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* Vital Signs Cards — 3D Holographic */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 perspective-container relative z-10">
        {vitalCards.map((card, i) => (
          <HoloCard
            key={i}
            className="p-5 perspective-child"
            intensity="medium"
            scanLine={i === 0}
            gridOverlay={false}
            corners={true}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg} ${card.border} border`}>
                  <card.icon size={18} className={`${card.color} ${card.animate ? 'animate-heartbeat' : ''}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-[11px] font-medium
                  ${card.trendDir === 'up' ? 'text-emerald-400' : card.trendDir === 'down' ? 'text-rose-400' : 'text-gray-500'}`}>
                  {card.trendDir === 'up' ? <TrendingUp size={12} /> : card.trendDir === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {card.trend}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <span className="text-xs text-gray-500">{card.unit}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
              {/* Holographic heartbeat line for first card */}
              {i === 0 && (
                <div className="mt-2 opacity-60">
                  <HoloHeartbeat color="#f43f5e" width={140} height={30} />
                </div>
              )}
            </div>
          </HoloCard>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heart Rate Chart (2-col wide) — Holographic */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 holo-chart holo-scan p-6 relative">
          <HoloScanLine color="#06b6d4" speed={6} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{t('dashboard.weeklyProgress')}</h3>
              <p className="text-sm text-gray-400">{language === 'ar' ? 'المؤشرات الحيوية خلال الأسبوع' : 'Vital signs over the week'}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> {t('dashboard.heartRate')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {t('dashboard.steps')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {t('dashboard.stress')}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px', fontSize: '12px'
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" fill="url(#hrGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="steps" stroke="#10b981" fill="url(#stepsGrad)" strokeWidth={2} yAxisId={0} />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Health Score — 3D Hologram Orb */}
        <motion.div variants={fadeInUp} className="holo-card holo-grid p-6 flex flex-col justify-between relative overflow-hidden">
          <HoloParticles count={6} color="#06b6d4" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-6 holo-text">{t('dashboard.healthScore')}</h3>
            <div className="flex justify-center holo-float">
              <HoloOrb
                size={170}
                value={healthScore}
                label="/100"
                color="#06b6d4"
                secondaryColor="#10b981"
                progress={healthScore}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">{t('dashboard.compliance')}</span>
                <span className="text-healix-400 font-semibold">{compliance}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${compliance}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">{t('dashboard.riskLevel')}</span>
                <span className="text-emerald-400 font-semibold">{language === 'ar' ? 'منخفض' : 'Low'}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-700"
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row: Exercises, Meals, Medications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Exercises — Holographic */}
        <motion.div variants={fadeInUp} className="holo-card holo-corners p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-healix-400" />
              <h3 className="font-semibold text-white">{t('dashboard.todayExercises')}</h3>
            </div>
            <a href="/exercises" className="text-healix-400 text-xs hover:text-healix-300 flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight size={14} className="[dir=rtl]:rotate-180" />
            </a>
          </div>
          <div className="space-y-3">
            {(todayExercises.length > 0 ? todayExercises : [
              { name: language === 'ar' ? 'تمرين الكتف بالآلة' : 'Machine Shoulder Press', sets: 3, reps: '6-8', completed: true },
              { name: language === 'ar' ? 'تمرين الصدر بالآلة' : 'Chest Press Machine', sets: 3, reps: '6-10', completed: false },
              { name: language === 'ar' ? 'هاك سكوات' : 'Hack Squat', sets: 2, reps: '5-8', completed: false },
              { name: language === 'ar' ? 'رفع جانبي بالآلة' : 'Machine Lateral Raises', sets: 3, reps: '6-8', completed: false },
            ]).map((ex: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                ex.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-dark-600/30 border border-white/5 hover:border-white/10'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  ex.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-500 text-gray-400'
                }`}>
                  {ex.completed ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${ex.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                    {ex.name}
                  </p>
                  <p className="text-xs text-gray-500">{ex.sets} × {ex.reps}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Meals — Holographic */}
        <motion.div variants={fadeInUp} className="holo-card holo-corners p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-emerald-400" />
              <h3 className="font-semibold text-white">{t('dashboard.todayMeals')}</h3>
            </div>
            <a href="/nutrition" className="text-healix-400 text-xs hover:text-healix-300 flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight size={14} className="[dir=rtl]:rotate-180" />
            </a>
          </div>
          <div className="space-y-3">
            {(todayMeals.length > 0 ? todayMeals : [
              { type: 'breakfast', name: language === 'ar' ? 'بيض مسلوق + شوفان' : 'Boiled Eggs + Oatmeal', calories: 420, consumed: true },
              { type: 'lunch', name: language === 'ar' ? 'صدور دجاج + أرز' : 'Chicken Breast + Rice', calories: 650, consumed: false },
              { type: 'snack', name: language === 'ar' ? 'بروتين شيك + موز' : 'Protein Shake + Banana', calories: 280, consumed: false },
              { type: 'dinner', name: language === 'ar' ? 'سمك مشوي + سلطة' : 'Grilled Fish + Salad', calories: 380, consumed: false },
            ]).map((meal: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                meal.consumed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-dark-600/30 border border-white/5 hover:border-white/10'
              }`}>
                <div className="text-xl">
                  {meal.type === 'breakfast' ? '🌅' : meal.type === 'lunch' ? '☀️' : meal.type === 'snack' ? '🍌' : '🌙'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${meal.consumed ? 'text-emerald-400' : 'text-white'}`}>{meal.name}</p>
                  <p className="text-xs text-gray-500">{meal.calories} {t('common.kcal')}</p>
                </div>
                {meal.consumed && <span className="text-emerald-400 text-xs">✓</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Medications — Holographic */}
        <motion.div variants={fadeInUp} className="holo-card holo-corners p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill size={18} className="text-violet-400" />
              <h3 className="font-semibold text-white">{t('dashboard.upcomingMeds')}</h3>
            </div>
            <a href="/medications" className="text-healix-400 text-xs hover:text-healix-300 flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight size={14} className="[dir=rtl]:rotate-180" />
            </a>
          </div>
          <div className="space-y-3">
            {(medications.length > 0 ? medications : [
              { name: language === 'ar' ? 'ميتفورمين' : 'Metformin', dosage: '500mg', time: '08:00', taken: true, beforeMeal: true },
              { name: language === 'ar' ? 'أملوديبين' : 'Amlodipine', dosage: '5mg', time: '14:00', taken: false, beforeMeal: false },
              { name: language === 'ar' ? 'فيتامين د' : 'Vitamin D', dosage: '1000IU', time: '20:00', taken: false, beforeMeal: false },
            ]).map((med: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                med.taken ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-dark-600/30 border border-white/5 hover:border-white/10'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  med.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
                }`}>
                  <Pill size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${med.taken ? 'text-emerald-400' : 'text-white'}`}>{med.name}</p>
                  <p className="text-xs text-gray-500">{med.dosage} · {med.time} · {med.beforeMeal ? (language === 'ar' ? 'قبل الأكل' : 'Before meal') : (language === 'ar' ? 'بعد الأكل' : 'After meal')}</p>
                </div>
                {!med.taken && (
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-healix-500/20 text-healix-400 hover:bg-healix-500/30 transition-colors">
                    {t('medications.markTaken')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Calories & Activity Bar Chart — Holographic */}
      <motion.div variants={fadeInUp} className="holo-chart holo-datastream p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {language === 'ar' ? 'السعرات والنشاط الأسبوعي' : 'Weekly Calories & Activity'}
            </h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
            <YAxis stroke="#4b5563" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '12px', fontSize: '12px'
              }}
            />
            <Bar dataKey="calories" fill="url(#calGrad)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="steps" fill="url(#stepGrad)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
