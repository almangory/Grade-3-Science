import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, RefreshCw, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { Message } from '../types';
import { curriculumData } from '../data/curriculum';

interface AIAssistantProps {
  currentContext?: string;
}

// Compact Arabic Normalizer for local search fallback
function cleanArabicText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // Remove harakat
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function AIAssistant({ currentContext }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'tutor',
      content: 'مرحباً بك يا بطل! أنا "حكيم المعرفة"، مرشدك الذكي لمادة العلوم للصف الثالث الابتدائي. يسعدني تبسيط كيفية غسل اليدين ونظافة الأسنان، أو تصنيف مجموعات الحيوانات وحركتها وغذائها، أو أجزاء النبات وحالات المادة والظلال! ما الذي تشوق لمعرفته اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync offline status in real time
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fast prompts
  const suggestions = [
    { title: "غسل اليدين 🧼", text: "لماذا يجب غسل اليدين بالماء والصابون لمدة ٢٠ ثانية؟" },
    { title: "مجموعات الحيوان 🦎", text: "كيف نفرق بين الزواحف والبرمائيات والطيور؟" },
    { title: "حالات المادة 🧊", text: "ما الفرق بين الحالة الصلبة والسائلة والغازية؟" },
    { title: "تكون الظلال 👥", text: "كيف يتكون الظل في الحديقة طوال النهار؟" }
  ];

  // Smart client-side expert fallback when offline
  const getOfflineTutorResponse = (query: string): string => {
    const cleanQuery = cleanArabicText(query);
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);
    
    let bestMatch: { title: string; summary: string; detail?: string } | null = null;
    let maxMatches = 0;

    // Search curriculumData for matches
    curriculumData.forEach(unit => {
      unit.lessons.forEach(lesson => {
        let matchesCount = 0;
        const normalizedTitle = cleanArabicText(lesson.title);
        const normalizedSummary = cleanArabicText(lesson.summary);

        queryTokens.forEach(token => {
          if (normalizedTitle.includes(token)) matchesCount += 3; // Title has higher weight
          if (normalizedSummary.includes(token)) matchesCount += 2;
          
          lesson.contentSection.forEach(section => {
            if (cleanArabicText(section.subtitleString).includes(token)) matchesCount += 1;
            section.paragraphs.forEach(para => {
              if (cleanArabicText(para).includes(token)) matchesCount += 1;
            });
          });
        });

        if (matchesCount > maxMatches) {
          maxMatches = matchesCount;
          bestMatch = {
            title: lesson.title,
            summary: lesson.summary,
            detail: lesson.contentSection[0]?.paragraphs[0] // grab first paragraph as extra info
          };
        }
      });
    });

    if (bestMatch && maxMatches >= 2) {
      return `أهلاً يا بطل العلوم العبقري! 🎒📡 أنا أحدثك الآن من **"وضع الأوفلاين السحري"** بدون إنترنت. 

لقد بحثت في مكتبتي المحلية المدمجة بخصوص سؤالك ووجدت درساً رائعاً في كتاب العلوم وهو: **${(bestMatch as any).title}**! 🔬📚

**إليك الخلاصة العلمية المعتمدة لدرس اليوم:**
" ${(bestMatch as any).summary} "

${(bestMatch as any).detail ? `💡 **معلومة مفصلة إضافية:**\n"${(bestMatch as any).detail}"` : ''}

هل تود الاستفسار عن تفاصيل أخرى في هذا الدرس يا بطل؟ اكتب سؤالك وسأجيبك فوراً! 🌟✏️`;
    }

    // Default polite educational fallback in offline mode
    return `مرحباً يا مستكشف العلوم البطل! 🧠✨ أنا أحدثك الآن عبر **"وضع الأوفلاين السحري"** ليعمل التطبيق كاملاً بدون إنترنت في أي مكان بالبلاد! 📡🇸🇩

سؤالك رائع، ولكن كوني أعمل بدون اتصال بالإنترنت حالياً، لم أجد تطابقاً كاملاً في كتاب العلوم للصف الثالث بخصوص هذه الكلمات الدقيقة. 

**هل تود أن نتذاكر سوياً في أحد المواضيع المتاحة بالكامل دون إنترنت؟:**
1. 🦎 **مجموعات الحيوان وغذائها:** (كيف تتحرك، ماذا تأكل، وتصنيفاتها).
2. 🧼 **صحتنا ونظافتنا الجسدية:** (أهمية غسل الأيدي بالصابون لمدة ٢٠ ثانية، تنظيف الأسنان بالفرشاة والسواك).
3. 🌵 **النباتات ومواطنها:** (أجزاء النبتة من جذور وساق وأوراق، ومواطن اليابسة والمائية).
4. 🧊 **المواد من حولنا وحالاتها:** (المطاط والصلصال، والحالة الصلبة والسائلة والغازية، والظل).

اكتب لي أي موضوع من هذه المواضيع وسأبسطه لك فوراً بأسلوب مشوق! ❤️🧪`;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setErrorText(null);
    const userMsg: Message = {
      id: `student-${Date.now()}`,
      role: 'student',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    // If completely offline, respond instantly with local intelligence
    if (isOffline) {
      setTimeout(() => {
        const localReply = getOfflineTutorResponse(text);
        const tutorMsg: Message = {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          content: localReply,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, tutorMsg]);
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          currentContext: currentContext || "المنهج العام للعلوم للصف الثالث الابتدائي"
        })
      });

      if (!response.ok) {
        throw new Error("فشل الاتصال بالمعلم الافتراضي.");
      }

      const data = await response.json();
      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: data.text,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (e: any) {
      console.warn("API tutor request failed, falling back to local offline responder.", e);
      // Even if navigator.onLine is true, if the server is unreachable, serve from offline responder instead of displaying a boring error!
      const localReply = getOfflineTutorResponse(text);
      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: localReply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, tutorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 text-white rounded-3xl border border-slate-800 h-[480px] justify-between overflow-hidden shadow-xl" id="ai-tutor-container">
      {/* Header bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black">المعلم الذكي: حكيم المعرفة</h4>
            {isOffline ? (
              <span className="text-[9px] text-emerald-400 font-bold block flex items-center gap-1 animate-pulse">
                <WifiOff className="h-3 w-3 text-emerald-400" />
                <span>يعمل بدون اتصال (أوفلاين) 📡🎒</span>
              </span>
            ) : (
              <span className="text-[9px] text-sky-400 font-bold block flex items-center gap-1">
                <Wifi className="h-3 w-3 text-sky-400 animate-ping" />
                <span>متصل بالمنهج السوداني 🇸🇩</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-right flex flex-col">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
              msg.role === 'tutor'
                ? 'bg-slate-800 text-slate-100 self-start rounded-tr-none'
                : 'bg-emerald-600 text-white self-end rounded-tl-none'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <span className="block text-[8px] opacity-40 text-left mt-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tr-none p-3 text-xs self-start flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            <span>{isOffline ? "حكيم المعرفة يبحث في الذاكرة المدمجة..." : "حكيم المعرفة يفكر في الإجابة السليمة..."}</span>
          </div>
        )}

        {errorText && (
          <div className="bg-rose-950/50 border border-rose-900 text-rose-300 p-3 rounded-lg text-[10px] flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Inputs area */}
      <div className="bg-slate-950 p-3 border-t border-slate-850 flex flex-col gap-2">
        {/* Fast prompts if chat is fresh or contexts change */}
        {messages.length < 4 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar justify-start">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug.text)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold rounded-full transition flex-shrink-0"
              >
                {sug.title}
              </button>
            ))}
          </div>
        )}

        {/* Message Input form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isOffline ? "اسأل حكيم المعرفة في وضع الأوفلاين..." : "اسأل حكيم المعرفة عن أي تجربة أو درس بالعلوم..."}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            id="btn-tutor-send"
            disabled={!inputValue.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 h-9 w-9 flex items-center justify-center rounded-xl text-white transition flex-shrink-0"
          >
            <Send className="h-4 w-4 transform rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}

