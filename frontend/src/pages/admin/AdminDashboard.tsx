import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import {
  Shield, Users, AlertTriangle, Activity, TrendingUp, Download,
  Eye, Search, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  Heart, Zap, FileText, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../../services/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    { label: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: '2,847', change: +12, icon: Users, color: '#06b6d4' },
    { label: language === 'ar' ? 'المستخدمون النشطون' : 'Active Users', value: '1,923', change: +8, icon: Activity, color: '#10b981' },
    { label: language === 'ar' ? 'مخاطر عالية' : 'High Risk', value: '47', change: -3, icon: AlertTriangle, color: '#f43f5e' },
    { label: language === 'ar' ? 'معدل الالتزام' : 'Compliance Rate', value: '87%', change: +5, icon: Shield, color: '#8b5cf6' },
  ];

  const riskDistribution = [
    { name: language === 'ar' ? 'منخفض' : 'Low', value: 1650, color: '#10b981' },
    { name: language === 'ar' ? 'متوسط' : 'Moderate', value: 890, color: '#f59e0b' },
    { name: language === 'ar' ? 'مرتفع' : 'High', value: 260, color: '#f97316' },
    { name: language === 'ar' ? 'حرج' : 'Critical', value: 47, color: '#ef4444' },
  ];

  const userGrowth = [
    { month: 'Jan', users: 1200, active: 800 },
    { month: 'Feb', users: 1500, active: 1000 },
    { month: 'Mar', users: 1800, active: 1250 },
    { month: 'Apr', users: 2100, active: 1500 },
    { month: 'May', users: 2400, active: 1720 },
    { month: 'Jun', users: 2600, active: 1850 },
    { month: 'Jul', users: 2847, active: 1923 },
  ];

  const alertsByType = [
    { type: language === 'ar' ? 'نبض القلب' : 'Heart Rate', count: 23, severity: 'high' },
    { type: language === 'ar' ? 'ضغط الدم' : 'Blood Pressure', count: 18, severity: 'high' },
    { type: language === 'ar' ? 'أدوية فائتة' : 'Missed Medications', count: 45, severity: 'medium' },
    { type: language === 'ar' ? 'عدم النشاط' : 'Inactivity', count: 67, severity: 'low' },
    { type: language === 'ar' ? 'جفاف' : 'Dehydration', count: 31, severity: 'medium' },
    { type: language === 'ar' ? 'اضطراب النوم' : 'Sleep Disruption', count: 52, severity: 'low' },
  ];

  const complianceByCategory = [
    { category: language === 'ar' ? 'الأدوية' : 'Medications', value: 87 },
    { category: language === 'ar' ? 'التمارين' : 'Exercise', value: 72 },
    { category: language === 'ar' ? 'التغذية' : 'Nutrition', value: 68 },
    { category: language === 'ar' ? 'النوم' : 'Sleep', value: 81 },
    { category: language === 'ar' ? 'فحوصات' : 'Check-ups', value: 91 },
  ];

  const highRiskUsers = [
    { name: 'Ahmed M.', nameAr: 'أحمد م.', risk: 82, condition: 'Cardiac', conditionAr: 'قلبي', trend: 'up' },
    { name: 'Sara K.', nameAr: 'سارة ق.', risk: 76, condition: 'Diabetic', conditionAr: 'سكري', trend: 'stable' },
    { name: 'Omar H.', nameAr: 'عمر ح.', risk: 71, condition: 'Hypertension', conditionAr: 'ضغط الدم', trend: 'down' },
    { name: 'Fatima A.', nameAr: 'فاطمة أ.', risk: 68, condition: 'Respiratory', conditionAr: 'تنفسي', trend: 'up' },
    { name: 'Khaled S.', nameAr: 'خالد س.', risk: 65, condition: 'Cardiac', conditionAr: 'قلبي', trend: 'down' },
  ];

  return (
    <motion.div className="page-container" initial="initial" animate="animate">
      <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Shield className="text-healix-400" size={28} />
            {t('admin.title')}
          </h1>
          <p className="section-subtitle">{t('admin.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                timeRange === r ? 'bg-healix-500/20 text-healix-400 border border-healix-500/30' : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
              }`}>{r}</button>
          ))}
          <button className="btn-primary flex items-center gap-2 text-xs">
            <Download size={14} />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} {...fadeInUp} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${stat.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <motion.div {...fadeInUp} className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-white mb-4">{language === 'ar' ? 'نمو المستخدمين' : 'User Growth'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="users" stroke="#06b6d4" fill="url(#usersGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="active" stroke="#10b981" fill="url(#activeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution Pie */}
        <motion.div {...fadeInUp} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">{language === 'ar' ? 'توزيع المخاطر' : 'Risk Distribution'}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                {riskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {riskDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="font-semibold text-gray-300 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts and Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <motion.div {...fadeInUp} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            {language === 'ar' ? 'التنبيهات حسب النوع' : 'Alerts by Type'}
          </h3>
          <div className="space-y-3">
            {alertsByType.map((alert, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-32 truncate">{alert.type}</span>
                <div className="flex-1 h-6 bg-dark-600/40 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(alert.count / 70) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-lg ${
                      alert.severity === 'high' ? 'bg-rose-500/60' :
                      alert.severity === 'medium' ? 'bg-amber-500/60' : 'bg-blue-500/60'
                    }`}
                  />
                </div>
                <span className="text-sm font-bold text-gray-300 w-8">{alert.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliance by Category */}
        <motion.div {...fadeInUp} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            {language === 'ar' ? 'الالتزام حسب الفئة' : 'Compliance by Category'}
          </h3>
          <div className="space-y-4">
            {complianceByCategory.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{cat.category}</span>
                  <span className={`font-bold ${cat.value >= 80 ? 'text-emerald-400' : cat.value >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{cat.value}%</span>
                </div>
                <div className="h-2.5 bg-dark-600/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full ${cat.value >= 80 ? 'bg-emerald-500' : cat.value >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* High Risk Users Table */}
      <motion.div {...fadeInUp} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-400" />
            {language === 'ar' ? 'المستخدمون ذوو المخاطر العالية' : 'High Risk Users'}
          </h3>
          <button className="text-healix-400 text-sm hover:underline flex items-center gap-1">
            {language === 'ar' ? 'عرض الكل' : 'View all'} <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left [dir=rtl]:text-right border-b border-white/5">
                <th className="pb-3 font-medium">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="pb-3 font-medium">{language === 'ar' ? 'الحالة' : 'Condition'}</th>
                <th className="pb-3 font-medium">{language === 'ar' ? 'مستوى الخطر' : 'Risk Level'}</th>
                <th className="pb-3 font-medium">{language === 'ar' ? 'الاتجاه' : 'Trend'}</th>
                <th className="pb-3 font-medium">{language === 'ar' ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {highRiskUsers.map((u, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dark-600/60 flex items-center justify-center text-xs font-bold text-healix-400">
                        {(language === 'ar' ? u.nameAr : u.name).charAt(0)}
                      </div>
                      <span className="text-white">{language === 'ar' ? u.nameAr : u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-400">{language === 'ar' ? u.conditionAr : u.condition}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-dark-600/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${u.risk >= 75 ? 'bg-rose-500' : u.risk >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${u.risk}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${u.risk >= 75 ? 'text-rose-400' : u.risk >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {u.risk}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 text-xs ${
                      u.trend === 'up' ? 'text-rose-400' : u.trend === 'down' ? 'text-emerald-400' : 'text-gray-400'
                    }`}>
                      {u.trend === 'up' ? <ArrowUpRight size={14} /> : u.trend === 'down' ? <ArrowDownRight size={14} /> : '—'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs text-healix-400 border border-healix-500/20 rounded-lg px-3 py-1.5 hover:bg-healix-500/10 transition-colors flex items-center gap-1">
                      <Eye size={12} /> {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Export Section */}
      <motion.div {...fadeInUp} className="glass-card p-6 gradient-border">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={20} className="text-healix-400" />
          <h3 className="text-white font-semibold">{t('admin.exportReport')}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">{language === 'ar' ? 'تصدير تقرير شامل لجميع البيانات' : 'Export a comprehensive report of all data'}</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary text-sm flex items-center gap-2"><Download size={16} /> PDF</button>
          <button className="btn-secondary text-sm flex items-center gap-2"><Download size={16} /> CSV</button>
          <button className="btn-secondary text-sm flex items-center gap-2"><Download size={16} /> Excel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
