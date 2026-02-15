import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore, useAuthStore } from '../../store';
import {
  FileText, Heart, Activity, Brain, Footprints, Moon, Gauge,
  Wind, Thermometer, Pill, Dumbbell, TrendingUp, TrendingDown,
  Minus, RefreshCw, Download, Star, ChevronRight, Loader2, Award,
} from 'lucide-react';
import api from '../../services/api';

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e', B: '#3b82f6', C: '#eab308', D: '#f97316', F: '#ef4444',
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'increasing') return <TrendingUp size={11} className="text-rose-400" />;
  if (trend === 'decreasing') return <TrendingDown size={11} className="text-emerald-400" />;
  return <Minus size={11} className="text-slate-500" />;
}

export default function HealthReport() {
  const { language } = useUIStore();
  const { user } = useAuthStore();
  const isAr = language === 'ar';

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/smart/health-report');
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateReport(); }, []);

  const gradeColor = GRADE_COLORS[report?.health_grade] || '#3b82f6';

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            {isAr ? 'التقرير الصحي الذكي' : 'AI Health Report'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAr ? 'تقرير شامل مدعوم بالذكاء الاصطناعي عن حالتك الصحية' : 'Comprehensive AI-powered report on your health status'}
          </p>
        </div>
        <button onClick={generateReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-40">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {isAr ? 'إنشاء تقرير' : 'Generate Report'}
        </button>
      </div>

      {loading && !report ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={36} className="text-blue-400 animate-spin mb-4" />
          <p className="text-sm text-slate-400">{isAr ? 'جاري إنشاء التقرير...' : 'Generating your report...'}</p>
        </div>
      ) : report ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* ── TOP SECTION: Score + Patient Info ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Health Score Card */}
            <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={gradeColor} strokeWidth="8"
                    strokeDasharray={`${report.health_score * 2.64} ${264 - report.health_score * 2.64}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: gradeColor }}>{report.health_score}</span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: gradeColor }} />
                <span className="text-lg font-bold" style={{ color: gradeColor }}>
                  {isAr ? 'الدرجة' : 'Grade'} {report.health_grade}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{report.period}</p>
            </div>

            {/* Patient Info */}
            <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">{isAr ? 'بيانات المريض' : 'Patient Info'}</h3>
              <div className="space-y-2">
                {[
                  { k: isAr ? 'الاسم' : 'Name', v: report.patient?.name || user?.name },
                  { k: isAr ? 'العمر' : 'Age', v: report.patient?.age ? `${report.patient.age} ${isAr ? 'سنة' : 'yrs'}` : '--' },
                  { k: isAr ? 'الجنس' : 'Gender', v: report.patient?.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : report.patient?.gender === 'female' ? (isAr ? 'أنثى' : 'Female') : '--' },
                  { k: 'BMI', v: report.patient?.bmi ? `${report.patient.bmi} (${report.patient.bmi_category})` : '--' },
                  { k: isAr ? 'فصيلة الدم' : 'Blood Type', v: report.patient?.blood_type || '--' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-white/[0.03] last:border-0">
                    <span className="text-slate-500">{item.k}</span>
                    <span className="text-slate-200 font-medium">{item.v}</span>
                  </div>
                ))}
                {report.patient?.conditions?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500">{isAr ? 'الحالات الصحية' : 'Conditions'}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {report.patient.conditions.map((c: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] border border-rose-500/10">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Brain size={14} />
                {isAr ? 'ملخص الذكاء الاصطناعي' : 'AI Summary'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{report.ai_summary}</p>

              {/* Medications count */}
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Pill size={12} className="text-violet-400" />
                  <span className="text-xs text-slate-400">
                    <span className="text-white font-bold">{report.medications?.total_active || 0}</span> {isAr ? 'أدوية نشطة' : 'active medications'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell size={12} className="text-emerald-400" />
                  <span className="text-xs text-slate-400">
                    <span className="text-white font-bold">{report.exercise_summary?.total_sessions || 0}</span> {isAr ? 'تمرين' : 'sessions'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── VITALS SUMMARY ── */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              {isAr ? 'ملخص المؤشرات الحيوية' : 'Vitals Summary'}
              <span className="ml-auto text-[10px] text-slate-500">
                {report.vitals_summary?.readings_count || 0} {isAr ? 'قراءة' : 'readings'}
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: isAr ? 'نبض القلب' : 'Heart Rate', icon: Heart, color: '#f43f5e', val: report.vitals_summary?.heart_rate?.avg, unit: 'bpm', trend: report.vitals_summary?.heart_rate?.trend, min: report.vitals_summary?.heart_rate?.min, max: report.vitals_summary?.heart_rate?.max },
                { label: isAr ? 'ضغط الدم' : 'Blood Pressure', icon: Gauge, color: '#3b82f6', val: report.vitals_summary?.blood_pressure?.avg_sys && report.vitals_summary?.blood_pressure?.avg_dia ? `${report.vitals_summary.blood_pressure.avg_sys}/${report.vitals_summary.blood_pressure.avg_dia}` : null, unit: 'mmHg', trend: report.vitals_summary?.blood_pressure?.trend },
                { label: 'SpO₂', icon: Wind, color: '#06b6d4', val: report.vitals_summary?.spo2?.avg, unit: '%', trend: report.vitals_summary?.spo2?.trend, min: report.vitals_summary?.spo2?.min },
                { label: isAr ? 'التوتر' : 'Stress', icon: Brain, color: '#a78bfa', val: report.vitals_summary?.stress?.avg, unit: '/10', trend: report.vitals_summary?.stress?.trend },
                { label: isAr ? 'النوم' : 'Sleep', icon: Moon, color: '#818cf8', val: report.vitals_summary?.sleep?.avg_hours, unit: isAr ? 'ساعة' : 'hrs', trend: report.vitals_summary?.sleep?.trend },
                { label: isAr ? 'الخطوات' : 'Steps', icon: Footprints, color: '#34d399', val: report.vitals_summary?.steps?.avg ? Math.round(report.vitals_summary.steps.avg) : null, unit: isAr ? 'يومياً' : '/day', trend: report.vitals_summary?.steps?.trend },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl border border-white/[0.04] bg-slate-800/30 text-center">
                  <item.icon size={16} className="mx-auto mb-1.5" style={{ color: item.color }} />
                  <div className="text-[9px] text-slate-500 mb-1">{item.label}</div>
                  <div className="text-sm font-bold text-white font-mono">{item.val ?? '--'}</div>
                  <div className="text-[8px] text-slate-600">{item.unit}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendIcon trend={item.trend || 'stable'} />
                    <span className="text-[8px] text-slate-500 capitalize">{item.trend || 'stable'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECOMMENDATIONS ── */}
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <Star size={14} />
              {isAr ? 'التوصيات' : 'Recommendations'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.recommendations?.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-white/[0.04] bg-slate-800/20">
                  <ChevronRight size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report meta */}
          <div className="text-center text-[10px] text-slate-600 pb-4">
            {isAr ? 'تم الإنشاء' : 'Generated'}: {report.generated_at ? new Date(report.generated_at).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '--'}
            {' • '}{isAr ? 'الفترة' : 'Period'}: {report.period}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
