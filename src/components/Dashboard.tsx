import React, { useState } from 'react';
import { 
  Heart, Flower2, Bug, Trees, Flame, Beaker, Sun, Globe,
  BookOpen, Star, Trophy, ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Play, Calendar, Download, AlertCircle, HelpCircle, Lock, Unlock, Eye
} from 'lucide-react';
import { Unit, Lesson, UserProgress } from '../types';
import { playSparkleSound, playFailureSound } from '../utils/audio';

interface DashboardProps {
  units: Unit[];
  progress: UserProgress;
  selectedUnit: Unit;
  onSelectUnit: (unit: Unit) => void;
  onSelectLesson: (lesson: Lesson) => void;
  isDailyChallengeSolved: boolean;
  onOpenDailyChallenge: () => void;
  onToggleWorksheets: () => void;
  viewMode?: 'units' | 'lessons';
  onViewModeChange?: (mode: 'units' | 'lessons') => void;
  onUnlockLesson?: (lessonId: string) => void;
}

// Fun child-friendly emojis representing lessons
const getLessonEmoji = (lessonId: string): string => {
  const emojiMap: Record<string, string> = {
    "u1-l1": "🐣", // living/non-living
    "u1-l2": "🌱", // characteristics of life
    "u1-l3": "🛸🌱", // needs of life (UFO plant dome)
    "u1-l4": "🌵", // habitats
    "u1-l5": "🫁", // human body
    "u1-l6": "👁️", // sensory organs
    "u1-l7": "👂", // hearing
    "u1-l8": "👓", // vision
    "u1-l9": "👃", // smell
    "u1-l10": "👅", // taste
    "u1-l11": "✋", // touch
    "u1-l12": "🌳", // plants diversity
    "u1-l13": "🦁", // animals diversity
    "u2-l1": "🏺", // solid/liquid/gas
    "u2-l2": "🪵", // properties
    "u2-l3": "🔬", // mixtures
    "u2-l4": "🪑", // objects structure
    "u3-l1": "💡", // light energy
    "u3-l2": "👥", // shadows
    "u3-l3": "🔋", // electricity
    "u3-l4": "🔌"  // safety
  };
  return emojiMap[lessonId] || "🚀";
};

// SVG Serpent Road Path Generator
const generateZigzagPath = (itemCount: number) => {
  if (itemCount <= 1) return "";
  const stepHeight = 100 / itemCount;
  
  // Start at center of first element
  let d = `M 50,${stepHeight / 2}`;
  
  for (let j = 0; j < itemCount - 1; j++) {
    const yStart = (j + 0.5) * stepHeight;
    const yEnd = (j + 1.5) * stepHeight;
    const dy = yEnd - yStart;
    
    const xStart = j % 2 === 0 ? 50 : (j % 4 === 1 ? 82 : 18);
    const xEnd = (j + 1) % 2 === 0 ? 50 : ((j + 1) % 4 === 1 ? 82 : 18);
    
    // Control points to create smooth s-shape loop
    const cy1 = yStart + dy * 0.45;
    const cy2 = yEnd - dy * 0.45;
    
    d += ` C ${xStart},${cy1} ${xEnd},${cy2} ${xEnd},${yEnd}`;
  }
  return d;
};

export default function Dashboard({ 
  units, 
  progress, 
  selectedUnit,
  onSelectUnit,
  onSelectLesson,
  isDailyChallengeSolved,
  onOpenDailyChallenge,
  onToggleWorksheets,
  viewMode: propViewMode,
  onViewModeChange,
  onUnlockLesson
}: DashboardProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [consoleMessageIdx, setConsoleMessageIdx] = useState(0);

  // Parent math unlock puzzle state
  const [parentUnlockLesson, setParentUnlockLesson] = useState<Lesson | null>(null);
  const [mathProblem, setMathProblem] = useState<{ equation: string; answer: number }>({ equation: '', answer: 0 });
  const [parentAnswerInput, setParentAnswerInput] = useState('');
  const [parentError, setParentError] = useState('');

  const generateMathProblem = () => {
    const isMultiStep = Math.random() > 0.5;
    let equation = '';
    let answer = 0;
    if (isMultiStep) {
      const n1 = Math.floor(Math.random() * 6) + 4; // 4 - 9
      const n2 = Math.floor(Math.random() * 6) + 4; // 4 - 9
      const n3 = Math.floor(Math.random() * 15) + 5; // 5 - 19
      equation = `${n1} × ${n2} + ${n3}`;
      answer = n1 * n2 + n3;
    } else {
      const n1 = Math.floor(Math.random() * 30) + 20; // 20 - 49
      const n2 = Math.floor(Math.random() * 30) + 20; // 20 - 49
      equation = `${n1} + ${n2}`;
      answer = n1 + n2;
    }
    setMathProblem({ equation, answer });
    setParentAnswerInput('');
    setParentError('');
  };

  const handleOpenParentUnlock = (lesson: Lesson) => {
    setParentUnlockLesson(lesson);
    generateMathProblem();
  };

  const handleVerifyParentUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(parentAnswerInput.trim());
    if (isNaN(parsed)) {
      setParentError("الرجاء إدخال رقم صحيح يا ولي الأمر.");
      playFailureSound();
      return;
    }
    if (parsed === mathProblem.answer) {
      playSparkleSound();
      if (onUnlockLesson && parentUnlockLesson) {
        onUnlockLesson(parentUnlockLesson.id);
      }
      // Launch lesson directly for convenience!
      if (parentUnlockLesson) {
        onSelectLesson(parentUnlockLesson);
      }
      setParentUnlockLesson(null);
    } else {
      playFailureSound();
      setParentError("الناتج غير صحيح! حاول مرة أخرى للتأكيد.");
    }
  };
  
  const [localViewMode, setLocalViewMode] = useState<'units' | 'lessons'>('units');
  const viewMode = propViewMode !== undefined ? propViewMode : localViewMode;
  const setViewMode = onViewModeChange !== undefined ? onViewModeChange : setLocalViewMode;

  // Custom Sudanese-vibe tips/greetings displayed on the screen console
  const consoleMessages = [
    `مرحباً بك يا ${progress.studentName || 'بطل العلوم'} في رحلة العلوم الممتعة! اختر الدرس الذي تود استكشافه لبدء المغامرة!`,
    "هل تعلم؟ جسم الإنسان يحتوي على حواس خمسة مدهشة تساعده على الإحساس بالعالم من حوله!",
    "تذكير ذكي: عند الانتهاء من مراجعة كل درس، قم بحل الأسئلة والأنشطة للحصول على النجوم الذهبية!",
    "صانع أوراق العمل يتيح لك تصميم وطباعة امتحاناتك المنزلية بكل سهولة! جربه الآن من القائمة الجانبية.",
    "مبادرتنا تهدف إلى تبسيط العلوم لطلاب الصف الثالث الابتدائي بالسودان الحبيب • بخت الرضا"
  ];

  const handleNextConsoleMessage = () => {
    setConsoleMessageIdx((prev) => (prev + 1) % consoleMessages.length);
  };

  const handlePrevConsoleMessage = () => {
    setConsoleMessageIdx((prev) => (prev - 1 + consoleMessages.length) % consoleMessages.length);
  };

  // Cycle through Units using << and >> console buttons
  const handleNextUnit = () => {
    const currentIdx = units.findIndex(u => u.id === selectedUnit.id);
    const nextIdx = (currentIdx + 1) % units.length;
    onSelectUnit(units[nextIdx]);
  };

  const handlePrevUnit = () => {
    const currentIdx = units.findIndex(u => u.id === selectedUnit.id);
    const prevIdx = (currentIdx - 1 + units.length) % units.length;
    onSelectUnit(units[prevIdx]);
  };

  // Build the list of items for the serpentine road based on the current view mode
  const roadItemsCount = viewMode === 'units' ? (units.length * 2 - 1) : (selectedUnit.lessons.length * 2 - 1);
  const pathD = generateZigzagPath(roadItemsCount);
  
  // Generate items
  const roadItems = [];
  if (viewMode === 'units') {
    for (let i = 0; i < roadItemsCount; i++) {
      roadItems.push({ type: i % 2 === 0 ? 'node' : 'lock', index: Math.floor(i / 2) });
    }
  } else {
    for (let i = 0; i < roadItemsCount; i++) {
      roadItems.push({ type: i % 2 === 0 ? 'node' : 'lock', index: Math.floor(i / 2) });
    }
  }

  return (
    <div className="p-1 sm:p-4 bg-[#FDFBF7] min-h-screen font-sans space-y-6" id="dashboard-root">
      
      {/* Centered Main Title mimicking "مسار الرحلة" */}
      <div className="text-center space-y-1.5 py-2" dir="rtl">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          مسار الرحلة 🗺️
        </h2>
        <p className="text-xs text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
          تنقل على طول الخريطة الذهبية المتصلة بالدروس، وشاهد المحاكيات، وافتح الأوسمة مع المنهج السوداني المعتمد!
        </p>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="three-column-journey-grid">
        
        {/* ==========================================
            COLUMN 1: LEFT SIDEBAR (Engagement, Spaceship Console & Resources)
           ========================================== */}
        <div className="col-span-1 lg:col-span-4 space-y-6 hidden lg:block" dir="rtl">
          
          <div className="bg-white rounded-[28px] border-4 border-rose-300 overflow-hidden shadow-md">
            {/* Header */}
            <div className="bg-[#E12A5E] text-white py-3 px-4 font-black text-center text-sm tracking-wide">
              Engagement
            </div>
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Daily Challenge Card */}
              <div 
                onClick={onOpenDailyChallenge}
                className={`bg-[#FFFDF0] border-3 border-amber-300 rounded-[22px] p-4 text-center cursor-pointer relative overflow-hidden transition hover:scale-[1.02] shadow-sm ${
                  isDailyChallengeSolved ? 'bg-emerald-50/50 border-emerald-300' : 'animate-pulse'
                }`}
              >
                <div className="absolute top-2 left-2 bg-amber-200 text-amber-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                  0+ 👥
                </div>
                <span className="text-xs font-black text-amber-800 block text-right pr-1">
                  ⭐ تحدي اليوم السريع!
                </span>
                
                {/* 3D Gift Box Animation */}
                <div className="my-3 flex justify-center">
                  <span className="text-5xl filter drop-shadow animate-bounce inline-block">
                    🎁
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-right" dir="rtl">
                  {isDailyChallengeSolved 
                    ? 'أحسنت يا بطل! لقد قمت بحل تحدي اليوم التفاعلي بنجاح وحصلت على الأوسمة والنقاط الذهبية!' 
                    : 'هناك تحدي تفاعلي مشوق بانتظارك لحل لغز السلسلة الغذائية ومقاومة الكائنات الحية وحرارة الأجسام!'
                  }
                </p>
              </div>

              {/* Spaceship Control Console */}
              <div className="bg-[#F1F3F5] rounded-[22px] border-3 border-slate-400 p-4 space-y-3.5 relative overflow-hidden text-right" dir="rtl">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500">لوحة التحكم الفضائية</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border-2 border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-xl shadow-inner shrink-0">
                    {progress.studentAvatar || '👧'}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-indigo-600 font-extrabold block">المستكشف:</span>
                    <h4 className="text-xs font-black text-slate-800 leading-tight">
                      {progress.studentName || 'ليان'}
                    </h4>
                    <span className="text-[9px] text-slate-450 block">📍 الولاية: {progress.studentCity || 'الخرطوم'}</span>
                  </div>
                </div>

                <div className="bg-[#051E2E] p-3 rounded-xl border border-cyan-800/50 text-cyan-400 font-mono text-[10px] min-h-[85px] relative shadow-inner">
                  <span className="text-[7px] text-cyan-600/60 absolute top-1 left-2">SYS_MSG_ACTIVE</span>
                  <p className="leading-normal font-bold pt-1">
                    {consoleMessages[consoleMessageIdx]}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center font-black">
                  <button onClick={handlePrevUnit} className="bg-white hover:bg-slate-100 text-slate-700 p-1 rounded-lg text-[10px] border border-slate-300 transition active:scale-90 cursor-pointer" title="الوحدة السابقة">&lt;&lt;</button>
                  <button onClick={handlePrevConsoleMessage} className="bg-white hover:bg-slate-100 text-slate-700 p-1 rounded-lg text-[10px] border border-slate-300 transition active:scale-90 cursor-pointer" title="الرسالة السابقة">&lt;</button>
                  <button onClick={handleNextConsoleMessage} className="bg-white hover:bg-slate-100 text-slate-700 p-1 rounded-lg text-[10px] border border-slate-300 transition active:scale-90 cursor-pointer" title="الرسالة التالية">&gt;</button>
                  <button onClick={handleNextUnit} className="bg-white hover:bg-slate-100 text-slate-700 p-1 rounded-lg text-[10px] border border-slate-300 transition active:scale-90 cursor-pointer" title="الوحدة التالية">&gt;&gt;</button>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Card (Moved here) */}
          <div className="bg-white rounded-[28px] border-4 border-emerald-300 overflow-hidden shadow-md">
            {/* Header */}
            <div className="bg-[#00A775] text-white py-3 px-4 font-black text-center text-sm tracking-wide">
              Resources
            </div>
            {/* Content */}
            <div className="p-4 space-y-4">
              
              {/* Books block - pink style */}
              <div 
                onClick={() => alert("سيتم قريباً توفير كتب تفاعلية ممتعة بالكامل لطلابنا الحبيبيين!")}
                className="bg-[#FFF0F3] border-3 border-[#F4A7B7] text-[#D0104C] rounded-[22px] p-4 text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition shadow-sm space-y-2"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-sm border border-[#F4A7B7]/40 animate-pulse">
                  📚
                </div>
                <h4 className="font-black text-xs">كتب وملخصات ممتعة</h4>
                <p className="text-[8px] text-[#D0104C]/75 font-bold">تصفح الكتيب المنهجي المقسم لدروس مبسطة مبهجة</p>
              </div>

              {/* Worksheets block - outline emerald style */}
              <div 
                onClick={onToggleWorksheets}
                className="bg-white border-3 border-[#00A775] text-[#00A775] rounded-[22px] p-4 text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition shadow-sm space-y-2"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-sm border border-emerald-100">
                  📝
                </div>
                <h4 className="font-black text-xs">أوراق عمل وبطاقات</h4>
                <p className="text-[8px] text-[#00A775]/75 font-bold">صمم، حمل واطبع امتحاناتك وراجع تحصيلك الدراسي</p>
              </div>

              {/* Diagonal floating hexagonal/round badges */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-[9px] text-slate-450 font-extrabold block text-right">أوسمة شرف بخت الرضا المحققة:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-base shadow hover:rotate-12 transition-transform cursor-pointer" title="الباحث الصغير">📘</div>
                  <div className="w-9 h-9 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-base shadow hover:rotate-12 transition-transform cursor-pointer animate-bounce" title="مستكشف الكون">🪐</div>
                  <div className="w-9 h-9 rounded-full bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-base shadow hover:rotate-12 transition-transform cursor-pointer" title="بطل المحاكيات">🔬</div>
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-base shadow hover:rotate-12 transition-transform cursor-pointer" title="عبقري الأحياء">🌿</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ==========================================
            COLUMN 2: CENTER AREA (Continuous Serpentine Winding Path)
           ========================================== */}
        <div className="col-span-1 lg:col-span-8 space-y-6" dir="rtl">
          
          <div className="bg-[#FAF6EC] p-4 sm:p-6 rounded-[32px] border-4 border-[#E2B755] shadow-lg space-y-6 relative overflow-hidden">
            
            {/* Title inside card */}
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-slate-850 tracking-tight">
                {viewMode === 'units' ? 'رحلة استكشاف المنهج 🗺️' : 'رحلة العلوم 🚀'}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold">
                {viewMode === 'units' 
                  ? 'اضغط على أي وحدة لفتح طريق الدروس والمغامرات التفصيلية!' 
                  : `دروس ومحاكيات وحدة: ${selectedUnit.title.split(': ')[0]}`
                }
              </p>
            </div>

            {/* Back button when inside lessons */}
            {viewMode === 'lessons' && (
              <div className="flex justify-start">
                <button 
                  onClick={() => setViewMode('units')}
                  className="bg-white hover:bg-slate-50 text-slate-850 font-black text-[11px] px-4 py-2 rounded-xl border-2 border-slate-200 transition shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>◀️ العودة لخريطة الوحدات</span>
                </button>
              </div>
            )}

            {/* THE ROAD CONTAINER */}
            <div className="relative w-full py-6 min-h-[500px]">
              
              {/* Absolute Road SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#C8BEA7" 
                  strokeWidth="76" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ vectorEffect: 'non-scaling-stroke' }} 
                />
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#EFE8D3" 
                  strokeWidth="62" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ vectorEffect: 'non-scaling-stroke' }} 
                />
              </svg>

              {/* Road Contents */}
              <div className="space-y-4 relative z-10 w-full">
                {roadItems.map((item, j) => {
                  const isEven = j % 2 === 0;
                  
                  // If it is even, it's a major Stop Node (Unit or Lesson)
                  if (isEven) {
                    const nodeIdx = j / 2;
                    
                    if (viewMode === 'units') {
                      const unit = units[nodeIdx];
                      const completedCount = unit.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
                      const pct = Math.round((completedCount / unit.lessons.length) * 100);
                      
                      // Illustrations for Units
                      const unitIllustration = 
                        unit.id === 1 ? '🌱' :
                        unit.id === 2 ? '🧪' : '💡';
                        
                      return (
                        <div key={`unit-node-${unit.id}`} className="flex justify-center w-full min-h-[170px] items-center relative">
                          
                          {/* Floating illustrations next to nodes */}
                          <div className="absolute left-[8%] md:left-[15%] text-4xl animate-bounce pointer-events-none filter drop-shadow">
                            {unitIllustration}
                          </div>

                          {/* Node Box */}
                          <div className="bg-white border-3 border-slate-900 rounded-[20px] p-4 text-center shadow-[4px_4px_0px_#1E293B] max-w-[240px] w-full space-y-2 relative z-10">
                            <span className="text-[8px] bg-indigo-100 text-indigo-900 font-extrabold px-2.5 py-0.5 rounded-full">
                              {unit.title.split(': ')[0]}
                            </span>
                            <h4 className="text-xs font-black text-slate-800 leading-tight">
                              {unit.title.split(': ')[1] || unit.title}
                            </h4>
                            
                            <div className="text-[9px] text-slate-450 font-semibold">
                              🏆 منجز: {completedCount} / {unit.lessons.length} ({pct}%)
                            </div>

                            {/* Action button inside Unit Node */}
                            <button 
                              onClick={() => {
                                onSelectUnit(unit);
                                setViewMode('lessons');
                              }}
                              className="w-full bg-[#05B382] hover:bg-[#049E73] text-white font-black text-[10px] py-1.5 rounded-full border border-[#048F68] transition active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>افتح الوحدة 🔓</span>
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // viewMode === 'lessons'
                      const lesson = selectedUnit.lessons[nodeIdx];
                      const isCompleted = progress.completedLessons.includes(lesson.id);
                      const isParentUnlocked = progress.parentUnlockedLessons?.includes(lesson.id);
                      const isFirstUncompleted = !isCompleted && 
                        (nodeIdx === 0 || progress.completedLessons.includes(selectedUnit.lessons[nodeIdx - 1]?.id));
                      const isUnlocked = isCompleted || isFirstUncompleted || nodeIdx === 0 || isParentUnlocked;
                      const lessonEmoji = getLessonEmoji(lesson.id);
                      
                      // Floating sensory or plant illustrations based on image
                      const isPlantNode = lesson.id === 'u1-l3' || lesson.id === 'u1-l2';
                      const isSensesNode = lesson.id === 'u1-l6' || lesson.id === 'u1-l5';

                      return (
                        <div key={`lesson-node-${lesson.id}`} className="flex justify-center w-full min-h-[190px] items-center relative">
                          
                          {/* Floating illustrations based on screenshot */}
                          {isPlantNode && (
                            <div className="absolute left-[5%] md:left-[12%] text-center pointer-events-none z-10">
                              <div className="text-4xl animate-pulse">🌱</div>
                              <div className="text-[7px] text-slate-500 font-bold bg-white/70 px-1 rounded">حاجة الكائنات</div>
                            </div>
                          )}
                          
                          {isSensesNode && (
                            <div className="absolute right-[5%] md:right-[12%] flex flex-col items-center pointer-events-none z-10">
                              <div className="text-4xl animate-bounce">👁️</div>
                              <div className="text-2xl -mt-2 animate-pulse">👂</div>
                            </div>
                          )}

                          {/* Node Box */}
                          <div className={`bg-white border-3 border-slate-900 rounded-[22px] p-4 text-center shadow-[4px_4px_0px_#1E293B] max-w-[240px] w-full space-y-2 relative z-10 ${
                            !isUnlocked ? 'opacity-70 grayscale bg-slate-50' : ''
                          }`}>
                            <div className="flex justify-between items-center text-[8px] font-bold text-slate-450 border-b pb-1 mb-1">
                              <span>{lesson.pagesRange} بالملخص</span>
                              <span>الدرس {nodeIdx + 1}</span>
                            </div>

                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-lg">{lessonEmoji}</span>
                              <h4 className="text-xs font-black text-slate-800 leading-tight">
                                {lesson.title.split(': ')[1] || lesson.title}
                              </h4>
                            </div>

                            {/* Under active nodes, green button to start */}
                            <div className="pt-1.5 space-y-1.5">
                              <button 
                                disabled={!isUnlocked}
                                onClick={() => onSelectLesson(lesson)}
                                className={`w-full py-2 rounded-full text-[10px] font-black transition active:scale-95 border-2 ${
                                  !isUnlocked
                                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                                    : isCompleted
                                      ? 'bg-emerald-550 hover:bg-emerald-600 text-white border-emerald-450 shadow-sm cursor-pointer'
                                      : 'bg-[#05B382] hover:bg-[#049E73] text-white border-[#048F68] shadow-md cursor-pointer animate-pulse hover:animate-none'
                                }`}
                              >
                                {isCompleted ? "مراجعة 🔄" : "ابدأ درس اليوم 🚀"}
                              </button>

                              {!isUnlocked && (
                                <button
                                  onClick={() => handleOpenParentUnlock(lesson)}
                                  className="w-full bg-slate-100 hover:bg-amber-55/90 text-amber-900 border-2 border-amber-300 hover:border-amber-400 py-1.5 rounded-full text-[9px] font-black transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                >
                                  👨‍👩‍👦 إذن ولي الأمر 🔐
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    }
                  } else {
                    // If it is odd, it's a connecting lock/checkpoint badge on the S-curves
                    const isRightSwing = j % 4 === 1;
                    const badgeLabel = viewMode === 'units' ? 'بوابة المنهج' : 'الملخص الدراسي';
                    
                    return (
                      <div 
                        key={`lock-badge-${j}`} 
                        className={`flex w-full min-h-[90px] items-center relative ${
                          isRightSwing ? 'justify-end pr-[12%] md:pr-[18%]' : 'justify-start pl-[12%] md:pl-[18%]'
                        }`}
                      >
                        <div className="bg-[#D2C8B5] border-2 border-[#B9AE98] text-[#5C5340] px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center text-[8px] font-black w-24 h-14 shadow-sm z-10 rotate-3">
                          <Lock className="h-3.5 w-3.5 text-amber-750 mb-0.5" />
                          <span>{badgeLabel}</span>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          BOTTOM EDUCATIONAL TIP/BANNER MOCKING "نصيحة مميزة"
         ======================================================== */}
      <section className="bg-gradient-to-r from-yellow-50 to-amber-100 border-4 border-yellow-300 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right shadow-md" dir="rtl">
        <div className="space-y-1">
          <span className="text-[9px] text-amber-800 bg-white/80 border border-amber-300 px-3 py-0.5 rounded-full font-black inline-block">
            💡 نصيحة علمية مميزة:
          </span>
          <p className="text-xs text-amber-950 font-black leading-relaxed">
            "يا بطل، العلوم ليست مجرد حفظ؛ بل متعة واكتشاف! انظر من حولك لتفهم نعم الله وعجائب هذا الكون العظيم." 🇸🇩🎒
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-amber-600 bg-white border-2 border-yellow-300 px-4 py-2 rounded-2xl shadow-sm">
          <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
          <span className="text-xs font-black text-slate-800">العلم أساس البناء! ✨</span>
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE LESSON VIDEO MODAL
         ======================================================== */}
      {isPlayingVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsPlayingVideo(false)}>
          <div className="bg-black rounded-3xl overflow-hidden border-4 border-emerald-400 shadow-2xl w-full max-w-4xl h-[70vh] relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800 text-white" dir="rtl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <span className="font-black text-xs sm:text-sm">فيديو الشرح التفاعلي المعتمد</span>
              </div>
              <button 
                onClick={() => setIsPlayingVideo(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-full shadow-md border-2 border-rose-400 cursor-pointer transition active:scale-95 flex items-center gap-1"
              >
                <span>إغلاق ✖</span>
              </button>
            </div>
            <div className="flex-grow w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
              {!navigator.onLine ? (
                <div className="space-y-4 max-w-md" dir="rtl">
                  <span className="text-5xl animate-bounce block">📡</span>
                  <h3 className="font-black text-sm sm:text-base text-yellow-300">أنت تدرس حالياً بدون اتصال بالإنترنت!</h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold">
                    فيديو الشرح المنهجي من المبادرة الإلكترونية يحتاج إلى اتصال نشط بالإنترنت لتشغيله. لا تقلق يا بطل، يمكنك الاستمرار في تصفح المنهج، حل التحديات والألعاب الممتعة بدون اتصال! 🌐✨
                  </p>
                </div>
              ) : (
                <iframe
                  src="https://drive.google.com/file/d/1BsPPlJ0sjG8hJjv0qMmZRX8eOagUJJC0/preview"
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="شرح مادة العلوم المنهج السوداني"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PARENT MATH UNLOCK MODAL
         ======================================================== */}
      {parentUnlockLesson && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setParentUnlockLesson(null)}>
          <div className="bg-white rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl w-full max-w-md relative flex flex-col text-slate-850" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="bg-amber-100 p-4 flex justify-between items-center border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">👨‍👩‍👦</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">بوابة ولي الأمر للتأكيد 🔐</span>
              </div>
              <button 
                onClick={() => setParentUnlockLesson(null)}
                className="bg-slate-250 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-3 py-1.5 rounded-full cursor-pointer transition active:scale-95 border border-slate-300"
              >
                إلغاء ✖
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 text-xs sm:text-sm">هل تود فتح هذا الدرس لبطلك الصغير؟</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  الدرس: <span className="text-amber-800 font-black">{parentUnlockLesson.title}</span>
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-amber-850 font-black block">مسألة حسابية سريعة لتأكيد إذن الوالدين:</span>
                <div className="text-2xl font-black text-slate-800 tracking-wider">
                  {mathProblem.equation} = ؟
                </div>
                <span className="text-[9px] text-slate-400 font-bold block">(تلميح ولي الأمر: يرجى كتابة الناتج بالأرقام لتجاوز القفل التلقائي)</span>
              </div>

              <form onSubmit={handleVerifyParentUnlock} className="space-y-3">
                <div>
                  <input
                    type="number"
                    value={parentAnswerInput}
                    onChange={(e) => {
                      setParentAnswerInput(e.target.value);
                      setParentError('');
                    }}
                    placeholder="اكتب الإجابة هنا..."
                    className="w-full text-center border-2 border-slate-300 p-2.5 rounded-xl font-extrabold text-slate-800 text-base focus:border-amber-400 focus:outline-none transition"
                    autoFocus
                  />
                  {parentError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5">{parentError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-3 rounded-xl border-2 border-amber-400 cursor-pointer shadow-md transition active:scale-95"
                  >
                    تأكيد الفتح والتشغيل 🔓
                  </button>
                  <button
                    type="button"
                    onClick={generateMathProblem}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 rounded-xl border border-slate-300 cursor-pointer transition active:scale-95"
                    title="تغيير المسألة"
                  >
                    🔄 مسألة أخرى
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
