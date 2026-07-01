import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowRight, BookOpen, CheckCircle2, AlertCircle, Info, 
  Sparkles, RotateCcw, MessageSquare, BrainCircuit, Play, Check,
  Heart, Volume2, VolumeX, Pause, Square, Maximize2, Minimize2, Type, Smile, Volume1,
  Printer, Save, Trash2, FileText, Award, Notebook
} from 'lucide-react';
import { Lesson, Unit, QuizQuestion, UserProgress } from '../types';
import InteractiveSimulators from './InteractiveSimulators';
import AIAssistant from './AIAssistant';
import EducationalDiagram from './EducationalDiagram';
import { playSuccessChord, playClapSound, playFailureSound } from '../utils/audio';

interface LessonDetailProps {
  lesson: Lesson;
  unit: Unit;
  progress: UserProgress;
  onBackClick: () => void;
  onLessonCompleted: (lessonId: string, scoreBonus: number) => void;
  onToggleFavorite: (lessonId: string) => void;
}

export default function LessonDetail({ 
  lesson, 
  unit, 
  progress, 
  onBackClick, 
  onLessonCompleted,
  onToggleFavorite
}: LessonDetailProps) {
  
  // Tab control: 'explain' | 'simulator' | 'quiz' | 'notebook'
  const [activeTab, setActiveTab] = useState<'explain' | 'simulator' | 'quiz' | 'notebook'>('explain');

  // Notebook Notes States
  const [noteContent, setNoteContent] = useState({
    mood: '🤩',
    learned: '',
    questions: '',
    experiments: '',
    freeNotes: ''
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Automatically load notebook content when lessonId changes
  useEffect(() => {
    const saved = localStorage.getItem(`notebook_notes_${lesson.id}`);
    if (saved) {
      try {
        setNoteContent(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notebook notes", e);
      }
    } else {
      setNoteContent({
        mood: '🤩',
        learned: '',
        questions: '',
        experiments: '',
        freeNotes: ''
      });
    }
    setSaveStatus('idle');
  }, [lesson.id]);

  const handleUpdateNote = (field: string, value: string) => {
    setSaveStatus('saving');
    setNoteContent(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`notebook_notes_${lesson.id}`, JSON.stringify(updated));
      return updated;
    });
    
    // Quick timeout for the visual checkmark save status
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  const handleClearNote = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في مسح كل الملاحظات المكتوبة في هذه المفكرة والبدء من جديد؟ 🧹")) {
      const cleared = {
        mood: '🤩',
        learned: '',
        questions: '',
        experiments: '',
        freeNotes: ''
      };
      setNoteContent(cleared);
      localStorage.removeItem(`notebook_notes_${lesson.id}`);
      setSaveStatus('idle');
    }
  };

  // Comfortable Reading Mode States
  const [isComfortableReader, setIsComfortableReader] = useState(true); // default true as requested
  const [readerFontSize, setReaderFontSize] = useState<'large' | 'larger' | 'jumbo'>('larger');
  const [readerBg, setReaderBg] = useState<'sepia' | 'cream' | 'white'>('sepia');
  
  // Podcast States
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [isPodcastPaused, setIsPodcastPaused] = useState(false);

  // References for speech
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Setup readable blocks for speech podcast narration
  const readableBlocks = useMemo(() => {
    const blocks: Array<{ id: string; text: string; label: string; elementId: string }> = [];
    
    blocks.push({
      id: 'summary',
      text: `فكرة الدرس الرئيسية: ${lesson.summary}`,
      label: 'الفكرة الرئيسية 💡',
      elementId: 'block-summary'
    });

    lesson.contentSection.forEach((section, sIdx) => {
      blocks.push({
        id: `subtitle-${sIdx}`,
        text: section.subtitleString,
        label: section.subtitleString,
        elementId: `block-subtitle-${sIdx}`
      });

      section.paragraphs.forEach((p, pIdx) => {
        blocks.push({
          id: `paragraph-${sIdx}-${pIdx}`,
          text: p,
          label: `فقرة ${pIdx + 1} 📝`,
          elementId: `block-paragraph-${sIdx}-${pIdx}`
        });
      });

      if (section.bullets) {
        section.bullets.forEach((b, bIdx) => {
          blocks.push({
            id: `bullet-${sIdx}-${bIdx}`,
            text: b,
            label: `تفصيل ${bIdx + 1} 🔸`,
            elementId: `block-bullet-${sIdx}-${bIdx}`
          });
        });
      }
    });

    return blocks;
  }, [lesson]);

  // Audio synthesis handlers
  const playBlock = (idx: number) => {
    if (!('speechSynthesis' in window)) {
      alert("عذراً، ميزة البودكاست لقراءة الدرس غير مدعومة في جهازك حالياً.");
      return;
    }

    window.speechSynthesis.cancel();

    if (idx < 0 || idx >= readableBlocks.length) {
      stopPodcast();
      return;
    }

    setCurrentBlockIndex(idx);
    setIsPodcastPlaying(true);
    setIsPodcastPaused(false);

    const block = readableBlocks[idx];
    
    // Smooth scroll current block into view
    const element = document.getElementById(block.elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clean text for optimal TTS playback
    const cleanText = block.text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG'; // widely supported
    utterance.rate = 0.85; // friendly comfortable pace for kids

    utterance.onend = () => {
      // Transition to next block after 600ms delay
      setTimeout(() => {
        setIsPodcastPlaying(prevIsPlaying => {
          if (prevIsPlaying) {
            playBlock(idx + 1);
          }
          return prevIsPlaying;
        });
      }, 600);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error("Podcast reading ended with an error:", e.error);
        stopPodcast();
      } else {
        console.log("Podcast utterance stopped or interrupted successfully:", e.error);
      }
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startPodcast = () => {
    if (isPodcastPlaying && isPodcastPaused) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setIsPodcastPaused(false);
      }
    } else {
      const startIdx = currentBlockIndex !== null ? currentBlockIndex : 0;
      playBlock(startIdx);
    }
  };

  const pausePodcast = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPodcastPaused(true);
    }
  };

  const stopPodcast = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPodcastPlaying(false);
    setIsPodcastPaused(false);
    setCurrentBlockIndex(null);
  };

  // Clean podcast speech synthesis on unmount or tab switch
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'explain') {
      stopPodcast();
    }
  }, [activeTab]);

  // Helper to resolve specific block index based on type, sectionIdx, and subIdx
  const getBlockIndex = (type: 'summary' | 'subtitle' | 'paragraph' | 'bullet', sectionIdx?: number, subIdx?: number) => {
    if (type === 'summary') return 0;
    
    let counter = 1;
    for (let s = 0; s < lesson.contentSection.length; s++) {
      const section = lesson.contentSection[s];
      
      if (type === 'subtitle' && sectionIdx === s) {
        return counter;
      }
      counter++; // subtitle increment
      
      for (let p = 0; p < section.paragraphs.length; p++) {
        if (type === 'paragraph' && sectionIdx === s && subIdx === p) {
          return counter;
        }
        counter++; // paragraph increment
      }
      
      if (section.bullets) {
        for (let b = 0; b < section.bullets.length; b++) {
          if (type === 'bullet' && sectionIdx === s && subIdx === b) {
            return counter;
          }
          counter++; // bullet increment
        }
      }
    }
    return -1;
  };

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScores] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Matching specific states for matching quizes
  const [matchingSelected, setMatchingSelected] = useState<string | null>(null);
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({}); // Left -> Right

  const handleSelectOption = (qId: string, option: string) => {
    if (quizChecked) return;
    setQuizAnswers({ ...quizAnswers, [qId]: option });
  };

  const handleSelectBoolean = (qId: string, val: boolean) => {
    if (quizChecked) return;
    setQuizAnswers({ ...quizAnswers, [qId]: val });
  };

  const handleSortItem = (qId: string, itemKey: string, category: string) => {
    if (quizChecked) return;
    const currentMappings = quizAnswers[qId] || {};
    setQuizAnswers({
      ...quizAnswers,
      [qId]: { ...currentMappings, [itemKey]: category }
    });
  };

  const handleMatchClick = (qId: string, type: 'left' | 'right', text: string) => {
    if (quizChecked) return;
    if (type === 'left') {
      setMatchingSelected(text);
    } else {
      if (matchingSelected) {
        const nextPairs = { ...matchingPairs, [matchingSelected]: text };
        setMatchingPairs(nextPairs);
        setQuizAnswers({ ...quizAnswers, [qId]: nextPairs });
        setMatchingSelected(null);
      }
    }
  };

  const resetMatch = (qId: string) => {
    setMatchingPairs({});
    setMatchingSelected(null);
    const answersCopy = { ...quizAnswers };
    delete answersCopy[qId];
    setQuizAnswers(answersCopy);
  };

  const checkQuizResult = () => {
    let score = 0;
    lesson.quiz.forEach((q) => {
      const userAnswer = quizAnswers[q.id];
      if (q.type === 'single' || q.type === 'boolean') {
        if (userAnswer === q.correctAnswer) {
          score += 1;
        }
      } else if (q.type === 'sorting') {
        const mappings = userAnswer || {};
        const isAllCorrect = Object.keys(q.correctAnswer).every(
          (k) => mappings[itemKeyNormalizer(k)] === q.correctAnswer[k]
        );
        if (isAllCorrect) score += 1;
      } else if (q.type === 'matching') {
        const pairs = userAnswer || {};
        const isAllCorrect = q.correctAnswer.every(
          (pair: any) => pairs[pair.left] === pair.right
        );
        if (isAllCorrect) score += 1;
      }
    });

    setQuizScores(score);
    setQuizChecked(true);
    setQuizFinished(true);

    // Call progression callback with score bonus
    const percentCorrect = score / lesson.quiz.length;
    const bonus = percentCorrect >= 0.7 ? 30 : Math.round(percentCorrect * 30);
    
    if (percentCorrect >= 0.7) {
      playSuccessChord();
      // Delay clapping slightly for a more natural audio build-up
      setTimeout(() => {
        playClapSound();
      }, 350);
    } else {
      playFailureSound();
    }

    onLessonCompleted(lesson.id, bonus);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizChecked(false);
    setQuizScores(null);
    setQuizFinished(false);
    setMatchingPairs({});
    setMatchingSelected(null);
  };

  const itemKeyNormalizer = (k: string) => k;

  return (
    <div className="space-y-6 text-right" id="lesson-detail-root">
      
      {/* Back button and Context breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={onBackClick}
          className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition flex items-center gap-1.5 p-1 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm"
          id="btn-back-dash"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة لشاشة الوحدات الأساسية</span>
        </button>

        <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-150 rounded-lg px-3 py-1.5">
          {unit.title} • {lesson.pagesRange}
        </span>
      </div>

      {/* Lesson Title Jumbotron */}
      <section className="bg-white border-4 border-amber-300 p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>💡</span>
            <div>
              <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full font-black block w-fit">الوحدة المقررة لطلاب الصف الثالث الابتدائي 🎒</span>
              <h2 className="text-base sm:text-2xl font-black text-slate-800 tracking-tight leading-tight mt-1.5">
                {lesson.title}
              </h2>
            </div>
          </div>

          {/* Favoriting option right here */}
          {(() => {
            const isFavorited = (progress.favoriteLessons || []).includes(lesson.id);
            return (
              <button
                onClick={() => onToggleFavorite(lesson.id)}
                className={`p-3 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs font-black shadow-sm ${
                  isFavorited
                    ? 'bg-rose-500 border-rose-405 text-white shadow-rose-100'
                    : 'bg-rose-50 border-rose-200 text-rose-605 hover:bg-rose-105'
                }`}
                title={isFavorited ? "حذف من مفضلة ورقة العمل" : "إضافة إلى مفضلة ورقة العمل ❤️"}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-white text-white' : 'text-rose-500'}`} />
                <span>{isFavorited ? "مفضل ❤️" : "أضف للمفضلة"}</span>
              </button>
            );
          })()}
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2.5 border-t-2 border-slate-100 pt-5" id="lesson-tabbar">
          <button
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 border-2 transform hover:scale-105 active:scale-95 ${
              activeTab === 'explain' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-205 border-emerald-600' 
                : 'bg-emerald-50/55 text-emerald-950 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span>📖 شرح الدرس اللطيف</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 border-2 transform hover:scale-105 active:scale-95 ${
              activeTab === 'simulator' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-205 border-blue-600' 
                : 'bg-blue-50/55 text-blue-950 hover:bg-blue-100 border-blue-200'
            }`}
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            <span>🔬 معمل العلوم السحري</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 border-2 transform hover:scale-105 active:scale-95 ${
              activeTab === 'quiz' 
                ? 'bg-purple-500 text-white shadow-md shadow-purple-255 border-purple-650' 
                : 'bg-purple-50/55 text-purple-950 hover:bg-purple-100 border-purple-200'
            }`}
          >
            <BrainCircuit className="h-4.5 w-4.5" />
            <span>✍️ كويز التحدي البطل</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 border-2 transform hover:scale-105 active:scale-95 ${
              activeTab === 'notebook' 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-200 border-amber-600' 
                : 'bg-amber-50/55 text-amber-950 hover:bg-amber-100 border-amber-200'
            }`}
          >
            <Notebook className="h-4.5 w-4.5 text-amber-600" />
            <span>📓 مفكرتي السحرية ✏️</span>
          </button>
        </div>
      </section>

      {/* Main Tab content viewer */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Tab 1: Textbook Summary explain */}
        {activeTab === 'explain' && (
          <article className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 animate-fade-in" id="explain-container">
            
            {/* Comfortable Reading Mode Panel */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-2 border-amber-200 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm" id="comfortable-reader-controls">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  id="comfortable-toggle"
                  checked={isComfortableReader}
                  onChange={(e) => setIsComfortableReader(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="comfortable-toggle" className="text-xs sm:text-sm font-black text-slate-800 cursor-pointer select-none">
                  🛋️ تفعيل وضع القراءة المريح والممتع (افتراضي)
                </label>
              </div>

              {isComfortableReader && (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Font sizes */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold px-1.5">حجم الخط:</span>
                    <button 
                      onClick={() => setReaderFontSize('large')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${readerFontSize === 'large' ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      صغير 🔍
                    </button>
                    <button 
                      onClick={() => setReaderFontSize('larger')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${readerFontSize === 'larger' ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      وسط 🧐
                    </button>
                    <button 
                      onClick={() => setReaderFontSize('jumbo')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${readerFontSize === 'jumbo' ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      كبير جداً 🧒
                    </button>
                  </div>

                  {/* Reading Background Colors */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold px-1.5">لون الورق:</span>
                    <button 
                      onClick={() => setReaderBg('sepia')}
                      className={`w-6 h-6 rounded-full bg-[#FAF5EC] border-2 transition-all cursor-pointer ${readerBg === 'sepia' ? 'border-amber-500 scale-110 shadow-sm' : 'border-slate-300'}`}
                      title="ورق دافئ (مريح للعين)"
                    />
                    <button 
                      onClick={() => setReaderBg('cream')}
                      className={`w-6 h-6 rounded-full bg-[#FDFBF7] border-2 transition-all cursor-pointer ${readerBg === 'cream' ? 'border-amber-500 scale-110 shadow-sm' : 'border-slate-300'}`}
                      title="كريمي ناعم"
                    />
                    <button 
                      onClick={() => setReaderBg('white')}
                      className={`w-6 h-6 rounded-full bg-white border-2 transition-all cursor-pointer ${readerBg === 'white' ? 'border-amber-500 scale-110 shadow-sm' : 'border-slate-300'}`}
                      title="أبيض كلاسيكي"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reading Document Container */}
            <div className={`p-6 sm:p-8 rounded-3xl border-3 transition-all duration-300 space-y-8 ${
              isComfortableReader 
                ? readerBg === 'sepia'
                  ? 'bg-[#FAF5EC] border-[#EADFC5] text-amber-950 shadow-[4px_4px_0px_#EADFC5]'
                  : readerBg === 'cream'
                    ? 'bg-[#FDFBF7] border-[#EAE3CB] text-yellow-950 shadow-[4px_4px_0px_#EAE3CB]'
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                : 'bg-white border-slate-150 text-slate-700'
            }`} id="lesson-reading-sheet">

              {/* Title Highlight Inside reading document */}
              <div className="pb-4 border-b border-dashed border-slate-300">
                <span className="text-[10px] text-indigo-750 bg-indigo-50 font-black px-2.5 py-0.5 rounded-lg">قراءة مستند المنهج السوداني المعتمد الصف الثالث 📚🇸🇩</span>
                <h1 className="text-xl sm:text-3xl font-black mt-2 leading-tight">
                  {lesson.title}
                </h1>
              </div>

              {/* Summary Block */}
              {(() => {
                const blockIdx = getBlockIndex('summary');
                const isCurrent = currentBlockIndex === blockIdx;
                return (
                  <div 
                    id="block-summary"
                    className={`transition-all duration-300 ${
                      isCurrent 
                        ? 'p-5 bg-amber-100/90 border-2 border-amber-400 rounded-2xl ring-4 ring-amber-300 shadow-md scale-[1.01]' 
                        : isComfortableReader
                          ? 'p-5 bg-emerald-50/40 border-r-4 border-emerald-500 rounded-l-xl'
                          : 'bg-emerald-50/20 p-4 border-r-4 border-emerald-500 rounded-l-xl'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <strong className={isComfortableReader ? "text-sm sm:text-base text-emerald-800" : "text-slate-800"}>
                          فكرة الدرس الرئيسية:
                        </strong>
                        <p className={`mt-1.5 font-bold ${
                          isComfortableReader
                            ? readerFontSize === 'large'
                              ? 'text-base sm:text-lg leading-relaxed'
                              : readerFontSize === 'larger'
                                ? 'text-lg sm:text-xl leading-loose'
                                : 'text-xl sm:text-2xl leading-extra-loose'
                            : 'text-xs sm:text-sm leading-relaxed text-slate-700'
                        }`}>
                          {lesson.summary}
                        </p>
                      </div>

                      <button
                        onClick={() => playBlock(blockIdx)}
                        className={`p-2 rounded-xl border-2 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                          isCurrent 
                            ? 'bg-amber-400 border-slate-900 text-slate-950 animate-bounce shadow-sm' 
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-amber-50'
                        }`}
                        title="اقرأ الفكرة الرئيسية بصوت سمسم 🔊"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-extrabold inline-block mt-2 animate-pulse">
                        🔊 سمسم القارئ يقرأ لك الآن...
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Sections list */}
              <div className="space-y-8">
                {lesson.contentSection.map((section, idx) => {
                  const subtitleIdx = getBlockIndex('subtitle', idx);
                  const isSubtitleCurrent = currentBlockIndex === subtitleIdx;

                  return (
                    <div key={idx} className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                      
                      {/* Subtitle Highlight */}
                      <div 
                        id={`block-subtitle-${idx}`}
                        className={`flex justify-between items-center gap-3 transition-all duration-300 p-2 rounded-xl ${
                          isSubtitleCurrent 
                            ? 'bg-amber-100 ring-2 ring-amber-400 shadow-sm' 
                            : ''
                        }`}
                      >
                        <h4 className={`${
                          isComfortableReader
                            ? 'text-lg sm:text-xl font-black text-amber-950 bg-amber-100/50 py-2 px-4 rounded-xl border-r-6 border-amber-400 shadow-xs'
                            : 'text-xs sm:text-sm font-black text-slate-900 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100'
                        } flex-1`}>
                          {section.subtitleString}
                        </h4>

                        <button
                          onClick={() => playBlock(subtitleIdx)}
                          className={`p-2 rounded-xl border-2 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                            isSubtitleCurrent 
                              ? 'bg-amber-400 border-slate-900 text-slate-950 animate-bounce shadow-sm' 
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-amber-50'
                          }`}
                          title="اقرأ العنوان بالصوت 🔊"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Paragraphs */}
                      <div className="space-y-4">
                        {section.paragraphs.map((p, pIdx) => {
                          const paraIdx = getBlockIndex('paragraph', idx, pIdx);
                          const isParaCurrent = currentBlockIndex === paraIdx;

                          return (
                            <div 
                              key={pIdx} 
                              id={`block-paragraph-${idx}-${pIdx}`}
                              className={`transition-all duration-300 p-3 rounded-2xl flex justify-between items-start gap-4 ${
                                isParaCurrent 
                                  ? 'bg-amber-100/80 ring-4 ring-amber-400 border-2 border-amber-300 shadow-md scale-[1.01]' 
                                  : 'hover:bg-slate-50/40'
                              }`}
                            >
                              <p className={`flex-1 ${
                                isComfortableReader
                                  ? readerFontSize === 'large'
                                    ? 'text-base sm:text-lg leading-relaxed font-medium'
                                    : readerFontSize === 'larger'
                                      ? 'text-lg sm:text-xl leading-loose font-bold'
                                      : 'text-xl sm:text-2xl leading-extra-loose font-extrabold'
                                  : 'text-slate-600 text-xs sm:text-sm leading-relaxed'
                              }`}>
                                {p}
                              </p>

                              <button
                                onClick={() => playBlock(paraIdx)}
                                className={`p-2 rounded-xl border-2 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                                  isParaCurrent 
                                    ? 'bg-amber-400 border-slate-900 text-slate-950' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                                }`}
                                title="استمع للفقرة بالصوت"
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bullets if any */}
                      {section.bullets && (
                        <div className="space-y-3 mr-4">
                          {section.bullets.map((b, bIdx) => {
                            const bulletIdx = getBlockIndex('bullet', idx, bIdx);
                            const isBulletCurrent = currentBlockIndex === bulletIdx;

                            return (
                              <div 
                                key={bIdx}
                                id={`block-bullet-${idx}-${bIdx}`}
                                className={`transition-all duration-300 p-3 rounded-2xl flex justify-between items-start gap-4 ${
                                  isBulletCurrent 
                                    ? 'bg-amber-100/80 ring-4 ring-amber-400 border-2 border-amber-300 shadow-md scale-[1.01]' 
                                    : 'hover:bg-slate-50/40'
                                }`}
                              >
                                <div className="flex gap-2 items-start flex-1">
                                  <span className="text-amber-505 mt-1.5 select-none font-bold">•</span>
                                  <span className={`${
                                    isComfortableReader
                                      ? readerFontSize === 'large'
                                        ? 'text-base sm:text-lg leading-relaxed font-medium'
                                        : readerFontSize === 'larger'
                                          ? 'text-lg sm:text-xl leading-loose font-bold'
                                          : 'text-xl sm:text-2xl leading-extra-loose font-extrabold'
                                      : 'text-slate-600 text-xs sm:text-sm leading-relaxed'
                                  }`}>
                                    {b}
                                  </span>
                                </div>

                                <button
                                  onClick={() => playBlock(bulletIdx)}
                                  className={`p-2 rounded-xl border-2 transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                                    isBulletCurrent 
                                      ? 'bg-amber-400 border-slate-900 text-slate-950' 
                                      : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                                  }`}
                                  title="استمع للمعلومة بالصوت"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Educational Illustration/Diagram drawing container */}
            <div className="pt-2">
              <EducationalDiagram 
                interactiveId={lesson.interactiveId} 
                lessonTitle={lesson.title} 
              />
            </div>

            {/* Quick footer cue to move to next tab */}
            <div className="bg-emerald-50 text-emerald-850 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold border-2 border-emerald-100">
              <p>هل قرأت وفهمت الدرس جيداً يا ذكي؟ حان وقت الانتقال للمعمل الافتراضي لتشاهد التجرية حية!</p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-md"
              >
                افتح المحاكاة لتجرب 🔬
              </button>
            </div>
          </article>
        )}

        {/* Tab 2: Opportuntiy virtual simulator */}
        {activeTab === 'simulator' && (
          <InteractiveSimulators 
            interactiveId={lesson.interactiveId} 
            onSuccess={(scoreBonus) => {
              // Mark lesson completed on simulator solve as well
              onLessonCompleted(lesson.id, scoreBonus);
            }} 
          />
        )}

        {/* Tab 3: Hand crafted quizes */}
        {activeTab === 'quiz' && (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6" id="quiz-container">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-purple-600 h-5 w-5" />
                <h3 className="text-md font-bold text-slate-800">اختبر ذكاءك لليوم:</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">كل سؤال يمنحك نجوماً إيجابية</span>
            </div>

            <div className="space-y-8">
              {lesson.quiz.map((q, idx) => {
                const answer = quizAnswers[q.id];

                return (
                  <div key={q.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-4">
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">
                      السؤال {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{q.questionText}</h4>

                    {/* Single choice questions type single */}
                    {q.type === 'single' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id={`q-opt-${q.id}`}>
                        {q.options.map((option) => {
                          const isSelected = answer === option;
                          const isCorrect = option === q.correctAnswer;

                          return (
                            <button
                              key={option}
                              onClick={() => handleSelectOption(q.id, option)}
                              disabled={quizChecked}
                              className={`p-3 rounded-xl border text-right text-xs transition duration-200 ${
                                quizChecked
                                  ? isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-sm shadow-emerald-100'
                                    : isSelected
                                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                                      : 'bg-white border-slate-200 opacity-60'
                                  : isSelected
                                    ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-200'
                                    : 'bg-white border-slate-200 hover:border-slate-350'
                              }`}
                            >
                              <span>{option}</span>
                              {quizChecked && isCorrect && <Check className="h-4 w-4 text-emerald-600 inline ml-1 mr-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* True or False questions type boolean */}
                    {q.type === 'boolean' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleSelectBoolean(q.id, true)}
                          disabled={quizChecked}
                          className={`flex-1 py-3 px-4 rounded-xl border text-center text-xs font-bold transition ${
                            quizChecked
                              ? q.correctAnswer === true
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : answer === true
                                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                                  : 'bg-white border-slate-200 opacity-60'
                              : answer === true
                                ? 'bg-purple-50 border-purple-400 text-purple-900 border-2 shadow-sm'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          صح ✔️
                        </button>
                        <button
                          onClick={() => handleSelectBoolean(q.id, false)}
                          disabled={quizChecked}
                          className={`flex-1 py-3 px-4 rounded-xl border text-center text-xs font-bold transition ${
                            quizChecked
                              ? q.correctAnswer === false
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : answer === false
                                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                                  : 'bg-white border-slate-200 opacity-60'
                              : answer === false
                                ? 'bg-purple-50 border-purple-400 text-purple-900 border-2 shadow-sm'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          خطأ ✖️
                        </button>
                      </div>
                    )}

                    {/* Sorting questions */}
                    {q.type === 'sorting' && q.categories && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-slate-400">انقر على الخانة لتحديد تصنيف كل عنصر:</p>
                        {Object.keys(q.correctAnswer).map((itemKey) => {
                          const mapping = answersCopyValue(quizAnswers[q.id], itemKey);
                          const correctCategory = q.correctAnswer[itemKey];

                          return (
                            <div key={itemKey} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-white border border-slate-150 rounded-xl">
                              <span className="text-xs font-bold text-slate-700">{itemKey}</span>
                              <div className="flex gap-2 w-full sm:w-auto">
                                {q.categories?.map((cat) => {
                                  const isSelected = mapping === cat;
                                  const isCorrect = cat === correctCategory;

                                  return (
                                    <button
                                      key={cat}
                                      onClick={() => handleSortItem(q.id, itemKey, cat)}
                                      disabled={quizChecked}
                                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold border transition ${
                                        quizChecked
                                          ? isCorrect
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                            : isSelected
                                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                                              : 'bg-white border-slate-200 opacity-60'
                                          : isSelected
                                            ? 'bg-purple-100 border-purple-400 text-purple-900'
                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Matching type matches */}
                    {q.type === 'matching' && q.matchingPairs && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-400">طريقة الحل: اضغط على عنصر من اليمين ثم نظيره المناسب باليسار لتوصيلهما!</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left options */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">العمود (أ)</span>
                            {q.matchingPairs.map((pair) => (
                              <button
                                key={pair.left}
                                onClick={() => handleMatchClick(q.id, 'left', pair.left)}
                                disabled={quizChecked || matchingPairs[pair.left] !== undefined}
                                className={`w-full p-2.5 rounded-xl border text-right text-[11px] font-bold transition ${
                                  matchingSelected === pair.left
                                    ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm'
                                    : matchingPairs[pair.left]
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-slate-50 hover:border-slate-350 text-slate-700'
                                }`}
                              >
                                {pair.left}
                              </button>
                            ))}
                          </div>

                          {/* Right options */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">العمود (ب)</span>
                            {/* Mix right options visually */}
                            {q.matchingPairs.map((pair) => (
                              <button
                                key={pair.right}
                                onClick={() => handleMatchClick(q.id, 'right', pair.right)}
                                disabled={quizChecked || Object.values(matchingPairs).includes(pair.right)}
                                className="w-full p-2.5 rounded-xl border text-right text-[11px] bg-slate-50 hover:border-slate-350 text-slate-700 transition"
                              >
                                {pair.right}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendering pairs resolved currently */}
                        {Object.keys(matchingPairs).length > 0 && (
                          <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100 mt-3 space-y-1">
                            <span className="text-[9px] text-emerald-700 font-bold block mb-1">المطابقات التي قمت بتشكيلها:</span>
                            {Object.entries(matchingPairs).map(([left, right]) => (
                              <div key={left} className="text-[10px] text-slate-700 flex justify-between">
                                <span>🔗 {left} ➜ {right}</span>
                              </div>
                            ))}
                            {!quizChecked && (
                              <button 
                                onClick={() => resetMatch(q.id)}
                                className="text-[9px] text-red-500 hover:underline block mt-2 font-bold"
                              >
                                مسح التوصيلات والبدء مجدداً
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {quizChecked && q.hint && (
                      <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-900 leading-normal flex items-start gap-1">
                        <Info className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span><strong>توجيه إيضاحي:</strong> {q.hint}</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Submit quiz action */}
            {!quizChecked ? (
              <button
                onClick={checkQuizResult}
                id="btn-quiz-submit"
                disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                className="w-full py-4 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                تحصيل الدرجات وحساب التقييم النهائي
              </button>
            ) : (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
                <div>
                  <h4 className="text-sm font-extrabold text-purple-950">
                    نتيجة التحدي: {quizScore} من أصل {lesson.quiz.length} نقاط صحيحة! 🎉
                  </h4>
                  <p className="text-[10px] text-purple-800 leading-normal mt-1">
                    لقد قمنا بتسجيل نقاطك في هالة الطلاب وتطوير إنجاز المستوى التراكمي.
                  </p>
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-purple-200 hover:bg-purple-300 text-purple-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  إعادة الاختبار للتمرن والتعلـيم
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: My Notebook (مفكرتي السحرية) */}
        {activeTab === 'notebook' && (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 animate-fade-in" id="notebook-container">
            {/* Header card with student details */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50/50 border-2 border-amber-200 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-300">
                  📓
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">مفكرتي ودفتر ملاحظاتي الذكي للعلوم 🧪📝</h3>
                  <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                    اكتب ما فهمته اليوم يا بطل، لتطبعه كملف PDF فخم لمعلمتك ووالديك!
                  </p>
                </div>
              </div>

              {/* Save & status feedback */}
              <div className="flex items-center gap-2.5">
                {saveStatus === 'saving' && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-750 font-extrabold px-3 py-1.5 rounded-full border border-indigo-150 animate-pulse flex items-center gap-1">
                    🔄 جاري الحفظ تلقائياً...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1.5 rounded-full border border-emerald-150 flex items-center gap-1">
                    💾 تم حفظ كتابتك بأمان!
                  </span>
                )}
                {saveStatus === 'idle' && (
                  <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-full border border-slate-150">
                    ✍️ اكتب وسأحفظ كلامك تلقائياً
                  </span>
                )}
              </div>
            </div>

            {/* Core Editor layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Side Controls and Tips (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 1. Mood selector */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-slate-800 block">🤩 كيف هو مزاجك وحماسك اليوم في هذا الدرس؟</span>
                  <div className="flex justify-between items-center gap-2">
                    {[
                      { emoji: '🤩', text: 'متحمس جداً' },
                      { emoji: '💡', text: 'فهمت الفكرة' },
                      { emoji: '🤔', text: 'أفكر وأبحث' },
                      { emoji: '🧪', text: 'مستعد للتجربة' }
                    ].map((m) => (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => handleUpdateNote('mood', m.emoji)}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 flex-1 ${
                          noteContent.mood === m.emoji 
                            ? 'bg-amber-150 border-slate-900 scale-105 shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        title={m.text}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[8px] font-black">{m.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Educational advice card */}
                <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                    <span>نصيحة الأرنب سمسم للكتابة المبدعة:</span>
                  </h4>
                  <p className="text-[11px] text-indigo-900 leading-relaxed font-bold">
                    البطل الذكي يكتب ملخص الدرس بكلماته الخاصة البسيطة، ولا يكتفي بالنسخ واللصق! هذا يجعلك أذكى طالب في الصف الثالث الابتدائي! 🐰🥕
                  </p>
                </div>

                {/* 3. Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={() => setIsPrintPreview(true)}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white border-2 border-slate-950 rounded-2xl shadow-[4px_4px_0px_#F59E0B] hover:shadow-[2px_2px_0px_#F59E0B] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Printer className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
                    <span>تحويل لملف للطباعة وحفظ كـ PDF 🖨️</span>
                  </button>

                  <button
                    onClick={handleClearNote}
                    className="w-full py-3 hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>مسح محتويات المذكرة والبدء من جديد 🧹</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Lined Workbook Notebook Sheets (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Lined Input 1: What did I learn */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-indigo-950 flex items-center gap-1">
                    <span>🧠 ما الذي تعلمته وفهمته من هذا الدرس الرائع اليوم؟</span>
                    <span className="text-[9px] text-slate-400 font-bold">(مثال: أجزاء النبتة، وظيفة القلب، تغيرات المادة)</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden bg-[#FDFBF7]">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-400 opacity-60" /> {/* Notebook red margin line */}
                    <textarea
                      value={noteContent.learned}
                      onChange={(e) => handleUpdateNote('learned', e.target.value)}
                      placeholder="اكتب هنا بأسلوبك البسيط الجميل..."
                      rows={4}
                      className="w-full p-4 pr-6 bg-transparent text-sm font-bold text-amber-950 border-0 outline-hidden focus:ring-0 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal leading-relaxed resize-none"
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #EADFC5 31px, #EADFC5 32px)',
                        lineHeight: '32px'
                      }}
                    />
                  </div>
                </div>

                {/* Lined Input 2: Questions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1">
                    <span>🧐 أسئلة ذكية تخطر ببالي وسأبحث عنها في غوغل أو أسأل والديّ:</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden bg-[#FDFBF7]">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-400 opacity-60" />
                    <textarea
                      value={noteContent.questions}
                      onChange={(e) => handleUpdateNote('questions', e.target.value)}
                      placeholder="مثال: لماذا تدور الأرض حول الشمس؟ كيف تتنفس الأسماك؟"
                      rows={3}
                      className="w-full p-4 pr-6 bg-transparent text-sm font-bold text-amber-950 border-0 outline-hidden focus:ring-0 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal leading-relaxed resize-none"
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #EADFC5 31px, #EADFC5 32px)',
                        lineHeight: '32px'
                      }}
                    />
                  </div>
                </div>

                {/* Lined Input 3: Experiments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <span>🧪 تجارب تطبيقية أو أنشطة عملية أود القيام بها للتحقق من الدرس:</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden bg-[#FDFBF7]">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-400 opacity-60" />
                    <textarea
                      value={noteContent.experiments}
                      onChange={(e) => handleUpdateNote('experiments', e.target.value)}
                      placeholder="مثال: سأجرب تذويب السكر في الماء الساخن والبارد لأقارن السرعة!"
                      rows={3}
                      className="w-full p-4 pr-6 bg-transparent text-sm font-bold text-amber-950 border-0 outline-hidden focus:ring-0 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal leading-relaxed resize-none"
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #EADFC5 31px, #EADFC5 32px)',
                        lineHeight: '32px'
                      }}
                    />
                  </div>
                </div>

                {/* Lined Input 4: Free notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <span>✏️ أي ملاحظات حرة وتلخيصات إضافية بخط يدي:</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden bg-[#FDFBF7]">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-400 opacity-60" />
                    <textarea
                      value={noteContent.freeNotes}
                      onChange={(e) => handleUpdateNote('freeNotes', e.target.value)}
                      placeholder="اكتب هنا أي فكرة تخطر ببالك لتثبيت المادة..."
                      rows={3}
                      className="w-full p-4 pr-6 bg-transparent text-sm font-bold text-amber-950 border-0 outline-hidden focus:ring-0 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal leading-relaxed resize-none"
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #EADFC5 31px, #EADFC5 32px)',
                        lineHeight: '32px'
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Floating PDF/Print Preview Overlay (معاينة وطباعة المفكرة) */}
      {isPrintPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex flex-col justify-start items-center p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-none" id="print-preview-modal">
          {/* Print isolation styles */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-notebook-area, #printable-notebook-area * {
                visibility: visible !important;
              }
              #printable-notebook-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
              }
            }
          `}} />

          {/* Header toolbar - hidden in actual print output */}
          <div className="w-full max-w-3xl bg-slate-800 text-white p-4 rounded-t-2xl flex justify-between items-center print:hidden border-b border-slate-700 shadow-lg" dir="rtl">
            <div className="flex items-center gap-2">
              <Printer className="text-amber-400 h-5 w-5 animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-black">جاهز لطباعة مفكرتك الذكية أو حفظها كـ PDF! 🇸🇩🖨️</h3>
                <p className="text-[10px] text-slate-350 font-bold mt-0.5">يمكنك تنزيل الملف وحفظه ومشاركته مع عائلتك ومعلمك</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>اطبع الآن / احفظ PDF 🖨️</span>
              </button>
              <button
                onClick={() => setIsPrintPreview(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                إغلاق المعاينة ❌
              </button>
            </div>
          </div>

          {/* Actual Printable Page styled like a school certificate/workbook sheet */}
          <div 
            className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 rounded-b-2xl shadow-2xl relative border-8 border-amber-300 print:border-0 print:shadow-none print:p-4 print:w-full print:max-w-none print:bg-white"
            id="printable-notebook-area"
            dir="rtl"
          >
            {/* National Sudanese School Document Header Style */}
            <div className="text-center space-y-2 pb-6 border-b-4 border-double border-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500">منصة العلوم التفاعلية 🎒🎒</span>
                <span className="text-2xl">🇸🇩</span>
                <span className="text-[10px] font-bold text-slate-500">الصف الثالث الابتدائي - جمهورية السودان</span>
              </div>
              
              <div className="py-2">
                <span className="text-xs bg-amber-100 text-amber-950 font-black px-4 py-1.5 rounded-full border border-amber-300 inline-block shadow-xs">
                  🏆 دفتر ملاحظات ومفكرة عالم العلوم الصغير 🏆
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                ورقة عمل الدرس: {lesson.title}
              </h1>
              <p className="text-xs text-slate-500 font-bold">الوحدة المقررة: {unit.title}</p>
            </div>

            {/* Student metadata */}
            <div className="grid grid-cols-2 gap-4 py-5 bg-slate-50 border border-slate-200 rounded-xl px-4 sm:px-6 my-6 text-xs font-bold">
              <div>
                <span className="text-slate-500">اسم الطالب البطل: </span>
                <span className="text-indigo-900 font-black text-sm">{progress.studentName || "عالم العلوم المتميز 🧒👧"}</span>
              </div>
              <div>
                <span className="text-slate-500">الولاية / المدينة: </span>
                <span className="text-slate-800">{progress.studentCity || "السودان الحبيب 🇸🇩"}</span>
              </div>
              <div>
                <span className="text-slate-500">تاريخ إعداد المذكرة: </span>
                <span className="text-slate-800">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500">مستوى إنجاز العلوم: </span>
                <span className="text-emerald-700 font-black">المستوى {progress.level || 1} 🌟 (بـ {progress.stars || 0} نجمة تفوق)</span>
              </div>
            </div>

            {/* Note content items formatted like workbook questions */}
            <div className="space-y-6 text-right">
              {/* Mood section */}
              <div className="flex items-center gap-2 border-b pb-3">
                <span className="text-xl">🤩</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">حالة ومزاج الطالب البطل أثناء التعلم لليوم:</span>
                <span className="text-lg bg-amber-105 px-3 py-1 rounded-xl font-bold border border-amber-200">{noteContent.mood}</span>
              </div>

              {/* Box 1: What did I learn */}
              <div className="p-5 border-2 border-slate-200 rounded-2xl bg-slate-50/20 space-y-2">
                <h4 className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
                  <span className="text-base">🧠</span>
                  <span>أولاً: أهم ما تعلمته وفهمته من هذا الدرس الرائع:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold border-r-4 border-indigo-500 pr-3 py-1 whitespace-pre-wrap">
                  {noteContent.learned.trim() || "(لم يكتب الطالب أي ملاحظات في هذا القسم، شجّعه على تدوين ما تعلمه! ✏️)"}
                </p>
              </div>

              {/* Box 2: Questions */}
              <div className="p-5 border-2 border-slate-200 rounded-2xl bg-slate-50/20 space-y-2">
                <h4 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
                  <span className="text-base">🧐</span>
                  <span>ثانياً: أسئلة ذكية تخطر ببالي وسأطرحها على معلمتي أو عائلتي:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold border-r-4 border-amber-500 pr-3 py-1 whitespace-pre-wrap">
                  {noteContent.questions.trim() || "(لا توجد أسئلة مسجلة حالياً)"}
                </p>
              </div>

              {/* Box 3: Experiments */}
              <div className="p-5 border-2 border-slate-200 rounded-2xl bg-slate-50/20 space-y-2">
                <h4 className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
                  <span className="text-base">🧪</span>
                  <span>ثالثاً: تجارب وأفكار عملية أود تجربتها للتحقق من الدرس:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold border-r-4 border-emerald-500 pr-3 py-1 whitespace-pre-wrap">
                  {noteContent.experiments.trim() || "(لم يتم تسجيل تجارب مقترحة بعد)"}
                </p>
              </div>

              {/* Box 4: Free creative notes */}
              {noteContent.freeNotes.trim() && (
                <div className="p-5 border-2 border-slate-200 rounded-2xl bg-slate-50/20 space-y-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-base">✏️</span>
                    <span>رابعاً: تلخيصات ورسوم إضافية بخط يدي:</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold border-r-4 border-slate-500 pr-3 py-1 whitespace-pre-wrap">
                    {noteContent.freeNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Decorative Award Stamp & Signatures */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 rounded-2xl border-2 border-amber-300">
                <Award className="h-10 w-10 text-amber-500 fill-amber-300" />
                <div>
                  <span className="text-xs font-black text-amber-950 block">شهادة التميز والتفوق لليوم 🎖️</span>
                  <span className="text-[10px] text-amber-800 font-bold">أنت عالم صغير ومستقبل السودان الحبيب! 🇸🇩🌟</span>
                </div>
              </div>

              <div className="flex gap-10 text-xs font-bold text-slate-500">
                <div className="text-center space-y-4">
                  <div className="w-24 border-b border-slate-400 mx-auto" />
                  <span>توقيع البطل الصغير 🧒</span>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-24 border-b border-slate-400 mx-auto" />
                  <span>توقيع المعلم / الوالد 👨‍🏫</span>
                </div>
              </div>
            </div>
            
            {/* Quick Sudanese Educational Footer */}
            <div className="text-center text-[9px] text-slate-400 font-bold mt-12">
              علم، نور، وعمل - معاً لبناء أجيال الغد المشرق في السودان الحبيب 🇸🇩🎓
            </div>
          </div>
        </div>
      )}

      {/* Floating Podcast Cartoon Companion Mascot (الأرنب سمسم القارئ 🐰📻) */}
      {(activeTab === 'explain' || activeTab === 'notebook') && (
        <div 
          className="fixed md:left-8 left-3 top-1/4 sm:top-1/3 z-50 flex flex-col items-start gap-2 select-none animate-bounce"
          style={{ animationDuration: '6s', direction: 'rtl' }}
          id="podcast-mascot-companion"
        >
          {/* Cartoon Character speech bubble */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl border-2 border-amber-400 shadow-xl max-w-[190px] text-right text-[10px] font-black relative leading-snug animate-fade-in">
            <span className="block text-amber-300 font-extrabold mb-1">🐰 الأرنب سمسم القارئ:</span>
            <span>
              {activeTab === 'notebook' 
                ? "يا بطل! كتابة ملاحظاتك الذكية هنا تلخص عبقريتك! يمكنك طباعتها كملف PDF لتريها لمعلمتك ووالديك! 📝🎖️"
                : (!isPodcastPlaying 
                    ? "أهلاً يا بطل! اضغط على زر التشغيل لأقوم بقراءة الدرس لك بصوتي الشيق! 🥕"
                    : isPodcastPaused
                      ? "لقد توقفت مؤقتاً! اضغط متابعة للاستماع لدروس العلوم الرائعة! 📻"
                      : `أنا أقرأ لك الآن: ${readableBlocks[currentBlockIndex ?? 0]?.label || "الملخص"}! 🎧`
                  )
              }
            </span>
            <div className="absolute right-4 -bottom-1.5 w-3 h-3 bg-slate-900 border-r-2 border-b-2 border-amber-400 transform rotate-45" />
          </div>

          {/* Bouncy Mascot Circle with controls */}
          <div className="bg-amber-100 hover:bg-amber-150 border-3 border-slate-900 p-2.5 rounded-3xl shadow-[4px_4px_0px_#1E293B] flex items-center gap-2.5 transition-all">
            
            {/* The Mascot icon with active headphone waves */}
            <div className="relative w-12 h-12 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              <span className={isPodcastPlaying && !isPodcastPaused ? "animate-bounce block" : ""}>🐰</span>
              {/* Headphone emoji layer */}
              <span className="absolute text-sm top-1">🎧</span>
              
              {/* Pulsing visual circles if playing */}
              {isPodcastPlaying && !isPodcastPaused && (
                <span className="absolute inset-0 border-2 border-emerald-500 rounded-full animate-ping opacity-35" />
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1.5" dir="ltr">
              
              {/* Prev Block */}
              {isPodcastPlaying && (
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (currentBlockIndex ?? 0) - 1;
                    if (prevIdx >= 0) {
                      playBlock(prevIdx);
                    }
                  }}
                  disabled={(currentBlockIndex ?? 0) <= 0}
                  className="p-1.5 bg-white border border-slate-300 hover:border-slate-950 rounded-lg text-slate-700 disabled:opacity-45 cursor-pointer text-xs"
                  title="الفقرة السابقة"
                >
                  ⏮️
                </button>
              )}

              {/* Main Play/Pause */}
              {!isPodcastPlaying || isPodcastPaused ? (
                <button
                  type="button"
                  onClick={startPodcast}
                  className="p-2 bg-[#05B382] hover:bg-[#049E73] text-white border-2 border-slate-950 rounded-xl shadow-[1px_1px_0px_#000] active:translate-y-0.5 transition cursor-pointer text-xs font-black flex items-center gap-1"
                  title="تشغيل البودكاست"
                >
                  <Play className="h-3 w-3 fill-white text-white" />
                  <span>شغّل 🎙️</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pausePodcast}
                  className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 border-2 border-slate-950 rounded-xl shadow-[1px_1px_0px_#000] active:translate-y-0.5 transition cursor-pointer text-xs font-black flex items-center gap-1"
                  title="إيقاف مؤقت"
                >
                  <Pause className="h-3 w-3 text-slate-950 fill-current" />
                  <span>مؤقت ⏸️</span>
                </button>
              )}

              {/* Stop button */}
              {isPodcastPlaying && (
                <button
                  type="button"
                  onClick={stopPodcast}
                  className="p-2 bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-950 rounded-xl shadow-[1px_1px_0px_#000] active:translate-y-0.5 transition cursor-pointer text-xs font-black flex items-center gap-1"
                  title="إيقاف تماماً"
                >
                  <Square className="h-3 w-3 fill-white text-white" />
                  <span>توقف ⏹️</span>
                </button>
              )}

              {/* Next Block */}
              {isPodcastPlaying && (
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (currentBlockIndex ?? 0) + 1;
                    if (nextIdx < readableBlocks.length) {
                      playBlock(nextIdx);
                    }
                  }}
                  disabled={(currentBlockIndex ?? 0) >= readableBlocks.length - 1}
                  className="p-1.5 bg-white border border-slate-300 hover:border-slate-950 rounded-lg text-slate-700 disabled:opacity-45 cursor-pointer text-xs"
                  title="الفقرة التالية"
                >
                  ⏭️
                </button>
              )}

            </div>

          </div>

          {/* Quick reading index indicator */}
          {isPodcastPlaying && (
            <div className="bg-slate-900 text-amber-400 border border-slate-850 px-2.5 py-1 rounded-full text-[9px] font-bold self-center shadow-md animate-pulse">
              الجزئية { (currentBlockIndex ?? 0) + 1 } من أصل { readableBlocks.length }
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// Helper to access nested objects inside answers dictionary
function answersCopyValue(dict: any, key: string): string | undefined {
  return dict ? dict[key] : undefined;
}
