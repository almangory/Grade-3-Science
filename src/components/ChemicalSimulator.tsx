import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, HelpCircle, RefreshCw, Layers, CheckCircle, 
  Trash2, ShieldAlert, Sparkles, AlertCircle, Info, ChevronRight, Eye
} from 'lucide-react';

interface Experiment {
  id: string;
  title: string;
  targetTool: 'fire' | 'mortar';
  instruction: string;
  initialEmoji: string;
  outcomeEmoji: string;
  sudanesePrompt: string;
  sudaneseSuccess: string;
  sudaneseFail: string;
  correctType: 'physical' | 'chemical';
  scientificExplanation: string;
  colorClass: string;
}

interface ChemicalSimulatorProps {
  onWin: (bonus: number) => void;
  successMsg: string | null;
}

export default function ChemicalSimulator({ onWin, successMsg }: ChemicalSimulatorProps) {
  const experiments: Experiment[] = [
    {
      id: 'paper',
      title: "حرق ورقة بيضاء",
      targetTool: 'fire',
      instruction: "اسحب ورقة الكراس عديييل وختّها فوق النار الموقدة عشان نحرقها.",
      initialEmoji: "📄",
      outcomeEmoji: "💨",
      sudanesePrompt: "أهلاً يا بطل! اسحب لينا الورقة دي لبيت النار وخلينا نشوف حيحصل ليها شنو!",
      sudaneseSuccess: "يا سلااام! شايف الورقة اتنهت وبقت رماد أسود طائر ودخان مرق! دي كدة تركيبة المادة اتغيرت نهائي وما بنقدر نرجعها كراس كشكول تاني. دا تغير كيميائي عديييل!",
      sudaneseFail: "أبّيت يا إبني! الحرق دا بغير تفاصيل المادة من جوة وجوة، يعني ما حيرجع تاني. ركز معاي التغير دا كيميائي!",
      correctType: 'chemical',
      scientificExplanation: "الاحتراق يغير التركيب الداخلي للورق وينتج مواد جديدة تماماً (كربون ورماد وغازات) لا يمكن إرجاعها لحالتها الأصلية.",
      colorClass: "from-amber-100 to-amber-200"
    },
    {
      id: 'water',
      title: "تسخين وتبخير وعقد الماء",
      targetTool: 'fire',
      instruction: "ختّ كاس الموية فوق النار السخنة عشان نغليه ونقرب لوح زجاج بارد.",
      initialEmoji: "🧪",
      outcomeEmoji: "☁️",
      sudanesePrompt: "عليك أمان الله، شيل لينا كاس الموية دا وختو فوق لهب النار وخلينا نراقب البخار!",
      sudaneseSuccess: "عليك نور! الموية غلت وبقت بخار طائر، ولما ختينا السطح البارد فوق البخار تكثّف ورجع موية سايلة قطرة قطرة! الموية لسة موية وما اتغيرت خواصها، دا تغير فيزيائي ساكت!",
      sudaneseFail: "حاسب يا بطل! الموية لما تتبخر وتتكثف تظل H2O بدون أي تغيير في عناصرها، يعني دا تغير فيزيائي بس!",
      correctType: 'physical',
      scientificExplanation: "التبخر والتكثف هما تغير في حالة المادة الفيزيائية (من سائل إلى غاز ثم سائل) دون أي تعديل في جزيئات الماء كيميائياً.",
      colorClass: "from-sky-100 to-sky-200"
    },
    {
      id: 'salt',
      title: "سحن الملح في الهاون",
      targetTool: 'mortar',
      instruction: "شيل مكعبات صخر الملح الخشن وختّها في الهاون عشان نسحنها كويس.",
      initialEmoji: "🧂",
      outcomeEmoji: "🍚",
      sudanesePrompt: "هاك الملح الصخري دا، ختو في الهاون (الهون) وتعال ندقّه ونسحنه ناعم شديد!",
      sudaneseSuccess: "عافية عليك! الملح اتسحن وبقى ناعم وبودرة بيضاء، لكن طعمه في لسانك لسة مالح وتركيبه الكيميائي ما اتغير نهائي، وبنقدر نرجعه بلورات. دا تغير فيزيائي أصيل!",
      sudaneseFail: "لا لا يا حبيبنا! طحن الملح بغير بس الشكل الخارجي والنعومة، لكن الطعم لسة مالح يعني خواصه ما اتغيرت! دا تغير فيزيائي.",
      correctType: 'physical',
      scientificExplanation: "سحن وضغط بلورات الملح يغير الحجم ومساحة السطح فقط (تغير هندسي فيزيائي) ولا ينتج مادة جديدة.",
      colorClass: "from-slate-100 to-slate-200"
    },
    {
      id: 'sugar',
      title: "حرق بلورات السكر",
      targetTool: 'fire',
      instruction: "شيل معلقة السكر السكرية دي وحطها فوق هبان اللهب.",
      initialEmoji: "🍭",
      outcomeEmoji: "🕳️",
      sudanesePrompt: "السكر دا طعمه مسكر وحلو، تعال نسخن معلقته على النار ونشوف عاقبته شنو!",
      sudaneseSuccess: "أوووبح! السكر غلى وداب وبقى كراميل بني، وتاني تفحم وبقى فحمة سودة طعمها مر خلاص ودخانها طالع! كدة السكر مات وانتهى ومستحيل يرجع سكر حلو تاني، دا تغير كيميائي من أمّه وأبوه!",
      sudaneseFail: "فكر فيها كويس يا غالي! السكر اتفحم وبقى أسود ومر خلاص، هل بتقدر ترجعه لبلورات السكر الحلوة حقت الشاي ديك؟ مستحيل! يبقى تغير كيميائي طبعاً.",
      correctType: 'chemical',
      scientificExplanation: "تسخين السكر لدرجة الاحتراق يؤدي لتفكك جزيئاته العضوية وتكون الكربون (الفحم) وبخار الماء في تفاعل كيميائي غير عكسي.",
      colorClass: "from-rose-100 to-rose-200"
    }
  ];

  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const [dragged, setDragged] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [simStep, setSimStep] = useState<'idle' | 'placed' | 'analyzed'>('idle'); // idle -> placed state (waiting classification) -> analyzed (show exact feedback)
  const [selectedUserType, setSelectedUserType] = useState<'physical' | 'chemical' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [score, setScore] = useState(0);
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const activeExp = experiments[activeExpIdx];

  const handleToolAction = () => {
    if (simStep !== 'idle' || isPlayingAnimation) return;
    setIsPlayingAnimation(true);
    setSimStep('placed');
    setTimeout(() => {
      setIsPlayingAnimation(false);
    }, 1500);
  };

  const handleClassification = (chosenType: 'physical' | 'chemical') => {
    setSelectedUserType(chosenType);
    const isCorrect = chosenType === activeExp.correctType;
    if (isCorrect) {
      setFeedbackMsg(activeExp.sudaneseSuccess);
      if (!completedList.includes(activeExp.id)) {
        setCompletedList(prev => [...prev, activeExp.id]);
        setScore(prev => prev + 25);
      }
    } else {
      setFeedbackMsg(activeExp.sudaneseFail);
    }
    setSimStep('analyzed');
  };

  const handleNext = () => {
    setSelectedUserType(null);
    setFeedbackMsg('');
    setSimStep('idle');
    
    if (activeExpIdx < experiments.length - 1) {
      setActiveExpIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
      onWin(20); // Award 20 score bonus
    }
  };

  const resetSim = () => {
    setActiveExpIdx(0);
    setCompletedList([]);
    setScore(0);
    setSimStep('idle');
    setSelectedUserType(null);
    setFeedbackMsg('');
    setIsFinished(false);
  };

  return (
    <div className="bg-[#FAF7F2] border-4 border-[#CFC5B3] p-5 sm:p-6 rounded-3xl shadow-xl text-right relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle, #EAE2D5 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
         id="chemical-simulator-main">
      
      {/* Educational Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#E5DAC4] pb-4 mb-5 gap-3" id="chem-banner">
        <div>
          <span className="text-[10px] text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-black border border-amber-200">
            🧪 معمل الكيمياء الافتراضي المستند للدقة السودانية
          </span>
          <h3 className="text-xl font-black text-slate-800 mt-2">
            مستكشف التغيرات الفيزيائية والكيميائية للمواد 🔬
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            جرب بيدك، عاين النتيجة بوضوح، وفرق بوعي كامل بين تغيرات الشكل والتركيب!
          </p>
        </div>
        
        {/* Score indicator */}
        <div className="bg-emerald-50 border-2 border-emerald-200 p-2.5 px-4 rounded-2xl flex items-center gap-3 self-stretch sm:self-auto justify-between shadow-sm">
          <span className="text-xl">🏆</span>
          <div className="text-right">
            <span className="text-[9px] text-emerald-600 font-black block">نقاط المعمل</span>
            <span className="text-lg font-black text-emerald-700">{score} / 100</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" key="active-arena">
            {/* Left side: Experimental Desk (Interactive Canvas) */}
            <div className="lg:col-span-7 bg-white border-2 border-[#D9CDB8] rounded-2xl p-4 sm:p-6 relative flex flex-col items-center justify-between min-h-[360px] shadow-sm">
              <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400">منضدة التجارب الخشبية 🪵</span>

              {/* Simulation stages visualization */}
              <div className="flex-grow w-full flex items-center justify-center p-4">
                {simStep === 'idle' ? (
                  <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    {/* Floating target element to interact with */}
                    <motion.div 
                      className={`h-28 w-28 rounded-2xl bg-gradient-to-br ${activeExp.colorClass} shadow-md flex items-center justify-center cursor-pointer relative group border-2 border-dashed border-amber-400`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToolAction}
                      id={`item-source-${activeExp.id}`}
                    >
                      <span className="text-5xl">{activeExp.initialEmoji}</span>
                      <span className="absolute -top-3 -left-3 bg-red-500 text-white text-[10px] font-black p-1 px-2 rounded-full animate-pulse shadow-sm">
                        إضغط للبدء! 👉
                      </span>
                    </motion.div>
                    
                    <div className="space-y-1">
                      <span className="text-xs text-amber-800 font-bold block">المادة الحالية: {activeExp.title}</span>
                      <p className="text-xs text-slate-400 max-w-sm">{activeExp.instruction}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full max-w-xs flex flex-col items-center justify-center" id="experiment-active-animation">
                    {/* Tool layout based on experiment target */}
                    {activeExp.targetTool === 'fire' ? (
                      <div className="relative flex flex-col items-center">
                        {/* Bunsen Burner Container */}
                        <div className="w-16 h-12 bg-slate-300 rounded-t-lg border-2 border-slate-400 relative mt-16 shadow-inner">
                          {/* Gas Tube entrance */}
                          <div className="absolute bottom-1 -left-4 w-4 h-2 bg-slate-400 rounded-full" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-slate-500 rounded" />
                        </div>
                        {/* Metal Stand */}
                        <div className="absolute bottom-0 w-32 h-1 bg-slate-600 rounded-full" />

                        {/* Active fire animations */}
                        <motion.div 
                          className="absolute -top-1 w-10 h-16 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-full blur-[1px] origin-bottom"
                          animate={{ 
                            scaleY: [1, 1.2, 0.9, 1.15, 1],
                            scaleX: [1, 0.9, 1.1, 0.95, 1],
                          }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />

                        {/* Placing substance reaction state */}
                        <AnimatePresence>
                          {simStep === 'placed' && (
                            <motion.div 
                              className="absolute -top-12 z-20 text-4xl"
                              initial={{ y: -60, scale: 0.2, opacity: 0 }}
                              animate={{ y: -10, scale: 1.2, opacity: 1 }}
                              exit={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.6 }}
                            >
                              {activeExp.id === 'paper' && (
                                <div className="relative">
                                  <span className="animate-pulse">📄</span>
                                  {/* fire flame licking paper */}
                                  <span className="absolute -bottom-2 -right-2 text-2xl animate-bounce">🔥</span>
                                  {/* smoke effect */}
                                  <span className="absolute -top-6 -left-2 text-xl animate-bounce">💨</span>
                                </div>
                              )}
                              {activeExp.id === 'water' && (
                                <div className="relative">
                                  <span className="animate-bounce">🧪</span>
                                  {/* water boiling steam */}
                                  <span className="absolute -top-8 -left-1 text-2xl animate-pulse">☁️</span>
                                  {/* condensation plate */}
                                  <span className="absolute -top-12 left-2 text-2xl">🧊</span>
                                </div>
                              )}
                              {activeExp.id === 'sugar' && (
                                <div className="relative">
                                  <span className="animate-ping">🍭</span>
                                  {/* fire bubble melting */}
                                  <span className="absolute -top-4 -right-1 text-2xl">🔥</span>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {simStep === 'analyzed' && (
                            <motion.div 
                              className="absolute -top-16 z-20 flex flex-col items-center"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 100 }}
                            >
                              <span className="text-6xl">{activeExp.outcomeEmoji}</span>
                              <span className="bg-slate-800 text-white text-[11px] font-black p-1 px-3 rounded-full mt-2 shadow-md">
                                مادة الناتجة 🔍
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* Mortar & Pestle target layout */
                      <div className="relative flex flex-col items-center pb-6">
                        {/* The heavy clay Mortar */}
                        <div className="w-36 h-24 bg-gradient-to-b from-[#A89E8D] to-[#807667] rounded-b-full border-4 border-[#CFC5B3] relative flex items-center justify-center shadow-lg">
                          {/* Inner bowl shadow */}
                          <div className="absolute top-2 w-32 h-6 bg-slate-900/25 rounded-full" />
                        </div>
                        
                        {/* The pestle animation */}
                        <motion.div 
                          className="w-8 h-24 bg-gradient-to-t from-slate-400 to-slate-200 rounded-full border-2 border-slate-500 absolute -top-8 origin-bottom z-30"
                          style={{ left: '40%' }}
                          animate={isPlayingAnimation ? {
                            y: [0, 25, 0, 20, 0],
                            rotate: [0, -10, 5, -8, 0],
                          } : {}}
                          transition={{ duration: 1.2 }}
                        />

                        <AnimatePresence>
                          {simStep === 'placed' && (
                            <motion.div 
                              className="absolute top-4 z-10 text-4xl"
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.2, 0.9, 1.1, 1] }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 1 }}
                            >
                              🧂
                            </motion.div>
                          )}

                          {simStep === 'analyzed' && (
                            <motion.div 
                              className="absolute top-6 z-10 text-5xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {activeExp.outcomeEmoji}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom bar of experimental box */}
              <div className="w-full border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[11px] text-slate-500 font-bold block text-center sm:text-right">
                  {simStep === 'idle' 
                    ? "💡 اضغط على كرت المادة لصبّها وتنشيط تجربة التحول الكيميائي والفيزيائي." 
                    : simStep === 'placed' 
                    ? "🤔 المادة الحين خضعت للتجربة! قيم شكلها وخصائصها الكيميائية، ثم جاوب على اليمين."
                    : "✅ تم الانتهاء من فحص خواص التحول!"
                  }
                </span>

                {simStep === 'analyzed' && (
                  <button 
                    onClick={handleNext} 
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-black hover:scale-105 active:scale-95 transition-all p-2.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    id="btn-next-experiment"
                  >
                    <span>المادة التالية</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Teacher Console & Questions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              
              {/* Sudanese Teacher Box */}
              <div className="bg-amber-50 border-2 border-[#DCD3C1] rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden shadow-sm" id="sudanese-teacher-box">
                {/* Visual Sudanese teacher avatar representation */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-200 to-emerald-200 border-2 border-white flex items-center justify-center text-4xl shrink-0 shadow-sm">
                  👴🏽
                </div>
                
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-black">أستاذ العلوم بالسودان 🌍</span>
                  <div className="text-xs text-slate-700 leading-relaxed font-bold">
                    {simStep === 'idle' && activeExp.sudanesePrompt}
                    {simStep === 'placed' && "أها يا بطل! هسي بعد ما سوينا التجربة دي، صنف لي التحول دا شنو؟ هل تركيبة المادة اتغيرت نهائي ولا بس شكلها الخارجي؟"}
                    {simStep === 'analyzed' && feedbackMsg}
                  </div>
                </div>
              </div>

              {/* Assessment Panel */}
              <div className="bg-white border-2 border-[#E5DAC4] rounded-2xl p-4 sm:p-5 flex-grow flex flex-col justify-center space-y-4 relative">
                {simStep === 'idle' && (
                  <div className="text-center py-6 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 animate-pulse">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold leading-normal">
                      بانتظار إضافة المادة وتفعيل التجربة العملية لمشاهدة التحولات وحلها خطوة بخطوة.
                    </p>
                  </div>
                )}

                {simStep === 'placed' && (
                  <div className="space-y-4 animate-fade-in text-right">
                    <h4 className="text-xs font-black text-[#5C5243] flex items-center gap-1.5 justify-end">
                      <span>شنو تصنيفك للتغير دا بناءً على شايفو في التجربة؟</span>
                      <Eye className="h-4 w-4 text-amber-500" />
                    </h4>

                    <div className="grid grid-cols-2 gap-3" id="chem-classification-buttons">
                      <button 
                        onClick={() => handleClassification('physical')}
                        className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-400 transition-all text-center group cursor-pointer focus:outline-none"
                      >
                        <span className="text-2xl block mb-1 group-hover:scale-110 transition">🧊</span>
                        <span className="text-xs font-black text-blue-900 block font-sans">تغير فيزيائي</span>
                        <span className="text-[9px] text-blue-500 font-bold block mt-0.5">(تغير في شكل المادة بس)</span>
                      </button>

                      <button 
                        onClick={() => handleClassification('chemical')}
                        className="p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/50 hover:bg-orange-100/70 hover:border-orange-400 transition-all text-center group cursor-pointer focus:outline-none"
                      >
                        <span className="text-2xl block mb-1 group-hover:scale-110 transition">🔥</span>
                        <span className="text-xs font-black text-orange-900 block font-sans">تغير كيميائي</span>
                        <span className="text-[9px] text-orange-500 font-bold block mt-0.5">(تنتج مواد جديدة تماماً)</span>
                      </button>
                    </div>
                  </div>
                )}

                {simStep === 'analyzed' && (
                  <div className="space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl" id="scientific-feedback-card">
                    <div className="flex items-center gap-2 justify-end text-right">
                      <span className="text-xs font-black text-slate-700">التفسير العلمي المعتمد في المنهج 📖</span>
                      <Info className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans text-right">
                      {activeExp.scientificExplanation}
                    </p>
                    
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                        <span>النوع الصحيح:</span>
                        <span className={activeExp.correctType === 'chemical' ? 'text-orange-600' : 'text-blue-600'}>
                          {activeExp.correctType === 'chemical' ? 'تغيّر كيميائي' : 'تغيّر فيزيائي'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black">
                        <span>إجابتك:</span>
                        <span className={selectedUserType === activeExp.correctType ? 'text-emerald-~500 font-bold' : 'text-rose-500'}>
                          {selectedUserType === 'chemical' ? 'كيميائي' : 'فيزيائي'} {' '}
                          {selectedUserType === activeExp.correctType ? '(صحيحة ✓)' : '(خاطئة ✗)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Stack indicator */}
              <div className="bg-[#FAF8F5] border border-[#DDD3C0] p-4 rounded-xl space-y-2 text-right">
                <span className="text-[10px] text-slate-500 font-bold block">مجموع المواد الخاضعة للتجربة:</span>
                <div className="flex justify-between gap-1.5">
                  {experiments.map((item, idx) => {
                    const isCompleted = completedList.includes(item.id);
                    const isActive = activeExpIdx === idx;
                    return (
                      <div key={item.id} className="flex-1 text-center font-black">
                        <div className={`h-2.5 rounded-full transition-all ${
                          isCompleted ? 'bg-emerald-500' : isActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
                        }`} />
                        <span className="text-[8px] text-slate-400 mt-1 block truncate" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Finished / Victory Screen */
          <motion.div 
            className="text-center py-10 max-w-md mx-auto space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key="victory-screen"
            id="chem-victory-screen"
          >
            <div className="text-6xl animate-bounce">🎓✨</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-800">بيّض الله وجهك يا بطل المعمل! 🌟</h4>
              <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto">
                نجحت في إجراء التجارب المعملية الأربعة وفهمتها كاملة بلهجتنا السودانية السمحة وبدقتك العلمية الأصيلة!
              </p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl inline-flex flex-col items-center justify-center space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-600 font-black">حالة التقييم</span>
              <span className="text-lg font-black text-emerald-700">لقد ربحت +20 نقطة تميز إضافية!</span>
            </div>

            <div className="flex justify-center gap-3">
              <button 
                onClick={resetSim} 
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black p-3 px-6 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className="h-4 w-4" />
                <span>إعادة التجربة من جديد</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
