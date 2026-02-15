import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  UtensilsCrossed, Droplets, Flame, Beef, Wheat, CircleDot,
  Check, Plus, ChevronRight, Target
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Nutrition() {
  const { t } = useTranslation();
  const { language } = useUIStore();

  const [plan, setPlan] = useState<any>({
    targetCalories: 2200, targetProtein: 165, targetCarbs: 250, targetFat: 65,
    totalCalories: 1350, totalProtein: 98, totalCarbs: 145, totalFat: 42, waterIntake: 1.5,
    meals: [
      {
        type: 'breakfast', name: language === 'ar' ? 'الإفطار' : 'Breakfast', time: '07:30', consumed: true,
        totalCalories: 420, totalProtein: 35, totalCarbs: 40, totalFat: 14,
        foods: [
          { name: language === 'ar' ? '٣ بيض مسلوق' : '3 Boiled Eggs', amount: 3, unit: 'pcs', calories: 210, protein: 18, carbs: 1, fat: 14 },
          { name: language === 'ar' ? 'شوفان بالحليب' : 'Oatmeal with Milk', amount: 80, unit: 'g', calories: 180, protein: 12, carbs: 35, fat: 4 },
          { name: language === 'ar' ? 'موز' : 'Banana', amount: 1, unit: 'pc', calories: 105, protein: 1, carbs: 27, fat: 0 },
        ]
      },
      {
        type: 'lunch', name: language === 'ar' ? 'الغداء' : 'Lunch', time: '13:00', consumed: false,
        totalCalories: 650, totalProtein: 50, totalCarbs: 55, totalFat: 18,
        foods: [
          { name: language === 'ar' ? 'صدور دجاج مشوي' : 'Grilled Chicken Breast', amount: 200, unit: 'g', calories: 330, protein: 42, carbs: 0, fat: 8 },
          { name: language === 'ar' ? 'أرز بني' : 'Brown Rice', amount: 150, unit: 'g', calories: 170, protein: 4, carbs: 36, fat: 2 },
          { name: language === 'ar' ? 'سلطة خضراء' : 'Green Salad', amount: 200, unit: 'g', calories: 45, protein: 2, carbs: 8, fat: 1 },
          { name: language === 'ar' ? 'زيت زيتون' : 'Olive Oil', amount: 15, unit: 'ml', calories: 120, protein: 0, carbs: 0, fat: 14 },
        ]
      },
      {
        type: 'pre_workout', name: language === 'ar' ? 'قبل التمرين' : 'Pre-Workout', time: '16:30', consumed: false,
        totalCalories: 280, totalProtein: 30, totalCarbs: 35, totalFat: 4,
        foods: [
          { name: language === 'ar' ? 'بروتين شيك' : 'Protein Shake', amount: 1, unit: 'scoop', calories: 120, protein: 25, carbs: 3, fat: 1 },
          { name: language === 'ar' ? 'موز' : 'Banana', amount: 1, unit: 'pc', calories: 105, protein: 1, carbs: 27, fat: 0 },
          { name: language === 'ar' ? 'تمر' : 'Dates', amount: 30, unit: 'g', calories: 80, protein: 1, carbs: 20, fat: 0 },
        ]
      },
      {
        type: 'dinner', name: language === 'ar' ? 'العشاء' : 'Dinner', time: '20:00', consumed: false,
        totalCalories: 480, totalProtein: 40, totalCarbs: 30, totalFat: 20,
        foods: [
          { name: language === 'ar' ? 'سمك سلمون مشوي' : 'Grilled Salmon', amount: 180, unit: 'g', calories: 350, protein: 35, carbs: 0, fat: 18 },
          { name: language === 'ar' ? 'بطاطا حلوة' : 'Sweet Potato', amount: 150, unit: 'g', calories: 130, protein: 2, carbs: 30, fat: 0 },
          { name: language === 'ar' ? 'خضار مشوية' : 'Grilled Vegetables', amount: 200, unit: 'g', calories: 80, protein: 3, carbs: 12, fat: 2 },
        ]
      },
    ]
  });

  useEffect(() => {
    loadNutrition();
  }, []);

  const loadNutrition = async () => {
    try {
      const res = await api.get('/nutrition/today');
      if (res.data) setPlan((prev: any) => ({ ...prev, ...res.data }));
    } catch {}
  };

  const macroData = [
    { name: t('nutrition.protein'), value: plan.totalProtein, target: plan.targetProtein, color: '#f43f5e', icon: Beef },
    { name: t('nutrition.carbs'), value: plan.totalCarbs, target: plan.targetCarbs, color: '#f59e0b', icon: Wheat },
    { name: t('nutrition.fat'), value: plan.totalFat, target: plan.targetFat, color: '#8b5cf6', icon: CircleDot },
  ];

  const pieData = macroData.map(m => ({ name: m.name, value: m.value }));
  const COLORS = ['#f43f5e', '#f59e0b', '#8b5cf6'];

  const calPercent = plan.targetCalories ? Math.min(100, Math.round((plan.totalCalories / plan.targetCalories) * 100)) : 0;

  const mealIcons: Record<string, string> = {
    breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍌', pre_workout: '⚡', post_workout: '🔄'
  };

  return (
    <motion.div className="page-container" initial="initial" animate="animate">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <h1 className="section-title flex items-center gap-2">
          <UtensilsCrossed className="text-emerald-400" size={28} />
          {t('nutrition.title')}
        </h1>
        <p className="section-subtitle">{t('nutrition.subtitle')}</p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Calories Ring */}
        <motion.div {...fadeInUp} className="col-span-2 md:col-span-1 glass-card p-5 flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#calRing)" strokeWidth="8"
                strokeDasharray={`${calPercent * 2.64} ${264 - calPercent * 2.64}`}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="calRing" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#f43f5e" /></linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame size={16} className="text-orange-400 mb-0.5" />
              <span className="text-xl font-bold text-white">{plan.totalCalories}</span>
              <span className="text-[10px] text-gray-500">/ {plan.targetCalories}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{t('nutrition.calories')}</p>
        </motion.div>

        {/* Macros */}
        {macroData.map((macro, i) => (
          <motion.div key={i} {...fadeInUp} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <macro.icon size={16} style={{ color: macro.color }} />
              <span className="text-sm text-gray-400">{macro.name}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-white">{macro.value}</span>
              <span className="text-xs text-gray-500">/ {macro.target}{t('nutrition.grams')}</span>
            </div>
            <div className="progress-bar h-1.5">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${macro.target ? Math.min(100, (macro.value / macro.target) * 100) : 0}%`, backgroundColor: macro.color }} />
            </div>
          </motion.div>
        ))}

        {/* Water */}
        <motion.div {...fadeInUp} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={16} className="text-blue-400" />
            <span className="text-sm text-gray-400">{t('nutrition.water')}</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-white">{plan.waterIntake}</span>
            <span className="text-xs text-gray-500">/ 3 {t('nutrition.liters')}</span>
          </div>
          <div className="flex gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex-1 h-6 rounded-md transition-all ${
                i < plan.waterIntake * 2 ? 'bg-blue-500/40 border border-blue-500/30' : 'bg-dark-600 border border-white/5'
              }`} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plan.meals?.map((meal: any, i: number) => (
          <motion.div key={i} {...fadeInUp} className={`glass-card overflow-hidden ${
            meal.consumed ? 'border-emerald-500/20 bg-emerald-500/5' : ''
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mealIcons[meal.type] || '🍽️'}</span>
                  <div>
                    <h3 className={`font-semibold ${meal.consumed ? 'text-emerald-400' : 'text-white'}`}>{meal.name}</h3>
                    <p className="text-xs text-gray-500">{meal.time} · {meal.totalCalories} {t('common.kcal')}</p>
                  </div>
                </div>
                {meal.consumed ? (
                  <span className="badge-success flex items-center gap-1"><Check size={12} /> {t('nutrition.consumed')}</span>
                ) : (
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-healix-500/20 text-healix-400 hover:bg-healix-500/30 transition-colors">
                    {t('nutrition.consumed')}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {meal.foods?.map((food: any, j: number) => (
                  <div key={j} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-gray-300">{food.name}</p>
                      <p className="text-xs text-gray-500">{food.amount} {food.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{food.calories} cal</span>
                      <span className="text-rose-400">P:{food.protein}g</span>
                      <span className="text-amber-400">C:{food.carbs}g</span>
                      <span className="text-violet-400">F:{food.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Macros Summary */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs font-medium">
                <span className="text-rose-400">P: {meal.totalProtein}g</span>
                <span className="text-amber-400">C: {meal.totalCarbs}g</span>
                <span className="text-violet-400">F: {meal.totalFat}g</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Macros Pie Chart */}
      <motion.div {...fadeInUp} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('nutrition.macros')}</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {macroData.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-sm text-gray-300">{m.name}: {m.value}g / {m.target}g</span>
                <span className="text-xs text-gray-500">({m.target ? Math.round((m.value / m.target) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
