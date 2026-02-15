import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Heart, Globe, Activity, Brain, Shield, Dumbbell, Utensils, Pill,
  TrendingUp, MessageSquare, BarChart3, Users, Clock, Zap, Lock,
  ArrowRight, Sparkles, Bot, ChevronRight, Eye, Wifi, Bell, Layers,
  FileText, AlertTriangle, Target, Gauge, Flame, Droplets, Footprints,
  Moon, CheckCircle2, Stethoscope, Syringe, TestTube, LineChart
} from 'lucide-react';
import { HoloParticles, HoloBgMesh, HoloRing } from '../../components/hologram/HologramEffects';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

export default function Features() {
  const { language, toggleLanguage } = useUIStore();
  const isAr = language === 'ar';

  const mainFeatures = [
    {
      id: 'monitoring',
      icon: Activity,
      color: '#ef4444',
      title: isAr ? 'المراقبة الحية' : 'Real-time Monitoring',
      desc: isAr ? 'تتبع مؤشراتك الحيوية لحظة بلحظة من ساعتك الذكية مع تنبيهات فورية عند تجاوز الحدود الطبيعية.' : 'Track your vital signs in real-time from your smartwatch with instant alerts when exceeding normal thresholds.',
      details: [
        { icon: Heart, text: isAr ? 'نبض القلب المستمر' : 'Continuous Heart Rate' },
        { icon: Droplets, text: isAr ? 'مستوى الأكسجين SpO2' : 'Blood Oxygen SpO2' },
        { icon: Flame, text: isAr ? 'حرق السعرات الحرارية' : 'Calorie Burn Tracking' },
        { icon: Footprints, text: isAr ? 'عدد الخطوات والمسافة' : 'Steps & Distance' },
        { icon: Gauge, text: isAr ? 'مستوى التوتر' : 'Stress Level' },
        { icon: Moon, text: isAr ? 'جودة النوم' : 'Sleep Quality' },
      ],
    },
    {
      id: 'ai-chat',
      icon: MessageSquare,
      color: '#8b5cf6',
      title: isAr ? 'الدردشة الذكية' : 'AI Chat',
      desc: isAr ? 'تحدث مع 4 وكلاء ذكاء اصطناعي متخصصين يفهمون حالتك الصحية ويقدمون نصائح مخصصة لك.' : 'Chat with 4 specialized AI agents that understand your health condition and provide personalized advice.',
      details: [
        { icon: Stethoscope, text: isAr ? 'وكيل سريري طبي' : 'Clinical Medical Agent' },
        { icon: Utensils, text: isAr ? 'وكيل التغذية والحمية' : 'Nutrition & Diet Agent' },
        { icon: Dumbbell, text: isAr ? 'وكيل التمارين واللياقة' : 'Exercise & Fitness Agent' },
        { icon: AlertTriangle, text: isAr ? 'وكيل المخاطر والوقاية' : 'Risk & Prevention Agent' },
        { icon: Layers, text: isAr ? 'قاعدة معرفة طبية RAG' : 'Medical Knowledge Base (RAG)' },
        { icon: Bot, text: isAr ? 'ذكاء سياقي يتذكر سجلك' : 'Context-aware with memory' },
      ],
    },
    {
      id: 'predictions',
      icon: TrendingUp,
      color: '#06b6d4',
      title: isAr ? 'التنبؤات الصحية' : 'Health Predictions',
      desc: isAr ? 'تحليل متقدم باستخدام SHAP يتنبأ بمخاطرك الصحية المستقبلية ويقترح خطط وقائية مخصصة.' : 'Advanced SHAP analysis predicting your future health risks and suggesting personalized preventive plans.',
      details: [
        { icon: LineChart, text: isAr ? 'تحليل SHAP للمخاطر' : 'SHAP Risk Analysis' },
        { icon: Target, text: isAr ? 'سيناريوهات مستقبلية' : 'Future Scenarios' },
        { icon: Shield, text: isAr ? 'توصيات وقائية' : 'Preventive Recommendations' },
        { icon: BarChart3, text: isAr ? 'رسوم بيانية تفاعلية' : 'Interactive Charts' },
        { icon: FileText, text: isAr ? 'تقارير مفصلة' : 'Detailed Reports' },
        { icon: Bell, text: isAr ? 'تنبيهات المخاطر العالية' : 'High Risk Alerts' },
      ],
    },
    {
      id: 'exercise',
      icon: Dumbbell,
      color: '#10b981',
      title: isAr ? 'التمارين الذكية' : 'Smart Exercises',
      desc: isAr ? 'خطط تمارين مخصصة مع أنيميشن لطريقة التنفيذ الصحيحة ونصائح أمان لكل تمرين.' : 'Personalized workout plans with execution animations and safety tips for every exercise.',
      details: [
        { icon: Dumbbell, text: isAr ? 'تمارين مخصصة لحالتك' : 'Exercises tailored to you' },
        { icon: Eye, text: isAr ? 'أنيميشن طريقة التنفيذ' : 'Execution Animations' },
        { icon: Shield, text: isAr ? 'نصائح أمان مفصلة' : 'Detailed Safety Tips' },
        { icon: Clock, text: isAr ? 'جدولة زمنية ذكية' : 'Smart Scheduling' },
        { icon: TrendingUp, text: isAr ? 'تتبع التقدم' : 'Progress Tracking' },
        { icon: Zap, text: isAr ? 'مستويات صعوبة متدرجة' : 'Progressive Difficulty' },
      ],
    },
    {
      id: 'nutrition',
      icon: Utensils,
      color: '#f59e0b',
      title: isAr ? 'التغذية المتكاملة' : 'Complete Nutrition',
      desc: isAr ? 'خطط وجبات يومية مفصلة مع حساب تلقائي للسعرات والماكرو بناءً على حالتك وأهدافك.' : 'Detailed daily meal plans with automatic calorie & macro calculations based on your condition and goals.',
      details: [
        { icon: Utensils, text: isAr ? 'خطط وجبات مخصصة' : 'Custom Meal Plans' },
        { icon: Flame, text: isAr ? 'حساب السعرات والماكرو' : 'Calorie & Macro Tracking' },
        { icon: TestTube, text: isAr ? 'تحليل القيم الغذائية' : 'Nutritional Analysis' },
        { icon: CheckCircle2, text: isAr ? 'قوائم بدائل ذكية' : 'Smart Substitution Lists' },
        { icon: Clock, text: isAr ? 'تنظيم مواعيد الأكل' : 'Meal Timing Organization' },
        { icon: Target, text: isAr ? 'أهداف يومية واضحة' : 'Clear Daily Goals' },
      ],
    },
    {
      id: 'medications',
      icon: Pill,
      color: '#ec4899',
      title: isAr ? 'متابعة الأدوية' : 'Medication Tracking',
      desc: isAr ? 'نظام متكامل لإدارة الأدوية مع تذكيرات ذكية، مراقبة عائلية، وتحليل تفاعلات دوائية.' : 'Complete medication management with smart reminders, family monitoring & drug interaction analysis.',
      details: [
        { icon: Bell, text: isAr ? 'تذكيرات ذكية' : 'Smart Reminders' },
        { icon: Users, text: isAr ? 'مراقبة عائلية' : 'Family Monitoring' },
        { icon: AlertTriangle, text: isAr ? 'تحليل التفاعلات الدوائية' : 'Drug Interaction Analysis' },
        { icon: FileText, text: isAr ? 'سجل الأدوية الكامل' : 'Complete Medication History' },
        { icon: Syringe, text: isAr ? 'تتبع الجرعات' : 'Dose Tracking' },
        { icon: CheckCircle2, text: isAr ? 'تأكيد تناول الدواء' : 'Medication Confirmation' },
      ],
    },
  ];

  const highlights = [
    { icon: Wifi, text: isAr ? 'اتصال لحظي Socket.IO' : 'Real-time Socket.IO', color: '#06b6d4' },
    { icon: Lock, text: isAr ? 'تشفير JWT آمن' : 'Secure JWT Encryption', color: '#10b981' },
    { icon: Globe, text: isAr ? 'دعم عربي/إنجليزي' : 'Arabic/English Support', color: '#8b5cf6' },
    { icon: Zap, text: isAr ? 'أداء فائق السرعة' : 'Ultra-fast Performance', color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden relative">
      <HoloBgMesh className="opacity-30" />
      <HoloParticles count={12} color="#10b981" />
      {/* ── Navbar ── */}
      <nav className="nav-glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight"><span className="text-gradient">Healix</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'عن المنصة' : 'About'}</Link>
            <Link to="/features" className="text-sm text-white font-medium">{isAr ? 'المميزات' : 'Features'}</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/60 transition-all"><Globe size={18} /></button>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">{isAr ? 'تسجيل الدخول' : 'Sign In'}</Link>
            <Link to="/register" className="btn-primary !px-5 !py-2.5 !text-sm !rounded-xl">{isAr ? 'ابدأ مجاناً' : 'Get Started'}</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 hero-glow">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[20%] w-72 h-72 rounded-full bg-healix-500/8 blur-[100px] animate-float" />
          <div className="absolute top-30 right-[10%] w-80 h-80 rounded-full bg-emerald-500/6 blur-[120px] animate-float animation-delay-300" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="holo-badge mb-6">
            <Sparkles size={14} /> {isAr ? '6 مميزات رئيسية' : '6 Core Features'} <Sparkles size={14} />
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl md:text-6xl font-black mb-6">
            {isAr ? 'اكتشف قوة ' : 'Discover the Power of '}
            <span className="gradient-text-hero">Healix</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'منصة شاملة تغطي كل جوانب صحتك — من المراقبة الحية إلى التنبؤات الذكية، ومن التغذية إلى التمارين.'
              : 'A comprehensive platform covering every aspect of your health — from live monitoring to smart predictions, nutrition to exercise.'}
          </motion.p>
          {/* Quick highlights */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap items-center justify-center gap-4 mt-10">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-white/5 holo-corners">
                <h.icon size={14} style={{ color: h.color }} />
                <span className="text-xs text-gray-400">{h.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Feature Sections ── */}
      {mainFeatures.map((feature, idx) => (
        <section key={feature.id} className={`py-20 px-6 ${idx % 2 === 1 ? 'relative' : ''}`}>
          {idx % 2 === 1 && <div className="absolute inset-0 hero-glow pointer-events-none" />}
          <div className="max-w-6xl mx-auto relative z-10">
            <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              {/* Text Side */}
              <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="lg:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: feature.color + '15' }}>
                    <feature.icon size={24} style={{ color: feature.color }} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black">{feature.title}</h2>
                </div>
                <p className="text-gray-400 leading-relaxed mb-8">{feature.desc}</p>
                <Link to="/register" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: feature.color }}>
                  {isAr ? 'ابدأ الآن' : 'Get Started'} <ArrowRight size={16} />
                </Link>
              </motion.div>

              {/* Feature Details Grid */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="lg:w-1/2 grid grid-cols-2 gap-3">
                {feature.details.map((d, i) => (
                  <motion.div key={i} custom={i + 2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-dark-800/40 border border-white/5 hover:border-white/10 transition-all holo-corners perspective-child">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: feature.color + '10' }}>
                      <d.icon size={16} style={{ color: feature.color }} />
                    </div>
                    <span className="text-sm text-gray-300">{d.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            {isAr ? 'جاهز تجرب؟' : 'Ready to Try?'}
          </h2>
          <p className="text-gray-400 mb-8 text-lg">{isAr ? 'سجّل الآن وابدأ رحلتك الصحية مع Healix' : 'Sign up now and start your health journey with Healix'}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary !px-10 !py-4 !text-base !rounded-2xl flex items-center gap-3 relative">
              <span className="absolute inset-0 rounded-2xl holo-scan" />
              {isAr ? 'سجّل مجاناً' : 'Sign Up Free'} <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn-outline-glow flex items-center gap-2">
              {isAr ? 'تعرف علينا' : 'Learn About Us'} <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center">
              <Heart size={14} className="text-white" />
            </div>
            <span className="font-bold holo-text">Healix</span>
            <span className="text-xs text-gray-600">by DigitalMind</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/about" className="hover:text-white transition-colors">{isAr ? 'عن المنصة' : 'About'}</Link>
            <span>© 2026 DigitalMind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
