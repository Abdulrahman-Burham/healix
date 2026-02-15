import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore, useUIStore } from '../../store';
import {
  Heart, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, Loader2,
  Activity, Brain, Dumbbell, TrendingUp, Shield, Sparkles, Zap, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { language, setLanguage } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isAr = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success(t('common.success'));
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('common.error'));
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex relative overflow-hidden">
      {/* Animated BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-healix-500/8 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/6 blur-[120px] animate-float animation-delay-300" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px] animate-float animation-delay-500" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center">
            <Heart size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-gradient">Healix</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-700/40 backdrop-blur border border-white/5 text-gray-400 hover:text-white transition-all text-sm">
            <Globe size={15} /> {isAr ? 'EN' : 'عر'}
          </button>
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">{isAr ? 'الرئيسية' : 'Home'}</Link>
        </div>
      </div>

      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Badge */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-healix-500/10 border border-healix-500/20 text-healix-400 text-xs font-medium mb-6">
              <Sparkles size={12} /> {isAr ? 'مدعوم بـ 4 وكلاء ذكاء اصطناعي' : 'Powered by 4 AI Agents'}
            </motion.div>

            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              {isAr ? 'مرحباً بعودتك إلى' : 'Welcome Back to'}
              <br />
              <span className="gradient-text-hero">Healix</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-10 text-lg">
              {isAr
                ? 'تابع مؤشراتك الحيوية، تحدث مع وكلاء الذكاء الاصطناعي، وحقق أهدافك الصحية.'
                : 'Monitor your vitals, chat with AI agents, and achieve your health goals.'}
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Activity, text: isAr ? 'مراقبة حية 24/7' : '24/7 Monitoring', color: '#ef4444' },
                { icon: Brain, text: isAr ? 'دردشة ذكية' : 'AI Chat', color: '#8b5cf6' },
                { icon: Dumbbell, text: isAr ? 'تمارين مخصصة' : 'Smart Workouts', color: '#10b981' },
                { icon: TrendingUp, text: isAr ? 'تنبؤات صحية' : 'Predictions', color: '#06b6d4' },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-dark-800/40 border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color + '15' }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Live status bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-4 px-5 py-3 rounded-2xl bg-dark-800/30 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">{isAr ? 'النظام يعمل' : 'System Online'}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield size={12} /> {isAr ? 'اتصال مشفر' : 'Encrypted Connection'}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Zap size={12} /> {isAr ? 'استجابة سريعة' : 'Fast Response'}
              </div>
            </motion.div>
          </motion.div>

          {/* Decorative arcs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            {[400, 360, 320].map((s, i) => (
              <motion.div key={i} className="absolute rounded-full border" style={{
                width: s, height: s, left: `calc(50% - ${s/2}px)`, top: `calc(50% - ${s/2}px)`,
                borderColor: i === 2 ? 'rgba(16,185,129,0.06)' : 'rgba(6,182,212,0.06)'
              }} animate={{ rotate: i % 2 === 0 ? 360 : -360 }} transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 pt-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-healix-500/20">
              <Heart size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient">Healix</h1>
              <p className="text-xs text-gray-500">{t('app.tagline')}</p>
            </div>
          </div>

          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-b from-healix-500/10 via-transparent to-emerald-500/5 blur-xl" />
            <div className="relative glass-card !rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 border border-white/[0.06]">
              <div className="text-center mb-8">
                <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={0}
                  className="text-2xl font-black text-white">{t('auth.loginTitle')}</motion.h2>
                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="text-gray-500 mt-2 text-sm">{t('auth.loginSubtitle')}</motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.email')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-healix-500/30' : ''}`}>
                    <Mail size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-healix-400' : 'text-gray-500'}`} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 [dir=rtl]:pl-4 [dir=rtl]:pr-11 !rounded-xl" placeholder="name@example.com" required />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.password')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-healix-500/30' : ''}`}>
                    <Lock size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-healix-400' : 'text-gray-500'}`} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 pr-11 [dir=rtl]:pl-11 [dir=rtl]:pr-11 !rounded-xl" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 [dir=rtl]:right-auto [dir=rtl]:left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                  className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded bg-dark-600 border-white/10 text-healix-500 focus:ring-healix-500" />
                    <span className="group-hover:text-gray-300 transition-colors">{isAr ? 'تذكرني' : 'Remember me'}</span>
                  </label>
                  <a href="#" className="text-healix-400 hover:text-healix-300 transition-colors font-medium">{t('auth.forgotPassword')}</a>
                </motion.div>

                <motion.button variants={fadeUp} initial="hidden" animate="visible" custom={5}
                  type="submit" disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 text-base !py-3.5 !rounded-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-healix-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>{t('auth.login')} <ArrowRight size={18} className="[dir=rtl]:rotate-180 group-hover:translate-x-1 transition-transform" /></>}
                  </span>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-600">{isAr ? 'أو' : 'or'}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <p className="text-center text-sm text-gray-400">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-healix-400 hover:text-healix-300 font-semibold transition-colors">{t('auth.register')}</Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-5 text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-emerald-600" /> SSL 256-bit</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-cyan-600" /> HIPAA</span>
            <span className="flex items-center gap-1.5"><Brain size={12} className="text-violet-600" /> AI Powered</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
