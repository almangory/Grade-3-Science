import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Mic, MicOff, Volume2, VolumeX, 
  Search, Sparkles, BookOpen, Award, HelpCircle, Send,
  ArrowRight, Compass, Volume1, AlertCircle, Play, Square
} from 'lucide-react';
import { curriculumData } from '../data/curriculum';
import { Lesson, Unit } from '../types';

// Arabic Normalization for robust client-side search without AI cost
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // Remove all short vowels (harakat)
    .replace(/[أإآ]/g, "ا")          // Normalize Hamza on Alif
    .replace(/ة/g, "ه")              // Normalize Ta Marbouta
    .replace(/ى/g, "ي")              // Normalize Alif Maksoura
    .replace(/ؤ/g, "و")              // Normalize Waw with Hamza
    .replace(/ئ/g, "ي")              // Normalize Ya with Hamza
    .replace(/\s+/g, " ")            // Normalize multiple spaces
    .trim()
    .toLowerCase();
}

// Stop words to clean search queries
const STOP_WORDS = new Set([
  "في", "من", "على", "ما", "هو", "هي", "ال", "عن", "كيف", "ماذا", "هل", "يا", "ام", "او", "مع", "الي", "التي", "الذي", "انه", "انها", "لقد", "بين", "تحت", "فوق"
]);

interface SearchResult {
  lesson: Lesson;
  unit: Unit;
  score: number;
  matchedText: string;
}

export default function CartoonResearcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'bot' | 'user';
    text: string;
    suggestedQueries?: string[];
  }>>([
    {
      id: 'welcome',
      role: 'bot',
      text: "أهلاً بك يا بطل العلوم! 🐿️✨ أنا صديقك 'سنجوب الباحث الذكي'، حارس مكتبة العلوم والمنهج السوداني للصف الثالث! 🇸🇩\n\nاسألني عن أي درس أو كائن حي أو تجربة، وسأبحث لك عنها فوراً في كتاب العلوم! كما يمكنني قراءة الإجابة لك بالضغط على زر الصوت 🔊 أو الاستماع لسؤالك بالصوت 🎙️!",
      suggestedQueries: [
        "ما هي خصائص الكائنات الحية؟ 🦁",
        "كيف نحافظ على حاسة السمع؟ 👂",
        "مواطن اليابسة والمائية 🌵",
        "مم يصنع الزير والقلة؟ 🏺"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [bubbleText, setBubbleText] = useState('اسألني! 🔎');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Occasional funny greeting bubbles for the floating mascot
  useEffect(() => {
    const greetings = [
      'مستعد للبحث! 🐿️🔎',
      'اسألني بالصوت! 🎙️',
      'عندي كل الإجابات! 📖',
      'علوم الصف الثالث! 🇸🇩',
      'اضغط لنتحدث! 🌟'
    ];
    const interval = setInterval(() => {
      if (!isOpen) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setBubbleText(randomGreeting);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ar-SD'; // Sudanese Arabic first! Fallbacks to Egyptian/General Arabic easily
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputValue(text);
          // Auto send after speech
          handleSearch(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("عذراً يا بطل! متصفحك لا يدعم البحث بالصوت حالياً. جرب استخدام متصفح جوجل كروم 🎙️");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Cancel speech before listening
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      recognitionRef.current.start();
    }
  };

  // Speaks aloud the response
  const speakResponse = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert("عذراً، ميزة قراءة الردود غير مدعومة على جهازك حالياً.");
      return;
    }

    if (isSpeaking && activeVoiceId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveVoiceId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop anything else

    // Clean emojis and formatting to make speech perfect
    let cleanText = text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "") // Emojis
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold text formatting
      .replace(/#/g, "")
      .replace(/\*/g, "")
      .replace(/ص \d+ - ص \d+/g, "") // page ranges
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG'; // Egyptian Arabic is widely supported on most mobile/desktop synthesizers
    utterance.rate = 0.85; // Calmer and slower speech rate for young children

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveVoiceId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveVoiceId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveVoiceId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Core curriculum search logic
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Add user message
    const userMessageId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMessageId,
      role: 'user',
      text: query
    }]);

    setInputValue('');

    // Normalize user search term
    const normalizedQuery = normalizeArabic(query);
    const queryTokens = normalizedQuery
      .split(/\s+/)
      .filter(token => token.length > 1 && !STOP_WORDS.has(token));

    if (queryTokens.length === 0 && normalizedQuery.length > 0) {
      // If everything was stripped, search with the normalizedQuery as a whole
      queryTokens.push(normalizedQuery);
    }

    const results: SearchResult[] = [];

    // Search through units and lessons
    curriculumData.forEach(unit => {
      unit.lessons.forEach(lesson => {
        let score = 0;
        let matchedText = '';

        // Normalize parts of the lesson
        const normalizedTitle = normalizeArabic(lesson.title);
        const normalizedSummary = normalizeArabic(lesson.summary);

        // Check query tokens matching
        queryTokens.forEach(token => {
          // Check title match (highest score)
          if (normalizedTitle.includes(token)) {
            score += 15;
            matchedText = `الدرس: ${lesson.title}`;
          }

          // Check summary match
          if (normalizedSummary.includes(token)) {
            score += 10;
            if (!matchedText) matchedText = lesson.summary;
          }

          // Check inner content paragraphs
          lesson.contentSection.forEach(section => {
            const normalizedSubtitle = normalizeArabic(section.subtitleString);
            if (normalizedSubtitle.includes(token)) {
              score += 8;
            }

            section.paragraphs.forEach(para => {
              const normalizedPara = normalizeArabic(para);
              if (normalizedPara.includes(token)) {
                score += 5;
                // Capture first matching sentence for preview context
                if (!matchedText) {
                  const sentences = para.split(/[.؟!؛]/);
                  const matchingSentence = sentences.find(s => normalizeArabic(s).includes(token));
                  matchedText = matchingSentence ? matchingSentence.trim() : para;
                }
              }
            });

            if (section.bullets) {
              section.bullets.forEach(bullet => {
                const normalizedBullet = normalizeArabic(bullet);
                if (normalizedBullet.includes(token)) {
                  score += 4;
                  if (!matchedText) matchedText = bullet;
                }
              });
            }
          });
        });

        if (score > 0) {
          results.push({
            lesson,
            unit,
            score,
            matchedText
          });
        }
      });
    });

    // Sort matching results descending
    results.sort((a, b) => b.score - a.score);

    setTimeout(() => {
      if (results.length > 0) {
        // We found matches! Formulate a rich, friendly response
        const best = results[0];
        
        let responseText = `يا سلام! لقد بحثت لك في كتاب العلوم للصف الثالث ووجدت معلومات رائعة ومؤكدة في **${best.lesson.title}** (${best.lesson.pagesRange}) ضمن **${best.unit.title}**! 📖✨\n\n**يقول المنهج السوداني المعتمد:**\n" ${best.lesson.summary} "\n\n`;

        if (best.matchedText && best.matchedText !== best.lesson.summary) {
          responseText += `• **شرح مفصل وممتع:**\n"${best.matchedText}"\n\n`;
        }

        // Add context suggestion on what the child can do
        responseText += `💡 **نصيحة سنجوب:** يمكنك التوجه إلى خريطة المنهج واختيار **${best.unit.title.split(': ')[0]}** لفتح هذا الدرس بالكامل وتجربة محاكاته التفاعلية والمسابقات الشيقة الخاصة به لتفوز بالنجوم الذهبية! ⭐🎯`;

        // Check if there are other alternative matched lessons
        const alternatives = results
          .slice(1, 4)
          .map(r => r.lesson.title.split(': ')[1] || r.lesson.title);

        const sugQueries = alternatives.length > 0 
          ? alternatives.map(title => `حدثني عن ${title} 📚`)
          : ["خصائص الكائنات الحية 🦁", "أعضاء الحس الخمسة 👀", "المطاط والصلصال والزجاج 🧪", "مواطن الحيوانات 🌴"];

        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: responseText,
          suggestedQueries: sugQueries
        }]);

        // Auto speak the response title and main answer to make it interactive
        speakResponse(`وجدتها في درس ${best.lesson.title.split(': ')[1] || best.lesson.title}! ${best.lesson.summary}`, `bot-${Date.now()}`);

      } else {
        // No direct match found. Give a playful kids' fallback response
        const fallbackText = `يا صديقي المكتشف العبقري 🐿️💨، لقد فتشت وبحثت في كافة صفحات كتاب العلوم للصف الثالث، ولم أجد كلمة "${query}" بالتحديد! \n\nهل تود أن نبحث سوياً عن أحد هذه المواضيع الشيقة المتوفرة في كتابنا المعتمد؟:\n\n1. 🧬 **الكائنات الحية والجماد:** (خصائص الكائنات، حاجاتها الأساسية، ومواطنها الطبيعية).\n2. 🧑‍🚀 **جسم الإنسان وأعضاء الحس الخمسة:** (الجلد وصحته، العين وحاسة البصر، الأذن وطبلة السمع، الأنف واللسان).\n3. 🧪 **المادة والصلصال والمطاط والزجاج:** (خواصها، واستخدامها، وهل تصنع الأشياء من مادة واحدة أو أكثر).\n\nاكتب لي كلمة بسيطة من هذه المواضيع، أو اضغط على أحد الاقتراحات في الأسفل وسأجيبك فوراً بكل حب! ❤️✨`;

        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: fallbackText,
          suggestedQueries: [
            "خصائص الكائنات الحية 🦁",
            "أعضاء الحس الخمسة 👀",
            "حاجة الكائنات للماء والهواء 💧",
            "مم تصنع المواد من حولنا؟ 🪵"
          ]
        }]);

        speakResponse("لم أجد هذه الكلمة يا بطل العلوم. جرب الاختيار من المواضيع المقترحة بالأسفل!", `bot-${Date.now()}`);
      }
    }, 600);
  };

  return (
    <>
      {/* ========================================================
          FLOATING MASCOT BUTTON (THE CUTE SCIENCE SQUIRREL)
         ======================================================== */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-end" id="cartoon-researcher-widget">
        
        {/* Playful Floating Speech bubble - shown only when closed */}
        {!isOpen && (
          <div className="mb-2 bg-slate-900 text-amber-300 font-black text-[10px] sm:text-xs py-1.5 px-3 rounded-2xl border-2 border-amber-400 shadow-md animate-bounce flex items-center gap-1 cursor-pointer select-none whitespace-nowrap"
               onClick={() => setIsOpen(true)}>
            <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{bubbleText}</span>
          </div>
        )}

        {/* Mascot Circle Trigger */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            // Cancel speech upon toggling
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
          }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border-4 border-slate-900 shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95 ${
            isOpen ? 'rotate-90 bg-slate-900 text-amber-400' : 'animate-pulse hover:rotate-6'
          }`}
          title="افتح باحث العلوم السريع!"
          aria-label="افتح الباحث سنجوب"
        >
          {isOpen ? (
            <X className="w-6 sm:w-7 h-6 sm:h-7 text-slate-900 font-bold" />
          ) : (
            <div className="relative">
              <span className="text-3.5xl sm:text-4xl filter drop-shadow select-none">🐿️</span>
              <span className="absolute -bottom-1 -right-1 text-base bg-slate-900 p-0.5 rounded-full border border-amber-400">🔍</span>
            </div>
          )}

          {/* Micro red pulsing dot when search matches or updates */}
          {!isOpen && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================
          MASCOT CHAT MODAL SCREEN (PORTABLE CHAT SHEET)
         ======================================================== */}
      {isOpen && (
        <div 
          className="fixed bottom-22 left-4 w-[calc(100vw-32px)] sm:w-[410px] h-[520px] max-h-[calc(100vh-120px)] bg-[#FDFCF7] border-4 border-amber-400 rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in"
          dir="rtl"
          id="cartoon-chat-window"
        >
          
          {/* Header Bar - Cute Wooden/Playful Theme */}
          <header className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-4 border-b-4 border-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-2xl shadow-inner relative overflow-hidden animate-bounce" style={{ animationDuration: '4s' }}>
                🐿️
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm tracking-tight text-slate-900 flex items-center gap-1">
                  <span>سنجوب الباحث الذكي</span>
                  <span className="text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400">أوفلاين 🇸🇩</span>
                </h3>
                <p className="text-[9px] text-slate-850 font-extrabold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
                  أبحث لك مجاناً بداخل كتاب العلوم للصف الثالث!
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsOpen(false);
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition text-white cursor-pointer"
              aria-label="إغلاق اللوحة"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Messages Area - Playground styled */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/20" id="cartoon-chat-messages">
            
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 items-start max-w-[85%] ${
                  msg.role === 'user' ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'
                }`}
              >
                {/* Character Icon / Kid Avatar */}
                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-base shrink-0 shadow-xs ${
                  msg.role === 'user' 
                    ? 'bg-indigo-150 border-indigo-300' 
                    : 'bg-amber-100 border-amber-300'
                }`}>
                  {msg.role === 'user' ? '👧' : '🐿️'}
                </div>

                {/* Message Bubble wrapper */}
                <div className="space-y-1.5 w-full">
                  <div className={`p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-xs border-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white border-slate-900 rounded-tr-none'
                      : 'bg-white text-slate-850 border-slate-900 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Speech synthesis Read-Aloud button inside bot message */}
                    {msg.role === 'bot' && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => speakResponse(msg.text, msg.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black border-2 border-slate-950 transition-all flex items-center gap-1 shadow-[1px_1px_0px_#000] active:translate-y-0.5 cursor-pointer ${
                            isSpeaking && activeVoiceId === msg.id
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : 'bg-amber-100 text-slate-800 hover:bg-amber-200'
                          }`}
                        >
                          {isSpeaking && activeVoiceId === msg.id ? (
                            <>
                              <Square className="w-3 h-3 fill-rose-700 text-rose-700" />
                              <span>إيقاف القراءة ⏹️</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-slate-900" />
                              <span>اقرأ لي بصوتك 🔊</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Suggested queries clickable */}
                  {msg.role === 'bot' && msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedQueries.map((query, sidx) => {
                        const cleanQuery = query.replace(/[📚🦁👀💧🏺🌵]/g, '').trim();
                        return (
                          <button
                            key={sidx}
                            onClick={() => handleSearch(cleanQuery)}
                            className="bg-white hover:bg-amber-50 border-2 border-slate-900 text-slate-700 font-extrabold text-[9.5px] py-1 px-2.5 rounded-full transition hover:scale-102 active:scale-95 cursor-pointer shadow-[1px_1px_0px_#000]"
                          >
                            {query}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice status banner */}
          {isListening && (
            <div className="bg-rose-100 border-t-2 border-b-2 border-rose-300 text-rose-900 px-4 py-2 text-center text-[10.5px] font-black flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              <span>سنجوب يستمع إليك بالصوت الآن! 🎙️ تكلّم بوضوح...</span>
            </div>
          )}

          {/* Wooden Styled Footer inputs form */}
          <footer className="p-3 bg-[#FAF7F0] border-t-4 border-slate-900 relative shrink-0">
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (inputValue.trim()) {
                  handleSearch(inputValue);
                }
              }} 
              className="flex gap-1.5 items-center"
            >
              
              {/* Voice search button (Microphone) */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border-2 border-slate-900 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-[2px_2px_0px_#000] ${
                  isListening
                    ? 'bg-rose-500 animate-pulse hover:bg-rose-600'
                    : 'bg-amber-400 hover:bg-amber-500'
                }`}
                title={isListening ? "إيقاف الاستماع بالصوت" : "اسأل سنجوب بالصوت! 🎙️"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-slate-950 font-black animate-spin" />
                ) : (
                  <Mic className="w-4 h-4 text-slate-950 font-black" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ابحث عن: كائنات حية، جلد، ماء، صخور..."
                className="flex-1 bg-white hover:bg-slate-50 focus:bg-white text-slate-850 font-bold text-xs p-3 rounded-xl border-2 border-slate-900 focus:outline-none transition-all shadow-inner text-right"
              />

              {/* Submit search button */}
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-3 rounded-xl border-2 border-slate-900 text-slate-950 font-extrabold flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[2px_2px_0px_#000] ${
                  inputValue.trim()
                    ? 'bg-[#05B382] hover:bg-[#049E73]'
                    : 'bg-slate-200 cursor-not-allowed opacity-50 shadow-none'
                }`}
              >
                <Send className="w-4 h-4 text-slate-950 transform rotate-180" />
              </button>

            </form>
          </footer>

        </div>
      )}
    </>
  );
}
