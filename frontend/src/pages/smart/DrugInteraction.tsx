import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Pill, AlertTriangle, CheckCircle, ShieldAlert, Search,
  ChevronRight, Loader2, Clock, Apple, XCircle,
} from 'lucide-react';
import api from '../../services/api';

const SEVERITY_COLORS: Record<string, string> = {
  severe: '#ef4444',
  moderate: '#f59e0b',
  mild: '#22c55e',
};

export default function DrugInteraction() {
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [drugName, setDrugName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkInteraction = async () => {
    if (!drugName.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/smart/drug-interactions', {
        drug_name: drugName.trim(),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
            <Pill size={20} className="text-violet-400" />
          </div>
          {isAr ? 'فاحص التفاعلات الدوائية' : 'Drug Interaction Checker'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAr ? 'تحقق من التفاعلات قبل تناول أي دواء جديد' : 'Check for interactions before taking any new medication'}
        </p>
      </div>

      {/* Search Input */}
      <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-sm p-5 mb-6">
        <label className="text-xs text-slate-400 mb-2 block">
          {isAr ? 'اسم الدواء الجديد' : 'New Medication Name'}
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={drugName}
              onChange={e => setDrugName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkInteraction()}
              placeholder={isAr ? 'مثال: Aspirin, Ibuprofen...' : 'e.g., Aspirin, Ibuprofen...'}
              className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-800/50 border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/30"
            />
          </div>
          <button onClick={checkInteraction} disabled={!drugName.trim() || loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-500/20 text-violet-400 font-semibold text-sm hover:from-violet-500/30 hover:to-blue-500/30 transition-all disabled:opacity-40 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            {isAr ? 'فحص' : 'Check'}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Safety Badge */}
            <div className={`rounded-xl border p-5 flex items-center gap-4 ${
              result.safe_to_take
                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                : 'border-rose-500/20 bg-rose-500/[0.05]'
            }`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                result.safe_to_take ? 'bg-emerald-500/15' : 'bg-rose-500/15'
              }`}>
                {result.safe_to_take
                  ? <CheckCircle size={28} className="text-emerald-400" />
                  : <XCircle size={28} className="text-rose-400" />}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${result.safe_to_take ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.safe_to_take
                    ? (isAr ? 'آمن للاستخدام' : 'Safe to Take')
                    : (isAr ? 'تحذير — مراجعة مطلوبة' : 'Warning — Review Required')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{result.summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Interactions */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400" />
                  {isAr ? 'التفاعلات الدوائية' : 'Drug Interactions'}
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {result.interactions?.length || 0}
                  </span>
                </h3>
                {result.interactions?.length > 0 ? (
                  <div className="space-y-3">
                    {result.interactions.map((int: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-white/[0.04] bg-slate-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[int.severity] || '#f59e0b' }} />
                          <span className="text-xs font-semibold text-white">{int.drug_pair}</span>
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                            style={{ color: SEVERITY_COLORS[int.severity], backgroundColor: `${SEVERITY_COLORS[int.severity]}15` }}>
                            {int.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{int.description}</p>
                        <div className="flex items-start gap-1.5 mt-2 text-[10px] text-cyan-400">
                          <ChevronRight size={10} className="mt-0.5 flex-shrink-0" />
                          <span>{int.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500/50" />
                    <p className="text-xs">{isAr ? 'لا توجد تفاعلات معروفة' : 'No known interactions found'}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Contraindications */}
                {result.contraindications?.length > 0 && (
                  <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-4">
                    <h3 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                      <ShieldAlert size={14} />
                      {isAr ? 'موانع الاستخدام' : 'Contraindications'}
                    </h3>
                    <div className="space-y-1.5">
                      {result.contraindications.map((c: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-rose-300/80">
                          <XCircle size={10} className="mt-0.5 flex-shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergy Warnings */}
                {result.allergy_warnings?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
                    <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      {isAr ? 'تحذيرات الحساسية' : 'Allergy Warnings'}
                    </h3>
                    {result.allergy_warnings.map((w: string, i: number) => (
                      <p key={i} className="text-xs text-amber-300/80 mt-1">⚠ {w}</p>
                    ))}
                  </div>
                )}

                {/* Timing Advice */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    {isAr ? 'نصائح التوقيت' : 'Timing Advice'}
                  </h3>
                  <p className="text-xs text-slate-400">{result.timing_advice}</p>
                </div>

                {/* Food Interactions */}
                {result.food_interactions?.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Apple size={14} className="text-orange-400" />
                      {isAr ? 'تفاعلات مع الطعام' : 'Food Interactions'}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.food_interactions.map((f: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] border border-orange-500/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : !loading ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Pill size={36} className="text-violet-500/40" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500">{isAr ? 'أدخل اسم الدواء للفحص' : 'Enter a drug name to check'}</h3>
            <p className="text-[11px] text-slate-600 mt-1 max-w-[300px]">
              {isAr ? 'سيتم فحص التفاعلات مع أدويتك الحالية وحالاتك الصحية' : 'We\'ll check interactions with your current medications and health conditions'}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
