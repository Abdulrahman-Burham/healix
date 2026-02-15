import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore, useUIStore } from '../../store';
import {
  Heart, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Globe,
  Activity, Brain, Dumbbell, Utensils, Shield, Sparkles, CheckCircle, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const { language, setLanguage } = useUIStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isAr = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(isAr ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    try {
      await register(form.email, form.password, form.name, language);
      toast.success(t('common.success'));
      navigate('/onboarding');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('common.error'));
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const passStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabels = [
    '', isAr ? 'ضعيف' : 'Weak', isAr ? 'متوسط' : 'Medium', isAr ? 'قوي' : 'Strong'
  ];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-dark-900 flex relative overflow-hidden">
      {/* Animated BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-healix-500/6 blur-[120px] animate-float animation-delay-300" />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px] animate-float animation-delay-500" />
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

      {/* Left: Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 pt-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-healix-500/20">
              <Heart size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient">Healix</h1>
              <p className="text-xs text-gray-500">{t('app.tagline')}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-b from-emerald-500/10 via-transparent to-healix-500/5 blur-xl" />
            <div className="relative glass-card !rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 border border-white/[0.06]">
              <div className="text-center mb-6">
                <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={0}
                  className="text-2xl font-black text-white">{t('auth.registerTitle')}</motion.h2>
                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="text-gray-500 mt-2 text-sm">{t('auth.registerSubtitle')}</motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.name')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'name' ? 'ring-2 ring-emerald-500/30' : ''}`}>
                    <User size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'name' ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 [dir=rtl]:pl-4 [dir=rtl]:pr-11 !rounded-xl" placeholder={isAr ? 'أحمد محمد' : 'John Doe'} required />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.email')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-healix-500/30' : ''}`}>
                    <Mail size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-healix-400' : 'text-gray-500'}`} />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 [dir=rtl]:pl-4 [dir=rtl]:pr-11 !rounded-xl" placeholder="name@example.com" required />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.password')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-healix-500/30' : ''}`}>
                    <Lock size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-healix-400' : 'text-gray-500'}`} />
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 pr-11 [dir=rtl]:pr-11 [dir=rtl]:pl-11 !rounded-xl" placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 [dir=rtl]:right-auto [dir=rtl]:left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {form.password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3].map(s => (
                          <div key={s} className="h-1 flex-1 rounded-full transition-colors duration-300"
                            style={{ backgroundColor: s <= passStrength ? strengthColors[passStrength] : 'rgba(255,255,255,0.05)' }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: strengthColors[passStrength] }}>{strengthLabels[passStrength]}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.confirmPassword')}</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'confirm' ? 'ring-2 ring-emerald-500/30' : ''}`}>
                    <Lock size={18} className={`absolute left-4 [dir=rtl]:left-auto [dir=rtl]:right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'confirm' ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                      className="input-field pl-11 [dir=rtl]:pl-4 [dir=rtl]:pr-11 !rounded-xl" placeholder="••••••••" required minLength={6} />
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <CheckCircle size={18} className="absolute right-4 [dir=rtl]:right-auto [dir=rtl]:left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                </motion.div>

                <motion.button variants={fadeUp} initial="hidden" animate="visible" custom={6}
                  type="submit" disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 text-base !py-3.5 !rounded-xl !mt-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-healix-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>{t('auth.register')} <ArrowRight size={18} className="[dir=rtl]:rotate-180 group-hover:translate-x-1 transition-transform" /></>}
                  </span>
                </motion.button>
              </form>

              <div className="my-5 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-600">{isAr ? 'أو' : 'or'}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <p className="text-center text-sm text-gray-400">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="text-healix-400 hover:text-healix-300 font-semibold transition-colors">{t('auth.login')}</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: Branding (desktop) */}
      <div className="hidden lg:flex lg:w-[50%] relative items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <Sparkles size={12} /> {isAr ? 'ابدأ رحلتك المجانية' : 'Start Your Free Journey'}
          </motion.div>

          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            {isAr ? 'انضم إلى' : 'Join'}
            <br />
            <span className="gradient-text-hero">Healix</span>
            {isAr ? ' اليوم' : ' Today'}
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8 text-lg">
            {isAr
              ? 'سجّل الآن واحصل على تجربة صحية شخصية مدعومة بالذكاء الاصطناعي.'
              : 'Sign up now and get a personalized AI-powered health experience.'}
          </p>

          {/* What you get */}
          <div className="space-y-3">
            {[
              { icon: Activity, text: isAr ? 'مراقبة حية لجميع مؤشراتك الحيوية' : 'Live monitoring of all your vital signs', color: '#ef4444' },
              { icon: Brain, text: isAr ? 'دردشة مع 4 وكلاء ذكاء اصطناعي' : 'Chat with 4 specialized AI agents', color: '#8b5cf6' },
              { icon: Dumbbell, text: isAr ? 'تمارين مخصصة مع أنيميشن' : 'Custom exercises with animations', color: '#10b981' },
              { icon: Utensils, text: isAr ? 'خطط تغذية يومية تلقائية' : 'Automatic daily nutrition plans', color: '#f59e0b' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-dark-800/30 border border-white/5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color + '15' }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <span className="text-sm text-gray-300">{f.text}</span>
                <CheckCircle size={14} className="text-emerald-500/40 ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-8 flex items-center gap-4 text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-emerald-600" /> {isAr ? 'بياناتك محمية' : 'Data Protected'}</span>
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-cyan-600" /> {isAr ? 'مجاناً للأبد' : 'Free Forever'}</span>
          </motion.div>
        </motion.div>

        {/* Decorative rotating arcs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          {[380, 340, 300].map((s, i) => (
            <motion.div key={i} className="absolute rounded-full border" style={{
              width: s, height: s, left: `calc(50% - ${s/2}px)`, top: `calc(50% - ${s/2}px)`,
              borderColor: i === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(6,182,212,0.05)'
            }} animate={{ rotate: i % 2 === 0 ? 360 : -360 }} transition={{ duration: 45 + i * 10, repeat: Infinity, ease: 'linear' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
