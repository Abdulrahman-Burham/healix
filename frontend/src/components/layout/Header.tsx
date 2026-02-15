import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useUIStore, useVitalsStore } from '../../store';
import {
  Menu, Bell, Globe, Search, AlertTriangle, Heart, X,
} from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { toggleSidebar, language, setLanguage } = useUIStore();
  const { alerts } = useVitalsStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center relative">
            <Search size={18} className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder={t('common.search') + '...'}
              className="pl-10 pr-4 py-2 w-64 bg-dark-700/50 border border-white/5 rounded-xl text-sm text-white
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-healix-500/50 
                         focus:border-healix-500/30 transition-all"
            />
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-xl hover:bg-dark-700 text-gray-400"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-dark-700 text-gray-400 
                       hover:text-white transition-all text-sm font-medium"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{language === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center 
                             bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-rose-500/30"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 [dir=rtl]:right-auto [dir=rtl]:left-0 mt-2 w-80 
                               bg-dark-700/95 backdrop-blur-xl border border-white/10 rounded-2xl 
                               shadow-2xl shadow-black/30 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-dark-600 rounded-lg"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          {t('common.noData')}
                        </div>
                      ) : (
                        alerts.slice(0, 10).map((alert) => (
                          <div
                            key={alert._id}
                            className={`px-4 py-3 border-b border-white/5 hover:bg-dark-600/50 transition-colors
                                       ${!alert.read ? 'bg-healix-500/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-lg ${
                                alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                                alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-healix-500/20 text-healix-400'
                              }`}>
                                {alert.severity === 'critical' ? <AlertTriangle size={14} /> :
                                 alert.severity === 'warning' ? <AlertTriangle size={14} /> :
                                 <Heart size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {language === 'ar' ? alert.titleAr : alert.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                  {language === 'ar' ? alert.messageAr : alert.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-3 ml-1 border-l border-white/5
                          [dir=rtl]:pl-0 [dir=rtl]:pr-3 [dir=rtl]:ml-0 [dir=rtl]:mr-1 
                          [dir=rtl]:border-l-0 [dir=rtl]:border-r [dir=rtl]:border-white/5">
            <div className="hidden sm:block text-right [dir=rtl]:text-left">
              <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
              <p className="text-[11px] text-gray-500 leading-tight">
                {user?.role === 'admin' ? t('nav.admin') : 'Member'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-healix-500 to-emerald-500 
                            flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-healix-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden px-4 pb-3 overflow-hidden"
          >
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t('common.search') + '...'}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl 
                           text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 
                           focus:ring-healix-500/50"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
