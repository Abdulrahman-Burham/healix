import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  UtensilsCrossed, Flame, Droplets, Target, RefreshCw,
  ChevronRight, Loader2, Apple, Beef, Wheat, Egg,
} from 'lucide-react';
import api from '../../services/api';

const GOALS = [
  { value: 'balanced', label: 'Balanced', labelAr: 'متوازن', icon: '⚖️', color: '#06b6d4' },
  { value: 'weight_loss', label: 'Weight Loss', labelAr: 'فقدان الوزن', icon: '🔥', color: '#f43f5e' },
  { value: 'muscle_gain', label: 'Muscle Gain', labelAr: 'بناء العضلات', icon: '💪', color: '#8b5cf6' },
  { value: 'diabetes_friendly', label: 'Diabetes Friendly', labelAr: 'مناسب للسكري', icon: '🩺', color: '#3b82f6' },
  { value: 'heart_healthy', label: 'Heart Healthy', labelAr: 'صحة القلب', icon: '❤️', color: '#ef4444' },
];

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎',
};

export default function MealPlanner() {
  const { language } = useUIStore();
  const isAr = language === 'ar';

  const [goal, setGoal] = useState('balanced');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [caloriesTarget, setCaloriesTarget] = useState('');
  const [excludeFoods, setExcludeFoods] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await api.post('/smart/meal-planner', {
        goal,
        meals_per_day: mealsPerDay,
        calories_target: caloriesTarget ? parseInt(caloriesTarget) : undefined,
        exclude_foods: excludeFoods ? excludeFoods.split(',').map(f => f.trim()) : [],
      });
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goalColor = GOALS.find(g => g.value === goal)?.color || '#06b6d4';

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <UtensilsCrossed size={20} className="text-emerald-400" />
          </div>
          {isAr ? 'مخطط الوجبات الذكي' : 'Smart Meal Planner'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAr ? 'خطة وجبات مخصصة حسب أهدافك وحالتك الصحية' : 'Personalized meal plan based on your goals and health profile'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── CONFIG ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Goal */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">{isAr ? 'الهدف' : 'Goal'}</h3>
            <div className="space-y-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    goal === g.value
                      ? 'border-opacity-30'
                      : 'bg-slate-800/30 text-slate-400 border-white/[0.04] hover:border-white/10'
                  }`}
                  style={goal === g.value ? {
                    backgroundColor: `${g.color}10`,
                    color: g.color,
                    borderColor: `${g.color}30`,
                  } : {}}>
                  <span className="text-base">{g.icon}</span>
                  {isAr ? g.labelAr : g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-5 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'عدد الوجبات' : 'Meals per Day'}</label>
              <div className="flex gap-2">
                {[3, 4, 5].map(n => (
                  <button key={n} onClick={() => setMealsPerDay(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border ${
                      mealsPerDay === n
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800/50 text-slate-400 border-white/[0.04]'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'السعرات المستهدفة (اختياري)' : 'Calorie Target (optional)'}</label>
              <input value={caloriesTarget} onChange={e => setCaloriesTarget(e.target.value)}
                placeholder={isAr ? 'مثال: 2000' : 'e.g., 2000'}
                type="number"
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.06] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'استبعاد أطعمة' : 'Exclude Foods'}</label>
              <input value={excludeFoods} onChange={e => setExcludeFoods(e.target.value)}
                placeholder={isAr ? 'مفصولة بفواصل' : 'comma separated'}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/[0.06] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 font-semibold text-sm hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-40">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? (isAr ? 'جاري التحضير...' : 'Generating...') : (isAr ? 'إنشاء خطة الوجبات' : 'Generate Meal Plan')}
          </button>
        </div>

        {/* ── RESULTS ── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {plan ? (
              <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Macro Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: isAr ? 'السعرات' : 'Calories', icon: Flame, color: '#f97316', val: plan.macros?.calories, unit: 'kcal' },
                    { label: isAr ? 'بروتين' : 'Protein', icon: Beef, color: '#ef4444', val: plan.macros?.protein_g, unit: 'g' },
                    { label: isAr ? 'كربوهيدرات' : 'Carbs', icon: Wheat, color: '#eab308', val: plan.macros?.carbs_g, unit: 'g' },
                    { label: isAr ? 'دهون' : 'Fat', icon: Egg, color: '#a855f7', val: plan.macros?.fat_g, unit: 'g' },
                    { label: isAr ? 'ماء' : 'Water', icon: Droplets, color: '#06b6d4', val: plan.water_recommendation, unit: 'L' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.04] bg-slate-900/40 p-3 text-center">
                      <item.icon size={16} className="mx-auto mb-1" style={{ color: item.color }} />
                      <div className="text-[9px] text-slate-500">{item.label}</div>
                      <div className="text-lg font-bold text-white font-mono">{item.val ?? '--'}</div>
                      <div className="text-[8px] text-slate-600">{item.unit}</div>
                    </div>
                  ))}
                </div>

                {/* TDEE Info */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4 flex items-center gap-4">
                  <Target size={18} style={{ color: goalColor }} />
                  <div className="flex-1">
                    <div className="text-xs text-slate-400">
                      BMR: <span className="text-white font-mono font-bold">{plan.bmr}</span> kcal
                      {' • '}TDEE: <span className="text-white font-mono font-bold">{plan.tdee}</span> kcal
                      {' • '}{isAr ? 'المستهدف' : 'Target'}: <span className="font-mono font-bold" style={{ color: goalColor }}>{plan.macros?.calories}</span> kcal
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-3">
                  {plan.meals?.map((meal: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                      className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{MEAL_ICONS[meal.meal_type] || '🍽️'}</span>
                        <div>
                          <h4 className="text-sm font-semibold text-white capitalize">
                            {isAr ? meal.meal_type_ar : meal.meal_type}
                          </h4>
                          <p className="text-xs text-slate-500">{isAr ? meal.name_ar : meal.name}</p>
                        </div>
                        <span className="ml-auto text-sm font-bold text-orange-400 font-mono">{meal.calories} kcal</span>
                      </div>
                      <div className="flex gap-4 text-[10px]">
                        <span className="text-red-400">🥩 {isAr ? 'بروتين' : 'Protein'}: <span className="font-bold text-white">{meal.protein}g</span></span>
                        <span className="text-yellow-400">🌾 {isAr ? 'كربوهيدرات' : 'Carbs'}: <span className="font-bold text-white">{meal.carbs}g</span></span>
                        <span className="text-purple-400">🥑 {isAr ? 'دهون' : 'Fat'}: <span className="font-bold text-white">{meal.fat}g</span></span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total */}
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">{isAr ? 'الإجمالي' : 'Total'}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-orange-400 font-mono font-bold">{plan.total_calories} kcal</span>
                      <span className="text-slate-400">P: <span className="text-white">{plan.total_protein}g</span></span>
                      <span className="text-slate-400">C: <span className="text-white">{plan.total_carbs}g</span></span>
                      <span className="text-slate-400">F: <span className="text-white">{plan.total_fat}g</span></span>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                {plan.tips?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">💡 {isAr ? 'نصائح' : 'Tips'}</h3>
                    <div className="space-y-1.5">
                      {plan.tips.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <ChevronRight size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <UtensilsCrossed size={36} className="text-emerald-500/40" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500">{isAr ? 'اختر هدفك وأنشئ خطة' : 'Choose your goal and generate a plan'}</h3>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[280px]">
                  {isAr ? 'سيتم إنشاء خطة وجبات مخصصة بناءً على بياناتك الصحية' : 'A personalized meal plan will be created based on your health data'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
