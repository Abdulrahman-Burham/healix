import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Dumbbell, Play, Pause, Check, ChevronDown, ChevronRight, ExternalLink,
  AlertTriangle, Shield, Timer, Flame, RotateCcw, ArrowRight, Zap, Clock, X, Eye, Camera
} from 'lucide-react';
import api from '../../services/api';
import ExerciseAnimation, { exerciseLibrary } from '../../components/exercise/ExerciseAnimation';
import LivePoseTracker from '../../components/exercise/LivePoseTracker';
import { HoloParticles, HoloBgMesh, HoloScanLine } from '../../components/hologram/HologramEffects';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const EXERCISE_DATA = [
  {
    id: '1', category: 'anterior_a',
    name: 'Machine Shoulder Press', nameAr: 'ضغط الكتف بالآلة',
    muscleGroup: 'shoulders', poseId: 'shoulder_press', warmupSets: '1~2', sets: 1, reps: '6~8', rest: '3~5',
    alternatives: ['DB Shoulder Press', 'Smith Shoulder Press'],
    alternativesAr: ['ضغط كتف بالدمبل', 'ضغط كتف سميث'],
    tips: 'Try not to arch too much and turn it into a chest press more than shoulder',
    tipsAr: 'حاول متعملش ارش بزياده وتقلبه صدر اكتر من كتف',
    videoUrl: 'https://youtube.com/results?search_query=machine+shoulder+press', completed: false, safe: true,
    imageUrl: '/exercises/shoulder-press.webp',
  },
  {
    id: '2', category: 'anterior_a',
    name: 'Chest Press Machine', nameAr: 'ضغط الصدر بالآلة',
    muscleGroup: 'chest', poseId: 'push_up', warmupSets: '1~2', sets: 3, reps: '6~10', rest: '3~5',
    alternatives: ['DB Flat Press', 'Smith Flat Press'],
    alternativesAr: ['ضغط صدر بالدمبل', 'ضغط صدر سميث'],
    tips: '', tipsAr: '',
    videoUrl: 'https://youtube.com/results?search_query=chest+press+machine', completed: false, safe: true,
    imageUrl: '/exercises/chest-press.webp',
  },
  {
    id: '3', category: 'anterior_a',
    name: 'Hack Squat', nameAr: 'هاك سكوات',
    muscleGroup: 'quadriceps', poseId: 'squat', warmupSets: '1~3', sets: 2, reps: '5~8', rest: '3~5',
    alternatives: ['Smith Squat', 'Leg Press'],
    alternativesAr: ['سكوات سميث', 'ليج بريس'],
    tips: '120 degrees of knee flexion is enough to target quads, but try to go all the way down',
    tipsAr: '120 درجه من ثني الركبه يكفي لاستهداف الكوادز, بس حاول تنزل للاخر',
    videoUrl: 'https://youtube.com/results?search_query=hack+squat', completed: false, safe: true,
    imageUrl: '/exercises/hack-squat.webp',
  },
  {
    id: '4', category: 'anterior_a',
    name: 'Machine Lateral Raises', nameAr: 'رفع جانبي بالآلة',
    muscleGroup: 'shoulders', poseId: 'lateral_raise', warmupSets: '1~2', sets: 3, reps: '6~8', rest: '3~5',
    alternatives: ['Cable Lateral Raises', 'DB Lateral Raises'],
    alternativesAr: ['رفع جانبي بالكابل', 'رفع جانبي بالدمبل'],
    tips: 'Try to make the movement come from your shoulder only, not your whole body',
    tipsAr: 'حاول علي قد متقدر الحركه تبقي طالعه من كتفك لوحده مش جسمك كله',
    videoUrl: 'https://youtube.com/results?search_query=machine+lateral+raises', completed: false, safe: true,
    imageUrl: '/exercises/lateral-raise.webp',
  },
  {
    id: '5', category: 'anterior_a',
    name: 'Overhead Extension', nameAr: 'تمديد فوق الرأس',
    muscleGroup: 'triceps', poseId: 'bicep_curl', warmupSets: '0', sets: 2, reps: '6~10', rest: '3~5',
    alternatives: ['DB Skull Crusher'],
    alternativesAr: ['سكل كراشر بالدمبل'],
    tips: 'If your elbow hurts, do pushdowns instead',
    tipsAr: 'لو كوعك وجعك العب بوش داون عادي جدااااا',
    videoUrl: 'https://youtube.com/results?search_query=overhead+extension+triceps', completed: false, safe: true,
    imageUrl: '/exercises/overhead-ext.webp',
  },
  {
    id: '6', category: 'anterior_a',
    name: 'Butterfly', nameAr: 'الفراشة',
    muscleGroup: 'chest', poseId: 'push_up', warmupSets: '1~2', sets: 1, reps: '6~10', rest: '',
    alternatives: [],
    alternativesAr: [],
    tips: '', tipsAr: '',
    videoUrl: 'https://youtube.com/results?search_query=butterfly+machine+chest', completed: false, safe: true,
    imageUrl: '/exercises/butterfly.webp',
  },
  {
    id: '7', category: 'anterior_a',
    name: 'Lat Pulldown Crunches', nameAr: 'كرنشز على الكابل',
    muscleGroup: 'abs', poseId: 'push_up', warmupSets: '0', sets: 2, reps: '6~10', rest: '3~5',
    alternatives: ['Cable Crunch'],
    alternativesAr: ['كرنش بالكابل'],
    tips: 'Focus on the movement coming from flexing/extending your spine, not your whole back moving',
    tipsAr: 'ركز ان الحركه تبقي طالعه من تني وفرد عمودك الفقري مش ضهرك كله بيتحرك',
    videoUrl: 'https://youtube.com/results?search_query=cable+crunch', completed: false, safe: true,
    imageUrl: '/exercises/cable-crunch.webp',
  },
  {
    id: '8', category: 'anterior_a',
    name: 'Leg Extension', nameAr: 'تمديد الأرجل',
    muscleGroup: 'quadriceps', poseId: 'squat', warmupSets: '1~2', sets: 1, reps: '8~12', rest: '3~5',
    alternatives: ['Banded Leg Extension'],
    alternativesAr: ['تمديد أرجل بالباند'],
    tips: 'If the machine is not available, do banded leg extensions',
    tipsAr: 'لو الجهاز مش موجود العب BANDED LEG EXTENSION',
    videoUrl: 'https://youtube.com/results?search_query=leg+extension', completed: false, safe: true,
    imageUrl: '/exercises/leg-ext.webp',
  },
];

export default function Exercises() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [exercises, setExercises] = useState(EXERCISE_DATA);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [safeLoadIndex, setSafeLoadIndex] = useState(85);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [filter, setFilter] = useState('all');
  const [animationExercise, setAnimationExercise] = useState<typeof exerciseLibrary[0] | null>(null);
  const [showLiveTracker, setShowLiveTracker] = useState<string | false>(false);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWorkoutActive) {
      timer = setInterval(() => setWorkoutTime(p => p + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isWorkoutActive]);

  const loadExercises = async () => {
    try {
      const res = await api.get('/exercises/today');
      if (res.data?.length) setExercises(res.data);
    } catch {}
  };

  const toggleComplete = (id: string) => {
    setExercises(exs => exs.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const completed = exercises.filter(e => e.completed).length;
  const total = exercises.length;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const muscleGroups = [...new Set(exercises.map(e => e.muscleGroup))];

  return (
    <motion.div className="page-container relative" initial="initial" animate="animate">
      <HoloBgMesh className="opacity-30" />
      <HoloParticles count={10} color="#10b981" />
      {/* Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Dumbbell className="text-healix-400" size={28} />
            <span className="holo-text">{t('exercises.title')}</span>
          </h1>
          <p className="section-subtitle">{t('exercises.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Tracking Button */}
          <button
            onClick={() => setShowLiveTracker('squat')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all font-medium text-sm"
          >
            <Camera size={16} />
            {language === 'ar' ? '🎯 تتبع مباشر' : '🎯 Live Tracking'}
          </button>
          {/* Safe Load Index */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 holo-corners">
            <Shield size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              {t('exercises.safeLoad')}: {safeLoadIndex}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Workout Control Bar */}
      <motion.div {...fadeInUp} className="holo-card holo-scan p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-healix-400" />
            <span className="text-xl font-mono font-bold text-white">{formatTime(workoutTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm text-gray-300">
              {completed}/{total} {language === 'ar' ? 'مكتمل' : 'completed'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <span className="text-sm text-gray-300">~{completed * 45} {t('common.kcal')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isWorkoutActive ? (
            <button onClick={() => setIsWorkoutActive(true)} className="btn-primary flex items-center gap-2">
              <Play size={18} />
              {t('exercises.startWorkout')}
            </button>
          ) : (
            <>
              <button onClick={() => setIsWorkoutActive(false)} className="btn-secondary flex items-center gap-2">
                <Pause size={18} />
                {t('exercises.pauseWorkout')}
              </button>
              <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); }} className="btn-primary flex items-center gap-2">
                <Check size={18} />
                {t('exercises.finishWorkout')}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div {...fadeInUp} className="progress-bar h-3">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Muscle Group Filter */}
      <motion.div {...fadeInUp} className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' ? 'holo-badge' : 'bg-dark-700/40 text-gray-400 border border-white/5 hover:border-white/10'
          }`}>
          {language === 'ar' ? 'الكل' : 'All'}
        </button>
        {muscleGroups.map(mg => (
          <button key={mg} onClick={() => setFilter(mg)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === mg ? 'holo-badge' : 'bg-dark-700/40 text-gray-400 border border-white/5 hover:border-white/10'
            }`}>
            {mg}
          </button>
        ))}
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-3">
        {exercises
          .filter(e => filter === 'all' || e.muscleGroup === filter)
          .map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`holo-card holo-corners overflow-hidden transition-all ${
              ex.completed ? 'border-emerald-500/20 bg-emerald-500/5' : ''
            } ${!ex.safe ? 'border-rose-500/20 bg-rose-500/5' : ''}`}
          >
            {/* Exercise Header */}
            <div
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-600/20 transition-colors"
              onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  ex.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-dark-600 text-gray-400 border border-white/10 hover:border-healix-500/30'
                }`}
              >
                {ex.completed ? <Check size={18} /> : <span className="text-sm font-bold">{i + 1}</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${ex.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                    {language === 'ar' ? ex.nameAr : ex.name}
                  </h3>
                  {!ex.safe && (
                    <span className="badge-danger flex items-center gap-1">
                      <AlertTriangle size={10} /> {t('exercises.contraindication')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{ex.muscleGroup}</p>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
                <div className="text-center">
                  <div className="text-white font-semibold">{ex.warmupSets}</div>
                  <div className="text-[10px]">{t('exercises.warmup')}</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{ex.sets}</div>
                  <div className="text-[10px]">{t('exercises.sets')}</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{ex.reps}</div>
                  <div className="text-[10px]">{t('exercises.reps')}</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{ex.rest || '-'}</div>
                  <div className="text-[10px]">{t('exercises.rest')} ({t('common.minutes')})</div>
                </div>
              </div>

              <ChevronDown size={18} className={`text-gray-500 transition-transform ${expandedId === ex.id ? 'rotate-180' : ''}`} />
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedId === ex.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
                    {/* Mobile Stats */}
                    <div className="sm:hidden grid grid-cols-4 gap-2">
                      {[
                        { label: t('exercises.warmup'), value: ex.warmupSets },
                        { label: t('exercises.sets'), value: ex.sets },
                        { label: t('exercises.reps'), value: ex.reps },
                        { label: t('exercises.rest'), value: ex.rest || '-' },
                      ].map((s, i) => (
                        <div key={i} className="text-center p-2 rounded-lg bg-dark-600/40">
                          <div className="text-white font-semibold text-sm">{s.value}</div>
                          <div className="text-[10px] text-gray-500">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    {(ex.tips || ex.tipsAr) && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-2">
                          <Zap size={14} className="text-amber-400 mt-0.5" />
                          <p className="text-sm text-amber-200">
                            {language === 'ar' ? ex.tipsAr : ex.tips}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Alternatives */}
                    {ex.alternatives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <RotateCcw size={14} /> {t('exercises.alternatives')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(language === 'ar' ? ex.alternativesAr : ex.alternatives).map((alt, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-dark-600/60 text-sm text-gray-300 border border-white/5">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2 text-sm">
                        <ExternalLink size={14} />
                        {t('exercises.watchVideo')}
                      </a>
                      <button
                        onClick={() => {
                          const match = exerciseLibrary.find(el =>
                            el.name.toLowerCase().includes(ex.muscleGroup) ||
                            ex.name.toLowerCase().includes(el.name.split(' ')[0].toLowerCase())
                          ) || exerciseLibrary[0];
                          setAnimationExercise(match);
                        }}
                        className="btn-secondary flex items-center gap-2 text-sm !border-healix-500/30 !text-healix-400"
                      >
                        <Eye size={14} />
                        {language === 'ar' ? 'أنيميشن التنفيذ' : 'Execution Animation'}
                      </button>
                      <button
                        onClick={() => setShowLiveTracker(ex.poseId || 'squat')}
                        className="btn-secondary flex items-center gap-2 text-sm !border-emerald-500/30 !text-emerald-400"
                      >
                        <Camera size={14} />
                        {language === 'ar' ? '🎯 تتبع مباشر' : '🎯 Live Form'}
                      </button>
                      <button
                        onClick={() => toggleComplete(ex.id)}
                        className={`flex items-center gap-2 text-sm ${
                          ex.completed ? 'btn-secondary' : 'btn-primary'
                        }`}
                      >
                        <Check size={14} />
                        {ex.completed ? t('exercises.completed') : t('exercises.markComplete')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Live Pose Tracker Modal */}
      <AnimatePresence>
        {showLiveTracker && (
          <LivePoseTracker
            language={language}
            initialExercise={typeof showLiveTracker === 'string' ? showLiveTracker : undefined}
            onClose={() => setShowLiveTracker(false)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Animation Modal */}
      <AnimatePresence>
        {animationExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setAnimationExercise(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-3xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setAnimationExercise(null)}
                className="absolute -top-3 -right-3 [dir=rtl]:-left-3 [dir=rtl]:right-auto z-20 w-9 h-9 rounded-full bg-dark-600 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-dark-500 hover:border-white/20 transition-all shadow-lg shadow-black/30"
              >
                <X size={16} />
              </button>
              <div className="holo-card holo-scan !overflow-visible">
                <ExerciseAnimation exercise={animationExercise} onClose={() => setAnimationExercise(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Animation Library Section */}
      <motion.div {...fadeInUp} className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="text-healix-400" size={20} />
          {language === 'ar' ? 'مكتبة أنيميشن التمارين' : 'Exercise Animation Library'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {exerciseLibrary.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setAnimationExercise(ex)}
              className="glass-card p-4 text-left hover:border-healix-500/30 transition-all group holo-corners perspective-child"
            >
              <div className="w-10 h-10 rounded-xl bg-healix-500/10 flex items-center justify-center mb-3 group-hover:bg-healix-500/20 transition-colors">
                <Dumbbell size={18} className="text-healix-400" />
              </div>
              <h4 className="text-sm font-semibold text-white">{language === 'ar' ? ex.nameAr : ex.name}</h4>
              <p className="text-[11px] text-gray-500 mt-1">{language === 'ar' ? ex.musclesAr : ex.muscles}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-healix-400">
                <Play size={10} /> {language === 'ar' ? 'شاهد الأنيميشن' : 'Watch Animation'}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
