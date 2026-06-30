import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Users, Sparkles, MessageCircle, X, ChevronDown, 
  MapPin, HelpCircle, Trophy, Volume2, RefreshCw
} from 'lucide-react';
import { UserProgress } from '../types';

export interface ChatMessage {
  id: string;
  studentName: string;
  studentCity: string;
  studentAvatar: string;
  content: string;
  timestamp: string;
}

interface StudentChatProps {
  progress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
}

const SCIENCE_EMOJIS = ["🔬", "🧬", "🪐", "🌸", "❤️", "👍", "💡", "🧠", "🏆", "🇸🇩", "🌟", "👏"];

const DEFAULT_SEED_MESSAGES: ChatMessage[] = [
  {
    id: "seed-1",
    studentName: "مريم",
    studentCity: "بورتسودان",
    studentAvatar: "🌸",
    content: "يا جماعة محاكي الدورة الدموية ممتع شديد! فهمت كيف القلب بينبض ويوزع الأكسجين لكافة الجسم 😍",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "seed-2",
    studentName: "أحمد",
    studentCity: "أم درمان",
    studentAvatar: "🦁",
    content: "جربت محاكي منشور الضوء؟ بيقسم الضوء لسبعة ألوان طيفية رائعة للغاية 🌈✨ سبحان الله المبدع!",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "seed-3",
    studentName: "مازن",
    studentCity: "الخرطوم",
    studentAvatar: "🔬",
    content: "حللت تحدي اليوم وحصلت على 50 نقطة إضافية! مستواي الآن ارتفع وعايز أحقق الترتيب الأول هنا 🏆🥇",
    timestamp: new Date(Date.now() - 1200000).toISOString()
  }
];

export default function StudentChat({ progress, isOpen, onClose }: StudentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMembersCount, setActiveMembersCount] = useState(13); // Fun mock count of active Sudanese students
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync offline state dynamically
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll for messages every 5 seconds when open
  useEffect(() => {
    fetchMessages();
    
    // Simulate natural fluctuation of online Sudanese kids
    const countInterval = setInterval(() => {
      setActiveMembersCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        return Math.max(8, Math.min(25, prev + change));
      });
    }, 15000);

    const pollInterval = setInterval(() => {
      if (isOpen) {
        fetchMessages(true);
      }
    }, 5000);

    return () => {
      clearInterval(countInterval);
      clearInterval(pollInterval);
    };
  }, [isOpen]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const fetchMessages = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const studentName = progress.studentName || '';
      const res = await fetch('/api/chat', {
        headers: {
          'x-student-name': encodeURIComponent(studentName)
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Save cache for offline/static deployment recovery
        localStorage.setItem('sudan_grade6_science_chat_cache', JSON.stringify(data.messages || []));
      } else {
        throw new Error('API server returned error status');
      }
    } catch (e) {
      console.warn("Backend chat API is offline, using localized chat fallback.", e);
      // Retrieve from localized storage cache, or fallback to beautiful Sudanese seed messages
      const cached = localStorage.getItem('sudan_grade6_science_chat_cache');
      if (cached) {
        try {
          setMessages(JSON.parse(cached));
        } catch {
          setMessages(DEFAULT_SEED_MESSAGES);
        }
      } else {
        setMessages(DEFAULT_SEED_MESSAGES);
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMsg = inputText.trim();
    if (!cleanMsg || isSending) return;

    setIsSending(true);
    
    // Optimistic UI updates
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      studentName: progress.studentName || 'مستكشف مجهول',
      studentCity: progress.studentCity || 'الخرطوم',
      studentAvatar: progress.studentAvatar || '🔬',
      content: cleanMsg,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: progress.studentName,
          studentCity: progress.studentCity,
          studentAvatar: progress.studentAvatar,
          content: cleanMsg
        })
      });

      if (!res.ok) {
        throw new Error('API server failed to accept message');
      }

      // Re-fetch current state to guarantee synchronization
      await fetchMessages(true);

    } catch (err) {
      console.warn("Error sending message to server, handling via offline local mode.", err);
      
      // Handle locally so the user doesn't get interrupted with a boring error prompt!
      const cachedString = localStorage.getItem('sudan_grade6_science_chat_cache');
      let localMsgs: ChatMessage[] = [];
      if (cachedString) {
        try {
          localMsgs = JSON.parse(cachedString);
        } catch {
          localMsgs = [...DEFAULT_SEED_MESSAGES];
        }
      } else {
        localMsgs = [...DEFAULT_SEED_MESSAGES];
      }

      // Append user's newly composed message
      const persistentLocalMsg: ChatMessage = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        studentName: progress.studentName || 'مستكشف مجهول',
        studentCity: progress.studentCity || 'الخرطوم',
        studentAvatar: progress.studentAvatar || '🔬',
        content: cleanMsg,
        timestamp: new Date().toISOString()
      };

      // Filter out any tempId so we don't have duplicates
      localMsgs = localMsgs.filter(m => m.id !== tempId && !m.id.startsWith('temp-'));
      localMsgs.push(persistentLocalMsg);
      
      if (localMsgs.length > 150) {
        localMsgs.shift();
      }

      localStorage.setItem('sudan_grade6_science_chat_cache', JSON.stringify(localMsgs));
      setMessages(localMsgs);
    } finally {
      setIsSending(false);
    }
  };

  // Quick emoji insertion helper
  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 left-0 w-full sm:w-96 bg-white border-r-4 border-indigo-200 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-slide-in text-right"
      dir="rtl"
      id="student-chat-drawer"
    >
      {/* Drawer Header */}
      <header className="bg-gradient-to-r from-indigo-650 to-indigo-500 text-white p-4.5 flex items-center justify-between shadow-md border-b-2 border-indigo-400">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-700 p-2 rounded-2xl border border-indigo-400 text-yellow-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xs sm:text-sm tracking-tight flex items-center gap-1">
              <span>دردشة أبطال مير للعلوم</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            </h3>
            <p className="text-[10px] text-indigo-150 font-bold mt-0.5">
              نشط الآن: {activeMembersCount} مستكشف سوداني 🇸🇩
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => fetchMessages()}
            className="p-1 px-1.5 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition"
            title="تحديث المحادثة"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 bg-indigo-750 hover:bg-indigo-800 rounded-xl transition text-indigo-200 hover:text-white"
            aria-label="إغلاق الدردشة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3.5 py-2 text-[10px] font-bold leading-normal flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300 shrink-0 mt-0.5" />
        <p>
          أهلاً بك في الملتقى الآمن لطلاب الصف الثالث! تناقشوا بلطف حول الأسئلة، وشاركوا إنجازات بخت الرضا. ممنوع تبادل المعلومات الشخصية 🔒.
        </p>
      </div>

      {/* Messages List Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4.5 bg-slate-50/70"
        id="chat-messages-container"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <span className="text-4xl animate-bounce">💬</span>
            <p className="font-extrabold text-xs text-slate-700">لا توجد رسائل بعد</p>
            <p className="text-[10px] text-slate-400 font-semibold max-w-xs leading-relaxed">
              كن أول من يكتب ترحيباً لزملائك الطلاب في كافة أنحاء السودان الحبيب!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.studentName === progress.studentName && msg.studentCity === progress.studentCity;
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 items-start max-w-[90%] transition-all ${
                  isMe ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'
                }`}
              >
                {/* Avatar Icon */}
                <div className="w-9 h-9 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-lg shadow-sm shrink-0">
                  {msg.studentAvatar || '🦁'}
                </div>

                {/* Message Bubble Column */}
                <div className="space-y-1">
                  {/* Name and State credentials */}
                  <div className={`flex items-center gap-1.5 text-[9.5px] font-extrabold text-slate-500 ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-slate-800">{msg.studentName}</span>
                    <span className="text-[8.5px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-indigo-750 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-indigo-400" />
                      {msg.studentCity.replace(' • ', '•')}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm border ${
                    isMe 
                      ? 'bg-gradient-to-br from-indigo-550 to-indigo-600 text-white border-indigo-350 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-indigo-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Time formatting */}
                  <p className={`text-[8px] text-slate-400 font-bold ${isMe ? 'text-left' : 'text-right'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('ar-SD', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Fast Keyboard Panel */}
      <div className="px-3 border-t border-slate-100 py-1.5 bg-white flex flex-wrap gap-1 items-center justify-center">
        <span className="text-[9px] text-slate-400 font-bold ml-1.5 shrink-0">رموز سريعة:</span>
        {SCIENCE_EMOJIS.map(emoji => (
          <button
            key={emoji}
            type="button"
            disabled={isOffline}
            onClick={() => handleInsertEmoji(emoji)}
            className={`w-7 h-7 bg-slate-50 rounded-lg text-xs flex items-center justify-center border border-slate-100 transition ${
              isOffline ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-90 cursor-pointer'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message input footer form */}
      <footer className="p-3 bg-white border-t border-indigo-150 relative">
        {isOffline ? (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-2.5 text-center text-[10px] font-bold text-indigo-800 leading-normal">
            📡 عذراً يا بطل! رفيقك الذكي بخت الرضا يحتاج إلى اتصال بالإنترنت ليجيب على أسئلتك. تصفح الدروس وحل المسابقات الرائعة حتى يعود الاتصال! 🌐
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              maxLength={180}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`تحدّث مع زملائك، يا ${progress.studentName || 'بطل'}...`}
              className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 font-medium text-xs p-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-455 focus:outline-none transition-all shadow-inner text-right"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className={`p-3 rounded-2xl text-white font-extrabold flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                inputText.trim() 
                  ? 'bg-indigo-600 border-indigo-400 hover:bg-indigo-700 shadow shadow-indigo-100' 
                  : 'bg-slate-300 border-transparent cursor-not-allowed text-slate-400'
              }`}
            >
              <Send className="w-4 h-4 transform rotate-180" />
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
