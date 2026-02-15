import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useUIStore, useVitalsStore } from '../../store';
import {
  LayoutDashboard, Dumbbell, UtensilsCrossed, Activity, TrendingUp,
  Pill, MessageSquareMore, ShieldCheck, User, Settings, LogOut,
  ChevronLeft, ChevronRight, X, Heart, AlertTriangle, Phone, Scan,
  Stethoscope, ShieldAlert, FileBarChart, Salad, BookOpen,
} from 'lucide-react';

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/app/exercises', icon: Dumbbell, labelKey: 'nav.exercises' },
  { path: '/app/nutrition', icon: UtensilsCrossed, labelKey: 'nav.nutrition' },
  { path: '/app/monitoring', icon: Activity, labelKey: 'nav.monitoring' },
  { path: '/app/predictions', icon: TrendingUp, labelKey: 'nav.predictions' },
  { path: '/app/medications', icon: Pill, labelKey: 'nav.medications' },
  { path: '/app/chat', icon: MessageSquareMore, labelKey: 'nav.chat' },
  { path: '/app/vr', icon: Scan, labelKey: 'nav.vr' },
  { path: '/app/symptoms', icon: Stethoscope, labelKey: 'nav.symptoms' },
  { path: '/app/drug-check', icon: ShieldAlert, labelKey: 'nav.drugCheck' },
  { path: '/app/health-report', icon: FileBarChart, labelKey: 'nav.healthReport' },
  { path: '/app/meal-planner', icon: Salad, labelKey: 'nav.mealPlanner' },
  { path: '/app/journal', icon: BookOpen, labelKey: 'nav.journal' },
];

const adminItems = [
  { path: '/app/admin', icon: ShieldCheck, labelKey: 'nav.admin' },
];

const bottomItems = [
  { path: '/app/profile', icon: User, labelKey: 'nav.profile' },
  { path: '/app/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapse } = useUIStore();
  const { current: vitals } = useVitalsStore();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const renderLink = (item: typeof navItems[0]) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={() => sidebarOpen && toggleSidebar()}
      className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}
    >
      <item.icon size={20} />
      {!sidebarCollapsed && (
        <span className="truncate">{t(item.labelKey)}</span>
      )}
      {isActive(item.path) && !sidebarCollapsed && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-healix-400 to-emerald-400 rounded-r-full"
        />
      )}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-healix-500/20">
            <Heart size={20} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-xl font-bold text-gradient">Healix</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">AI Health Platform</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-dark-600 text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Vitals Mini Card */}
      {!sidebarCollapsed && vitals && (
        <div className="mx-4 mb-4 p-3 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className={`${vitals.status === 'critical' ? 'text-rose-400 animate-heartbeat' : vitals.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-xs text-gray-400">{t('dashboard.heartRate')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{vitals.heartRate}</span>
            <span className="text-xs text-gray-500">{t('dashboard.bpm')}</span>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-gray-500">
            <span>O₂ {vitals.oxygenSaturation}%</span>
            <span className={`badge-${vitals.status === 'critical' ? 'danger' : vitals.status === 'warning' ? 'warning' : 'success'} !text-[10px] !px-1.5`}>
              {t(`dashboard.status.${vitals.status}`)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map(renderLink)}
        </div>

        {user?.role === 'admin' && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-0.5">
            {adminItems.map(renderLink)}
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/5 pt-3">
        {bottomItems.map(renderLink)}

        {/* Emergency Button */}
        <button
          onClick={() => {
            if (user?.emergencyContact?.phone) {
              window.open(`tel:${user.emergencyContact.phone}`);
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 
                     bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 
                     transition-all duration-200 group"
        >
          <Phone size={20} className="group-hover:animate-pulse" />
          {!sidebarCollapsed && <span className="font-medium">{t('common.emergency')}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full sidebar-link text-gray-500 hover:text-rose-400"
        >
          <LogOut size={20} />
          {!sidebarCollapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>

      {/* Collapse Toggle (desktop only) */}
      <button
        onClick={toggleSidebarCollapse}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-600 border border-white/10 
                   items-center justify-center text-gray-400 hover:text-white hover:bg-dark-500 transition-all z-50"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden lg:block fixed top-0 left-0 h-screen bg-dark-800/80 backdrop-blur-xl 
                     border-r border-white/5 z-40 transition-all duration-300
                     ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
                     [dir=rtl]:border-r-0 [dir=rtl]:border-l [dir=rtl]:right-0 [dir=rtl]:left-auto`}
        initial={false}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleSidebar}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[280px] bg-dark-800/95 backdrop-blur-xl 
                         border-r border-white/5 z-50 lg:hidden
                         [dir=rtl]:left-auto [dir=rtl]:right-0 [dir=rtl]:border-r-0 [dir=rtl]:border-l"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
