import React, { useState } from 'react';
import { 
  ArrowRight, BookOpen, CheckCircle2, AlertCircle, Info, 
  Sparkles, RotateCcw, MessageSquare, BrainCircuit, Play, Check,
  Heart
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
  
  // Tab control: 'explain' | 'simulator' | 'quiz'
  const [activeTab, setActiveTab] = useState<'explain' | 'simulator' | 'quiz'>('explain');

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
        </div>
      </section>

      {/* Main Tab content viewer */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Tab 1: Textbook Summary explain */}
        {activeTab === 'explain' && (
          <article className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6" id="explain-container">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="text-emerald-500 h-5 w-5" />
              <h3 className="text-md font-bold text-slate-800">الملخص المفصل لليوم:</h3>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-emerald-50/20 p-4 border-r-4 border-emerald-500 rounded-l-xl">
              <strong>فكرة الدرس الرئيسية:</strong> {lesson.summary}
            </p>

            <div className="space-y-6">
              {lesson.contentSection.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
                    {section.subtitleString}
                  </h4>
                  <div className="space-y-2">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {section.bullets && (
                    <ul className="list-disc list-inside space-y-2 mr-4 text-xs sm:text-sm text-slate-600 leading-relaxed marker:text-emerald-600 font-medium">
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Educational Illustration/Diagram drawing container */}
            <div className="pt-2">
              <EducationalDiagram 
                interactiveId={lesson.interactiveId} 
                lessonTitle={lesson.title} 
              />
            </div>

            {/* Quick footer cue to move to next tab */}
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold">
              <p>هل قرأت وفهمت الدرس جيداً يا ذكي؟ حان وقت الانتقال للمعمل الافتراضي لتشاهد التجرية حية!</p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
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



      </div>
    </div>
  );
}

// Helper to access nested objects inside answers dictionary
function answersCopyValue(dict: any, key: string): string | undefined {
  return dict ? dict[key] : undefined;
}
