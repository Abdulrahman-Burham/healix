import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Heart, Activity, Brain, Shield, Dumbbell, Utensils, Pill, TrendingUp,
  ArrowRight, ChevronDown, Globe, Sparkles, Zap, Users, Clock, Star,
  Play, BarChart3, Lock, CheckCircle, Bot
} from 'lucide-react';
import { HoloParticles, HoloRing, HoloCube, HoloDNAHelix } from '../../components/hologram/HologramEffects';

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

export default function Home() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useUIStore();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const isAr = language === 'ar';

  const features = [
    { icon: Activity, title: isAr ? 'مراقبة حية 24/7' : 'Real-time Monitoring', desc: isAr ? 'تتبع نبض القلب، الأكسجين، التوتر والنشاط من ساعتك الذكية لحظة بلحظة' : 'Track heart rate, SpO2, stress & activity from your smartwatch in real-time', color: '#06b6d4' },
    { icon: Brain, title: isAr ? '4 وكلاء ذكاء اصطناعي' : '4 AI Agents', desc: isAr ? 'وكيل سريري، تغذية، تمارين، ومخاطر — كل واحد متخصص بمجاله' : 'Clinical, Nutrition, Exercise & Risk agents — each specialized in their domain', color: '#8b5cf6' },
    { icon: Dumbbell, title: isAr ? 'خطط تمارين ذكية' : 'Smart Workout Plans', desc: isAr ? 'تمارين مخصصة مع أنيميشن للتنفيذ الصحيح ونصائح الأمان' : 'Personalized exercise plans with execution animations & safety tips', color: '#10b981' },
    { icon: Utensils, title: isAr ? 'تغذية متكاملة' : 'Complete Nutrition', desc: isAr ? 'خطط وجبات يومية مفصلة مع حساب السعرات والماكرو تلقائياً' : 'Detailed daily meal plans with automatic calorie & macro calculations', color: '#f59e0b' },
    { icon: Pill, title: isAr ? 'متابعة الأدوية' : 'Medication Tracking', desc: isAr ? 'تذكيرات ذكية، مراقبة عائلية، وتحليل التفاعلات الدوائية' : 'Smart reminders, family monitoring & drug interaction analysis', color: '#ef4444' },
    { icon: TrendingUp, title: isAr ? 'تنبؤات صحية' : 'Health Predictions', desc: isAr ? 'تحليل SHAP للمخاطر، سيناريوهات مستقبلية، وتوصيات وقائية' : 'SHAP risk analysis, future scenarios & preventive recommendations', color: '#06b6d4' },
  ];

  const stats = [
    { value: 4, suffix: '', label: isAr ? 'وكلاء ذكاء اصطناعي' : 'AI Agents' },
    { value: 24, suffix: '/7', label: isAr ? 'مراقبة مستمرة' : 'Monitoring' },
    { value: 99, suffix: '%', label: isAr ? 'دقة التنبؤات' : 'Prediction Accuracy' },
    { value: 6, suffix: '+', label: isAr ? 'مؤشرات حيوية' : 'Vital Signs' },
  ];

  const testimonials = [
    { name: isAr ? 'د. أحمد المنصور' : 'Dr. Ahmed Al-Mansour', role: isAr ? 'طبيب قلب' : 'Cardiologist', text: isAr ? 'Healix غيّر طريقة متابعتي لمرضاي. التنبؤات الذكية ساعدتنا في الوقاية من حالات خطيرة.' : 'Healix transformed how I monitor patients. AI predictions helped prevent critical conditions.' },
    { name: isAr ? 'سارة الخالدي' : 'Sara Al-Khalidi', role: isAr ? 'مستخدمة' : 'User', text: isAr ? 'أحب كيف التطبيق يفهم حالتي ويعطيني نصائح شخصية. حياتي الصحية تحسنت كثير!' : 'I love how the app understands my condition and gives personalized advice. My health improved so much!' },
    { name: isAr ? 'م. خالد العتيبي' : 'Eng. Khaled Al-Otaibi', role: isAr ? 'رياضي' : 'Athlete', text: isAr ? 'نظام التمارين مع الأنيميشن والنصائح خلاني أتمرن بطريقة صحيحة وآمنة.' : 'The exercise system with animations and tips helped me train correctly and safely.' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="nav-glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="holo-text">Healix</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-white font-medium">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'عن المنصة' : 'About'}</Link>
            <Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'المميزات' : 'Features'}</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/60 transition-all">
              <Globe size={18} />
            </button>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
            <Link to="/register" className="btn-primary !px-5 !py-2.5 !text-sm !rounded-xl">
              {isAr ? 'ابدأ مجاناً' : 'Get Started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with 3D Holographic Effects ── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-32 pb-20 px-6 hero-glow">
        {/* Animated Background + Holographic Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-healix-500/10 blur-[100px] animate-float" />
          <div className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-emerald-500/8 blur-[120px] animate-float animation-delay-300" />
          <div className="absolute bottom-20 left-[40%] w-60 h-60 rounded-full bg-violet-500/8 blur-[80px] animate-float animation-delay-500" />
          {/* 3D Hologram Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <HoloRing size={500} color="rgba(6,182,212,0.06)" speed={25} thickness={1} />
            <HoloRing size={400} color="rgba(16,185,129,0.05)" speed={18} thickness={1} dashed reverse className="top-[50px] left-[50px]" />
            <HoloRing size={300} color="rgba(139,92,246,0.04)" speed={22} thickness={1} className="top-[100px] left-[100px]" />
          </div>
          {/* 3D Cube accents */}
          <HoloCube size={60} color="#06b6d4" className="top-[25%] left-[8%] opacity-30" />
          <HoloCube size={40} color="#10b981" className="top-[35%] right-[12%] opacity-20" />
          {/* DNA Helix */}
          <div className="hidden lg:block absolute top-[15%] right-[5%] opacity-20">
            <HoloDNAHelix height={250} color1="#06b6d4" color2="#8b5cf6" />
          </div>
          <HoloParticles count={20} color="#06b6d4" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="holo-badge mb-8">
            <Sparkles size={14} /> {isAr ? 'مدعوم بالذكاء الاصطناعي المتعدد الوكلاء' : 'Powered by Multi-Agent AI'} <Sparkles size={14} />
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tight">
            {isAr ? (
              <>صحتك أولاً<br /><span className="gradient-text-hero">مع Healix</span></>
            ) : (
              <>Your Health,<br /><span className="gradient-text-hero">Reimagined</span></>
            )}
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr
              ? 'منصة صحية ذكية تجمع بين 4 وكلاء ذكاء اصطناعي، مراقبة حية، وتنبؤات متقدمة — كل ما تحتاجه لحياة صحية في مكان واحد.'
              : 'An intelligent health platform combining 4 AI agents, real-time monitoring & advanced predictions — everything you need for a healthier life in one place.'}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn-primary !px-10 !py-4 !text-base !rounded-2xl flex items-center gap-3 !shadow-2xl !shadow-healix-500/30">
              {isAr ? 'ابدأ رحلتك الصحية' : 'Start Your Journey'} <ArrowRight size={20} />
            </Link>
            <Link to="/features" className="btn-outline-glow flex items-center gap-2">
              <Play size={18} /> {isAr ? 'شاهد المميزات' : 'Explore Features'}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center holo-float" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className="text-3xl md:text-4xl font-black holo-text mb-1">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ChevronDown size={24} className="text-gray-600" />
        </motion.div>
      </motion.section>

      {/* ── Dashboard Preview (Floating mockup) — Holographic ── */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative holo-card holo-scan holo-grid p-2 shadow-2xl" style={{ boxShadow: '0 0 80px rgba(6,182,212,0.08)' }}>
            {/* Mockup header bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-dark-700/60 rounded-lg px-4 py-1 text-[10px] text-gray-500 font-mono">healix.digitalmind.ai/dashboard</div>
              </div>
            </div>
            {/* Mockup dashboard content */}
            <div className="p-6 grid grid-cols-4 gap-3">
              {[
                { label: isAr ? 'نبض القلب' : 'Heart Rate', value: '72 bpm', color: '#ef4444' },
                { label: isAr ? 'الأكسجين' : 'SpO2', value: '98%', color: '#06b6d4' },
                { label: isAr ? 'الخطوات' : 'Steps', value: '6,500', color: '#10b981' },
                { label: isAr ? 'السعرات' : 'Calories', value: '420 kcal', color: '#f59e0b' },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="holo-stat perspective-child">
                  <div className="text-[10px] text-gray-500 mb-2">{card.label}</div>
                  <div className="text-xl font-black" style={{ color: card.color }}>{card.value}</div>
                  <div className="mt-3 h-8 rounded-lg overflow-hidden bg-dark-600/30">
                    <motion.div className="h-full rounded-lg" style={{ backgroundColor: card.color + '30' }}
                      initial={{ width: 0 }} whileInView={{ width: '70%' }} viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }} />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Glow line */}
            <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
              <div className="glow-line h-full w-1/3" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              {isAr ? 'كل ما تحتاجه في ' : 'Everything You Need in '}
              <span className="holo-text">{isAr ? 'مكان واحد' : 'One Place'}</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">{isAr ? 'منصة متكاملة تجمع بين التكنولوجيا والصحة' : 'A complete platform bridging technology and health'}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="feature-card holo-corners perspective-child">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: f.color + '15' }}>
                  <f.icon size={26} style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Agents Section ── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="holo-text">{isAr ? '4 وكلاء ذكاء اصطناعي' : '4 AI Agents'}</span>
              {isAr ? ' يعملون من أجلك' : ' Working for You'}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: isAr ? 'الوكيل السريري' : 'Clinical Agent', desc: isAr ? 'يحلل مؤشراتك الحيوية ويقدم رؤى طبية متعمقة' : 'Analyzes your vitals and provides deep medical insights', icon: Activity, color: '#06b6d4', gradient: 'from-cyan-500/10 to-blue-500/5' },
              { name: isAr ? 'وكيل التغذية' : 'Nutrition Agent', desc: isAr ? 'يصمم خطط وجبات مخصصة تناسب حالتك الصحية' : 'Designs personalized meal plans for your health condition', icon: Utensils, color: '#10b981', gradient: 'from-emerald-500/10 to-green-500/5' },
              { name: isAr ? 'وكيل التمارين' : 'Exercise Agent', desc: isAr ? 'يبني برامج تدريب آمنة مع تعليمات مفصلة' : 'Builds safe training programs with detailed instructions', icon: Dumbbell, color: '#8b5cf6', gradient: 'from-violet-500/10 to-purple-500/5' },
              { name: isAr ? 'وكيل المخاطر' : 'Risk Agent', desc: isAr ? 'يتنبأ بالمخاطر الصحية قبل حدوثها ويقترح حلول وقائية' : 'Predicts health risks before they occur & suggests preventive solutions', icon: Shield, color: '#f59e0b', gradient: 'from-amber-500/10 to-orange-500/5' },
            ].map((agent, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`bg-gradient-to-br ${agent.gradient} rounded-3xl p-8 border border-white/5 relative overflow-hidden group holo-corners holo-datastream`}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundColor: agent.color }} />
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: agent.color + '20' }}>
                    <agent.icon size={22} style={{ color: agent.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: agent.color }}>
                      <Bot size={10} /> LangChain + RAG
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed relative z-10">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              {isAr ? 'ماذا يقولون عنا' : 'What People Say'}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card p-6 rounded-3xl holo-corners">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-healix-500/5 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full bg-healix-500/20 blur-2xl animate-pulse" />
            <HoloRing size={100} color="rgba(6,182,212,0.15)" speed={10} className="top-[-10px] left-[-10px]" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center holo-float">
              <Heart size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            {isAr ? 'جاهز تبدأ رحلتك الصحية؟' : 'Ready to Transform Your Health?'}
          </h2>
          <p className="text-gray-400 mb-8 text-lg">{isAr ? 'انضم الآن مجاناً واستمتع بمستقبل صحي أفضل' : 'Join now for free and enjoy a healthier future'}</p>
          <Link to="/register" className="btn-primary !px-12 !py-4 !text-lg !rounded-2xl inline-flex items-center gap-3">
            {isAr ? 'سجّل الآن' : 'Sign Up Now'} <ArrowRight size={22} />
          </Link>
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
            <Link to="/about" className="hover:text-white transition-colors">{isAr ? 'عن المنصة' : 'About'}</Link>
            <Link to="/features" className="hover:text-white transition-colors">{isAr ? 'المميزات' : 'Features'}</Link>
            <span>© 2026 DigitalMind</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <Lock size={12} /> HIPAA Compliant
            <Shield size={12} /> SSL Encrypted
          </div>
        </div>
      </footer>
    </div>
  );
}
