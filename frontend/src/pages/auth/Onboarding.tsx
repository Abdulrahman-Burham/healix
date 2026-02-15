import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useUIStore } from '../../store';
import {
  User, Stethoscope, Target, Leaf, Phone, Watch,
  ArrowRight, ArrowLeft, Check, ChevronDown, Upload,
  Heart, Loader2
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { icon: User, key: 'step1' },
  { icon: Stethoscope, key: 'step2' },
  { icon: Target, key: 'step3' },
  { icon: Leaf, key: 'step4' },
  { icon: Phone, key: 'step5' },
  { icon: Watch, key: 'step6' },
];

const CONDITIONS = [
  'hypertension', 'diabetes', 'heartDisease', 'asthma',
  'arthritis', 'obesity', 'backPain', 'kneePain', 'none'
];

const GOALS = [
  'loseWeight', 'gainMuscle', 'improveHealth',
  'increaseStamina', 'flexibility', 'manageCondition', 'rehabilitation'
];

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const { language } = useUIStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    age: 25, weight: 70, height: 170, gender: 'male' as 'male' | 'female',
    conditions: [] as string[], medications: '' , allergies: '', surgeries: '',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goals: [] as string[], daysPerWeek: 3, preferredTime: 'evening',
    sleepHours: 7, stressLevel: 5, dietType: '', waterIntake: 2,
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    watchConnected: false,
  });

  const updateField = (field: string, value: any) => setData({ ...data, [field]: value });

  const toggleArrayItem = (field: 'conditions' | 'goals', item: string) => {
    const arr = data[field];
    if (item === 'none' && field === 'conditions') {
      setData({ ...data, [field]: arr.includes('none') ? [] : ['none'] });
      return;
    }
    setData({
      ...data,
      [field]: arr.includes(item) 
        ? arr.filter((i) => i !== item && i !== 'none')
        : [...arr.filter(i => i !== 'none'), item]
    });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        personalInfo: { name: '', age: data.age, gender: data.gender, weight: data.weight, height: data.height },
        medicalHistory: {
          conditions: data.conditions.filter(c => c !== 'none'),
          medications: data.medications.split(',').map(m => m.trim()).filter(Boolean),
          allergies: data.allergies.split(',').map(a => a.trim()).filter(Boolean),
          surgeries: data.surgeries.split(',').map(s => s.trim()).filter(Boolean),
        },
        fitnessInfo: { level: data.fitnessLevel, goals: data.goals, daysPerWeek: data.daysPerWeek, preferredTime: data.preferredTime },
        lifestyle: { sleepHours: data.sleepHours, stressLevel: data.stressLevel, dietType: data.dietType, waterIntake: data.waterIntake },
        emergencyContact: { name: data.emergencyName, phone: data.emergencyPhone, relation: data.emergencyRelation },
        watchData: { connected: data.watchConnected },
      };
      await api.put('/users/onboarding', payload);
      updateUser({ onboardingCompleted: true });
      toast.success(t('common.success'));
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.age')}</label>
                <input type="number" value={data.age} onChange={(e) => updateField('age', +e.target.value)} className="input-field" min={10} max={100} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.gender')}</label>
                <div className="flex gap-3">
                  {['male', 'female'].map(g => (
                    <button key={g} type="button" onClick={() => updateField('gender', g)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all
                        ${data.gender === g ? 'bg-healix-500/20 border-healix-500/40 text-healix-400' : 'bg-dark-700/40 border-white/5 text-gray-400 hover:border-white/10'}`}>
                      {t(`onboarding.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.weight')}</label>
                <input type="number" value={data.weight} onChange={(e) => updateField('weight', +e.target.value)} className="input-field" min={20} max={300} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.height')}</label>
                <input type="number" value={data.height} onChange={(e) => updateField('height', +e.target.value)} className="input-field" min={50} max={250} />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">{t('onboarding.conditions')}</label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => toggleArrayItem('conditions', c)}
                    className={`p-3 rounded-xl border text-sm text-left [dir=rtl]:text-right transition-all
                      ${data.conditions.includes(c) ? 'bg-healix-500/20 border-healix-500/40 text-healix-400' : 'bg-dark-700/40 border-white/5 text-gray-400 hover:border-white/10'}`}>
                    <div className="flex items-center gap-2">
                      {data.conditions.includes(c) && <Check size={14} className="text-healix-400" />}
                      <span>{t(`onboarding.conditionsList.${c}`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.currentMedications')}</label>
              <input type="text" value={data.medications} onChange={(e) => updateField('medications', e.target.value)}
                className="input-field" placeholder={language === 'ar' ? 'أدخل الأدوية مفصولة بفاصلة' : 'Enter medications, comma-separated'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.allergies')}</label>
              <input type="text" value={data.allergies} onChange={(e) => updateField('allergies', e.target.value)}
                className="input-field" placeholder={language === 'ar' ? 'أي حساسية؟' : 'Any allergies?'} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">{t('onboarding.fitnessLevel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                  <button key={level} type="button" onClick={() => updateField('fitnessLevel', level)}
                    className={`p-4 rounded-xl border text-center transition-all
                      ${data.fitnessLevel === level ? 'bg-healix-500/20 border-healix-500/40 text-healix-400' : 'bg-dark-700/40 border-white/5 text-gray-400 hover:border-white/10'}`}>
                    <div className="text-2xl mb-1">{level === 'beginner' ? '🌱' : level === 'intermediate' ? '💪' : '🔥'}</div>
                    <div className="text-sm font-medium">{t(`onboarding.${level}`)}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">{t('onboarding.goals')}</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button key={g} type="button" onClick={() => toggleArrayItem('goals', g)}
                    className={`p-3 rounded-xl border text-sm text-left [dir=rtl]:text-right transition-all
                      ${data.goals.includes(g) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-dark-700/40 border-white/5 text-gray-400 hover:border-white/10'}`}>
                    <div className="flex items-center gap-2">
                      {data.goals.includes(g) && <Check size={14} className="text-emerald-400" />}
                      <span>{t(`onboarding.goalsList.${g}`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.daysPerWeek')}</label>
                <input type="range" min={1} max={7} value={data.daysPerWeek} onChange={(e) => updateField('daysPerWeek', +e.target.value)}
                  className="w-full accent-healix-500" />
                <div className="text-center text-healix-400 font-bold text-lg mt-1">{data.daysPerWeek}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.preferredTime')}</label>
                <div className="flex flex-col gap-2">
                  {['morning', 'afternoon', 'evening'].map(time => (
                    <button key={time} type="button" onClick={() => updateField('preferredTime', time)}
                      className={`py-2 px-3 rounded-lg border text-sm transition-all
                        ${data.preferredTime === time ? 'bg-healix-500/20 border-healix-500/40 text-healix-400' : 'bg-dark-700/40 border-white/5 text-gray-400'}`}>
                      {t(`onboarding.${time}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.sleepHours')}</label>
                <input type="range" min={3} max={12} step={0.5} value={data.sleepHours} onChange={(e) => updateField('sleepHours', +e.target.value)}
                  className="w-full accent-healix-500" />
                <div className="text-center text-healix-400 font-bold text-lg mt-1">{data.sleepHours}h</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.stressLevel')}</label>
                <input type="range" min={1} max={10} value={data.stressLevel} onChange={(e) => updateField('stressLevel', +e.target.value)}
                  className="w-full accent-amber-500" />
                <div className="text-center text-amber-400 font-bold text-lg mt-1">{data.stressLevel}/10</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.dietType')}</label>
              <input type="text" value={data.dietType} onChange={(e) => updateField('dietType', e.target.value)}
                className="input-field" placeholder={language === 'ar' ? 'مثال: عادي، نباتي، كيتو' : 'e.g., Regular, Vegetarian, Keto'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.waterIntake')}</label>
              <input type="range" min={0.5} max={5} step={0.5} value={data.waterIntake} onChange={(e) => updateField('waterIntake', +e.target.value)}
                className="w-full accent-blue-500" />
              <div className="text-center text-blue-400 font-bold text-lg mt-1">{data.waterIntake}L</div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-300">
                {language === 'ar'
                  ? 'جهة اتصال الطوارئ مهمة جداً. سيتم الاتصال بها في حالات الطوارئ الصحية.'
                  : 'Emergency contact is essential. They will be notified in health emergencies.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.emergencyName')}</label>
              <input type="text" value={data.emergencyName} onChange={(e) => updateField('emergencyName', e.target.value)}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.emergencyPhone')}</label>
              <input type="tel" value={data.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)}
                className="input-field" placeholder="+20 xxx xxx xxxx" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('onboarding.emergencyRelation')}</label>
              <input type="text" value={data.emergencyRelation} onChange={(e) => updateField('emergencyRelation', e.target.value)}
                className="input-field" placeholder={language === 'ar' ? 'مثال: أخ، أب، زوج' : 'e.g., Brother, Father, Spouse'} required />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-healix-500/20 to-emerald-500/20 
                            border-2 border-dashed border-healix-500/40 flex items-center justify-center">
              <Watch size={40} className="text-healix-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {t('onboarding.connectWatch')}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {language === 'ar'
                ? 'اربط ساعتك الذكية لمراقبة المؤشرات الحيوية في الوقت الفعلي والحصول على تنبؤات أفضل'
                : 'Connect your smartwatch for real-time vital monitoring and better health predictions'}
            </p>

            {/* Upload Button */}
            <div className="space-y-3">
              <label className="block">
                <div className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                  <Upload size={18} />
                  {t('onboarding.uploadData')}
                </div>
                <input type="file" className="hidden" accept=".csv,.json,.xml" 
                  onChange={() => updateField('watchConnected', true)} />
              </label>

              <button type="button" onClick={() => updateField('watchConnected', true)}
                className="btn-secondary block mx-auto">
                {t('onboarding.connectWatch')}
              </button>

              <button type="button" onClick={() => {}}
                className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                {t('onboarding.skipWatch')}
              </button>
            </div>

            {data.watchConnected && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Check size={16} />
                {t('onboarding.watchConnected')}
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-healix-500/6 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-healix-500 to-emerald-500 
                            flex items-center justify-center shadow-xl shadow-healix-500/20">
              <Heart size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('onboarding.title')}</h1>
          <p className="text-gray-400">{t('onboarding.subtitle')}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${i === step ? 'bg-gradient-to-br from-healix-500 to-emerald-500 text-white shadow-lg shadow-healix-500/30' :
                    i < step ? 'bg-healix-500/20 text-healix-400' : 'bg-dark-700 text-gray-600'}`}
              >
                {i < step ? <Check size={16} /> : <s.icon size={16} />}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-all ${i < step ? 'bg-healix-500' : 'bg-dark-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            {(() => { const StepIcon = STEPS[step].icon; return <StepIcon size={24} className="text-healix-400" />; })()}
            <h2 className="text-xl font-bold text-white">{t(`onboarding.${STEPS[step].key}`)}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className={`btn-secondary flex items-center gap-2 ${step === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ArrowLeft size={18} className="[dir=rtl]:rotate-180" />
              {t('onboarding.back')}
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
                {t('onboarding.next')}
                <ArrowRight size={18} className="[dir=rtl]:rotate-180" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={isSubmitting}
                className="btn-primary flex items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    {t('onboarding.finish')}
                    <ArrowRight size={18} className="[dir=rtl]:rotate-180" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
