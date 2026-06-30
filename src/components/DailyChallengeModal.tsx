import React, { useState } from 'react';
import { Sparkles, Trophy, CheckCircle2, AlertCircle, X, HelpCircle, ArrowLeft } from 'lucide-react';
import { DailyChallenge } from '../data/dailyChallenges';
import { playSuccessChord, playFailureSound, playSparkleSound } from '../utils/audio';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DailyChallenge;
  isAlreadySolved: boolean;
  onSolveCorrectly: (points: number) => void;
}

export default function DailyChallengeModal({
  isOpen,
  onClose,
  challenge,
  isAlreadySolved,
  onSolveCorrectly
}: DailyChallengeModalProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOptionSelect = (idx: number) => {
    if (hasChecked && isCorrect) return; // Locked once answered correctly
    setSelectedIdx(idx);
    setErrorMessage(null);
  };

  const handleCheckAnswer = () => {
    if (selectedIdx === null) {
      setErrorMessage("أوه! الرجاء اختيار إحدى الإجابات أولاً يا بطل! 🤔");
      return;
    }

    const correct = selectedIdx === challenge.correctIndex;
    setHasChecked(true);
    setIsCorrect(correct);

    if (correct) {
      playSuccessChord();
      onSolveCorrectly(challenge.pointsValue);
    } else {
      playFailureSound();
    }
  };

  const handleRetry = () => {
    setSelectedIdx(null);
    setHasChecked(false);
    setIsCorrect(false);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900] flex items-center justify-center p-4 text-right overflow-y-auto" id="daily-challenge-modal-overlay">
      <div 
        className="bg-white border-4 border-yellow-400 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 relative transform scale-100 transition-all font-sans my-8"
        id="daily-challenge-modal-card"
        dir="rtl"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600 cursor-pointer"
          title="إغلاق التحدي"
          id="btn-close-challenge"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header decoration */}
        <div className="flex items-center gap-3 border-b-2 border-dashed border-slate-100 pb-4 mb-5">
          <div className="bg-yellow-150 p-2.5 rounded-2xl border-2 border-yellow-400 animate-spin" style={{ animationDuration: '10s' }}>
            <Trophy className="h-6 w-6 text-yellow-600 fill-yellow-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
              <span>🏆</span> {isAlreadySolved ? "لقد أتممت تحدي اليوم!" : "تحدي العالم الصغير لليوم!"}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-extrabold block">
              الوحدة: <span className="text-indigo-600 font-black">{challenge.unitTitle}</span>
            </p>
          </div>
        </div>

        {isAlreadySolved ? (
          // Already Solved State
          <div className="text-center py-6 space-y-4" id="dc-already-solved">
            <div className="text-6xl animate-bounce">🎉✨🧠</div>
            <h3 className="text-lg font-black text-emerald-700">أنت ممتاز وعبقري جداً!</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold max-w-md mx-auto">
              لقد أجبت بشكل صحيح على تحدي اليوم الرقمي <strong>({challenge.title})</strong> وحصلت على النقاط الإضافية كاملة (+{challenge.pointsValue} نقطة) لترفع مستوى ذكائك!
            </p>
            
            <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-right">
              <h4 className="text-xs font-black text-emerald-900 mb-1">💡 لنتعلم معاً:</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                {challenge.explanation}
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md border-2 border-emerald-350 active:scale-95 transition cursor-pointer"
            >
              متابعة الرحلة العلمية 🚀
            </button>
          </div>
        ) : (
          // Active Challenge Playing
          <div className="space-y-4" id="dc-active-play">
            {/* Display Badge title */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 flex justify-between items-center">
              <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>عنوان التحدي: {challenge.title}</span>
              </span>
              <span className="text-[10px] bg-yellow-300 text-yellow-950 px-2.5 py-1 rounded-full font-black border border-yellow-405">
                +{challenge.pointsValue} نقطة 🥇
              </span>
            </div>

            {/* Question Text */}
            <div className="text-slate-800 font-black text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-2xl border-r-4 border-indigo-500 shadow-sm">
              {challenge.questionText}
            </div>

            {/* Choices list */}
            <div className="space-y-2 pt-2">
              {challenge.options.map((option, idx) => {
                let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800";
                
                if (selectedIdx === idx) {
                  btnStyle = "border-indigo-400 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-400/20";
                }

                if (hasChecked) {
                  if (idx === challenge.correctIndex) {
                    btnStyle = "border-emerald-400 bg-emerald-50 text-emerald-900 font-black ring-2 ring-emerald-400/20";
                  } else if (selectedIdx === idx) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-900 line-through ring-2 ring-rose-400/20";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasChecked && isCorrect}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-right text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-3 text-right cursor-pointer group ${btnStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[11px] group-hover:bg-indigo-100 transition">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </span>
                    
                    {hasChecked && idx === challenge.correctIndex && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Warn or success board */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-black flex items-center gap-2 animate-pulse">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {hasChecked && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-905' 
                  : 'bg-rose-50 border-rose-200 text-rose-905'
              }`}>
                <div className="flex items-center gap-1.5 font-black text-sm mb-1">
                  <span>{isCorrect ? "✅ إجابة نموذجية ممتازة!" : "❌ عذراً يا بطل، حاول ثانية!"}</span>
                </div>
                <p className="font-semibold text-xs leading-loose">
                  {isCorrect ? challenge.explanation : "اقرأ السؤال بهدوء، وتذكر دروس العلوم التفاعلية الممتازة التي تعلمتها ثم اختر الإجابة الأصح لتفوز بالنقاء! 💡"}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 justify-end">
              {!hasChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md border-2 border-indigo-500 active:scale-95 transition cursor-pointer"
                >
                  التحقق من الإجابة 🔍🔑
                </button>
              ) : isCorrect ? (
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-md border-2 border-emerald-450 active:scale-95 transition cursor-pointer"
                >
                  عظيم! إغلاق وحفظ التقدم 💾✨
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="w-full sm:w-auto px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-md border-2 border-rose-450 active:scale-95 transition cursor-pointer"
                >
                  حاول مرة أخرى 🔄💪
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
