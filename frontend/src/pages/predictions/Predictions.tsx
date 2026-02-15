import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield, BarChart3,
  ArrowRight, Lightbulb, Activity, Minus, Target, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { HoloCard, HoloOrb, HoloParticles, HoloBgMesh, HoloScanLine } from '../../components/hologram/HologramEffects';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Predictions() {
  const { t } = useTranslation();
  const { language } = useUIStore();

  const currentRisk = 22;
  const predictedRisk = 15;
  const riskTrend: 'improving' | 'stable' | 'worsening' = 'improving';

  const riskFactors = [
    { name: 'Sleep Quality', nameAr: 'جودة النوم', impact: 35, direction: 'positive' as const },
    { name: 'Exercise Compliance', nameAr: 'الالتزام بالتمارين', impact: 28, direction: 'positive' as const },
    { name: 'Stress Level', nameAr: 'مستوى التوتر', impact: -18, direction: 'negative' as const },
    { name: 'Diet Adherence', nameAr: 'الالتزام بالنظام الغذائي', impact: 22, direction: 'positive' as const },
    { name: 'Blood Pressure Control', nameAr: 'التحكم بضغط الدم', impact: 15, direction: 'positive' as const },
    { name: 'Missed Medications', nameAr: 'الأدوية الفائتة', impact: -12, direction: 'negative' as const },
  ];

  const scenarios = [
    {
      scenario: 'Continue current program for 3 months',
      scenarioAr: 'الاستمرار على البرنامج الحالي لمدة 3 أشهر',
      riskChange: -30,
      timeframe: '3 months',
      details: 'Blood pressure improvement by 15%, cardio fitness +20%',
      detailsAr: 'تحسن ضغط الدم بنسبة 15%، لياقة القلب +20%',
    },
    {
      scenario: 'Skip exercise for 2 weeks',
      scenarioAr: 'ترك التمارين لمدة أسبوعين',
      riskChange: +18,
      timeframe: '2 weeks',
      details: 'Risk of deconditioning, stress increase, muscle loss',
      detailsAr: 'خطر فقدان اللياقة، زيادة التوتر، فقدان عضلات',
    },
    {
      scenario: 'Neglect sleep (<5h/night)',
      scenarioAr: 'إهمال النوم (أقل من 5 ساعات/ليلة)',
      riskChange: +25,
      timeframe: '1 month',
      details: 'Cardiovascular risk +25%, cognitive decline, hormonal imbalance',
      detailsAr: 'خطر القلب +25%، تراجع إدراكي، خلل هرموني',
    },
    {
      scenario: 'Follow AI recommendations strictly',
      scenarioAr: 'اتباع توصيات الذكاء الاصطناعي بدقة',
      riskChange: -40,
      timeframe: '6 months',
      details: 'Optimal health trajectory, disease risk minimized',
      detailsAr: 'مسار صحي مثالي، تقليل خطر الأمراض',
    },
  ];

  const shapData = [
    { feature: 'Exercise', featureAr: 'التمارين', value: 0.35 },
    { feature: 'Sleep', featureAr: 'النوم', value: 0.28 },
    { feature: 'Diet', featureAr: 'النظام الغذائي', value: 0.22 },
    { feature: 'Stress', featureAr: 'التوتر', value: -0.15 },
    { feature: 'Medications', featureAr: 'الأدوية', value: 0.18 },
    { feature: 'Heart Rate', featureAr: 'نبض القلب', value: 0.12 },
    { feature: 'HRV', featureAr: 'تقلب النبض', value: 0.08 },
  ];

  const trendData = [
    { month: language === 'ar' ? 'يناير' : 'Jan', actual: 35, predicted: null },
    { month: language === 'ar' ? 'فبراير' : 'Feb', actual: 30, predicted: null },
    { month: language === 'ar' ? 'مارس' : 'Mar', actual: 28, predicted: null },
    { month: language === 'ar' ? 'أبريل' : 'Apr', actual: 25, predicted: null },
    { month: language === 'ar' ? 'مايو' : 'May', actual: 22, predicted: 22 },
    { month: language === 'ar' ? 'يونيو' : 'Jun', actual: null, predicted: 19 },
    { month: language === 'ar' ? 'يوليو' : 'Jul', actual: null, predicted: 16 },
    { month: language === 'ar' ? 'أغسطس' : 'Aug', actual: null, predicted: 15 },
  ];

  const recommendations = language === 'ar' ? [
    'زيادة وقت النوم إلى 7-8 ساعات يومياً لتحسين تعافي القلب',
    'إضافة تمارين التنفس العميق 10 دقائق يومياً لتقليل التوتر',
    'تناول الأدوية في المواعيد المحددة - الالتزام الحالي 85%',
    'زيادة شرب الماء إلى 3 لتر يومياً',
    'تقليل الصوديوم في الطعام للمساعدة في ضبط ضغط الدم',
  ] : [
    'Increase sleep time to 7-8 hours daily for better cardiac recovery',
    'Add 10 minutes of deep breathing exercises daily to reduce stress',
    'Take medications on time — current compliance at 85%',
    'Increase water intake to 3 liters daily',
    'Reduce sodium intake to help control blood pressure',
  ];

  return (
    <motion.div className="page-container relative" initial="initial" animate="animate">
      <HoloBgMesh />
      <HoloParticles count={12} color="#8b5cf6" />

      <motion.div {...fadeInUp} className="relative z-10">
        <h1 className="section-title flex items-center gap-2">
          <TrendingUp className="text-healix-400" size={28} />
          <span className="holo-text">{t('predictions.title')}</span>
        </h1>
        <p className="section-subtitle">{t('predictions.subtitle')}</p>
      </motion.div>

      {/* Risk Score Cards — 3D Holographic Orbs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-container relative z-10">
        <HoloCard className="p-6 text-center" corners={true} scanLine={false} intensity="medium">
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-4">{t('predictions.currentRisk')}</p>
            <div className="flex justify-center holo-float">
              <HoloOrb
                size={140}
                value={`${currentRisk}%`}
                color={currentRisk > 60 ? '#f43f5e' : currentRisk > 30 ? '#f59e0b' : '#10b981'}
                secondaryColor="#06b6d4"
                progress={currentRisk}
              />
            </div>
            <div className="mt-3 badge-success">{language === 'ar' ? 'منخفض' : 'Low Risk'}</div>
          </div>
        </HoloCard>

        <HoloCard className="p-6 text-center" corners={true} scanLine={false} intensity="medium">
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-4">{t('predictions.predictedRisk')}</p>
            <div className="flex justify-center holo-float">
              <HoloOrb
                size={140}
                value={`${predictedRisk}%`}
                color="#10b981"
                secondaryColor="#06b6d4"
                progress={predictedRisk}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-emerald-400 text-sm font-medium">
              <TrendingDown size={16} /> -{currentRisk - predictedRisk}% {language === 'ar' ? 'تحسن' : 'improvement'}
            </div>
          </div>
        </HoloCard>

        <HoloCard className="p-6" corners={true} intensity="low">
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-4">{t('predictions.trendAnalysis')}</p>
            <div className={`holo-badge mb-4 ${
              riskTrend === 'improving' ? '!border-emerald-500/30 !text-emerald-400' :
              riskTrend === 'worsening' ? '!border-rose-500/30 !text-rose-400' : ''
            }`}>
              {riskTrend === 'improving' ? <TrendingDown size={14} /> : riskTrend === 'worsening' ? <TrendingUp size={14} /> : <Minus size={14} />}
              {t(`monitoring.${riskTrend === 'improving' ? 'improving' : riskTrend === 'worsening' ? 'declining' : 'stable'}`)}
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HoloCard>
      </div>

      {/* Risk Progression Chart — Holographic */}
      <motion.div {...fadeInUp} className="holo-chart holo-scan p-6 relative z-10">
        <HoloScanLine color="#06b6d4" speed={7} />
        <h3 className="text-lg font-semibold text-white mb-6 holo-text">
          {language === 'ar' ? 'مسار المخاطر: الماضي والمتوقع' : 'Risk Trajectory: Past & Predicted'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
            <YAxis stroke="#4b5563" fontSize={12} domain={[0, 50]} />
            <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="actual" stroke="#06b6d4" fill="url(#actualGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-healix-500" /> {language === 'ar' ? 'الفعلي' : 'Actual'}</span>
          <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-emerald-500 border-dashed" style={{ borderTop: '2px dashed #10b981', width: 12, height: 0 }} /> {language === 'ar' ? 'المتوقع' : 'Predicted'}</span>
        </div>
      </motion.div>

      {/* SHAP Analysis — Holographic */}
      <motion.div {...fadeInUp} className="holo-card holo-datastream p-6 relative z-10">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-2 holo-text">{t('monitoring.contextAnalysis')}</h3>
          <p className="text-sm text-gray-400 mb-6">
            {language === 'ar' ? 'تأثير كل عامل على حالتك الصحية' : 'Impact of each factor on your health status'}
          </p>
          <div className="space-y-3">
            {shapData.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-gray-300 w-24 text-right [dir=rtl]:text-left truncate">
                  {language === 'ar' ? item.featureAr : item.feature}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-dark-600/60 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(item.value) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-lg ${item.value > 0 ? 'bg-emerald-500/60' : 'bg-rose-500/60'}`}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${item.value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.value > 0 ? '+' : ''}{Math.round(item.value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scenario Comparisons — Holographic */}
      <motion.div {...fadeInUp} className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-4 holo-text">{t('predictions.scenarios')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((s, i) => (
            <HoloCard key={i} className={`p-5 ${
              s.riskChange < 0 ? 'hover:border-emerald-500/20' : 'hover:border-rose-500/20'
            }`} corners={true} intensity="low" scanLine={false}>
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-white text-sm flex-1">
                  {language === 'ar' ? s.scenarioAr : s.scenario}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                  s.riskChange < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {s.riskChange > 0 ? '+' : ''}{s.riskChange}% {language === 'ar' ? 'خطر' : 'risk'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{language === 'ar' ? s.detailsAr : s.details}</p>
              <span className="text-[11px] text-gray-500">{language === 'ar' ? 'المدة: ' : 'Timeframe: '}{s.timeframe}</span>
            </HoloCard>
          ))}
        </div>
      </motion.div>

      {/* AI Recommendations — Holographic */}
      <motion.div {...fadeInUp} className="holo-card holo-corners p-6 relative z-10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold holo-text">{t('predictions.recommendations')}</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-600/30 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-healix-500/20 text-healix-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
