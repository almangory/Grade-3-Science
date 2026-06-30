import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Play, RefreshCw, CheckCircle2, AlertCircle, Info, 
  Eye, Thermometer, Sun, Zap, RotateCcw, HelpCircle, ArrowRight
} from 'lucide-react';
import { 
  playSuccessChord, playClapSound, playSparkleSound, playFailureSound
} from '../utils/audio';

const MASTER_TASHKEEL_MAP: Record<string, string> = {
  "كائن حي": "كَائِنٌ حَيٌّ",
  "جماد": "جَمَادٌ",
  "كائنات حية": "كَائِنَاتٌ حَيَّةٌ",
  "أشياء غير حية": "أَشْيَاءُ غَيْرُ حَيَّةٍ",
  "ولودة": "وَلُودَةٌ",
  "بيوضة": "بَيُوضَةٌ",
  "الصحراء": "الصَّحْرَاءُ",
  "الغابة": "الغَابَةُ",
  "المناطق القطبية": "المَنَاطِقُ القُطْبِيَّةُ",
  "موطن مائي": "مَوْطِنٌ مَائِيٌّ",
  "الرأس": "الرَّأْسُ",
  "الجذع": "الجِذْعُ",
  "الأطراف": "الأَطْرَافُ",
  "السمع": "السَّمْعُ",
  "البصر": "البَصَرُ",
  "الشم": "الشَّمُّ",
  "الذوق": "الذَّوْقُ",
  "اللمس": "اللَّمْسُ",
  "شجرة": "شَجَرَةٌ",
  "شجيرة": "شُجَيْرَةٌ",
  "عشب": "عُشْبٌ",
  "بلاستيك": "بِلَاسْتِيكٌ",
  "خشب": "خَشَبٌ",
  "صلصال": "صَلْصَالٌ",
  "مطاط": "مَطَّاطٌ",
  "قماش": "قُمَاشٌ",
  "زجاج": "زُجَاجٌ"
};

/**
 * Speaks a technical scientific word clearly in Arabic using Web Speech API synthesis
 */
export function speakWord(word: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const lookupClean = word.trim();
    const vocalText = MASTER_TASHKEEL_MAP[lookupClean] || lookupClean;
    const utterance = new SpeechSynthesisUtterance(vocalText);
    utterance.lang = 'ar-SA';
    
    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      let activeVoice = voices.find(v => v.lang.includes('ar-SA') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Majed') || v.name.includes('Maged')));
      if (!activeVoice) activeVoice = voices.find(v => v.lang.includes('ar-SA') || v.lang.includes('ar_SA'));
      if (!activeVoice) activeVoice = voices.find(v => v.lang.startsWith('ar'));
      if (activeVoice) utterance.voice = activeVoice;
    }
    utterance.rate = 0.85; 
    utterance.pitch = 1.2; 
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * A beautiful animated companion that guides students with friendly tips.
 */
function MascotCompanion({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3.5 flex gap-3 items-center text-right shadow-sm mb-4"
      dir="rtl"
    >
      <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-emerald-300 animate-bounce flex-shrink-0">
        🔬
      </div>
      <div>
        <span className="text-[10px] bg-emerald-200 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-black">مرشد المعمل الذكي 🧠:</span>
        <p className="text-slate-700 text-xs font-bold leading-relaxed mt-1">
          {message}
        </p>
      </div>
    </motion.div>
  );
}

interface SimulatorProps {
  interactiveId: string;
  onSuccess: (scoreBonus: number) => void;
}

export default function InteractiveSimulators({ interactiveId, onSuccess }: SimulatorProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSimSuccess = (msg: string, bonus: number = 15) => {
    setSuccessMsg(msg);
    onSuccess(bonus);
    playSuccessChord();
    setTimeout(() => {
      playClapSound();
    }, 350);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 5000);
  };

  // Map lesson interactions to customized virtual labs
  switch (interactiveId) {
    case 'excretion': // Used for u1-l1 (Living vs Non-Living sorting)
      return <LivingSortingSimulator onWin={() => handleSimSuccess("ممتاز جداً! صممت مجموعتين رائعين وفرقت بين الكائنات الحية والجمادات بدقة! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'senses': // Used for u1-l6, u1-l7, u1-l8, u1-l9, u1-l10, u1-l11 (Senses & Organs)
      return <SensesSimulator onWin={() => handleSimSuccess("أحسنت يا بطل! لقد أتقنت ربط المؤثرات بأعضاء الحس وحفظت القواعد الصحية المعتمدة بكتاب العلوم! +١٥ نقطة", 15)} successMsg={successMsg} />;

    case 'lifecycle': // Used for u1-l2 (Characteristics: Growth & Reproduction)
      return <AnimalReproductionSimulator onWin={() => handleSimSuccess("عبقري! لقد صنفت الحيوانات إلى ولودة وبيوضة وعرفتها بشكل رائع! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'dissolution': // Used for u1-l3 (Needs of Living: Plant Water & Light Experiment)
      return <PlantGrowthLab onWin={() => handleSimSuccess("أحسنت يا بطل! لقد أثبت عملياً حاجة النبات للماء العذب والضوء الأخضر لتفادي الذبول! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'foodchain': // Used for u1-l4 (Habitats: Desert, Forest, Polar, Water)
      return <HabitatMatchSimulator onWin={() => handleSimSuccess("يا سلام عليك! لقد نجحت في إسكان الحيوانات والنباتات في مواطنها الطبيعية الملائمة! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'circulation': // Used for u1-l5 (Human Body Parts)
      return <HumanBodyPartsLabeler onWin={() => handleSimSuccess("مذهل! لقد ركبت أجزاء جسم الإنسان (الرأس، الجذع، الأطراف العليا والسفلى) بدقة تامة! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'flower': // Used for u1-l12, u1-l13 (Plants & Animals Classification)
      return <SpeciesClassifier onWin={() => handleSimSuccess("بارك الله فيك! لقد نجحت في تصنيف النباتات حسب أحجامها، والحيوانات لمجموعاتها الست! +١٥ نقطة", 15)} successMsg={successMsg} />;
    
    case 'changes': // Used for Unit 2: Matter & its Properties
      return <MatterPropertiesLab onWin={() => handleSimSuccess("رائع جداً! أتقنت معرفة المادة المصنوعة منها الأشياء واختبرت خواصها الفيزيائية باقتدار! +٢٠ نقطة", 20)} successMsg={successMsg} />;
    
    case 'light': // Used for Unit 3: Light & Shadows
      return <LightAndShadowLab onWin={() => handleSimSuccess("يا بطل! أثبتّ بالدليل أن الضوء يسير في خطوط مستقيمة وتحكمت بحجم الظل بدقة مدهشة! +٢٠ نقطة", 20)} successMsg={successMsg} />;
    
    case 'moon': // Used for Unit 3: Electrical Circuits
      return <ElectricCircuitBuilder onWin={() => handleSimSuccess("عبقري الكهرباء الصغير! لقد صنعت دائرة كهربائية مغلقة تفاعلية، وتعلمت قواعد الأمان! +٢٠ نقطة", 20)} successMsg={successMsg} />;
    
    default:
      return (
        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl" id="sim-default">
          <Info className="mx-auto text-slate-400 mb-2 h-10 w-10" />
          <p>المختبر التفاعلي قيد التحضير في معمل العلوم.</p>
        </div>
      );
  }
}

// ============================================================================
// 1. Living vs Non-Living Simulator (excretion slot)
// ============================================================================
interface SortingItem {
  id: string;
  name: string;
  isLiving: boolean;
  icon: string;
}

function LivingSortingSimulator({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const itemsPool: SortingItem[] = [
    { id: '1', name: "ولد (الإنسان)", isLiving: true, icon: "👦" },
    { id: '2', name: "شجرة (نبات)", isLiving: true, icon: "🌳" },
    { id: '3', name: "سمكة (حيوان)", isLiving: true, icon: "🐟" },
    { id: '4', name: "قطة (حيوان)", isLiving: true, icon: "🐈" },
    { id: '5', name: "دودة الأرض", isLiving: true, icon: "🪱" },
    { id: '6', name: "كتاب مدرسي", isLiving: false, icon: "📘" },
    { id: '7', name: "ساعة حائط", isLiving: false, icon: "⏰" },
    { id: '8', name: "كرسي خشبي", isLiving: false, icon: "🪑" },
    { id: '9', name: "صخور صلبة", isLiving: false, icon: "🪨" },
    { id: '10', name: "قلم رصاص", isLiving: false, icon: "✏️" }
  ];

  const [items, setItems] = useState<SortingItem[]>(itemsPool);
  const [livingBin, setLivingBin] = useState<SortingItem[]>([]);
  const [nonLivingBin, setNonLivingBin] = useState<SortingItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSort = (item: SortingItem, targetIsLiving: boolean) => {
    // Speak word
    speakWord(item.name);

    if (item.isLiving === targetIsLiving) {
      playSparkleSound();
      setFeedback(`إجابة صحيحة! ${item.icon} ${item.name} ${targetIsLiving ? "يحتاج للماء والهواء والغذاء ليعيش." : "جماد لا يحتاج للغذاء."}`);
      
      if (targetIsLiving) {
        setLivingBin([...livingBin, item]);
      } else {
        setNonLivingBin([...nonLivingBin, item]);
      }
      setItems(items.filter(i => i.id !== item.id));
    } else {
      playFailureSound();
      setFeedback(`عفواً! ${item.icon} ${item.name} ليس مكانه هنا. حاول مجدداً!`);
    }
  };

  useEffect(() => {
    if (livingBin.length === 5 && nonLivingBin.length === 5) {
      onWin();
    }
  }, [livingBin, nonLivingBin]);

  const resetGame = () => {
    setItems(itemsPool);
    setLivingBin([]);
    setNonLivingBin([]);
    setFeedback(null);
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-living">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر فرز الكائنات: أحياء أم جمادات؟ 🕵️‍♀️
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ٢ - ص ٥</span>
      </div>

      <MascotCompanion message="أهلاً بك يا بطل العلوم! انقر على الكائن أدناه لتسمع اسمه، ثم صنفه بالضغط على السلة الصحيحة. الكائن الحي يحتاج إلى هواء، ماء، وغذاء ليعيش! بينما الجماد لا يحتاج لأي منها." />

      {feedback && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      {items.length > 0 ? (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mb-6 min-h-[140px]">
          <span className="text-[10px] text-slate-400 font-bold mb-2">الكائن المراد تصنيفه:</span>
          <motion.div 
            key={items[0].id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl mb-2 filter drop-shadow-md select-none">{items[0].icon}</span>
            <span className="text-sm font-black text-slate-800 mb-4">{items[0].name}</span>
            
            <div className="flex gap-3">
              <button
                id="btn-sort-living"
                onClick={() => handleSort(items[0], true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md active:scale-95"
              >
                💚 كائن حي (أحياء)
              </button>
              <button
                id="btn-sort-nonliving"
                onClick={() => handleSort(items[0], false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-md active:scale-95"
              >
                🪵 شيء غير حي (جماد)
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
          <span className="text-4xl">🎉</span>
          <p className="text-xs font-black text-emerald-800 mt-2">رائع جداً! لقد أكملت تصنيف جميع الكائنات العشر بنجاح تام!</p>
          <button 
            onClick={resetGame}
            className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
          >
            إعادة تعيين 🔄
          </button>
        </div>
      )}

      {/* Categories Visual Representation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-emerald-150 bg-emerald-50/30 p-3 rounded-xl min-h-[150px]">
          <h4 className="text-xs font-black text-emerald-700 border-b border-emerald-100 pb-1 mb-2 text-center">🌳 كائنات حية ({livingBin.length})</h4>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {livingBin.map(i => (
              <span key={i.id} title={i.name} className="text-2xl p-1 bg-white rounded-lg shadow-sm">{i.icon}</span>
            ))}
          </div>
        </div>
        <div className="border border-amber-150 bg-amber-50/30 p-3 rounded-xl min-h-[150px]">
          <h4 className="text-xs font-black text-amber-700 border-b border-amber-100 pb-1 mb-2 text-center">🧱 أشياء غير حية ({nonLivingBin.length})</h4>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {nonLivingBin.map(i => (
              <span key={i.id} title={i.name} className="text-2xl p-1 bg-white rounded-lg shadow-sm">{i.icon}</span>
            ))}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center flex items-center justify-center gap-1.5 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. Animal Reproduction & Characteristics Simulator (lifecycle slot)
// ============================================================================
interface AnimalItem {
  id: string;
  name: string;
  isMammal: boolean; // ولودة
  icon: string;
  description: string;
}

function AnimalReproductionSimulator({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const animalsList: AnimalItem[] = [
    { id: '1', name: "الأبقار", isMammal: true, icon: "🐄", description: "تلد وترضع صغارها الحليب." },
    { id: '2', name: "الدجاج", isMammal: false, icon: "🐓", description: "تضع البيض وتتكاثر بالبيوض." },
    { id: '3', name: "الأغنام", isMammal: true, icon: "🐏", description: "تلد وترضع صغارها وترعى في المزارع." },
    { id: '4', name: "الحمام", isMammal: false, icon: "🕊️", description: "تضع البيض وتطير بجناحين." },
    { id: '5', name: "الأرانب", isMammal: true, icon: "🐇", description: "تلد صغاراً ناعمة الفرو وترضعها." },
    { id: '6', name: "الثعابين", isMammal: false, icon: "🐍", description: "من الزواحف البيوضة التي تزحف على بطنها." },
    { id: '7', name: "القطط", isMammal: true, icon: "🐈", description: "تلد صغيراً ينمو ليكبر شيئاً فشيئاً." },
    { id: '8', name: "الأسماك", isMammal: false, icon: "🐟", description: "تضع بيضاً ناعماً في بيئتها المائية." }
  ];

  const [pool, setPool] = useState<AnimalItem[]>(animalsList);
  const [mammalBin, setMammalBin] = useState<AnimalItem[]>([]); // ولودة
  const [eggBin, setEggBin] = useState<AnimalItem[]>([]); // بيوضة
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClassify = (item: AnimalItem, choiceIsMammal: boolean) => {
    speakWord(item.isMammal ? "ولودة" : "بيوضة");
    if (item.isMammal === choiceIsMammal) {
      playSparkleSound();
      setFeedback(`صحيح! ${item.icon} ${item.name} حيوانات ${item.isMammal ? "ولودة (تلد وترضع صغارها)" : "بيوضة (تبيض)"}.`);
      if (item.isMammal) {
        setMammalBin([...mammalBin, item]);
      } else {
        setEggBin([...eggBin, item]);
      }
      setPool(pool.filter(p => p.id !== item.id));
    } else {
      playFailureSound();
      setFeedback(`عفواً! ${item.icon} ${item.name} ليست ${choiceIsMammal ? "ولودة" : "بيوضة"}. حاول مجدداً!`);
    }
  };

  useEffect(() => {
    if (mammalBin.length === 4 && eggBin.length === 4) {
      onWin();
    }
  }, [mammalBin, eggBin]);

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-repro">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر التكاثر: حيوانات ولودة أم بيوضة؟ 🥚🍼
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ٦ - ص ٨</span>
      </div>

      <MascotCompanion message="أهلاً بك يا عالم الكائنات الحية! بعض الكائنات الحية تلد وترضع صغارها وتسمى كائنات ولودة، وبعضها الآخر تبيض وتسمى كائنات بيوضة. صنف الحيوانات بدقة!" />

      {feedback && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      {pool.length > 0 ? (
        <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 min-h-[140px]">
          <span className="text-[10px] text-slate-400 font-bold mb-1">صنف هذا الحيوان:</span>
          <span className="text-5xl mb-1 select-none">{pool[0].icon}</span>
          <h4 className="text-sm font-black text-slate-800 mb-2">{pool[0].name}</h4>
          <p className="text-xs text-slate-500 mb-4 text-center">{pool[0].description}</p>

          <div className="flex gap-3">
            <button
              onClick={() => handleClassify(pool[0], true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl transition shadow active:scale-95"
            >
              🍼 حيوانات ولودة (تلد)
            </button>
            <button
              onClick={() => handleClassify(pool[0], false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow active:scale-95"
            >
              🥚 حيوانات بيوضة (تبيض)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100 mb-5">
          <span className="text-4xl">🎉</span>
          <p className="text-xs font-black text-emerald-800 mt-1">مذهل يا بطل العلوم! لقد فرقت بين الحيوانات الولودة والبيوضة بنجاح!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-teal-150 bg-teal-50/30 p-3 rounded-xl min-h-[140px]">
          <h5 className="text-xs font-black text-teal-700 border-b border-teal-100 pb-1 mb-2 text-center">🍼 ولودة (تلد وترضع صغارها)</h5>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {mammalBin.map(m => <span key={m.id} className="text-2xl p-1 bg-white rounded-lg shadow-xs">{m.icon}</span>)}
          </div>
        </div>
        <div className="border border-indigo-150 bg-indigo-50/30 p-3 rounded-xl min-h-[140px]">
          <h5 className="text-xs font-black text-indigo-700 border-b border-indigo-100 pb-1 mb-2 text-center">🥚 بيوضة (تضع البيض)</h5>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {eggBin.map(e => <span key={e.id} className="text-2xl p-1 bg-white rounded-lg shadow-xs">{e.icon}</span>)}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. Needs of Living: Plant Watering & Light Lab (dissolution slot)
// ============================================================================
const renderPlantSVG = (applied: boolean | null, days: number, isLightExp: boolean) => {
  if (applied === null) return null;
  const progress = days / 7;
  const isHealthy = applied;
  const plantHeight = isHealthy ? (40 + progress * 55) : (40 - progress * 15);
  
  // Stem & leaves color
  const color = isHealthy 
    ? `rgb(${Math.max(34, 139 - progress * 105)}, ${Math.min(197, 195 + progress * 2)}, ${Math.max(94, 74 - progress * 20)})` // bright green
    : `rgb(${Math.min(234, 139 + progress * 95)}, ${Math.max(120, 197 - progress * 120)}, ${Math.max(10, 94 - progress * 80)})`; // yellowish-brown
    
  const rotation = isHealthy ? 0 : progress * 30; // wilt droop angle

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-md">
        {/* Glowing aura if healthy and completed */}
        {days === 7 && isHealthy && (
          <circle cx="100" cy="100" r="70" fill="url(#radialGlow)" opacity="0.4" className="animate-pulse" />
        )}
        
        <defs>
          <radialGradient id="radialGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="1" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sun/Box overlay */}
        {isLightExp && applied && (
          <g className="animate-pulse">
            <circle cx="160" cy="40" r="15" fill="#f59e0b" />
            {/* Sunbeams */}
            <line x1="160" y1="18" x2="160" y2="10" stroke="#f59e0b" strokeWidth="2" />
            <line x1="138" y1="40" x2="130" y2="40" stroke="#f59e0b" strokeWidth="2" />
            <line x1="144" y1="24" x2="138" y2="18" stroke="#f59e0b" strokeWidth="2" />
            <line x1="176" y1="24" x2="182" y2="18" stroke="#f59e0b" strokeWidth="2" />
          </g>
        )}

        {isLightExp && !applied && (
          <g>
            {/* Dark box covering the plant */}
            <rect x="52" y={Math.max(10, 150 - progress * 135)} width="96" height="120" fill="#7c2d12" stroke="#451a03" strokeWidth="3" rx="4" opacity={0.9} />
            <text x="100" y={Math.max(35, 175 - progress * 135)} fontSize="9" fontWeight="black" fill="#fef08a" textAnchor="middle">صندوق معتم 📦</text>
          </g>
        )}

        {/* Water shower animation if watering and in progress */}
        {!isLightExp && applied && days > 0 && days < 7 && (
          <g className="animate-bounce">
            {/* Watering can */}
            <path d="M 25 35 L 55 35 L 50 55 L 30 55 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <path d="M 25 45 Q 12 45 25 35" fill="none" stroke="#1d4ed8" strokeWidth="2" />
            <line x1="55" y1="45" x2="75" y2="58" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            {/* Water Drops */}
            <circle cx="82" cy="78" r="2" fill="#60a5fa" />
            <circle cx="92" cy="92" r="2" fill="#60a5fa" />
            <circle cx="102" cy="106" r="2" fill="#60a5fa" />
          </g>
        )}

        {/* Cracked dry soil texture if unwatered, dark moist soil if watered */}
        <ellipse cx="100" cy="150" rx="48" ry="14" fill={applied ? "#543005" : "#a16207"} stroke="#451a03" strokeWidth="1.5" />
        
        {/* Pot */}
        <path d="M 58 150 L 68 190 L 132 190 L 142 150 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
        <line x1="55" y1="150" x2="145" y2="150" stroke="#9a3412" strokeWidth="4.5" strokeLinecap="round" />

        {/* Stem structure growing from soil */}
        <g transform={`translate(100, 145) rotate(${rotation})`}>
          {/* Main Stem */}
          <path d={`M 0 0 Q ${isHealthy ? -4 : 12} ${-plantHeight/2} 0 ${-plantHeight}`} fill="none" stroke={color} strokeWidth={isHealthy ? 5 : 3.5} strokeLinecap="round" />
          
          {/* Leaf 1 */}
          {days >= 1 && (
            <path d={`M 0 ${-plantHeight * 0.25} C -18 ${-plantHeight * 0.35}, -28 ${-plantHeight * 0.15}, 0 ${-plantHeight * 0.15}`} fill={color} stroke="#15803d" strokeWidth="0.5" />
          )}
          {/* Leaf 2 */}
          {days >= 3 && (
            <path d={`M 0 ${-plantHeight * 0.55} C 18 ${-plantHeight * 0.65}, 28 ${-plantHeight * 0.45}, 0 ${-plantHeight * 0.45}`} fill={color} stroke="#15803d" strokeWidth="0.5" />
          )}
          {/* Leaf 3 */}
          {days >= 5 && (
            <path d={`M 0 ${-plantHeight * 0.8} C -16 ${-plantHeight * 0.9}, -26 ${-plantHeight * 0.7}, 0 ${-plantHeight * 0.7}`} fill={color} stroke="#15803d" strokeWidth="0.5" />
          )}

          {/* Golden Flower bud if healthy and 7 days reached */}
          {days === 7 && isHealthy && (
            <g transform={`translate(0, ${-plantHeight})`} className="animate-bounce">
              {/* Petals */}
              <circle cx="0" cy="-12" r="9" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="-12" cy="0" r="9" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="12" cy="0" r="9" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="12" r="9" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="0" r="8" fill="#facc15" />
              {/* Core */}
              <circle cx="0" cy="0" r="5" fill="#ea580c" />
            </g>
          )}
        </g>
      </svg>
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black tracking-wide mt-2 shadow-xs ${isHealthy ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
        {isHealthy ? "🌱 نبات سليم ونشط" : "🥀 ذابل وبحاجة للمساعدة"}
      </span>
    </div>
  );
};

function PlantGrowthLab({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [waterTab, setWaterTab] = useState(true);

  // Irrigation Experiment
  const [waterApplied, setWaterApplied] = useState<boolean | null>(null);
  const [waterDays, setWaterDays] = useState(0);

  // Light Experiment
  const [lightApplied, setLightApplied] = useState<boolean | null>(null);
  const [lightDays, setLightDays] = useState(0);

  const [expCompleted, setExpCompleted] = useState<string[]>([]);

  const handleWaterDecision = (water: boolean) => {
    setWaterApplied(water);
    setWaterDays(1);
    playSparkleSound();
  };

  const handleLightDecision = (light: boolean) => {
    setLightApplied(light);
    setLightDays(1);
    playSparkleSound();
  };

  useEffect(() => {
    if (waterDays > 0 && waterDays < 7) {
      const timer = setTimeout(() => setWaterDays(waterDays + 1), 400);
      return () => clearTimeout(timer);
    } else if (waterDays === 7) {
      if (waterApplied && !expCompleted.includes('water')) {
        const next = [...expCompleted, 'water'];
        setExpCompleted(next);
        if (next.length === 2) onWin();
      }
    }
  }, [waterDays, waterApplied]);

  useEffect(() => {
    if (lightDays > 0 && lightDays < 7) {
      const timer = setTimeout(() => setLightDays(lightDays + 1), 400);
      return () => clearTimeout(timer);
    } else if (lightDays === 7) {
      if (lightApplied && !expCompleted.includes('light')) {
        const next = [...expCompleted, 'light'];
        setExpCompleted(next);
        if (next.length === 2) onWin();
      }
    }
  }, [lightDays, lightApplied]);

  const resetWater = () => {
    setWaterApplied(null);
    setWaterDays(0);
  };

  const resetLight = () => {
    setLightApplied(null);
    setLightDays(0);
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-needs">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر الحاجات الأساسية: تجارب نمو النبات بالماء والضوء 🌿☀️
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ٩ - ص ١١</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setWaterTab(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${waterTab ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          💧 تجربة سقاية الماء
        </button>
        <button
          onClick={() => setWaterTab(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${!waterTab ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          ☀️ تجربة حاجة النبات للضوء
        </button>
      </div>

      {waterTab ? (
        <div>
          <MascotCompanion message="أهلاً بك في معمل النباتات! لدينا نباتان متشابهان ناميان في أصيص. دعنا نسقي أحدهما بالماء يومياً ونترك الآخر بدون ماء لمدة أسبوع. ماذا تتوقع أن يحدث؟ اختر ري النبات بالماء لتشاهد النتيجة!" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700">ري الأصيص الأخضر بالماء؟</h4>
              <div className="flex gap-2">
                <button
                  id="btn-irrigate-yes"
                  onClick={() => handleWaterDecision(true)}
                  disabled={waterDays > 0}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition"
                >
                  💦 نعم، إسقِ بالماء بانتظام
                </button>
                <button
                  id="btn-irrigate-no"
                  onClick={() => handleWaterDecision(false)}
                  disabled={waterDays > 0}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-black rounded-lg transition"
                >
                  ❌ لا تسقِ النبات بالماء
                </button>
              </div>

              {waterDays > 0 && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg font-bold">
                  {waterDays < 7 ? `⏳ نراقب التغيرات على النبات... اليوم ${waterDays}` : "✔️ انتهت التجربة بعد أسبوع كامل!"}
                </div>
              )}

              {waterDays === 7 && (
                <button onClick={resetWater} className="text-xs text-blue-600 hover:underline">إعادة تجربة الماء 🔄</button>
              )}
            </div>

            <div className="md:col-span-7 bg-slate-50 border p-4 rounded-xl flex flex-col items-center min-h-[220px] justify-center">
              {waterApplied === null ? (
                <span className="text-xs text-slate-400">اختر الري بالماء أو تركه جافاً لبدء التجربة...</span>
              ) : (
                <div className="text-center flex flex-col items-center gap-3">
                  {renderPlantSVG(waterApplied, waterDays, false)}
                  {waterDays === 7 ? (
                    waterApplied ? (
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-emerald-700">النبات ينمو ويظل ناصعاً وأخضر وبصحة ممتازة!</h5>
                        <p className="text-[11px] text-slate-500">الماء ضروري جداً لبقاء حياة الكائن الحي ونشاطه.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-amber-700">ذبل النبات واصفرّت أوراقه ومات كلياً!</h5>
                        <p className="text-[11px] text-slate-500">غياب الماء يؤدي لجفاف الكائن الحي وموته.</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 font-bold">يرجى الانتظار، تمر أيام الأسبوع السبعة...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <MascotCompanion message="أشعة الشمس الساطعة تمد النبات بالطاقة لصنع غذاءه بنفسه. دعنا نضع نباتاً في مكان مضيء تحت أشعة الشمس ونحجب الضوء تماماً عن الآخر بوضعه في علبة مظلمة ونراقب كيف تتغير أوراقه!" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700">تعريض النبات لضوء الشمس؟</h4>
              <div className="flex gap-2">
                <button
                  id="btn-light-yes"
                  onClick={() => handleLightDecision(true)}
                  disabled={lightDays > 0}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg transition"
                >
                  ☀️ نعم، ضعه تحت ضوء الشمس
                </button>
                <button
                  id="btn-light-no"
                  onClick={() => handleLightDecision(false)}
                  disabled={lightDays > 0}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-850 text-white text-xs font-black rounded-lg transition"
                >
                  📦 لا، غطِّه بصندوق مظلم مغلق
                </button>
              </div>

              {lightDays > 0 && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg font-bold">
                  {lightDays < 7 ? `⏳ نراقب نمو النبات وأوراقه... اليوم ${lightDays}` : "✔️ انتهت تجربة الضوء!"}
                </div>
              )}

              {lightDays === 7 && (
                <button onClick={resetLight} className="text-xs text-amber-600 hover:underline">إعادة تجربة الضوء 🔄</button>
              )}
            </div>

            <div className="md:col-span-7 bg-slate-50 border p-4 rounded-xl flex flex-col items-center min-h-[220px] justify-center">
              {lightApplied === null ? (
                <span className="text-xs text-slate-400">اختر تعريض النبات للشمس أو تظليله لبدء التجربة...</span>
              ) : (
                <div className="text-center flex flex-col items-center gap-3">
                  {renderPlantSVG(lightApplied, lightDays, true)}
                  {lightDays === 7 ? (
                    lightApplied ? (
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-emerald-700">أوراق النبات خضراء يانعة ويصنع غذاءه بنفسه بنشاط!</h5>
                        <p className="text-[11px] text-slate-500">يحتاج النبات لضوء الشمس كعنصر أساسي ومحرك لصنع الغذاء.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-amber-700">شحب لون أوراق النبات واصفرّ وضعف نموه لغياب الضوء!</h5>
                        <p className="text-[11px] text-slate-500">بدون ضوء الشمس، يعجز النبات عن القيام بعملية البناء الضوئي.</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 font-bold">نراقب صحة الأوراق بمرور أيام الأسبوع...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Verification */}
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          تجارب مكتملة: {expCompleted.includes('water') ? "✔️ الماء" : "❌ الماء"} • {expCompleted.includes('light') ? "✔️ الضوء" : "❌ الضوء"}
        </span>
        {expCompleted.length === 2 ? (
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse">🎉 رائع! أكملت التجربتين بنجاح!</span>
        ) : (
          <span className="text-[11px] text-amber-600 font-bold">💡 أكمل تجربة الماء والضوء معاً (بإظهار النتائج الناجحة) لحل المختبر!</span>
        )}
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. Habitat Matching Simulator (foodchain slot)
// ============================================================================
interface HabitatItem {
  id: string;
  name: string;
  habitat: 'desert' | 'forest' | 'polar' | 'water';
  icon: string;
  hint: string;
}

function HabitatMatchSimulator({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const habitats = [
    { key: 'desert', label: "🐪 الصحراء الجافة", desc: "يندر فيها وجود الماء وتربتها رملية." },
    { key: 'forest', label: "🌳 الغابة الظليلة", desc: "كثيفة الأشجار ورطبة وتهطل فيها أمطار غزيرة." },
    { key: 'polar', label: "❄️ المناطق القطبية", desc: "برودة شديدة ومغطاة بالكامل بالجليد والبرق." },
    { key: 'water', label: "🐟 الموطن المائي", desc: "اليابسة والماء (عذبة كالأنهار ومالحة كالبحار)." }
  ];

  const initialItems: HabitatItem[] = [
    { id: '1', name: "نبات الصبار", habitat: 'desert', icon: "🌵", hint: "نبات صحراوي جاف يحتفظ بالماء." },
    { id: '2', name: "الدب القطبي", habitat: 'polar', icon: "🐻‍❄️", hint: "يملك فراء سميكاً للدفء في الجليد." },
    { id: '3', name: "الأسد (ملك الغابة)", habitat: 'forest', icon: "🦁", hint: "يعيش بين الأشجار الكثيفة والظليلة." },
    { id: '4', name: "أعشاب النيل الطافية", habitat: 'water', icon: "🌱", hint: "تنمو في مياه النيل العذبة بالسودان." },
    { id: '5', name: "الإبل (سفينة الصحراء)", habitat: 'desert', icon: "🐪", hint: "تتحمل الجوع والعطش في الرمال." },
    { id: '6', name: "البطريق", habitat: 'polar', icon: "🐧", hint: "طائر يعيش على الجليد والماء البارد." }
  ];

  const [items, setItems] = useState<HabitatItem[]>(initialItems);
  const [solvedItems, setSolvedItems] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<HabitatItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectItem = (item: HabitatItem) => {
    speakWord(item.name);
    setSelectedItem(item);
  };

  const handleMatchHabitat = (habitatKey: 'desert' | 'forest' | 'polar' | 'water') => {
    if (!selectedItem) return;

    if (selectedItem.habitat === habitatKey) {
      playSparkleSound();
      setFeedback(`إجابة صحيحة! الموطن الطبيعي لـ ${selectedItem.icon} ${selectedItem.name} هو ${habitats.find(h => h.key === habitatKey)?.label}.`);
      setSolvedItems({ ...solvedItems, [selectedItem.id]: habitatKey });
      setItems(items.filter(i => i.id !== selectedItem.id));
      setSelectedItem(null);
    } else {
      playFailureSound();
      setFeedback(`موطن خاطئ! فكر أين يمكن أن يعيش ${selectedItem.icon} ${selectedItem.name}؟`);
    }
  };

  useEffect(() => {
    if (Object.keys(solvedItems).length === 6) {
      onWin();
    }
  }, [solvedItems]);

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-habitats">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر مواطن الكائنات: أين موطني؟ 🐪❄️🌳
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ١٢ - ص ١٤</span>
      </div>

      <MascotCompanion message="أهلاً بك يا مستكشف المواطن! انقر على الكائن الحي من القائمة بالأسفل، ثم انقر على البيئة والموطن المناسب لعيشه باليمين لإسكانه بسلام!" />

      {feedback && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Habitats List */}
        <div className="md:col-span-6 flex flex-col gap-2.5">
          <span className="text-[10px] text-slate-400 font-bold">المواطن المتوفرة بالمعمل:</span>
          {habitats.map(h => (
            <button
              key={h.key}
              onClick={() => handleMatchHabitat(h.key as any)}
              disabled={!selectedItem}
              className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                selectedItem 
                  ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer' 
                  : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-75'
              }`}
            >
              <div>
                <h4 className="text-xs font-black text-slate-800">{h.label}</h4>
                <p className="text-[10px] text-slate-500">{h.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-600" />
            </button>
          ))}
        </div>

        {/* Animals Pool */}
        <div className="md:col-span-6 flex flex-col gap-2 border border-slate-100 bg-slate-50/50 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold">الكائنات بانتظار الموطن ({items.length}):</span>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 ${
                    selectedItem?.id === item.id 
                      ? 'bg-purple-100 border-purple-400 text-purple-900 ring-2 ring-purple-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-3xl select-none">{item.icon}</span>
                  <span className="text-xs font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-emerald-700 font-bold">
              🎉 رائع! جميع الكائنات تسكن في بيئاتها المناسبة الآن!
            </div>
          )}

          {selectedItem && (
            <div className="mt-2 text-[10px] text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
              📌 تلميح: <strong>{selectedItem.name}</strong> {selectedItem.hint}
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. Human Body Parts Labeler (circulation slot)
// ============================================================================
interface BodyPart {
  id: string;
  name: string;
  description: string;
  matched: boolean;
}

function HumanBodyPartsLabeler({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const partsList: BodyPart[] = [
    { id: '1', name: "الرأس", description: "يحتوي على الدماغ، العينين، الأذنين، الأنف، والفم.", matched: false },
    { id: '2', name: "الجذع (الصدر والبطن)", description: "الجزء الأوسط من الجسم ويحمى الرئة والمعدة.", matched: false },
    { id: '3', name: "الأطراف العليا (اليدان)", description: "نستخدمهما للكتابة واللمس وحمل الأشياء.", matched: false },
    { id: '4', name: "الأطراف السفلى (الرجلان)", description: "نستخدمهما للمشي والجري والقفز من مكان لآخر.", matched: false }
  ];

  const [parts, setParts] = useState<BodyPart[]>(partsList);
  const [selectedWord, setSelectedWord] = useState<BodyPart | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectWord = (part: BodyPart) => {
    if (part.matched) return;
    speakWord(part.name);
    setSelectedWord(part);
  };

  const handleMatchNode = (id: string) => {
    if (!selectedWord) return;

    if (selectedWord.id === id) {
      playSparkleSound();
      const updated = parts.map(p => p.id === id ? { ...p, matched: true } : p);
      setParts(updated);
      setSelectedWord(null);
      setFeedback(`إجابة صحيحة! تم تحديد موضع ${selectedWord.name} بنجاح.`);

      if (updated.every(p => p.matched)) {
        onWin();
      }
    } else {
      playFailureSound();
      setFeedback("عفواً! هذا الموضع غير صحيح، فكر ثانية برفق!");
    }
  };

  const resetGame = () => {
    setParts(partsList);
    setSelectedWord(null);
    setFeedback(null);
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-body">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر أقسام جسم الإنسان: الرأس والجذع والأطراف 👦
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ١٥</span>
      </div>

      <MascotCompanion message="أهلاً بك يا طبيب المستقبل! يتكون جسم الإنسان من ثلاثة أجزاء رئيسية هي الرأس والجذع والأطراف. انقر على التسمية باليمين، ثم طابقها على رقمها الصحيح في نموذج جسم الإنسان!" />

      {feedback && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Buttons List */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-bold">الأجزاء الأساسية:</span>
          {parts.map(p => (
            <button
              key={p.id}
              onClick={() => selectWord(p)}
              disabled={p.matched}
              className={`p-2.5 rounded-xl border text-right transition ${
                p.matched 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed opacity-60' 
                  : selectedWord?.id === p.id
                    ? 'bg-purple-100 border-purple-400 text-purple-900 ring-2 ring-purple-200 scale-102'
                    : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-black text-xs flex items-center justify-between">
                <span>{p.name} {p.matched && "✔️"}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{p.description}</p>
            </button>
          ))}

          <button onClick={resetGame} className="text-[10px] text-slate-400 hover:underline text-left mt-1">إعادة تجميع الجسد 🔄</button>
        </div>

        {/* Vector representation */}
        <div className="md:col-span-7 border border-slate-150 bg-slate-50/40 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] relative">
          
          {/* Simple Boy Human SVG */}
          <svg viewBox="0 0 100 120" className="w-44 h-48 select-none">
            {/* Head (1) */}
            <circle cx="50" cy="22" r="14" fill="#fed7aa" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="45" cy="19" r="1.5" fill="#334155" />
            <circle cx="55" cy="19" r="1.5" fill="#334155" />
            <path d="M 46 27 Q 50 30 54 27" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
            {/* Hair */}
            <path d="M 37 17 C 40 8, 60 8, 63 17" fill="#1e293b" />

            {/* Neck */}
            <rect x="47" y="36" width="6" height="5" fill="#fed7aa" />

            {/* Trunk (2) */}
            <rect x="35" y="41" width="30" height="40" rx="6" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
            {/* Heart symbol to look lively */}
            <path d="M 44 48 C 42 45, 38 45, 38 49 C 38 53, 44 56, 44 56 C 44 56, 50 53, 50 49 C 50 45, 46 45, 44 48 Z" fill="#ef4444" opacity="0.8" />

            {/* Arms - Upper Limbs (3) */}
            {/* Left Arm */}
            <path d="M 35 45 L 20 62" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />
            {/* Right Arm */}
            <path d="M 65 45 L 80 62" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />

            {/* Legs - Lower Limbs (4) */}
            {/* Left Leg */}
            <rect x="38" y="81" width="8" height="28" rx="2" fill="#fed7aa" stroke="#ca8a04" strokeWidth="0.5" />
            <rect x="36" y="106" width="11" height="6" rx="2" fill="#1e293b" />
            {/* Right Leg */}
            <rect x="54" y="81" width="8" height="28" rx="2" fill="#fed7aa" stroke="#ca8a04" strokeWidth="0.5" />
            <rect x="53" y="106" width="11" height="6" rx="2" fill="#1e293b" />
          </svg>

          {/* Absolute Target Buttons */}
          {/* Target 1: Head (الرأس) */}
          <button
            onClick={() => handleMatchNode('1')}
            className={`absolute top-[18px] right-[calc(50%-12px)] h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition ${
              parts[0].matched ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-dashed border-slate-400 text-slate-700 hover:scale-110'
            }`}
          >
            {parts[0].matched ? "١" : "?"}
          </button>
          <span className="absolute top-[8px] right-[calc(50%+18px)] text-[9px] bg-slate-950 text-white px-1 rounded font-bold">١. الرأس</span>

          {/* Target 2: Trunk (الجذع) */}
          <button
            onClick={() => handleMatchNode('2')}
            className={`absolute top-[130px] right-[calc(50%-12px)] h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition ${
              parts[1].matched ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-dashed border-slate-400 text-slate-700 hover:scale-110'
            }`}
          >
            {parts[1].matched ? "٢" : "?"}
          </button>
          <span className="absolute top-[120px] right-[calc(50%+18px)] text-[9px] bg-slate-950 text-white px-1 rounded font-bold">٢. الجذع</span>

          {/* Target 3: Upper Limbs (الأطراف العليا) */}
          <button
            onClick={() => handleMatchNode('3')}
            className={`absolute top-[140px] right-[16%] h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition ${
              parts[2].matched ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-dashed border-slate-400 text-slate-700 hover:scale-110'
            }`}
          >
            {parts[2].matched ? "٣" : "?"}
          </button>
          <span className="absolute top-[125px] right-[5%] text-[9px] bg-slate-950 text-white px-1 rounded font-bold">٣. الأطراف العليا</span>

          {/* Target 4: Lower Limbs (الأطراف السفلى) */}
          <button
            onClick={() => handleMatchNode('4')}
            className={`absolute bottom-[32px] right-[calc(50%-12px)] h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition ${
              parts[3].matched ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-dashed border-slate-400 text-slate-700 hover:scale-110'
            }`}
          >
            {parts[3].matched ? "٤" : "?"}
          </button>
          <span className="absolute bottom-[22px] right-[calc(50%+18px)] text-[9px] bg-slate-950 text-white px-1 rounded font-bold">٤. الأطراف السفلى</span>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. Species & Sizes Classifier Simulator (flower slot)
// ============================================================================
interface SizeItem {
  id: string;
  name: string;
  category: 'tree' | 'shrub' | 'herb';
  icon: string;
  desc: string;
}

function SpeciesClassifier({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [activeTab, setActiveTab] = useState<'plants' | 'animals'>('plants');

  // Plants states
  const plantsPool: SizeItem[] = [
    { id: '1', name: "النخيل", category: 'tree', icon: "🌴", desc: "أشجار كبيرة ساقها خشبية عملاقة." },
    { id: '2', name: "شجرة المانجو", category: 'tree', icon: "🥭", desc: "أشجار كبيرة الحجم ومثمرة." },
    { id: '3', name: "شجيرة الفل", category: 'shrub', icon: "🌸", desc: "شجيرات متوسطة الحجم لزينة الحدائق." },
    { id: '4', name: "شجيرة الياسمين", category: 'shrub', icon: "🌼", desc: "نباتات متوسطة معمرة وعطرة." },
    { id: '5', name: "الحشائش البرية", category: 'herb', icon: "🌾", desc: "نباتات صغيرة الحجم تغطي الأرض." },
    { id: '6', name: "البرسيم والأعشاب", category: 'herb', icon: "🍀", desc: "أعشاب صغيرة الحجم ولينة." }
  ];

  const [plants, setPlants] = useState<SizeItem[]>(plantsPool);
  const [trees, setTrees] = useState<SizeItem[]>([]);
  const [shrubs, setShrubs] = useState<SizeItem[]>([]);
  const [herbs, setHerbs] = useState<SizeItem[]>([]);

  // Animals states
  const [selectedAnimalGroup, setSelectedAnimalGroup] = useState<string>('');
  const [scoreAnimal, setScoreAnimal] = useState(0);

  const handlePlantSort = (item: SizeItem, cat: 'tree' | 'shrub' | 'herb') => {
    speakWord(item.name);
    if (item.category === cat) {
      playSparkleSound();
      if (cat === 'tree') setTrees([...trees, item]);
      if (cat === 'shrub') setShrubs([...shrubs, item]);
      if (cat === 'herb') setHerbs([...herbs, item]);
      setPlants(plants.filter(p => p.id !== item.id));
    } else {
      playFailureSound();
    }
  };

  const handleAnimalAnswer = (group: string, correct: boolean) => {
    if (correct) {
      playSparkleSound();
      setScoreAnimal(scoreAnimal + 1);
      setSelectedAnimalGroup('');
    } else {
      playFailureSound();
      alert("عفواً، حاول مرة أخرى برفق!");
    }
  };

  useEffect(() => {
    if (trees.length === 2 && shrubs.length === 2 && herbs.length === 2 && scoreAnimal >= 3) {
      onWin();
    }
  }, [trees, shrubs, herbs, scoreAnimal]);

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-species">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-emerald-600 h-4 w-4" />
          مختبر التنوع الحيوي: أحجام النباتات ومجموعات الحيوانات 🌴🦁
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-full font-black">ص ٢٣ - ص ٢٦</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('plants')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'plants' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🌲 فرز أحجام النباتات
        </button>
        <button
          onClick={() => setActiveTab('animals')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'animals' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🦅 مجموعات الحيوانات الست
        </button>
      </div>

      {activeTab === 'plants' ? (
        <div>
          <MascotCompanion message="تنقسم النباتات الخضراء حسب حجمها إلى ثلاثة أقسام: أشجار كبيرة الحجم مثل النخيل والمانجو والدوم، وشجيرات متوسطة الحجم، وحشائش وأعشاب صغيرة الحجم. قم بفرز النباتات أدناه!" />

          {plants.length > 0 ? (
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border rounded-xl mb-4 text-center">
              <span className="text-4xl mb-1 select-none">{plants[0].icon}</span>
              <h4 className="text-xs font-black text-slate-800 mb-1">{plants[0].name}</h4>
              <p className="text-[10px] text-slate-500 mb-3">{plants[0].desc}</p>

              <div className="flex gap-2">
                <button
                  id="btn-sort-tree"
                  onClick={() => handlePlantSort(plants[0], 'tree')}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg transition"
                >
                  🌴 أشجار كبيرة
                </button>
                <button
                  id="btn-sort-shrub"
                  onClick={() => handlePlantSort(plants[0], 'shrub')}
                  className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                >
                  🌸 شجيرات متوسطة
                </button>
                <button
                  id="btn-sort-herb"
                  onClick={() => handlePlantSort(plants[0], 'herb')}
                  className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg transition"
                >
                  🌾 حشائش وأعشاب صغيرة
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-emerald-50 rounded-xl mb-4">
              <p className="text-xs font-black text-emerald-800">✔️ رائع! أكملت فرز وتصنيف أحجام النباتات كلها!</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="border bg-slate-50 p-2 rounded-lg min-h-[90px] text-center">
              <span className="text-xs font-black text-slate-700">🌴 أشجار</span>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {trees.map(t => <span key={t.id} className="text-xl bg-white p-1 rounded shadow-xs" title={t.name}>{t.icon}</span>)}
              </div>
            </div>
            <div className="border bg-slate-50 p-2 rounded-lg min-h-[90px] text-center">
              <span className="text-xs font-black text-slate-700">🌸 شجيرات</span>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {shrubs.map(s => <span key={s.id} className="text-xl bg-white p-1 rounded shadow-xs" title={s.name}>{s.icon}</span>)}
              </div>
            </div>
            <div className="border bg-slate-50 p-2 rounded-lg min-h-[90px] text-center">
              <span className="text-xs font-black text-slate-700">🌾 أعشاب</span>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {herbs.map(h => <span key={h.id} className="text-xl bg-white p-1 rounded shadow-xs" title={h.name}>{h.icon}</span>)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <MascotCompanion message="تصنف الحيوانات إلى ست مجموعات كبرى. أجب على الأسئلة الثلاثة التالية لترقية معمل مجموعات الحيوانات!" />

          <div className="bg-slate-50 border p-4 rounded-xl mb-4">
            <h4 className="text-xs font-black text-slate-800 mb-3">الأسئلة السريعة ({scoreAnimal}/٣ إجابات صحيحة):</h4>
            
            {scoreAnimal === 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-3">١. الضفدع يستطيع العيش في الماء وعلى اليابسة ويضع البيض، فإلى أي مجموعة ينتمي؟</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleAnimalAnswer('amphibians', true)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">البرمائيات</button>
                  <button onClick={() => handleAnimalAnswer('reptiles', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الزواحف</button>
                  <button onClick={() => handleAnimalAnswer('insects', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الحشرات</button>
                </div>
              </div>
            )}

            {scoreAnimal === 1 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-3">٢. الثعابين والسحالي يغطي جسمها حراشف صلبة وجافة وتضع البيض، فإلى أي مجموعة تنتمي؟</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleAnimalAnswer('reptiles', true)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الزواحف</button>
                  <button onClick={() => handleAnimalAnswer('mammals', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الثدييات</button>
                  <button onClick={() => handleAnimalAnswer('birds', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الطيور</button>
                </div>
              </div>
            )}

            {scoreAnimal === 2 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-3">٣. الأبقار والقطط والأرانب تلد وترضع صغارها الحليب، فما اسم هذه المجموعة الحيوية؟</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleAnimalAnswer('mammals', true)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الثدييات</button>
                  <button onClick={() => handleAnimalAnswer('insects', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الحشرات</button>
                  <button onClick={() => handleAnimalAnswer('fish', false)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50">الأسماك</button>
                </div>
              </div>
            )}

            {scoreAnimal >= 3 && (
              <div className="text-center p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-bold">
                🎉 رائع جداً! أجبت على الأسئلة الثلاثة بنجاح كامل!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist to win */}
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          * فرز النباتات: {trees.length === 2 ? "✔️ مكتمل" : "❌ غير مكتمل"} • أسئلة الحيوانات: {scoreAnimal >= 3 ? "✔️ مكتمل" : `❌ ${scoreAnimal}/٣`}
        </span>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. Matter Properties & Classification Lab (changes slot)
// ============================================================================
interface MatterItem {
  id: string;
  name: string;
  material: 'wood' | 'plastic' | 'glass' | 'clay' | 'rubber' | 'fabric';
  icon: string;
  property: string;
}

function MatterPropertiesLab({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [activeTab, setActiveTab] = useState<'materials' | 'properties'>('materials');

  const materialsPool: MatterItem[] = [
    { id: '1', name: "مشبك غسيل", material: 'wood', icon: "🪵", property: "متين ويصنع من الخشب." },
    { id: '2', name: "بالون ملون", material: 'rubber', icon: "🎈", property: "مرن وخفيف ويصنع من المطاط." },
    { id: '3', name: "زير وقلة ماء", material: 'clay', icon: "🏺", property: "سهل التشكيل باليد ويصنع من الصلصال (الطين)." },
    { id: '4', name: "ملابس ناعمة", material: 'fabric', icon: "👕", property: "متين وسهل الطي ويصنع من القماش." },
    { id: '5', name: "لعبة أطفال", material: 'plastic', icon: "🧸", property: "متين وخفيف ومقاوم للكسر ويصنع من البلاستيك." },
    { id: '6', name: "كوب زجاجي", material: 'glass', icon: "🥛", property: "شفاف وهش وسهل الكسر ويصنع من الزجاج." }
  ];

  const [items, setItems] = useState<MatterItem[]>(materialsPool);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  // Property Sandbox state
  const [selectedPropMat, setSelectedPropMat] = useState<string>('');
  const [testedProp, setTestedProp] = useState<string>('');

  const handleMatchMaterial = (item: MatterItem, mat: string) => {
    speakWord(item.name);
    if (item.material === mat) {
      playSparkleSound();
      setFeedback(`إجابة صحيحة! ${item.icon} ${item.name} يصنع من مادة الـ ${mat === 'wood' ? 'خشب' : mat === 'rubber' ? 'مطاط' : mat === 'clay' ? 'صلصال (طين)' : mat === 'fabric' ? 'قماش' : mat === 'plastic' ? 'بلاستيك' : 'زجاج'}.`);
      setItems(items.filter(i => i.id !== item.id));
      setSolvedCount(solvedCount + 1);
    } else {
      playFailureSound();
      setFeedback(`عفواً! ${item.icon} ${item.name} ليس مصنوعاً من هذه المادة.`);
    }
  };

  const handleTestProperty = (prop: string) => {
    if (!selectedPropMat) return;
    playSparkleSound();
    
    if (selectedPropMat === 'plastic' && prop === 'lightness') {
      setTestedProp("🟢 البلاستيك خفيف الوزن ومتين وقوي.");
    } else if (selectedPropMat === 'glass' && prop === 'fragility') {
      setTestedProp("🔴 الزجاج شفاف وهش للغاية وسهل الكسر.");
    } else if (selectedPropMat === 'clay' && prop === 'shaping') {
      setTestedProp("🟢 الصلصال يتميز بسهولة التشكيل وصناعة الأواني الفخارية.");
    } else if (selectedPropMat === 'fabric' && prop === 'folding') {
      setTestedProp("🟢 القماش متين ومطواع وسهل الطي والغسيل.");
    } else {
      setTestedProp("📝 اختبرت هذه المادة وظهرت خصائصها الفيزيائية بنجاح.");
    }

    if (solvedCount >= 6) {
      onWin();
    }
  };

  const resetGame = () => {
    setItems(materialsPool);
    setSolvedCount(0);
    setFeedback(null);
    setSelectedPropMat('');
    setTestedProp('');
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-matter">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-sky-600 h-4 w-4" />
          مختبر المادة: صناعة الأشياء وخواصها الفيزيائية 🪵🥛🏺
        </h3>
        <span className="text-xs bg-sky-100 text-sky-850 px-2 py-0.5 rounded-full font-black">ص ٣٠ - ص ٣٧</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'materials' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🏺 فرز المادة المصنوعة
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'properties' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🔬 معمل الخواص الفيزيائية
        </button>
      </div>

      {feedback && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      {activeTab === 'materials' ? (
        <div>
          <MascotCompanion message="تتكون الأشياء من حولنا من مواد مختلفة مثل البلاستيك، الخشب، الزجاج، والصلصال. انقر على الشيء واقترحه للمادة الصحيحة المصنوع منها!" />

          {items.length > 0 ? (
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border rounded-xl text-center mb-4">
              <span className="text-4xl mb-1 select-none">{items[0].icon}</span>
              <h4 className="text-xs font-black text-slate-800 mb-2">{items[0].name}</h4>
              <p className="text-[10px] text-slate-500 mb-4">{items[0].property}</p>

              <div className="grid grid-cols-3 gap-2 w-full">
                <button onClick={() => handleMatchMaterial(items[0], 'wood')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">🪵 خشب</button>
                <button onClick={() => handleMatchMaterial(items[0], 'rubber')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">🎈 مطاط</button>
                <button onClick={() => handleMatchMaterial(items[0], 'clay')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">🏺 صلصال</button>
                <button onClick={() => handleMatchMaterial(items[0], 'fabric')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">👕 قماش</button>
                <button onClick={() => handleMatchMaterial(items[0], 'plastic')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">🧸 بلاستيك</button>
                <button onClick={() => handleMatchMaterial(items[0], 'glass')} className="px-2 py-1.5 bg-white border text-xs font-bold rounded-lg hover:bg-sky-50 transition">🥛 زجاج</button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-sky-50 rounded-xl mb-4">
              <p className="text-xs font-black text-sky-800">🎉 رائع جداً! لقد أكملت فرز وتصنيف مواد الأشياء الست كلها!</p>
              <p className="text-[11px] text-slate-500 mt-1">انتقل الآن لـ 'معمل الخواص الفيزيائية' لإكمال تجارب المادة.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <MascotCompanion message="نحن نختار المواد لصنع الأشياء وفق خواصها المحددة. اختر مادة من اليسار، واضغط على خاصيتها الفيزيائية في اليمين لاختبار تفكيكها ومرونتها!" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold">١. اختر المادة:</span>
              <button onClick={() => { setSelectedPropMat('plastic'); setTestedProp(''); }} className={`p-2 rounded-lg border text-xs font-black text-right transition ${selectedPropMat === 'plastic' ? 'bg-sky-100 border-sky-400' : 'bg-white'}`}>🧸 البلاستيك</button>
              <button onClick={() => { setSelectedPropMat('glass'); setTestedProp(''); }} className={`p-2 rounded-lg border text-xs font-black text-right transition ${selectedPropMat === 'glass' ? 'bg-sky-100 border-sky-400' : 'bg-white'}`}>🥛 الزجاج</button>
              <button onClick={() => { setSelectedPropMat('clay'); setTestedProp(''); }} className={`p-2 rounded-lg border text-xs font-black text-right transition ${selectedPropMat === 'clay' ? 'bg-sky-100 border-sky-400' : 'bg-white'}`}>🏺 الصلصال</button>
              <button onClick={() => { setSelectedPropMat('fabric'); setTestedProp(''); }} className={`p-2 rounded-lg border text-xs font-black text-right transition ${selectedPropMat === 'fabric' ? 'bg-sky-100 border-sky-400' : 'bg-white'}`}>👕 القماش</button>
            </div>

            <div className="md:col-span-7 flex flex-col gap-3">
              <span className="text-[10px] text-slate-400 font-bold">٢. اختر الخاصية الفيزيائية لاختبارها:</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleTestProperty('lightness')} disabled={!selectedPropMat} className="p-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-250 transition disabled:opacity-50">⚖️ الخفة والمتانة</button>
                <button onClick={() => handleTestProperty('fragility')} disabled={!selectedPropMat} className="p-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-250 transition disabled:opacity-50">🔨 الهشاشة والكسر</button>
                <button onClick={() => handleTestProperty('shaping')} disabled={!selectedPropMat} className="p-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-250 transition disabled:opacity-50">🏺 سهولة التشكيل</button>
                <button onClick={() => handleTestProperty('folding')} disabled={!selectedPropMat} className="p-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-250 transition disabled:opacity-50">👕 سهولة الطي</button>
              </div>

              {testedProp && (
                <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs font-bold">
                  {testedProp}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          المواد المفروزة: {solvedCount}/٦ • {solvedCount >= 6 ? "✔️ مكتمل" : "❌ غير مكتمل"}
        </span>
        {solvedCount < 6 && (
          <span className="text-[11px] text-amber-600 font-bold">💡 قم بفرز جميع المواد الست في التبويب الأول أولاً!</span>
        )}
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. Light & Shadows Simulator (light slot)
// ============================================================================
function LightAndShadowLab({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [activeTab, setActiveTab] = useState<'straight' | 'shadow' | 'opaque'>('straight');

  // Straight line state
  const [hole1, setHole1] = useState(0); // offset y: -20 to 20
  const [hole2, setHole2] = useState(15);
  const [hole3, setHole3] = useState(-10);

  const [hasAligned, setHasAligned] = useState(false);

  // Shadow state
  const [flashlightDist, setFlashlightDist] = useState(50); // 10 to 100

  // Opaque state
  const [glassScore, setGlassScore] = useState<string[]>([]);

  const handleAlign = () => {
    setHole1(0);
    setHole2(0);
    setHole3(0);
    setHasAligned(true);
    playSparkleSound();
    checkWinCondition();
  };

  const handleClassifyObject = (obj: string, category: string) => {
    playSparkleSound();
    if (!glassScore.includes(obj)) {
      setGlassScore([...glassScore, obj]);
    }
  };

  const checkWinCondition = () => {
    if (hasAligned || (glassScore.length >= 3 && flashlightDist !== 50)) {
      onWin();
    }
  };

  useEffect(() => {
    if (glassScore.length === 3 && hasAligned) {
      onWin();
    }
  }, [glassScore, hasAligned]);

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-light-lab">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-amber-500 h-4 w-4" />
          مختبر الطاقة الضوئية والظلال والأجسام 🕯️🕶️
        </h3>
        <span className="text-xs bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full font-black">ص ٤٠ - ص ٤٥</span>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('straight')} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer flex-shrink-0 ${activeTab === 'straight' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>🕯️ خطوط مستقيمة</button>
        <button onClick={() => setActiveTab('shadow')} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer flex-shrink-0 ${activeTab === 'shadow' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>👤 معمل تكون الظلال</button>
        <button onClick={() => setActiveTab('opaque')} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer flex-shrink-0 ${activeTab === 'opaque' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>📄 أجسام شفافة ومعتمة</button>
      </div>

      {activeTab === 'straight' && (
        <div>
          <MascotCompanion message="أهلاً بك في معمل الفيزياء الضوئي! يسير الضوء في خطوط مستقيمة. اسحب الحوائل لضبط ثقوبها على استقامة واحدة مع ضوء الشمعة، أو اضغط على 'ضبط المحاذاة التلقائي' لمشاهدة لهب الشمعة الناري!" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-700">تحريك الحوائل الخشبية:</h4>
              
              <div>
                <label className="text-[10px] text-slate-500 block">موضع الحائل الأول:</label>
                <input type="range" min="-20" max="20" value={hole1} onChange={(e) => { setHole1(Number(e.target.value)); setHasAligned(false); }} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">موضع الحائل الثاني:</label>
                <input type="range" min="-20" max="20" value={hole2} onChange={(e) => { setHole2(Number(e.target.value)); setHasAligned(false); }} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">موضع الحائل الثالث:</label>
                <input type="range" min="-20" max="20" value={hole3} onChange={(e) => { setHole3(Number(e.target.value)); setHasAligned(false); }} className="w-full accent-amber-500" />
              </div>

              <button
                id="btn-auto-align"
                onClick={handleAlign}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg transition"
              >
                📏 ضبط محاذاة الثقوب تلقائياً
              </button>
            </div>

            <div className="md:col-span-7 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center min-h-[220px] relative text-white">
              <span className="absolute top-2 right-2 text-[9px] text-slate-400">نمذجة الأشعة المستقيمة ثنائية الأبعاد</span>

              <svg viewBox="0 0 320 160" className="w-full max-w-sm h-40">
                <defs>
                  {/* Glowing candle flame */}
                  <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </radialGradient>
                  {/* Laser light beam gradient */}
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="1" />
                    <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Candle on Left */}
                <g transform="translate(25, 60)">
                  {/* Candle Stick */}
                  <rect x="0" y="25" width="12" height="45" fill="#fca5a5" rx="2" stroke="#ef4444" strokeWidth="1" />
                  {/* Wick */}
                  <line x1="6" y1="25" x2="6" y2="18" stroke="#1e293b" strokeWidth="2" />
                  {/* Candle Base */}
                  <ellipse cx="6" cy="70" rx="14" ry="4" fill="#64748b" />
                  {/* Flame */}
                  <path d="M 6 0 C 12 10, 10 20, 6 20 C 2 20, 0 10, 6 0 Z" fill="#f97316" className="animate-pulse" />
                  <path d="M 6 5 C 9 11, 8 18, 6 18 C 4 18, 3 11, 6 5 Z" fill="#facc15" />
                  <circle cx="6" cy="15" r="10" fill="url(#flameGlow)" opacity="0.5" />
                </g>

                {/* Wooden Barriers */}
                {/* Barrier 1 */}
                <g transform={`translate(100, 20)`}>
                  {/* Slider slot outline */}
                  <line x1="8" y1="-10" x2="8" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="3,3" />
                  {/* Wood Board */}
                  <g transform={`translate(0, ${hole1 * 1.5})`}>
                    <rect x="0" y="10" width="16" height="100" fill="#7c2d12" stroke="#451a03" strokeWidth="1.5" rx="3" />
                    {/* The Hole */}
                    <circle cx="8" cy="60" r="5" fill="#090d16" stroke="#facc15" strokeWidth="1" />
                  </g>
                </g>

                {/* Barrier 2 */}
                <g transform={`translate(160, 20)`}>
                  <line x1="8" y1="-10" x2="8" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="3,3" />
                  <g transform={`translate(0, ${hole2 * 1.5})`}>
                    <rect x="0" y="10" width="16" height="100" fill="#7c2d12" stroke="#451a03" strokeWidth="1.5" rx="3" />
                    <circle cx="8" cy="60" r="5" fill="#090d16" stroke="#facc15" strokeWidth="1" />
                  </g>
                </g>

                {/* Barrier 3 */}
                <g transform={`translate(220, 20)`}>
                  <line x1="8" y1="-10" x2="8" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="3,3" />
                  <g transform={`translate(0, ${hole3 * 1.5})`}>
                    <rect x="0" y="10" width="16" height="100" fill="#7c2d12" stroke="#451a03" strokeWidth="1.5" rx="3" />
                    <circle cx="8" cy="60" r="5" fill="#090d16" stroke="#facc15" strokeWidth="1" />
                  </g>
                </g>

                {/* Eye on Right */}
                <g transform="translate(275, 65)">
                  {/* Eye socket / sclera */}
                  <path d="M -15 0 Q 0 -12 15 0 Q 0 12 -15 0 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Iris & pupil */}
                  <circle cx="0" cy="0" r="6" fill="#0284c7" />
                  <circle cx="0" cy="0" r="3" fill="#000000" />
                  {/* Eye shine */}
                  <circle cx="-2" cy="-2" r="1.5" fill="#ffffff" />
                  {/* Eyelashes / details */}
                  <path d="M -10 -10 L -6 -6" stroke="#475569" strokeWidth="1" />
                  <path d="M 0 -12 L 0 -7" stroke="#475569" strokeWidth="1" />
                  <path d="M 10 -10 L 6 -6" stroke="#475569" strokeWidth="1" />
                </g>

                {/* The Light Rays! */}
                {/* Ray segment 1: Candle to Barrier 1 */}
                <line x1="31" y1="75" x2="108" y2="75" stroke="url(#beamGrad)" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />

                {/* Ray segment 2: Through Barrier 1 to Barrier 2 */}
                {Math.abs(hole1) <= 3 ? (
                  <g>
                    <line x1="108" y1="75" x2="168" y2="75" stroke="url(#beamGrad)" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                    
                    {/* Segment 3: Through Barrier 2 to Barrier 3 */}
                    {Math.abs(hole2) <= 3 ? (
                      <g>
                        <line x1="168" y1="75" x2="228" y2="75" stroke="url(#beamGrad)" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                        
                        {/* Segment 4: Through Barrier 3 to Eye! */}
                        {Math.abs(hole3) <= 3 ? (
                          <g>
                            <line x1="228" y1="75" x2="275" y2="75" stroke="url(#beamGrad)" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                            {/* Glowing effect at the pupil */}
                            <circle cx="275" cy="75" r="8" fill="#facc15" opacity="0.6" className="animate-ping" />
                          </g>
                        ) : (
                          // Blocked at Barrier 3
                          <circle cx="228" cy="75" r="4" fill="#ef4444" className="animate-pulse" />
                        )}
                      </g>
                    ) : (
                      // Blocked at Barrier 2
                      <circle cx="168" cy="75" r="4" fill="#ef4444" className="animate-pulse" />
                    )}
                  </g>
                ) : (
                  // Blocked at Barrier 1
                  <circle cx="108" cy="75" r="4" fill="#ef4444" className="animate-pulse" />
                )}
              </svg>

              <div className="mt-4 text-center">
                {(Math.abs(hole1) <= 3 && Math.abs(hole2) <= 3 && Math.abs(hole3) <= 3) ? (
                  <span className="text-xs text-amber-400 font-extrabold animate-pulse">🟢 مدهش! الثقوب على استقامة واحدة: شعاع الضوء المستقيم وصل للعين بنجاح!</span>
                ) : (
                  <span className="text-xs text-rose-400 font-bold">🔴 الأشعة محجوبة: عثر الضوء المستقيم على حاجز خشبي معتم فامتصّه ومنعه!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shadow' && (
        <div>
          <MascotCompanion message="الظل هو المساحة المظلمة التي تتكون خلف الجسم المعتم عندما يحجب الضوء المستقيم. قم بسحب المصباح لتقريبه من الجسم لمشاهدة كيف يتضخم ويكبر حجم الظل المتكون على الحائط!" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5">
              <label className="text-xs font-black text-slate-700 block mb-2">تقريب المصباح الكهربائي:</label>
              <input
                type="range"
                min="15"
                max="90"
                value={flashlightDist}
                onChange={(e) => { setFlashlightDist(Number(e.target.value)); checkWinCondition(); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-xs text-slate-500 font-bold mt-2">
                مسافة المصباح: {flashlightDist} سم
              </div>
            </div>

            <div className="md:col-span-7 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center min-h-[220px] relative text-white">
              <span className="absolute top-2 right-2 text-[9px] text-slate-400">حائط المعاينة البصرية والظلال ثلاثية الأبعاد</span>

              {(() => {
                const torchTipX = 10 + (flashlightDist - 15) * 1.1; // moves as slider changes
                const coneRadius = 20 + (120 * 20) / flashlightDist;
                const shadowScale = 0.5 + 40 / flashlightDist;
                const blurAmount = Math.max(1, (100 - flashlightDist) / 20); // softer shadow when closer!
                return (
                  <svg viewBox="0 0 320 160" className="w-full max-w-sm h-40">
                    <defs>
                      {/* Flashlight beam gradient */}
                      <radialGradient id="torchBeam" cx="0%" cy="50%" r="100%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                        <stop offset="60%" stopColor="#fef08a" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                      </radialGradient>
                      
                      {/* Blur filter for realistic shadow borders */}
                      <filter id="shadowBlur">
                        <feGaussianBlur stdDeviation={blurAmount} />
                      </filter>

                      {/* Reusable Teddy Bear vector group */}
                      <g id="vectorTeddy">
                        {/* Head */}
                        <circle cx="0" cy="-6" r="8" />
                        {/* Ears */}
                        <circle cx="-6" cy="-12" r="3.5" />
                        <circle cx="6" cy="-12" r="3.5" />
                        {/* Body */}
                        <ellipse cx="0" cy="8" rx="10" ry="11" />
                        {/* Arms & Legs */}
                        <circle cx="-11" cy="5" r="3" />
                        <circle cx="11" cy="5" r="3" />
                        <circle cx="-7" cy="18" r="4" />
                        <circle cx="7" cy="18" r="4" />
                      </g>
                    </defs>

                    {/* Leftside dark backdrop */}
                    <rect x="0" y="0" width="320" height="160" fill="#020617" rx="8" />

                    {/* Light Cone representation */}
                    <polygon 
                      points={`${torchTipX + 25},80 270,${80 - coneRadius} 270,${80 + coneRadius}`} 
                      fill="url(#torchBeam)" 
                      opacity="0.35" 
                    />

                    {/* Flashlight (🔦) Vector Graphic */}
                    <g transform={`translate(${torchTipX}, 65)`}>
                      {/* Handle */}
                      <rect x="0" y="10" width="20" height="10" fill="#475569" rx="1" stroke="#334155" strokeWidth="1" />
                      {/* Ribs */}
                      <line x1="5" y1="10" x2="5" y2="20" stroke="#334155" strokeWidth="1" />
                      <line x1="10" y1="10" x2="10" y2="20" stroke="#334155" strokeWidth="1" />
                      {/* Head */}
                      <path d="M 20 5 L 28 0 L 28 30 L 20 25 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                      {/* Glass Lens glow */}
                      <ellipse cx="28" cy="15" rx="2" ry="14" fill="#fef08a" />
                    </g>

                    {/* Opaque Teddy Bear Object (Brown Toy) */}
                    <g transform="translate(160, 80)" fill="#b45309" stroke="#78350f" strokeWidth="1">
                      <use href="#vectorTeddy" />
                      {/* Face details */}
                      <circle cx="-3" cy="-7" r="1" fill="#451a03" />
                      <circle cx="3" cy="-7" r="1" fill="#451a03" />
                      <ellipse cx="0" cy="-4" rx="1.5" ry="1" fill="#451a03" />
                    </g>

                    {/* Projection Wall (Right side) */}
                    <rect x="270" y="10" width="40" height="140" fill="#e2e8f0" stroke="#94a3b8" rx="2" />
                    <text x="290" y="25" fontSize="7" fontWeight="bold" fill="#475569" textAnchor="middle">الحائط</text>

                    {/* Dynamic Shadow Cast on Wall */}
                    <g 
                      transform={`translate(280, 80) scale(${shadowScale})`} 
                      fill="#0f172a" 
                      opacity="0.85" 
                      filter="url(#shadowBlur)"
                    >
                      <use href="#vectorTeddy" />
                    </g>
                  </svg>
                );
              })()}

              <div className="mt-2 text-center">
                <span className="text-[11px] text-slate-300 font-bold">
                  📏 حجم الظل المتكون: <span className="text-amber-400 font-extrabold">{(0.5 + 40 / flashlightDist).toFixed(1)}x</span> ضعف الحجم الطبيعي للجسم
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'opaque' && (
        <div>
          <MascotCompanion message="تصنف المواد حسب نفاذ الضوء إلى ثلاثة أقسام. صل الأجسام التالية بفئتها الصحيحة:" />

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-slate-50 border rounded-xl text-center">
              <span className="text-2xl">🥛</span>
              <h4 className="text-xs font-black text-slate-800 mt-1">لوح الزجاج الشفاف</h4>
              <button onClick={() => handleClassifyObject('glass', 'transparent')} className="mt-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md hover:bg-amber-600 block mx-auto">✔️ جسم شفاف</button>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl text-center">
              <span className="text-2xl">🩹</span>
              <h4 className="text-xs font-black text-slate-800 mt-1">قطعة شاش طبي</h4>
              <button onClick={() => handleClassifyObject('gauze', 'semitransparent')} className="mt-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md hover:bg-amber-600 block mx-auto">✔️ نصف شفاف</button>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl text-center">
              <span className="text-2xl">📦</span>
              <h4 className="text-xs font-black text-slate-800 mt-1">ورق كرتون مقوى</h4>
              <button onClick={() => handleClassifyObject('cardboard', 'opaque')} className="mt-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md hover:bg-amber-600 block mx-auto">✔️ جسم معتم</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Footer */}
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          * الثقوب مستقيمة: {hasAligned ? "✔️ نعم" : "❌ لا"} • أجسام مصنفة: {glassScore.length}/٣
        </span>
        {glassScore.length === 3 && hasAligned ? (
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-bounce">🎉 رائع! أكملت كل تجارب الضوء!</span>
        ) : (
          <span className="text-[11px] text-amber-600 font-bold">💡 اضبط محاذاة الثقوب أولاً، وصنف المواد الثلاث لحل المعمل!</span>
        )}
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 9. Electric Circuit Builder Simulator (moon slot)
// ============================================================================
function ElectricCircuitBuilder({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [wire1Connected, setWire1Connected] = useState(false);
  const [wire2Connected, setWire2Connected] = useState(false);
  const [switchInstalled, setSwitchInstalled] = useState(false);
  const [bulbInstalled, setBulbInstalled] = useState(false);

  const [switchOn, setSwitchOn] = useState(false);
  const [wetHandWarning, setWetHandWarning] = useState(false);

  // Conductor vs Insulator materials
  const testMaterials = [
    { id: 'copper_wire', name: "سلك نحاسي بطل", isConductor: true, emoji: "🔌", color: "#f59e0b", explanation: "النحاس ناقل ممتاز وسريع جداً للكهرباء." },
    { id: 'iron_nail', name: "مسمار حديدي صلب", isConductor: true, emoji: "📌", color: "#64748b", explanation: "الحديد من المعادن الموصلة التي تسمح بسريان التيار." },
    { id: 'rubber_eraser', name: "ممحاة مطاطية", isConductor: false, emoji: "🧼", color: "#fda4af", explanation: "المطاط مادة عازلة تماماً وتمنع عبور الشحنات." },
    { id: 'metal_spoon', name: "ملعقة طعام معدنية", isConductor: true, emoji: "🥄", color: "#94a3b8", explanation: "المعدن يغلق الدائرة فوراً ويسمح بمرور الكهرباء." },
    { id: 'wooden_stick', name: "عود خشبي جاف", isConductor: false, emoji: "🪵", color: "#ca8a04", explanation: "الخشب مادة عازلة لا تمرر الكهرباء ولا تضيء المصباح." },
    { id: 'plastic_ruler', name: "مسطرة بلاستيك", isConductor: false, emoji: "📏", color: "#38bdf8", explanation: "البلاستيك عازل قوي ويستخدم لحماية الأسلاك." }
  ];

  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0); // Default: Copper wire
  const currentMaterial = testMaterials[selectedMaterialIdx];

  const [testedCount, setTestedCount] = useState<string[]>(['copper_wire']);
  const [hasSolved, setHasSolved] = useState(false);

  const handleConnectWire1 = () => {
    playSparkleSound();
    setWire1Connected(true);
  };

  const handleConnectWire2 = () => {
    playSparkleSound();
    setWire2Connected(true);
  };

  const handleInstallSwitch = () => {
    playSparkleSound();
    setSwitchInstalled(true);
  };

  const handleInstallBulb = () => {
    playSparkleSound();
    setBulbInstalled(true);
  };

  const handleToggleSwitch = () => {
    if (wetHandWarning) {
      playFailureSound();
      alert("🚨 خطر جداً ومميت! يدك مبللة بالماء! الماء العذب أو رطوبة اليد تزيد من خطر الصعقة الكهربائية. جفف يدك أولاً للسلامة!");
      return;
    }

    playSparkleSound();
    const nextSwitchOn = !switchOn;
    setSwitchOn(nextSwitchOn);

    if (nextSwitchOn && wire1Connected && wire2Connected && switchInstalled && bulbInstalled && currentMaterial.isConductor) {
      if (!hasSolved) {
        setHasSolved(true);
        onWin();
      }
    }
  };

  const handleSelectMaterial = (idx: number) => {
    playSparkleSound();
    setSelectedMaterialIdx(idx);
    const mat = testMaterials[idx];
    if (!testedCount.includes(mat.id)) {
      setTestedCount([...testedCount, mat.id]);
    }

    // If switch is already on and they swap to a conductor, let it light up
    if (switchOn && wire1Connected && wire2Connected && switchInstalled && bulbInstalled && mat.isConductor) {
      if (!hasSolved) {
        setHasSolved(true);
        onWin();
      }
    }
  };

  const resetCircuit = () => {
    setWire1Connected(false);
    setWire2Connected(false);
    setSwitchInstalled(false);
    setBulbInstalled(false);
    setSwitchOn(false);
    setWetHandWarning(false);
    setHasSolved(false);
    setSelectedMaterialIdx(0);
    setTestedCount(['copper_wire']);
  };

  const isGlowing = switchOn && wire1Connected && wire2Connected && switchInstalled && bulbInstalled && currentMaterial.isConductor;

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-circuit">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-amber-600 h-4 w-4" />
          مختبر الطاقة الكهربائية والمواد الموصلة والعازلة ⚡💡
        </h3>
        <span className="text-xs bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full font-black">ص ٥١ - ص ٥٤</span>
      </div>

      <MascotCompanion message="مرحباً بك في معمل الفيزياء والكهرباء! أولاً، ركّب عناصر الدائرة (البطارية، الأسلاك، المفتاح، المصباح). ثانياً، اختبر المواد المختلفة في فجوة الاختبار (مشبك التوصيل) لتكتشف المواد الموصلة التي تضيء المصباح والمواد العازلة التي تمنع مرور التيار!" />

      {wetHandWarning && (
        <div className="mb-4 p-2.5 bg-rose-50 border-2 border-rose-200 rounded-xl text-xs font-black text-rose-700 text-center flex items-center justify-center gap-1.5 animate-pulse">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          ⚠️ تحذير سلامة منهج كتاب العلوم: تمنع ملامسة المفاتيح الكهربائية واليد مبللة بالماء لتفادي الصعق الكهربائي!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Wire controls */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <span className="text-[10px] text-slate-400 font-bold">الخطوة الأولى: تركيب الدائرة الأساسية:</span>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleConnectWire1}
              disabled={wire1Connected}
              className={`p-2 rounded-lg border text-[11px] font-black text-right transition ${
                wire1Connected ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-not-allowed opacity-70' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer'
              }`}
            >
              🔌 ١. سلك أول (+)
            </button>

            <button
              onClick={handleConnectWire2}
              disabled={!wire1Connected || wire2Connected}
              className={`p-2 rounded-lg border text-[11px] font-black text-right transition ${
                wire2Connected ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-not-allowed opacity-70' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              🔌 ٢. سلك ثانٍ (-)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleInstallSwitch}
              disabled={!wire2Connected || switchInstalled}
              className={`p-2 rounded-lg border text-[11px] font-black text-right transition ${
                switchInstalled ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-not-allowed opacity-70' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              🎛️ ٣. تركيب المفتاح
            </button>

            <button
              onClick={handleInstallBulb}
              disabled={!switchInstalled || bulbInstalled}
              className={`p-2 rounded-lg border text-[11px] font-black text-right transition ${
                bulbInstalled ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-not-allowed opacity-70' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              💡 ٤. تركيب المصباح
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-bold mt-2">الخطوة الثانية: اختيار مادة الاختبار في الفجوة:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {testMaterials.map((mat, idx) => {
              const isSelected = selectedMaterialIdx === idx;
              return (
                <button
                  key={mat.id}
                  onClick={() => handleSelectMaterial(idx)}
                  className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center transition active:scale-95 cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-md' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xl mb-1">{mat.emoji}</span>
                  <span className="truncate max-w-full text-center leading-tight">{mat.name.split(' ')[0]}</span>
                  <span className={`text-[8px] mt-1 px-1 rounded-full ${mat.isConductor ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {mat.isConductor ? "موصل" : "عازل"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Wet hand switch */}
          <div className="mt-2 p-2 bg-slate-50 border rounded-lg flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">بلل اليد بالماء؟ (اختبار أمان منهج العلوم)</span>
            <input
              type="checkbox"
              checked={wetHandWarning}
              onChange={(e) => setWetHandWarning(e.target.checked)}
              className="w-4 h-4 accent-rose-600"
            />
          </div>

          <button onClick={resetCircuit} className="text-[10px] text-slate-400 hover:underline text-left mt-1">تفكيك وإعادة الدائرة 🔄</button>
        </div>

        {/* Visual Lab */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[250px] relative text-white overflow-hidden shadow-inner">
          <span className="absolute top-2 right-2 text-[9px] text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            لوحة المعمل التفاعلية المباشرة 🔬
          </span>

          <svg viewBox="0 0 320 160" className="w-full max-w-sm h-40">
            <style>{`
              @keyframes electronFlow {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              .electrons {
                stroke-dasharray: 6, 12;
                animation: electronFlow 0.8s linear infinite;
              }
            `}</style>

            <defs>
              {/* Glowing bulb radial gradient */}
              <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#eab308" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* PCB Background grid lines */}
            <rect x="0" y="0" width="320" height="160" fill="#022c22" rx="8" stroke="#047857" strokeWidth="2.5" />
            <path d="M 0 40 L 320 40 M 0 80 L 320 80 M 0 120 L 320 120 M 80 0 L 80 160 M 160 0 L 160 160 M 240 0 L 240 160" stroke="#044e36" strokeWidth="0.5" />

            {/* WIRES PATHS */}
            {/* Path 1: Battery (+) to Bulb Top */}
            <path 
              d="M 40 50 L 40 30 L 260 30 L 260 50" 
              fill="none" 
              stroke={wire1Connected ? (isGlowing ? "#fbbf24" : "#ea580c") : "#1e293b"} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            {isGlowing && (
              <path 
                d="M 40 50 L 40 30 L 260 30 L 260 50" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2" 
                className="electrons"
                strokeLinecap="round"
              />
            )}

            {/* Path 2: Battery (-) to Switch Left */}
            <path 
              d="M 40 100 L 40 130 L 135 130" 
              fill="none" 
              stroke={wire2Connected ? (isGlowing ? "#fbbf24" : "#ea580c") : "#1e293b"} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            {isGlowing && (
              <path 
                d="M 40 100 L 40 130 L 135 130" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2" 
                className="electrons"
                strokeLinecap="round"
              />
            )}

            {/* Path 3 Part A: Switch Right to Test Clip 1 */}
            <path 
              d="M 185 130 L 200 130" 
              fill="none" 
              stroke={(wire2Connected && switchInstalled) ? (isGlowing ? "#fbbf24" : "#ea580c") : "#1e293b"} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            {isGlowing && (
              <path 
                d="M 185 130 L 200 130" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2" 
                className="electrons"
                strokeLinecap="round"
              />
            )}

            {/* Path 3 Part B: Test Clip 2 to Bulb Bottom */}
            <path 
              d="M 240 130 L 260 130 L 260 90" 
              fill="none" 
              stroke={(wire2Connected && switchInstalled && currentMaterial.isConductor) ? (isGlowing ? "#fbbf24" : "#ea580c") : "#1e293b"} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            {isGlowing && (
              <path 
                d="M 240 130 L 260 130 L 260 90" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2" 
                className="electrons"
                strokeLinecap="round"
              />
            )}

            {/* TEST SLOP TERMINAL CLIPS */}
            <circle cx="200" cy="130" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
            <circle cx="240" cy="130" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

            {/* Render selected material in testing slot */}
            <g transform="translate(200, 115)">
              <rect x="2" y="3" width="36" height="24" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="2,2" rx="3" />
              <text x="20" y="18" fontSize="12" textAnchor="middle" className="select-none">{currentMaterial.emoji}</text>
              <text x="20" y="24" fontSize="5" fontWeight="bold" fill="#34d399" textAnchor="middle">{currentMaterial.name.split(' ')[0]}</text>
            </g>

            {/* BATTERY COMPONENT */}
            <g transform="translate(15, 45)">
              <rect x="-3" y="0" width="56" height="60" fill="none" stroke="#047857" strokeWidth="1" rx="4" />
              <rect x="5" y="10" width="40" height="40" fill="#1e293b" rx="2" stroke="#475569" strokeWidth="1.5" />
              <rect x="5" y="10" width="20" height="40" fill="#dc2626" rx="1" />
              <rect x="0" y="22" width="5" height="16" fill="#facc15" rx="1" />
              <text x="12" y="34" fontSize="11" fontWeight="black" fill="#ffffff" textAnchor="middle">+</text>
              <rect x="45" y="22" width="5" height="16" fill="#64748b" rx="1" />
              <text x="36" y="34" fontSize="11" fontWeight="black" fill="#ffffff" textAnchor="middle">-</text>
              <text x="25" y="58" fontSize="7" fontWeight="bold" fill="#059669" textAnchor="middle">بطارية مجهزة</text>
            </g>

            {/* SWITCH COMPONENT */}
            <g transform="translate(130, 110)">
              {!switchInstalled ? (
                <g>
                  <rect x="0" y="0" width="60" height="35" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" rx="4" />
                  <text x="30" y="22" fontSize="7" fontWeight="bold" fill="#94a3b8" textAnchor="middle">مكان المفتاح 🎛️</text>
                </g>
              ) : (
                <g>
                  <rect x="0" y="10" width="60" height="20" fill="#78350f" stroke="#451a03" strokeWidth="1" rx="2" />
                  <circle cx="10" cy="20" r="3.5" fill="#ca8a04" />
                  <circle cx="50" cy="20" r="3.5" fill="#ca8a04" />
                  {switchOn ? (
                    <line x1="10" y1="20" x2="50" y2="20" stroke="#facc15" strokeWidth="4" strokeLinecap="round" className="cursor-pointer" onClick={handleToggleSwitch} />
                  ) : (
                    <line x1="10" y1="20" x2="42" y2="2" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" className="cursor-pointer" onClick={handleToggleSwitch} />
                  )}
                  <circle cx={switchOn ? 50 : 42} cy={switchOn ? 20 : 2} r="5" fill="#dc2626" className="cursor-pointer" onClick={handleToggleSwitch} />
                  <text x="30" y="38" fontSize="6" fontWeight="bold" fill="#34d399" textAnchor="middle">انقر لتشغيل المفتاح</text>
                </g>
              )}
            </g>

            {/* BULB COMPONENT */}
            <g transform="translate(235, 45)">
              {!bulbInstalled ? (
                <g>
                  <circle cx="25" cy="25" r="22" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="25" y="28" fontSize="7" fontWeight="bold" fill="#94a3b8" textAnchor="middle">مكان المصباح 💡</text>
                </g>
              ) : (
                <g>
                  {isGlowing && (
                    <circle cx="25" cy="18" r="30" fill="url(#bulbGlow)" opacity="0.8" className="animate-pulse" />
                  )}
                  
                  <rect x="17" y="33" width="16" height="12" fill="#94a3b8" stroke="#475569" strokeWidth="1" rx="1" />
                  <line x1="17" y1="37" x2="33" y2="37" stroke="#475569" strokeWidth="1" />
                  <line x1="17" y1="41" x2="33" y2="41" stroke="#475569" strokeWidth="1" />
                  
                  <path 
                    d="M 13 28 C 10 18, 12 5, 25 5 C 38 5, 40 18, 37 28 C 36 31, 33 33, 33 33 L 17 33 C 17 33, 14 31, 13 28 Z" 
                    fill={isGlowing ? "#fef08a" : "#cbd5e1"} 
                    stroke="#64748b" 
                    strokeWidth="1.5" 
                    opacity={isGlowing ? 0.95 : 0.7} 
                  />

                  <path d="M 19 33 L 22 18 L 28 18 L 31 33" fill="none" stroke={isGlowing ? "#ea580c" : "#64748b"} strokeWidth="1" />
                  <circle cx="25" cy="18" r="1.5" fill={isGlowing ? "#f97316" : "#475569"} />

                  {isGlowing && (
                    <g stroke="#facc15" strokeWidth="2" strokeLinecap="round" className="animate-pulse">
                      <line x1="25" y1="-2" x2="25" y2="-8" />
                      <line x1="5" y1="8" x2="-1" y2="5" />
                      <line x1="45" y1="8" x2="51" y2="5" />
                      <line x1="10" y1="25" x2="4" y2="28" />
                      <line x1="40" y1="25" x2="46" y2="28" />
                    </g>
                  )}
                </g>
              )}
            </g>
          </svg>

          {/* Practical Results & Educational Status */}
          <div className="mt-3 text-center w-full max-w-sm px-2">
            {isGlowing ? (
              <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-2 animate-pulse">
                <span className="text-[11px] text-emerald-300 font-extrabold block">✨ المصباح يضيء! {currentMaterial.emoji} موصلة للكهرباء</span>
                <p className="text-[9px] text-emerald-100/90 mt-0.5 leading-tight">{currentMaterial.explanation}</p>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2">
                <span className="text-[11px] text-slate-300 font-extrabold block">
                  {!wire1Connected || !wire2Connected || !switchInstalled || !bulbInstalled 
                    ? "⚠️ قم بتركيب جميع عناصر الدائرة الكهربائية أولاً." 
                    : !switchOn 
                      ? "🎛️ أغلق المفتاح الكهربائي لبدء سريان التيار." 
                      : `❌ المصباح منطفئ! ${currentMaterial.emoji} مادة عازلة`}
                </span>
                {switchOn && wire1Connected && wire2Connected && switchInstalled && bulbInstalled && !currentMaterial.isConductor && (
                  <p className="text-[9px] text-rose-300 mt-0.5 leading-tight">{currentMaterial.explanation}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between w-full text-[9px] border-t border-slate-800 pt-2 text-slate-400">
            <span>المواد المختبرة: {testedCount.length} من {testMaterials.length}</span>
            {testedCount.length >= 4 && (
              <span className="text-emerald-400 font-black">🌟 مبروك! وثقت {testedCount.length} مواد في دفتر علومك!</span>
            )}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 10. Magic Senses Lab Simulator (senses slot)
// ============================================================================
interface SensesItem {
  id: string;
  stimulus: string;
  icon: string;
  correctOrgan: string;
  senseName: string;
  feedbackMsg: string;
}

function SensesSimulator({ onWin, successMsg }: { onWin: () => void; successMsg: string | null }) {
  const [activeTab, setActiveTab] = useState<'matching' | 'safety'>('matching');

  const matchPool: SensesItem[] = [
    { id: '1', stimulus: "عطر فواح رائحته زكية 🌸", icon: "🌸", correctOrgan: "الأنف", senseName: "الشم", feedbackMsg: "الأنف هو عضو حاسة الشم، نميز به الروائح الطيبة كالعطور الجذابة." },
    { id: '2', stimulus: "صوت بوق السيارة القوي 🚗", icon: "🚗", correctOrgan: "الأذنان", senseName: "السمع", feedbackMsg: "الأذنان هما عضوا السمع، نسمع بهما الأصوات المختلفة لنتفادي المخاطر." },
    { id: '3', stimulus: "عصير ليمون حامض الطعم 🍋", icon: "🍋", correctOrgan: "اللسان", senseName: "التذوق", feedbackMsg: "اللسان هو عضو التذوق، نميز به الطعم الحلو والمالح والحامض والمر." },
    { id: '4', stimulus: "ملمس الثلج البارد جداً ❄️", icon: "❄️", correctOrgan: "الجلد", senseName: "اللمس", feedbackMsg: "الجلد يغطي جسمنا كله، ونشعر به بالسخونة والبرودة والنعومة والخشونة." },
    { id: '5', stimulus: "رؤية صور كتاب مدرسي ملون 📚", icon: "📚", correctOrgan: "العينان", senseName: "البصر", feedbackMsg: "العينان هما عضوا البصر، نحتاج للضوء لنرى الأشياء بوضوح كامل." }
  ];

  const [items, setItems] = useState<SensesItem[]>(matchPool);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const [safetyScore, setSafetyScore] = useState(0);
  const [safetyIndex, setSafetyIndex] = useState(0);

  const safetyScenarios = [
    {
      question: "١. كيف تنظف أذنك بطريقة آمنة وصحيحة؟",
      options: [
        { text: "باستخدام عود ثقاب أو مسمار حاد ❌", correct: false, reason: "الأجسام الحادة قد تثقب غشاء طبلة الأذن الحساس وتسبب الصمم!" },
        { text: "بمسحها بمنديل نظيف برفق ✨", correct: true, reason: "هذا يحافظ على الأذن دون إلحاق الضرر بالقناة السمعية." }
      ]
    },
    {
      question: "٢. كيف تحافظ على سلامة ونظافة جلدك بعد اللعب والتعرق؟",
      options: [
        { text: "بالاستحمام بالماء فقط دون صابون ❌", correct: false, reason: "الماء وحده لا يكفي لإزالة الدهون والأوساخ العالقة بالجلد." },
        { text: "بالاستحمام بالماء والصابون معاً 🧼", correct: true, reason: "الماء والصابون يذيبان الدهون والروائح الكريهة ويحميان من الأمراض." }
      ]
    },
    {
      question: "٣. ماذا تفعل عند التعرض لضوء الشمس المباشر والساطع؟",
      options: [
        { text: "النظر المباشر لقرص الشمس لاختبار بصرك ❌", correct: false, reason: "النظر المباشر لأضواء ساطعة يؤذي العين بشدة ويجهد البصر!" },
        { text: "تجنب النظر المباشر وارتداء نظارة شمسية 🕶️", correct: true, reason: "هذا يحمي شبكية العين من الأضرار البصرية الجسيمة." }
      ]
    },
    {
      question: "٤. كيف تحمي لسانك أثناء تناول الطعام والشراب؟",
      options: [
        { text: "تذوق المواد الساخنة جداً أو كيمياويات مجهولة ❌", correct: false, reason: "قد يسبب حروقاً بالغة وتلفاً لمستقبلات التذوق!" },
        { text: "الانتظار حتى يبرد الطعام، وعدم تذوق كيمياويات مجهولة 🥣", correct: true, reason: "هذا يضمن سلامة اللسان وحمايته من الحروق والسموم." }
      ]
    }
  ];

  const handleMatchOrgan = (item: SensesItem, organ: string) => {
    speakWord(organ);
    if (item.correctOrgan === organ) {
      playSparkleSound();
      setFeedback(`إجابة صحيحة! ${item.icon} ${item.stimulus} -> يتم عبر ${item.correctOrgan} (حاسة ${item.senseName}). ${item.feedbackMsg}`);
      setItems(items.filter(i => i.id !== item.id));
      setSolvedCount(solvedCount + 1);
    } else {
      playFailureSound();
      setFeedback(`عفواً! ${item.icon} ${item.stimulus} لا يتم عبر ${organ}. حاول مجدداً برفق!`);
    }
  };

  const handleSafetyAnswer = (correct: boolean, reason: string) => {
    if (correct) {
      playSparkleSound();
      alert(`إجابة صحيحة وممتازة! 🎉\n${reason}`);
      setSafetyScore(safetyScore + 1);
    } else {
      playFailureSound();
      alert(`انتبه يا بطل! ⚠️\n${reason}`);
    }
    setSafetyIndex(safetyIndex + 1);
  };

  useEffect(() => {
    if (solvedCount === 5 && safetyScore >= 3) {
      onWin();
    }
  }, [solvedCount, safetyScore]);

  const resetGame = () => {
    setItems(matchPool);
    setSolvedCount(0);
    setFeedback(null);
    setSafetyScore(0);
    setSafetyIndex(0);
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-right" dir="rtl" id="sim-senses">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="text-[#8D7F67] h-4 w-4" />
          مختبر الحواس الخمس السحري وصحة الأعضاء 👁️👂👃👅✋
        </h3>
        <span className="text-xs bg-[#FAF6EE] text-amber-900 border border-[#D5CBB9] px-2 py-0.5 rounded-full font-black">ص ١٦ - ص ٢٢</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'matching' ? 'bg-[#8D7F67] text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🧩 ربط المثيرات بالحاسة
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'safety' ? 'bg-[#8D7F67] text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          🛡️ معمل أمان وصحة الحواس
        </button>
      </div>

      {feedback && (
        <div className="mb-4 p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-center text-slate-700 animate-pulse">
          {feedback}
        </div>
      )}

      {activeTab === 'matching' ? (
        <div>
          <MascotCompanion message="وهبنا الله خمسة أعضاء حس لنتعرف بها على الأشياء من حولنا. انقر على المثير الحسي ثم حدد العضو المسؤول عنه!" />

          {items.length > 0 ? (
            <div className="flex flex-col items-center justify-center p-5 bg-[#FCFAF7] border-2 border-[#DDD4C3] rounded-2xl text-center mb-4">
              <span className="text-4xl mb-2 select-none animate-bounce">{items[0].icon}</span>
              <h4 className="text-sm font-black text-slate-800 mb-2">{items[0].stimulus}</h4>
              <p className="text-xs text-amber-900 bg-amber-50 px-3 py-1 border border-amber-100 rounded-full font-bold mb-4">
                أي أعضاء الحس التالية مسؤول عن هذا المثير؟
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
                <button onClick={() => handleMatchOrgan(items[0], 'العينان')} className="px-2 py-2 bg-white border border-slate-200 text-xs font-extrabold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer">👁️ العينان</button>
                <button onClick={() => handleMatchOrgan(items[0], 'الأذنان')} className="px-2 py-2 bg-white border border-slate-200 text-xs font-extrabold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer">👂 الأذنان</button>
                <button onClick={() => handleMatchOrgan(items[0], 'الأنف')} className="px-2 py-2 bg-white border border-slate-200 text-xs font-extrabold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer">👃 الأنف</button>
                <button onClick={() => handleMatchOrgan(items[0], 'اللسان')} className="px-2 py-2 bg-white border border-slate-200 text-xs font-extrabold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer">👅 اللسان</button>
                <button onClick={() => handleMatchOrgan(items[0], 'الجلد')} className="px-2 py-2 bg-white border border-slate-200 text-xs font-extrabold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer">✋ الجلد</button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
              <p className="text-xs font-black text-emerald-800">🎉 رائع جداً! لقد أكملت ربط وتحديد جميع الحواس الخمس بنجاح!</p>
              <p className="text-[11px] text-slate-500 mt-1">انتقل الآن لـ 'معمل أمان وصحة الحواس' لإثبات ممارساتك الصحية المعتمدة بكتاب العلوم.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <MascotCompanion message="صحة أعضاء الحس غالية جداً. أجب بشكل صحيح على القواعد الصحية المعتمدة لترقية وسام بطل العلوم!" />

          {safetyIndex < safetyScenarios.length ? (
            <div className="bg-[#FAF6EE] border border-[#DDD4C3] p-4 rounded-xl mb-4">
              <h4 className="text-xs font-black text-amber-950 mb-3">{safetyScenarios[safetyIndex].question}</h4>
              <div className="flex flex-col gap-2">
                {safetyScenarios[safetyIndex].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSafetyAnswer(opt.correct, opt.reason)}
                    className="p-3 bg-white hover:bg-amber-50 border border-slate-200 text-right rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
              <p className="text-xs font-black text-emerald-800">✔️ رائع جداً! لقد أجبت على جميع سيناريوهات سلامة الحواس!</p>
              <p className="text-xs font-extrabold text-slate-700 mt-1">حصلت على درجة أمان: {safetyScore} / ٤</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Footer */}
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          * الحواس المكتملة: {solvedCount}/٥ • نتيجة الأمان: {safetyScore}/٤
        </span>
        <button onClick={resetGame} className="text-[10px] text-slate-400 hover:underline cursor-pointer">إعادة المحاولة 🔄</button>
      </div>

      {successMsg && (
        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-black text-emerald-800 text-center animate-bounce">
          {successMsg}
        </div>
      )}
    </div>
  );
}

