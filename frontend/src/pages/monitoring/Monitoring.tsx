import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useVitalsStore, useUIStore } from '../../store';
import {
  Activity, Heart, Wind, Brain, Flame, Footprints, Clock,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Upload, Watch,
  BarChart3, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import api from '../../services/api';
import { HoloCard, HoloParticles, HoloBgMesh, HoloScanLine, HoloDNAHelix, HoloHeartbeat } from '../../components/hologram/HologramEffects';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Monitoring() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const { current: vitals } = useVitalsStore();
  const [activeTab, setActiveTab] = useState<'realtime' | '24h' | 'weekly' | 'population'>('realtime');

  const v = vitals || {
    heartRate: 72, hrv: 45, oxygenSaturation: 98, stressLevel: 3,
    caloriesBurned: 420, steps: 6840, activeMinutes: 45,
    bloodPressureSystolic: 120, bloodPressureDiastolic: 80, status: 'normal' as const,
    bodyTemperature: 36.7,
  };

  // 24h data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    heartRate: 60 + Math.round(Math.random() * 30 + (i > 8 && i < 22 ? 10 : 0)),
    hrv: 30 + Math.round(Math.random() * 40),
    stress: Math.round(1 + Math.random() * 6 + (i > 14 && i < 18 ? 2 : 0)),
    oxygen: 95 + Math.round(Math.random() * 4),
    steps: Math.round(Math.random() * 800 + (i > 6 && i < 22 ? 200 : 0)),
  }));

  const weeklyData = [
    { day: language === 'ar' ? 'السبت' : 'Sat', heartRate: 68, hrv: 48, stress: 4, steps: 5200, oxygen: 98 },
    { day: language === 'ar' ? 'الأحد' : 'Sun', heartRate: 72, hrv: 42, stress: 3, steps: 7100, oxygen: 97 },
    { day: language === 'ar' ? 'الاثنين' : 'Mon', heartRate: 75, hrv: 38, stress: 5, steps: 8400, oxygen: 98 },
    { day: language === 'ar' ? 'الثلاثاء' : 'Tue', heartRate: 70, hrv: 45, stress: 4, steps: 6800, oxygen: 99 },
    { day: language === 'ar' ? 'الأربعاء' : 'Wed', heartRate: 73, hrv: 40, stress: 3, steps: 9200, oxygen: 98 },
    { day: language === 'ar' ? 'الخميس' : 'Thu', heartRate: 69, hrv: 50, stress: 2, steps: 7500, oxygen: 98 },
    { day: language === 'ar' ? 'الجمعة' : 'Fri', heartRate: 71, hrv: 47, stress: 3, steps: 6400, oxygen: 97 },
  ];

  const radarData = [
    { subject: language === 'ar' ? 'نبض القلب' : 'Heart Rate', A: 75, fullMark: 100 },
    { subject: language === 'ar' ? 'تقلب النبض' : 'HRV', A: 60, fullMark: 100 },
    { subject: language === 'ar' ? 'الأكسجين' : 'Oxygen', A: 98, fullMark: 100 },
    { subject: language === 'ar' ? 'التوتر' : 'Stress', A: 30, fullMark: 100 },
    { subject: language === 'ar' ? 'النشاط' : 'Activity', A: 65, fullMark: 100 },
    { subject: language === 'ar' ? 'النوم' : 'Sleep', A: 78, fullMark: 100 },
  ];

  const wearTime = 18.5;
  const peakHours = [9, 10, 16, 17, 18];
  const riskWindows = [{ start: '14:00', end: '15:00', risk: 'medium' }, { start: '23:00', end: '01:00', risk: 'high' }];

  const tabs = [
    { key: 'realtime', label: t('monitoring.realtime') },
    { key: '24h', label: t('monitoring.history24h') },
    { key: 'weekly', label: t('monitoring.weeklyTrends') },
    { key: 'population', label: t('monitoring.populationTrends') },
  ];

  return (
    <motion.div className="page-container relative" initial="initial" animate="animate">
      <HoloBgMesh />
      <HoloParticles count={10} color="#06b6d4" />

      {/* DNA Helix accent on the side */}
      <div className="hidden xl:block absolute top-24 right-8 opacity-30 z-0">
        <HoloDNAHelix height={300} color1="#06b6d4" color2="#10b981" />
      </div>

      <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Activity className="text-healix-400" size={28} />
            <span className="holo-text">{t('monitoring.title')}</span>
          </h1>
          <p className="section-subtitle">{t('monitoring.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} />
            {t('onboarding.uploadData')}
            <input type="file" className="hidden" accept=".csv,.json,.xml" />
          </label>
          <div className="holo-badge">
            <Watch size={14} className="text-emerald-400" />
            {wearTime}h {t('monitoring.wearTime')}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeInUp} className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-healix-500/20 text-healix-400 border border-healix-500/40' : 'bg-dark-700/40 text-gray-400 border border-white/5 hover:border-white/10'
            }`}>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Real-time Vitals */}
      {activeTab === 'realtime' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 perspective-container relative z-10">
            {[
              { label: t('dashboard.heartRate'), value: v.heartRate, unit: t('dashboard.bpm'), icon: Heart, color: 'rose', animate: true },
              { label: 'HRV', value: v.hrv, unit: 'ms', icon: Activity, color: 'blue' },
              { label: t('dashboard.oxygen'), value: `${v.oxygenSaturation}%`, unit: 'SpO₂', icon: Wind, color: 'sky' },
              { label: t('dashboard.stress'), value: `${v.stressLevel}/10`, unit: '', icon: Brain, color: 'amber' },
            ].map((card, i) => (
              <HoloCard key={i} className="p-5 perspective-child" corners={true} scanLine={i === 0} intensity="medium">
                <div className="relative z-10">
                  <div className={`p-2 rounded-lg bg-${card.color}-500/10 border border-${card.color}-500/20 w-fit mb-3`}>
                    <card.icon size={20} className={`text-${card.color}-400 ${card.animate ? 'animate-heartbeat' : ''}`} />
                  </div>
                  <div className="text-3xl font-bold text-white">{card.value}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{card.label}</span>
                    <span className="text-xs text-gray-500">{card.unit}</span>
                  </div>
                  {i === 0 && (
                    <div className="mt-2 opacity-50">
                      <HoloHeartbeat color="#f43f5e" width={120} height={25} />
                    </div>
                  )}
                </div>
              </HoloCard>
            ))}
          </div>

          {/* Live Heart Rate Chart — Holographic */}
          <motion.div {...fadeInUp} className="holo-chart holo-scan p-6 relative">
            <HoloScanLine color="#f43f5e" speed={5} />
            <h3 className="text-lg font-semibold text-white mb-4">
              {language === 'ar' ? 'نبض القلب - مباشر' : 'Heart Rate — Live'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData.slice(0, 12)}>
                <defs>
                  <linearGradient id="liveHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={11} />
                <YAxis stroke="#4b5563" fontSize={11} domain={[50, 110]} />
                <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" fill="url(#liveHR)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar Chart — Holographic */}
          <motion.div {...fadeInUp} className="holo-card holo-grid p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-4">{t('monitoring.contextAnalysis')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} domain={[0, 100]} />
                <Radar name="Health" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}

      {/* 24h Analysis */}
      {activeTab === '24h' && (
        <>
          <motion.div {...fadeInUp} className="holo-chart holo-datastream p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-4 holo-text">{t('monitoring.history24h')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={11} interval={2} />
                <YAxis stroke="#4b5563" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hrv" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Risk Windows — Holographic */}
          <motion.div {...fadeInUp} className="holo-card p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-4">{t('monitoring.riskWindows')}</h3>
            <div className="space-y-3">
              {riskWindows.map((rw, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${
                  rw.risk === 'high' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                  <AlertTriangle size={20} className={rw.risk === 'high' ? 'text-rose-400' : 'text-amber-400'} />
                  <div>
                    <p className="font-medium text-white">{rw.start} - {rw.end}</p>
                    <p className="text-xs text-gray-400">
                      {language === 'ar' ? `مستوى خطر ${rw.risk === 'high' ? 'مرتفع' : 'متوسط'}` : `${rw.risk} risk level`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Weekly Trends */}
      {activeTab === 'weekly' && (
        <motion.div {...fadeInUp} className="holo-chart holo-scan p-6 relative">
          <HoloScanLine color="#06b6d4" speed={6} />
          <h3 className="text-lg font-semibold text-white mb-4 holo-text">{t('monitoring.weeklyTrends')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="steps" fill="#06b6d4" radius={[6, 6, 0, 0]} opacity={0.8} />
              <Bar dataKey="heartRate" fill="#f43f5e" radius={[6, 6, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Population Trends */}
      {activeTab === 'population' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t('monitoring.wearTime'), value: `${wearTime}h`, detail: language === 'ar' ? 'من ٢٤ ساعة' : 'of 24h', pct: Math.round((wearTime / 24) * 100) },
              { label: t('monitoring.activityLevel'), value: language === 'ar' ? 'نشط' : 'Active', detail: `${v.activeMinutes} ${t('common.minutes')}`, pct: 65 },
              { label: t('monitoring.peakHours'), value: '16:00-18:00', detail: language === 'ar' ? 'أعلى نشاط' : 'Peak activity', pct: 85 },
            ].map((item, i) => (
              <HoloCard key={i} className="p-5 perspective-child" corners={true} intensity="low">
                <div className="relative z-10">
                  <p className="text-sm text-gray-400 mb-2">{item.label}</p>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                  <div className="progress-bar mt-3">
                    <div className="progress-bar-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              </HoloCard>
            ))}
          </div>

          <motion.div {...fadeInUp} className="holo-chart holo-datastream p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-4">
              {language === 'ar' ? 'تحليل الأوقات الخطرة' : 'Dangerous Time Analysis'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={11} interval={3} />
                <YAxis stroke="#4b5563" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="stress" stroke="#f59e0b" fill="url(#riskGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
