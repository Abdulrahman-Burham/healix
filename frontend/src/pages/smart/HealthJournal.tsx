import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  BookOpen, Plus, Send, Smile, SmilePlus, Meh, Frown, AlertCircle,
  Zap, Activity, Brain, TrendingUp, Calendar, Trash2, Loader2,
  ChevronRight, BarChart3,
} from 'lucide-react';
import api from '../../services/api';

const MOODS = [
  { value: 'happy', icon: '😊', label: 'Happy', labelAr: 'سعيد', color: '#22c55e' },
  { value: 'good', icon: '🙂', label: 'Good', labelAr: 'جيد', color: '#3b82f6' },
  { value: 'neutral', icon: '😐', label: 'Neutral', labelAr: 'عادي', color: '#94a3b8' },
  { value: 'sad', icon: '😔', label: 'Sad', labelAr: 'حزين', color: '#8b5cf6' },
  { value: 'anxious', icon: '😰', label: 'Anxious', labelAr: 'قلق', color: '#f59e0b' },
  { value: 'stressed', icon: '😤', label: 'Stressed', labelAr: 'متوتر', color: '#ef4444' },
];

export default function HealthJournal() {
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [entries, setEntries] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'history' | 'insights'>('write');

  // Form
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [energy, setEnergy] = useState(5);
  const [pain, setPain] = useState(0);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, insightsRes] = await Promise.allSettled([
        api.get('/smart/journal'),
        api.get('/smart/journal/insights'),
      ]);
      if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.data);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setLastResult(null);
    try {
      const res = await api.post('/smart/journal', {
        content: content.trim(),
        mood,
        energy_level: energy,
        pain_level: pain,
      });
      setLastResult(res.data);
      setContent('');
      setMood('neutral');
      setEnergy(5);
      setPain(0);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await api.delete(`/smart/journal/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const moodObj = MOODS.find(m => m.value === mood);

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-amber-400" />
          </div>
          {isAr ? 'المذكرة الصحية الذكية' : 'AI Health Journal'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAr ? 'سجّل يومك واحصل على تحليل ذكي لحالتك الصحية' : 'Log your day and get AI-powered health insights'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/30 border border-white/[0.04] mb-6 max-w-md">
        {[
          { key: 'write', label: isAr ? 'كتابة' : 'Write', icon: Plus },
          { key: 'history', label: isAr ? 'السجل' : 'History', icon: Calendar },
          { key: 'insights', label: isAr ? 'تحليلات' : 'Insights', icon: BarChart3 },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ WRITE TAB ═══ */}
        {activeTab === 'write' && (
          <motion.div key="write" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Mood Selector */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">{isAr ? 'كيف تشعر اليوم؟' : 'How are you feeling?'}</h3>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => setMood(m.value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all border ${
                        mood === m.value
                          ? 'border-opacity-30'
                          : 'bg-slate-800/30 text-slate-500 border-white/[0.04] hover:border-white/10'
                      }`}
                      style={mood === m.value ? {
                        backgroundColor: `${m.color}10`,
                        color: m.color,
                        borderColor: `${m.color}25`,
                      } : {}}>
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-[9px]">{isAr ? m.labelAr : m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1"><Zap size={11} className="text-yellow-400" /> {isAr ? 'مستوى الطاقة' : 'Energy Level'}</span>
                    <span className="text-white font-mono font-bold">{energy}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-yellow-400"
                    style={{ background: `linear-gradient(to right, #eab308 0%, #eab308 ${energy * 10}%, #1e293b ${energy * 10}%, #1e293b 100%)` }} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1"><Activity size={11} className="text-rose-400" /> {isAr ? 'مستوى الألم' : 'Pain Level'}</span>
                    <span className="text-white font-mono font-bold">{pain}/10</span>
                  </div>
                  <input type="range" min="0" max="10" value={pain} onChange={e => setPain(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-rose-400"
                    style={{ background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${pain * 10}%, #1e293b ${pain * 10}%, #1e293b 100%)` }} />
                </div>
              </div>

              {/* Journal Text */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{isAr ? 'اكتب عن يومك' : 'Write about your day'}</h3>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder={isAr ? 'كيف كان يومك؟ هل لاحظت أي تغييرات في صحتك؟...' : 'How was your day? Any health changes you noticed?...'}
                  rows={6}
                  className="w-full px-3 py-3 rounded-xl bg-slate-800/50 border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/30 resize-none leading-relaxed" />
                <button onClick={submit} disabled={!content.trim() || submitting}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 text-amber-400 font-semibold text-sm hover:from-amber-500/30 hover:to-orange-500/30 transition-all disabled:opacity-40">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'حفظ وتحليل' : 'Save & Analyze')}
                </button>
              </div>
            </div>

            {/* AI Analysis Result */}
            <div>
              {lastResult?.ai_analysis ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <Brain size={14} />
                    {isAr ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'المشاعر' : 'Sentiment'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lastResult.ai_analysis.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                      lastResult.ai_analysis.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {lastResult.ai_analysis.sentiment}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'المواضيع الرئيسية' : 'Key Themes'}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lastResult.ai_analysis.key_themes?.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/10">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'رؤى صحية' : 'Health Insights'}</span>
                    <p className="text-xs text-slate-300 mt-1">{lastResult.ai_analysis.health_insights}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-400 font-semibold">💡 {isAr ? 'اقتراح' : 'Suggestion'}</span>
                    <p className="text-xs text-slate-300 mt-1">{lastResult.ai_analysis.suggestion}</p>
                  </div>

                  <p className="text-[10px] text-slate-500">{lastResult.ai_analysis.mood_analysis}</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center rounded-xl border border-white/[0.04] bg-slate-900/30">
                  <BookOpen size={40} className="text-slate-700 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-500">{isAr ? 'اكتب تدوينتك واحصل على تحليل فوري' : 'Write your entry to get instant analysis'}</h3>
                  <p className="text-[11px] text-slate-600 mt-1">{isAr ? 'الذكاء الاصطناعي سيحلل مشاعرك ويقدم نصائح' : 'AI will analyze your feelings and provide suggestions'}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isAr ? 'لا توجد تدوينات بعد' : 'No journal entries yet'}</p>
              </div>
            ) : entries.map((entry, i) => {
              const moodData = MOODS.find(m => m.value === entry.mood);
              return (
                <motion.div key={entry._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{moodData?.icon || '😐'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{isAr ? moodData?.labelAr : moodData?.label}</span>
                        <span className="text-[9px] text-slate-600">
                          ⚡ {entry.energy_level}/10 {entry.pain_level > 0 && `• 🩹 ${entry.pain_level}/10`}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-600">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        }) : ''}
                      </span>
                    </div>
                    <button onClick={() => deleteEntry(entry._id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{entry.content}</p>
                  {entry.ai_analysis && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-white/[0.04]">
                      {entry.ai_analysis.key_themes?.map((t: string, j: number) => (
                        <span key={j} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">{t}</span>
                      ))}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        entry.ai_analysis.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                        entry.ai_analysis.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {entry.ai_analysis.sentiment}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ INSIGHTS TAB ═══ */}
        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {insights && insights.total_entries > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Overview */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">{isAr ? 'نظرة عامة' : 'Overview'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: isAr ? 'إجمالي التدوينات' : 'Total Entries', val: insights.total_entries, color: '#06b6d4' },
                      { label: isAr ? 'هذا الأسبوع' : 'This Week', val: insights.entries_this_week, color: '#3b82f6' },
                      { label: isAr ? 'متوسط الطاقة' : 'Avg Energy', val: `${insights.avg_energy}/10`, color: '#eab308' },
                      { label: isAr ? 'متوسط الألم' : 'Avg Pain', val: `${insights.avg_pain}/10`, color: '#ef4444' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-white/[0.04] text-center">
                        <div className="text-[9px] text-slate-500">{item.label}</div>
                        <div className="text-lg font-bold font-mono" style={{ color: item.color }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Distribution */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">{isAr ? 'توزيع المشاعر' : 'Mood Distribution'}</h3>
                  <div className="space-y-2">
                    {Object.entries(insights.mood_distribution || {}).map(([moodKey, count]: [string, any]) => {
                      const m = MOODS.find(mo => mo.value === moodKey);
                      const pct = insights.total_entries > 0 ? (count / insights.total_entries) * 100 : 0;
                      return (
                        <div key={moodKey} className="flex items-center gap-2">
                          <span className="text-sm w-6">{m?.icon || '😐'}</span>
                          <span className="text-[10px] text-slate-400 w-14">{isAr ? m?.labelAr : m?.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: m?.color || '#94a3b8' }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.04] text-center">
                    <span className="text-[10px] text-slate-500">{isAr ? 'المشاعر السائدة' : 'Dominant Mood'}: </span>
                    <span className="text-xs font-bold" style={{ color: MOODS.find(m => m.value === insights.dominant_mood)?.color }}>
                      {MOODS.find(m => m.value === insights.dominant_mood)?.icon} {isAr
                        ? MOODS.find(m => m.value === insights.dominant_mood)?.labelAr
                        : MOODS.find(m => m.value === insights.dominant_mood)?.label}
                    </span>
                  </div>
                </div>

                {/* Common Themes */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5 md:col-span-2">
                  <h3 className="text-sm font-semibold text-white mb-3">{isAr ? 'المواضيع الشائعة' : 'Common Themes'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(insights.common_themes || {}).map(([theme, count]: [string, any]) => (
                      <span key={theme}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/15 inline-flex items-center gap-1.5">
                        {theme}
                        <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isAr ? 'أضف تدوينات للحصول على تحليلات' : 'Add entries to see insights'}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
