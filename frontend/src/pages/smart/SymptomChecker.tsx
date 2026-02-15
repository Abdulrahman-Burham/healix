import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Stethoscope, AlertTriangle, CheckCircle, Clock, Plus, X,
  Activity, ShieldAlert, Home, ChevronRight, Loader2, Trash2,
} from 'lucide-react';
import api from '../../services/api';

const COMMON_SYMPTOMS = {
  en: [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Sore Throat', 'Back Pain',
    'Joint Pain', 'Muscle Pain', 'Stomach Pain', 'Vomiting',
    'Insomnia', 'Anxiety', 'Weakness', 'Loss of Appetite',
  ],
  ar: [
    'صداع', 'حمى', 'كحة', 'تعب', 'غثيان', 'دوخة',
    'ألم في الصدر', 'ضيق في التنفس', 'التهاب الحلق', 'ألم في الظهر',
    'ألم في المفاصل', 'ألم في العضلات', 'ألم في المعدة', 'قيء',
    'أرق', 'قلق', 'ضعف عام', 'فقدان الشهية',
  ],
};

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', labelAr: 'خفيفة', color: '#34d399' },
  { value: 'moderate', label: 'Moderate', labelAr: 'متوسطة', color: '#fbbf24' },
  { value: 'severe', label: 'Severe', labelAr: 'شديدة', color: '#f43f5e' },
];

const URGENCY_COLORS: Record<string, string> = {
  emergency: '#ef4444',
  urgent: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

export default function SymptomChecker() {
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [customSymptom, setCustomSymptom] = useState('');

  const symptoms = COMMON_SYMPTOMS[isAr ? 'ar' : 'en'];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const analyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/smart/symptom-checker', {
        symptoms: selectedSymptoms,
        severity,
        duration: duration || undefined,
        additional_notes: notes || undefined,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setSeverity('moderate');
    setDuration('');
    setNotes('');
    setResult(null);
  };

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/20 flex items-center justify-center">
            <Stethoscope size={20} className="text-rose-400" />
          </div>
          {isAr ? 'فاحص الأعراض الذكي' : 'AI Symptom Checker'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAr ? 'أدخل أعراضك واحصل على تحليل فوري مدعوم بالذكاء الاصطناعي' : 'Enter your symptoms and get an instant AI-powered analysis'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── INPUT SECTION ── */}
        <div className="space-y-5">
          {/* Symptom Selection */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              {isAr ? 'اختر الأعراض' : 'Select Symptoms'}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {symptoms.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedSymptoms.includes(s)
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-white/[0.05] hover:border-white/10 hover:text-white'
                  }`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Custom symptom input */}
            <div className="flex gap-2">
              <input
                value={customSymptom}
                onChange={e => setCustomSymptom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
                placeholder={isAr ? 'أضف عرض آخر...' : 'Add custom symptom...'}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.06] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/30"
              />
              <button onClick={addCustomSymptom}
                className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs hover:bg-cyan-500/20 transition-all">
                <Plus size={14} />
              </button>
            </div>

            {/* Selected symptoms chips */}
            {selectedSymptoms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedSymptoms.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/15">
                    {s}
                    <X size={10} className="cursor-pointer hover:text-white" onClick={() => toggleSymptom(s)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Severity */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              {isAr ? 'شدة الأعراض' : 'Severity Level'}
            </h3>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSeverity(opt.value)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                    severity === opt.value
                      ? 'border-opacity-30'
                      : 'bg-slate-800/50 text-slate-400 border-white/[0.05]'
                  }`}
                  style={severity === opt.value ? {
                    backgroundColor: `${opt.color}15`,
                    color: opt.color,
                    borderColor: `${opt.color}30`,
                  } : {}}>
                  {isAr ? opt.labelAr : opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Notes */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-sm p-5 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'مدة الأعراض' : 'Duration'}</label>
              <input value={duration} onChange={e => setDuration(e.target.value)}
                placeholder={isAr ? 'مثال: يومين' : 'e.g., 2 days'}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.06] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={isAr ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.06] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 resize-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={analyze} disabled={selectedSymptoms.length === 0 || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/20 text-rose-400 font-semibold text-sm hover:from-rose-500/30 hover:to-orange-500/30 transition-all disabled:opacity-40">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Stethoscope size={16} />}
              {loading ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'تحليل الأعراض' : 'Analyze Symptoms')}
            </button>
            {result && (
              <button onClick={reset}
                className="px-4 py-3 rounded-xl bg-slate-800/50 border border-white/[0.06] text-slate-400 text-sm hover:text-white transition-all">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── RESULTS SECTION ── */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Urgency Banner */}
              <div className="rounded-xl border p-4 flex items-center gap-3"
                style={{
                  borderColor: `${URGENCY_COLORS[result.urgency_level] || '#22c55e'}25`,
                  background: `${URGENCY_COLORS[result.urgency_level] || '#22c55e'}08`,
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${URGENCY_COLORS[result.urgency_level]}15` }}>
                  {result.urgency_level === 'emergency' ? <AlertTriangle size={22} style={{ color: URGENCY_COLORS[result.urgency_level] }} /> :
                   result.urgency_level === 'urgent' ? <ShieldAlert size={22} style={{ color: URGENCY_COLORS[result.urgency_level] }} /> :
                   <CheckCircle size={22} style={{ color: URGENCY_COLORS[result.urgency_level] }} />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: URGENCY_COLORS[result.urgency_level] }}>
                    {isAr
                      ? result.urgency_level === 'emergency' ? 'طوارئ' : result.urgency_level === 'urgent' ? 'عاجل' : result.urgency_level === 'moderate' ? 'متوسط' : 'منخفض'
                      : result.urgency_level.toUpperCase()
                    } {isAr ? 'الأهمية' : 'URGENCY'}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{result.summary}</p>
                </div>
              </div>

              {/* Possible Conditions */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Stethoscope size={14} className="text-cyan-400" />
                  {isAr ? 'الحالات المحتملة' : 'Possible Conditions'}
                </h3>
                <div className="space-y-2">
                  {result.possible_conditions?.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.04] bg-slate-800/30">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        c.probability === 'high' ? 'bg-rose-400' : c.probability === 'medium' ? 'bg-amber-400' : 'bg-slate-500'
                      }`} />
                      <div>
                        <div className="text-xs font-semibold text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.description}</div>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          c.probability === 'high' ? 'bg-rose-500/10 text-rose-400' :
                          c.probability === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {isAr ? (c.probability === 'high' ? 'احتمال عالي' : c.probability === 'medium' ? 'احتمال متوسط' : 'احتمال منخفض') : c.probability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Recommendation */}
              {result.should_see_doctor && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4 flex items-center gap-3">
                  <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
                  <span className="text-xs text-rose-300 font-medium">
                    {isAr ? 'يُنصح بزيارة الطبيب في أقرب وقت' : 'It is recommended to see a doctor as soon as possible'}
                  </span>
                </div>
              )}

              {/* Recommendations */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">{isAr ? 'التوصيات' : 'Recommendations'}</h3>
                <div className="space-y-2">
                  {result.recommendations?.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight size={12} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Remedies */}
              {result.home_remedies?.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Home size={14} className="text-emerald-400" />
                    {isAr ? 'العلاجات المنزلية' : 'Home Remedies'}
                  </h3>
                  <div className="space-y-1.5">
                    {result.home_remedies.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Signs */}
              {result.warning_signs?.length > 0 && (
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {isAr ? 'علامات تحذيرية يجب مراقبتها' : 'Warning Signs to Watch'}
                  </h3>
                  <div className="space-y-1.5">
                    {result.warning_signs.map((w: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-300/80">
                        <span>⚠</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl border border-white/[0.04] bg-slate-900/30">
              <Stethoscope size={48} className="text-slate-700 mb-4" />
              <h3 className="text-sm font-semibold text-slate-500">{isAr ? 'اختر أعراضك وابدأ التحليل' : 'Select symptoms to begin analysis'}</h3>
              <p className="text-[11px] text-slate-600 mt-1 max-w-[250px]">
                {isAr ? 'سيقوم الذكاء الاصطناعي بتحليل أعراضك وتقديم تقييم شامل' : 'AI will analyze your symptoms and provide a comprehensive assessment'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
