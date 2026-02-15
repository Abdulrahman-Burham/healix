import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Heart, Globe, Code2, Brain, Shield, Zap, Users, GraduationCap,
  Layers, Database, Server, Smartphone, ArrowRight, Cpu, Bot,
  Activity, ChevronRight, Sparkles, Target, Eye, Lightbulb,
  Twitter, Facebook, Instagram, Linkedin
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

export default function About() {
  const { language, toggleLanguage } = useUIStore();
  const isAr = language === 'ar';

  const team = [
    { name: isAr ? 'DigitalMind' : 'DigitalMind', role: isAr ? 'فريق التطوير' : 'Development Team', desc: isAr ? 'فريق متخصص في حلول الذكاء الاصطناعي والصحة الرقمية' : 'Specialized team in AI solutions & digital health' },
  ];

  const techStack = [
    { name: 'React 18', desc: isAr ? 'واجهة مستخدم تفاعلية عالية الأداء' : 'High-performance interactive UI', icon: Code2, color: '#61dafb' },
    { name: 'FastAPI', desc: isAr ? 'خلفية سريعة وآمنة مبنية بـ Python' : 'Fast & secure Python backend', icon: Server, color: '#009688' },
    { name: 'LangChain', desc: isAr ? 'إطار عمل متقدم لوكلاء الذكاء الاصطناعي' : 'Advanced framework for AI agents', icon: Brain, color: '#8b5cf6' },
    { name: 'MongoDB', desc: isAr ? 'قاعدة بيانات مرنة للبيانات الصحية' : 'Flexible database for health data', icon: Database, color: '#4db33d' },
    { name: 'ChromaDB', desc: isAr ? 'قاعدة بيانات متجهية للمعرفة الطبية' : 'Vector DB for medical knowledge (RAG)', icon: Layers, color: '#f59e0b' },
    { name: 'Socket.IO', desc: isAr ? 'اتصال فوري للمراقبة اللحظية' : 'Real-time communication for monitoring', icon: Zap, color: '#06b6d4' },
    { name: 'TailwindCSS', desc: isAr ? 'تصميم حديث ومتجاوب وقابل للتخصيص' : 'Modern, responsive & customizable design', icon: Smartphone, color: '#38bdf8' },
    { name: 'Ollama', desc: isAr ? 'تشغيل نماذج ذكاء اصطناعي محلياً' : 'Run AI models locally for privacy', icon: Cpu, color: '#10b981' },
  ];

  const values = [
    { icon: Target, title: isAr ? 'مهمتنا' : 'Our Mission', desc: isAr ? 'تمكين كل فرد من التحكم في صحته من خلال تقنيات الذكاء الاصطناعي المتقدمة والمراقبة المستمرة.' : 'Empower every individual to take control of their health through advanced AI and continuous monitoring.', color: '#06b6d4' },
    { icon: Eye, title: isAr ? 'رؤيتنا' : 'Our Vision', desc: isAr ? 'عالم يكون فيه الرعاية الصحية الذكية متاحة للجميع، وقائية وليست علاجية فقط.' : 'A world where intelligent healthcare is accessible to everyone — preventive, not just reactive.', color: '#8b5cf6' },
    { icon: Lightbulb, title: isAr ? 'أسلوبنا' : 'Our Approach', desc: isAr ? 'نجمع بين 4 وكلاء ذكاء اصطناعي متخصصين، بيانات حية من الأجهزة القابلة للارتداء، ومعرفة طبية عميقة.' : 'We combine 4 specialized AI agents, live wearable data & deep medical knowledge.', color: '#10b981' },
  ];

  const timeline = [
    { phase: isAr ? 'المرحلة 1' : 'Phase 1', title: isAr ? 'البحث والتخطيط' : 'Research & Planning', desc: isAr ? 'دراسة احتياجات المستخدمين وتصميم بنية النظام' : 'User needs study & system architecture design', done: true },
    { phase: isAr ? 'المرحلة 2' : 'Phase 2', title: isAr ? 'تطوير النظام الأساسي' : 'Core Development', desc: isAr ? 'بناء الواجهة والخلفية ونظام الوكلاء' : 'Frontend, backend & agent system development', done: true },
    { phase: isAr ? 'المرحلة 3' : 'Phase 3', title: isAr ? 'الاختبار والتحسين' : 'Testing & Optimization', desc: isAr ? 'اختبار شامل وتحسين الأداء والتجربة' : 'Comprehensive testing & UX optimization', done: true },
    { phase: isAr ? 'المرحلة 4' : 'Phase 4', title: isAr ? 'الإطلاق' : 'Launch', desc: isAr ? 'إطلاق المنصة والمراقبة المستمرة' : 'Platform launch & continuous monitoring', done: false },
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
            <span className="text-xl font-black tracking-tight"><span className="text-gradient">Healix</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/about" className="text-sm text-white font-medium">{isAr ? 'عن المنصة' : 'About'}</Link>
            <Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">{isAr ? 'المميزات' : 'Features'}</Link>
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
          <div className="absolute top-20 left-[15%] w-80 h-80 rounded-full bg-violet-500/8 blur-[120px] animate-float" />
          <div className="absolute top-40 right-[20%] w-64 h-64 rounded-full bg-healix-500/8 blur-[100px] animate-float animation-delay-300" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
            <Sparkles size={14} /> DigitalMind <Sparkles size={14} />
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl md:text-6xl font-black mb-6">
            {isAr ? 'نبني ' : 'We Build '}
            <span className="gradient-text-hero">{isAr ? 'مستقبل الصحة' : 'The Future of Health'}</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'Healix هي منصة ذكاء اصطناعي صحية من فريق DigitalMind. نستخدم أحدث التقنيات لبناء أنظمة تراقب صحتك، تتنبأ بالمخاطر، وتقدم نصائح شخصية مبنية على بياناتك الحقيقية.'
              : 'Healix is an AI-powered health platform by DigitalMind. We use cutting-edge technology to build systems that monitor your health, predict risks & provide personalized advice based on your real data.'}
          </motion.p>
        </div>
      </section>

      {/* ── Mission / Vision / Approach ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(300px circle at 50% 30%, ${v.color}10, transparent)` }} />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: v.color + '15' }}>
                <v.icon size={28} style={{ color: v.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              {isAr ? 'التقنيات المستخدمة' : 'Tech Stack'}
            </h2>
            <p className="text-gray-400">{isAr ? 'أحدث التقنيات لأفضل أداء وأمان' : 'Latest technologies for best performance & security'}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-dark-800/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group hover:-translate-y-1 duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tech.color + '15' }}>
                    <tech.icon size={20} style={{ color: tech.color }} />
                  </div>
                  <span className="font-bold text-sm text-white">{tech.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Diagram Visual ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">{isAr ? 'بنية النظام' : 'System Architecture'}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-8">
            {/* Visual architecture */}
            <div className="flex flex-col items-center gap-6">
              {/* Layer 1: User */}
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-healix-500/10 border border-healix-500/20">
                <Users size={20} className="text-healix-400" />
                <span className="font-bold text-healix-400">{isAr ? 'المستخدم' : 'User'}</span>
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-healix-500/40 to-transparent" />
              {/* Layer 2: Frontend */}
              <div className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <Code2 size={18} className="text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">React + TypeScript + TailwindCSS</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-px h-6 bg-gradient-to-b from-blue-500/30 to-transparent" />
                <span className="text-[10px] text-gray-600">REST API + Socket.IO</span>
                <div className="w-px h-6 bg-gradient-to-b from-blue-500/30 to-transparent" />
              </div>
              {/* Layer 3: Backend */}
              <div className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <Server size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">FastAPI + JWT Auth + Motor</span>
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-emerald-500/30 to-transparent" />
              {/* Layer 4: AI + DB */}
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                  <Brain size={20} className="text-violet-400" />
                  <span className="text-sm font-bold text-violet-400">{isAr ? 'نظام الوكلاء' : 'Agent System'}</span>
                  <span className="text-[10px] text-gray-500 text-center">LangChain + Ollama + ChromaDB</span>
                </div>
                <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <Database size={20} className="text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{isAr ? 'قاعدة البيانات' : 'Database'}</span>
                  <span className="text-[10px] text-gray-500 text-center">MongoDB + ChromaDB (RAG)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">{isAr ? 'مراحل التطوير' : 'Development Timeline'}</h2>
          </motion.div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-healix-500/40 via-violet-500/20 to-transparent" />
            {timeline.map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-10"
                  style={{ borderColor: item.done ? '#06b6d4' : '#374151', backgroundColor: item.done ? '#06b6d4' : '#0a0e1a' }} />
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[45%] ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                  <span className="text-xs font-medium text-healix-400">{item.phase}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                  {item.done && <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-2"><Activity size={10} /> {isAr ? 'مكتمل' : 'Completed'}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center">
              <Heart size={14} className="text-white" />
            </div>
            <span className="font-bold text-gradient">Healix</span>
            <span className="text-xs text-gray-600">by DigitalMind</span>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            <a href="https://x.com/Healix_eg" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-healix-500/20 border border-white/5 hover:border-healix-500/40 flex items-center justify-center text-gray-400 hover:text-healix-400 transition-all duration-300">
              <Twitter size={16} />
            </a>
            <a href="https://www.facebook.com/people/Healix-Company/61587929772919" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/40 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300">
              <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com/healixcompanyeg/" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-pink-500/20 border border-white/5 hover:border-pink-500/40 flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all duration-300">
              <Instagram size={16} />
            </a>
            <a href="https://www.linkedin.com/in/healix-company-09524a3b1/" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/5 hover:border-sky-500/40 flex items-center justify-center text-gray-400 hover:text-sky-400 transition-all duration-300">
              <Linkedin size={16} />
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <Link to="/features" className="hover:text-white transition-colors">{isAr ? 'المميزات' : 'Features'}</Link>
            <span>© 2026 DigitalMind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
