import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useAuthStore } from '../../store';
import {
  Send, Bot, User, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown,
  Activity, Utensils, Dumbbell, AlertTriangle, Mic, Paperclip, ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import { HoloParticles, HoloBgMesh } from '../../components/hologram/HologramEffects';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: 'clinical' | 'nutrition' | 'exercise' | 'risk';
  timestamp: Date;
  thinking?: boolean;
}

const agentConfig = {
  clinical: { label: 'Clinical Agent', labelAr: 'الوكيل السريري', icon: Activity, color: '#06b6d4', bg: 'bg-cyan-500/10' },
  nutrition: { label: 'Nutrition Agent', labelAr: 'وكيل التغذية', icon: Utensils, color: '#10b981', bg: 'bg-emerald-500/10' },
  exercise: { label: 'Exercise Agent', labelAr: 'وكيل التمارين', icon: Dumbbell, color: '#8b5cf6', bg: 'bg-violet-500/10' },
  risk: { label: 'Risk Agent', labelAr: 'وكيل المخاطر', icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10' },
};

export default function Chat() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1', role: 'assistant', agent: 'clinical',
      content: language === 'ar'
        ? 'مرحباً! أنا المساعد الطبي الذكي في Healix. يمكنني مساعدتك في فهم حالتك الصحية، تحليل بيانات ساعتك الذكية، وتقديم توصيات مخصصة. كيف يمكنني مساعدتك اليوم؟'
        : "Hello! I'm the Healix AI Health Assistant. I can help you understand your health status, analyze your smartwatch data, and provide personalized recommendations. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = language === 'ar' ? [
    'حلل بيانات نومي من الأسبوع الماضي',
    'ما هو أفضل وقت للتمرين بالنسبة لحالتي؟',
    'هل معدل نبضي الحالي طبيعي؟',
    'أخبرني عن التفاعلات بين أدويتي',
    'كيف أحسن مستوى التوتر لدي؟',
    'هل يمكنني تناول هذا الطعام مع أدويتي؟',
  ] : [
    'Analyze my sleep data from last week',
    'What is the best time to exercise for my condition?',
    'Is my current heart rate normal?',
    'Tell me about my medication interactions',
    'How can I improve my stress levels?',
    'Can I eat this food with my medications?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/chat/', { message: input, agent: selectedAgent });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        agent: res.data.agent || 'clinical',
        content: res.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback response when API is not available
      const fallbackResponses: Record<string, { content: string; agent: 'clinical' | 'nutrition' | 'exercise' | 'risk' }> = {
        default: {
          agent: 'clinical',
          content: language === 'ar'
            ? 'شكراً لسؤالك. بناءً على بياناتك الصحية، حالتك العامة مستقرة. معدل نبض القلب في النطاق الطبيعي ومستوى الأكسجين ممتاز. أنصحك بالاستمرار في البرنامج الحالي والتركيز على جودة النوم. هل لديك أي أسئلة أخرى؟'
            : 'Thank you for your question. Based on your health data, your overall condition is stable. Heart rate is within normal range and oxygen levels are excellent. I recommend continuing the current program and focusing on sleep quality. Do you have any other questions?',
        },
      };
      const fb = fallbackResponses.default;
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          agent: fb.agent,
          content: fb.content,
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 1500);
      return;
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  return (
    <motion.div className="page-container !pb-0 flex flex-col h-[calc(100vh-7rem)] relative" initial="initial" animate="animate">
      <HoloBgMesh className="opacity-50" />

      {/* Header — Holographic */}
      <motion.div {...fadeInUp} className="flex-shrink-0 relative z-10">
        <h1 className="section-title flex items-center gap-2">
          <div className="relative">
            <Bot className="text-healix-400" size={28} />
            <div className="absolute inset-0 blur-md bg-cyan-500/20 rounded-full" />
          </div>
          <span className="holo-text">{t('chat.title')}</span>
        </h1>
        <p className="section-subtitle mb-4">{t('chat.subtitle')}</p>
      </motion.div>

      {/* Agent Filters — Holographic Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0 mb-4 relative z-10">
        <button onClick={() => setSelectedAgent(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            !selectedAgent ? 'holo-badge' : 'text-gray-400 hover:text-white border border-transparent hover:bg-dark-600/50'
          }`}>
          <Sparkles size={14} />
          {language === 'ar' ? 'الكل (تلقائي)' : 'All (Auto)'}
        </button>
        {Object.entries(agentConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setSelectedAgent(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedAgent === key ? 'text-white border' : 'text-gray-400 hover:text-white border border-transparent hover:bg-dark-600/50'
            }`} style={selectedAgent === key ? { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40', color: cfg.color } : {}}>
            <cfg.icon size={14} />
            {language === 'ar' ? cfg.labelAr : cfg.label}
          </button>
        ))}
      </div>

      {/* Messages — with holographic glow */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 space-y-4 relative z-10">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar — Holographic glow */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
              msg.role === 'user' ? 'bg-healix-500/20' : msg.agent ? agentConfig[msg.agent].bg : 'bg-dark-600'
            }`}>
              {msg.role === 'assistant' && (
                <div className="absolute inset-0 rounded-xl animate-pulse opacity-30" style={{ boxShadow: `0 0 15px ${msg.agent ? agentConfig[msg.agent].color : '#06b6d4'}40` }} />
              )}
              {msg.role === 'user' ? (
                <User size={16} className="text-healix-400" />
              ) : msg.agent ? (
                (() => { const Icon = agentConfig[msg.agent].icon; return <Icon size={16} style={{ color: agentConfig[msg.agent].color }} />; })()
              ) : (
                <Bot size={16} className="text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right [dir=rtl]:text-left' : ''}`}>
              {msg.role === 'assistant' && msg.agent && (
                <span className="text-[10px] font-medium mb-1 block" style={{ color: agentConfig[msg.agent].color }}>
                  {language === 'ar' ? agentConfig[msg.agent].labelAr : agentConfig[msg.agent].label}
                </span>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-healix-500/20 text-white border border-healix-500/20'
                  : 'holo-card !rounded-2xl text-gray-200 holo-datastream'
              }`}>
                {msg.content}
              </div>
              <div className={`flex items-center gap-2 mt-1.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <span className="text-[10px] text-gray-600">
                  {msg.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-dark-500/50 text-gray-600 hover:text-gray-400 transition-colors">
                      <Copy size={12} />
                    </button>
                    <button className="p-1 rounded hover:bg-dark-500/50 text-gray-600 hover:text-emerald-400 transition-colors">
                      <ThumbsUp size={12} />
                    </button>
                    <button className="p-1 rounded hover:bg-dark-500/50 text-gray-600 hover:text-rose-400 transition-colors">
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator — Holographic */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-healix-500/10 flex items-center justify-center relative">
              <Bot size={16} className="text-healix-400" />
              <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 15px rgba(6,182,212,0.2)', animation: 'holo-pulse-ring 2s ease-in-out infinite' }} />
            </div>
            <div className="holo-card !rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-healix-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-healix-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-healix-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <motion.div {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => handleSuggestion(q)}
                className="text-left [dir=rtl]:text-right p-3 holo-card !rounded-xl text-sm text-gray-300 hover:text-white transition-all holo-corners">
                <Sparkles size={12} className="inline text-healix-400 mr-2 [dir=rtl]:ml-2 [dir=rtl]:mr-0" />
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — Holographic */}
      <div className="flex-shrink-0 py-4 border-t border-cyan-500/10 relative z-10">
        <div className="holo-card holo-scan p-3 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ar' ? 'اسأل المساعد الطبي الذكي...' : 'Ask the AI Health Assistant...'}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm max-h-32 py-2 px-2"
            style={{ minHeight: '40px' }}
          />
          <div className="flex items-center gap-1">
            <button className="p-2.5 rounded-xl hover:bg-dark-600/60 text-gray-400 hover:text-white transition-colors">
              <Paperclip size={18} />
            </button>
            <button onClick={handleSend} disabled={!input.trim()}
              className={`p-2.5 rounded-xl transition-all ${
                input.trim() ? 'bg-healix-500 text-white hover:bg-healix-600' : 'bg-dark-600/60 text-gray-600'
              }`}>
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2">
          {language === 'ar' ? 'المساعد الذكي لا يغني عن استشارة الطبيب' : 'AI assistant does not replace professional medical advice'}
        </p>
      </div>
    </motion.div>
  );
}
