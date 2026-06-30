import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, CheckCircle, HelpCircle, 
  Layers, Info, FileText, Sparkles, BookOpen, Bug, Flame, Heart, Play
} from 'lucide-react';

export default function AnimalLifecycles() {
  const [activeTab, setActiveTab] = useState<'groups' | 'movement' | 'diets' | 'game' | 'table'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<'mammals' | 'birds' | 'reptiles' | 'amphibians' | 'fish' | 'insects'>('mammals');
  
  // Game states for feeding animals
  const [gameAnimal, setGameAnimal] = useState<'camel' | 'lion' | 'chicken'>('camel');
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  const badgeRibbon = (colorClass: string, text: string) => (
    <div className={`relative flex items-center justify-center py-2 px-4 border-2 ${colorClass} rounded-2xl shadow-sm text-xs font-black select-none shrink-0 w-fit`}>
      <span className="relative z-10">{text}</span>
    </div>
  );

  const handleFeed = (food: 'grass' | 'meat' | 'both') => {
    setSelectedFood(food);
    if (gameAnimal === 'camel') {
      if (food === 'grass') {
        setFeedback("✅ إجابة صحيحة وممتازة! الجمل سفينة الصحراء حيوان آكل للعشب يتغذى على الحشائش والنباتات الشوكية 🐫🌱.");
        setScore(prev => prev + 10);
      } else {
        setFeedback("❌ ممم.. ليس تماماً! الجمل لا يأكل اللحوم، بل هو آكل للعشب فقط 🌱.");
      }
    } else if (gameAnimal === 'lion') {
      if (food === 'meat') {
        setFeedback("✅ رائع وبطل! الأسد ملك الغابة حيوان مفترس آكل للحوم، يصطاد ويتغذى على اللحم الطازج 🦁🥩.");
        setScore(prev => prev + 10);
      } else {
        setFeedback("❌ لا، الأسد لا يأكل الأعشاب والنباتات! الأسد حيوان آكل للحوم فقط ليمتلك طاقة الصيد 🥩.");
      }
    } else if (gameAnimal === 'chicken') {
      if (food === 'both') {
        setFeedback("✅ رائع جداً! الدجاجة حيوان متعدد التغذية (مزدوج) تأكل حبوب الذرة والقمح وتلتقط الديدان الصغيرة أيضاً 🐔🌽🐛.");
        setScore(prev => prev + 10);
      } else {
        setFeedback("❌ انتبه! الدجاجة تأكل الحبوب (نبات) وتأكل الديدان (لحم حيوان صغير) معاً، فهي حيوان متعدد التغذية 🐔🌽🐛.");
      }
    }
  };

  const nextAnimal = () => {
    setSelectedFood(null);
    setFeedback(null);
    if (gameAnimal === 'camel') setGameAnimal('lion');
    else if (gameAnimal === 'lion') setGameAnimal('chicken');
    else setGameAnimal('camel');
  };

  return (
    <div className="bg-[#FAF8F5] border-4 border-[#E6DFD5] p-4 sm:p-6 rounded-3xl shadow-sm text-slate-800 space-y-6 select-none font-sans" id="animal-lifecycles-explorer" dir="rtl">
      {/* Slide Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#E6DFD5] pb-4">
        <div>
          <span className="text-[10px] text-emerald-700 bg-emerald-150 border border-emerald-300 px-3 py-1 rounded-full font-black">
            الوحدة الثانية: الحيوانات من حولنا • مقرر علوم الصف الثالث الابتدائي 🎒
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-slate-800 mt-1">
            رحلة في عالم الحيوان: المجموعات، الحركة والتغذية 🐾
          </h3>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl border-2 border-amber-450 flex items-center justify-center font-bold text-[10px] bg-white text-amber-800 text-center leading-tight">
            الوحدة
            <br />
            الثانية
          </div>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="lifecycle-tabs">
        <button 
          onClick={() => setActiveTab('groups')} 
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 whitespace-nowrap ${
            activeTab === 'groups' ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border-slate-200'
          }`}
        >
          🦁 المجموعات الست
        </button>
        <button 
          onClick={() => setActiveTab('movement')} 
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 whitespace-nowrap ${
            activeTab === 'movement' ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border-slate-200'
          }`}
        >
          🦅 كيف تتحرك الحيوانات؟
        </button>
        <button 
          onClick={() => setActiveTab('diets')} 
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 whitespace-nowrap ${
            activeTab === 'diets' ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border-slate-200'
          }`}
        >
          🌱 غذاء الحيوان
        </button>
        <button 
          onClick={() => setActiveTab('game')} 
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 whitespace-nowrap ${
            activeTab === 'game' ? 'bg-emerald-450 text-white border-emerald-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border-slate-200'
          }`}
        >
          🎮 لعبة إطعام الحيوانات
        </button>
        <button 
          onClick={() => setActiveTab('table')} 
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border-2 whitespace-nowrap ${
            activeTab === 'table' ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border-slate-200'
          }`}
        >
          📊 جدول المقارنة المبسط
        </button>
      </div>

      {/* Slide Canvas */}
      <div className="bg-[#FAF8F5] border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-inner relative overflow-hidden min-h-[350px]">
        
        {/* Subtle Watermark/Emblem */}
        <div className="absolute top-4 left-4 text-slate-200/30 font-black text-6xl select-none pointer-events-none font-mono">
          {activeTab.toUpperCase()}
        </div>

        {/* TAB 1: Groups */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="text-right">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                صنف الحيوانات إلى مجموعات بناءً على صفاتها المشتركة 🔬
              </h4>
              <p className="text-xs text-slate-500 mt-1">اضغط على أي مجموعة في الأسفل لاستكشاف أسرارها:</p>
            </div>

            {/* Sub-tabs for groups */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'mammals', label: '🐇 الثدييات', color: 'border-pink-300 bg-pink-50 text-pink-900' },
                { id: 'birds', label: '🐦 الطيور', color: 'border-cyan-300 bg-cyan-50 text-cyan-900' },
                { id: 'reptiles', label: '🦎 الزواحف', color: 'border-amber-300 bg-amber-50 text-amber-900' },
                { id: 'amphibians', label: '🐸 البرمائيات', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                { id: 'fish', label: '🐟 الأسماك', color: 'border-blue-300 bg-blue-50 text-blue-900' },
                { id: 'insects', label: '🦗 الحشرات', color: 'border-rose-300 bg-rose-50 text-rose-900' }
              ].map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id as any)}
                  className={`p-2 py-3 border-2 rounded-2xl text-[11px] font-black transition-all cursor-pointer ${
                    selectedGroup === group.id 
                      ? 'bg-amber-300 text-slate-900 border-amber-400 scale-105 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Selected Group Description Box */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-right">
              {selectedGroup === 'mammals' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-pink-450 bg-pink-50 text-pink-900', 'تلد وترضع صغاراً 🍼')}
                      {badgeRibbon('border-slate-350 bg-slate-50 text-slate-800', 'يغطيها الشعر أو الفرو 🐇')}
                    </div>
                    <h5 className="text-base font-black text-pink-700">🐇 مجموعة الثدييات (اللبونات):</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      هي حيوانات دافئة تلد صغاراً حية ولا تضع بيضاً، وترضع صغارها الحليب الطبيعي المغذي من أجساد أمهاتهم. يغطي جسمها غالباً الفرو أو الشعر أو الوبر لحمايتها.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة سودانية: الجمل (سفينة الصحراء) 🐫، الأرانب البرية 🐇، الأبقار والماعز 🐐.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🐫</span>
                  </div>
                </div>
              )}

              {selectedGroup === 'birds' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-cyan-450 bg-cyan-50 text-cyan-900', 'يغطيها الريش 🪶')}
                      {badgeRibbon('border-amber-450 bg-amber-50 text-amber-900', 'تتكاثر بالبيض 🥚')}
                    </div>
                    <h5 className="text-base font-black text-cyan-700">🐦 مجموعة الطيور:</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      تتميز بوجود منقار صلب لقطع الطعام وجناحين ورجلين، ويغطي الريش أجسامها ليحافظ على حرارتها ويساعدها على الطيران. تتكاثر الطيور بوضع البيض في الأعشاش وتحضنه حتى يفقس.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة سودانية: الحمام المنزلي 🐦، الصقر الجارح 🦅، الدجاج والبط 🦆.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🦅</span>
                  </div>
                </div>
              )}

              {selectedGroup === 'reptiles' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-amber-500 bg-amber-50 text-amber-900', 'جلد جاف وحراشف 🦎')}
                      {badgeRibbon('border-rose-450 bg-rose-50 text-rose-900', 'تزحف أو تمشي ببطء 🐍')}
                    </div>
                    <h5 className="text-base font-black text-amber-700">🦎 مجموعة الزواحف:</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      تتميز بجلد جاف جداً ومغطى بحراشف صلبة وقاسية تحميها من الجفاف وفقدان الماء. ليس لها أرجل (مثل الثعبان) أو لها أرجل قصيرة جداً (مثل السلحفاة والضب)، وتتكاثر بوضع بيض له قشرة جلدية قوية على اليابسة.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة سودانية: حيوان الضب الصحراوي 🦎، التمساح النيلي الكبير 🐊، الثعابين والسلحفاة 🐢.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🦎</span>
                  </div>
                </div>
              )}

              {selectedGroup === 'amphibians' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-emerald-500 bg-emerald-50 text-emerald-900', 'جلد رطب وناعم 🐸')}
                      {badgeRibbon('border-blue-450 bg-blue-50 text-blue-900', 'تعيش في الماء والبر 💧🏡')}
                    </div>
                    <h5 className="text-base font-black text-emerald-700">🐸 مجموعة البرمائيات:</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      تتميز بجلد ناعم ورطب جداً بدون حراشف أو شعر. تقضي بداية حياتها في الماء وتتنفس بالخياشيم (مثل أبو ذنيبة)، وعندما تكبر تظهر لها أرجل ورئات لتتنفس الهواء وتعيش على اليابسة قرب المياه العذبة لتضع بيضها الرطب بالماء.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة شهيرة: الضفادع الخضراء 🐸، حيوان السلمندر المائي.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🐸</span>
                  </div>
                </div>
              )}

              {selectedGroup === 'fish' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-blue-500 bg-blue-50 text-blue-900', 'تعيش في الماء بالكامل 🌊')}
                      {badgeRibbon('border-slate-450 bg-slate-50 text-slate-800', 'تتنفس بالخياشيم 🐟')}
                    </div>
                    <h5 className="text-base font-black text-blue-700">🐟 مجموعة الأسماك:</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      تعيش في الماء طوال حياتها، وجسمها انسيابي مغطى بقشور صلبة ولامعة تحميها من المياه. تتحرك وتسبح بمهارة عالية باستخدام الزعانف والذيل، وتتنفس الأكسجين المذاب بالماء بواسطة الخياشيم وليس الرئات، وتتكاثر بوضع ملايين البيض الناعم في الماء.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة سودانية: سمك البلطي ببحيرة النوبة 🐟، سمك القرقور، وسمك البياض النيلي اللذيذ.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🐟</span>
                  </div>
                </div>
              )}

              {selectedGroup === 'insects' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex gap-2">
                      {badgeRibbon('border-rose-500 bg-rose-50 text-rose-900', 'تملك ٦ أرجل مفصلية 🦗')}
                      {badgeRibbon('border-amber-450 bg-amber-50 text-amber-900', 'الجسم مقسم لـ ٣ أجزاء 🐜')}
                    </div>
                    <h5 className="text-base font-black text-rose-700">🦗 مجموعة الحشرات:</h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      هي كائنات صغيرة جداً لا تملك عظاماً بل هيكل خارجي صلب. يتميز جسمها بتقسيمه إلى ثلاثة أجزاء واضحة: (رأس، صدر، بطن)، وتملك الحشرة البالغة دائماً ٦ أرجل مفصلية (ثلاثة أزواج)، ولبعضها أجنحة لتطير وقرون استشعار للشم واللمس.
                    </p>
                    <p className="text-xs font-bold text-slate-700">أمثلة سودانية: النمل 🐜، النحل العاسل 🐝، الفراش الملون 🦋، والجراد الصحراوي 🦗.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <span className="text-8xl">🦋</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Movement */}
        {activeTab === 'movement' && (
          <div className="space-y-6">
            <div className="text-right">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                كيف وبأي طريقة تتحرك الحيوانات في الطبيعة؟ 🦅
              </h4>
              <p className="text-xs text-slate-500 mt-1">اضغط على طريقة الحركة لترى الكائنات التي تتبعها:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { type: 'جري', emoji: '🐎', title: 'مشي وجري', desc: 'تستخدم أطرافها القوية وعظامها المتينة للركض بامتياز مثل الخيول، الأبقار، والكلاب.', bg: 'bg-amber-50 border-amber-300' },
                { type: 'طيران', emoji: '🦅', title: 'طيران بالهواء', desc: 'تستخدم الأجنحة المكسوة بالريش الخفيف أو الأغشية الشفافة مثل الحمام، الصقور، والنحل.', bg: 'bg-cyan-50 border-cyan-300' },
                { type: 'زحف', emoji: '🐍', title: 'زحف ببطنها', desc: 'تعتمد على عضلات بطنها المرنة لغياب أرجلها بالكامل أو لقصرها الشديد مثل الثعابين والسحالي والديدان.', bg: 'bg-rose-50 border-rose-300' },
                { type: 'سباحة', emoji: '🐟', title: 'سباحة بالماء', desc: 'تستخدم زعانفها الصدرية والظهرية والذيلية وجسمها الانسيابي مثل سمك البلطي النيلي.', bg: 'bg-blue-50 border-blue-300' },
                { type: 'قفز', emoji: '🐸', title: 'قفز سريع', desc: 'تستعمل أرجل خلفية طويلة جداً ومطاطية كالفراغ لتقفز لارتفاعات كبيرة كالضفدع والكنغر.', bg: 'bg-emerald-50 border-emerald-300' }
              ].map(item => (
                <div key={item.type} className={`border-2 rounded-2xl p-4 text-right space-y-2 ${item.bg} shadow-sm hover:scale-[1.02] transition-transform`}>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-black text-slate-900 bg-white/80 px-2 py-0.5 rounded-full border border-slate-250">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Diets */}
        {activeTab === 'diets' && (
          <div className="space-y-6">
            <div className="text-right">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                تصنيف الحيوانات حسب نظامها الغذائي 🌱🥩
              </h4>
              <p className="text-xs text-slate-500 mt-1">كل حيوان يتناول طعاماً خاصاً ليمده بالطاقة للنمو والحركة والمحافظة على حياته:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Herbivores */}
              <div className="bg-emerald-50/75 border-2 border-emerald-300 rounded-3xl p-5 text-right space-y-3 shadow-sm">
                <span className="text-4xl">🌱🐐</span>
                <h5 className="font-black text-emerald-850 text-sm">١. أكلات العشب (Herbivores):</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هي حيوانات تتغذى فقط على النباتات، الأعشاب الخضراء، ثمار الأشجار، بذور النباتات، والأوراق الجافة.
                </p>
                <div className="border-t border-emerald-200 pt-2 text-[10px] font-extrabold text-emerald-800">
                  🦷 ميزة الأسنان: تملك قواطع وأسنان أمامية عريضة لمضغ وقص العشب.
                  <br />
                  🐾 أمثلة: الأرانب، الغنم، الأبقار، الجمال، الزرافة.
                </div>
              </div>

              {/* Carnivores */}
              <div className="bg-rose-50/75 border-2 border-rose-300 rounded-3xl p-5 text-right space-y-3 shadow-sm">
                <span className="text-4xl">🥩🦁</span>
                <h5 className="font-black text-rose-850 text-sm">٢. أكلات اللحوم (Carnivores):</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هي حيوانات تصطاد حيوانات أخرى وتتغذى على لحومها لتستمد طاقتها لكونها غير قادرة على هضم الأعشاب.
                </p>
                <div className="border-t border-rose-200 pt-2 text-[10px] font-extrabold text-rose-800">
                  🦷 ميزة الأسنان: تملك مخالب حادة وأنياب مدببة وقوية لتمزيق وقص اللحوم.
                  <br />
                  🐾 أمثلة: الأسد، النمر، الصقر الجارح، التمساح، الثعبان.
                </div>
              </div>

              {/* Omnivores */}
              <div className="bg-indigo-50/75 border-2 border-indigo-300 rounded-3xl p-5 text-right space-y-3 shadow-sm">
                <span className="text-4xl">🌽🐔</span>
                <h5 className="font-black text-indigo-850 text-sm">٣. حيوانات متعددة التغذية (Omnivores):</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هي حيوانات تتناول وتتغذى على النباتات واللحوم (كائنات أخرى) معاً دون مشكلة في هضمها لتأمين غذائها.
                </p>
                <div className="border-t border-indigo-200 pt-2 text-[10px] font-extrabold text-indigo-800">
                  🦷 ميزة الأسنان: تملك تشكيلة مرنة من الأسنان لقطع العشب وطحن الطعام المتنوع واللحوم.
                  <br />
                  🐾 أمثلة: الإنسان، القردة 🐒، الدب، والدجاج 🐔.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Feed the Animal Game */}
        {activeTab === 'game' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-black text-slate-700">🎮 لعبة إطعام الحيوانات التفاعلية</span>
              <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300">★ النقاط المكتسبة: {score} درجة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white border-2 border-slate-200 rounded-3xl p-6">
              
              {/* Left Side: Animal display */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3 bg-[#faf8f5] p-6 rounded-2xl border border-slate-150 min-h-[180px]">
                {gameAnimal === 'camel' && (
                  <>
                    <span className="text-8xl animate-bounce">🐫</span>
                    <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">أنا الجمل سفينة الصحراء</span>
                  </>
                )}
                {gameAnimal === 'lion' && (
                  <>
                    <span className="text-8xl animate-bounce">🦁</span>
                    <span className="text-xs font-black bg-rose-100 text-rose-950 px-3 py-1 rounded-full border border-rose-300">أنا الأسد ملك الغابة الشجاع</span>
                  </>
                )}
                {gameAnimal === 'chicken' && (
                  <>
                    <span className="text-8xl animate-bounce">🐔</span>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-300">أنا الدجاجة النشيطة</span>
                  </>
                )}
                <p className="text-xs font-bold text-slate-550 text-center">أنا جائع جداً! ما نوع الغذاء المناسب لي من الأزرار الجانبية؟ 🤔</p>
              </div>

              {/* Right Side: Feed buttons & actions */}
              <div className="md:col-span-7 space-y-4 text-right">
                <h5 className="text-xs sm:text-sm font-black text-slate-800 mb-2">اختر الطعام المناسب لإطعامي:</h5>
                
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button 
                    disabled={selectedFood !== null}
                    onClick={() => handleFeed('grass')}
                    className={`flex-1 p-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      selectedFood === 'grass' ? 'bg-emerald-500 border-emerald-650 text-white shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    🌱 عشب ونباتات فقط
                  </button>
                  <button 
                    disabled={selectedFood !== null}
                    onClick={() => handleFeed('meat')}
                    className={`flex-1 p-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      selectedFood === 'meat' ? 'bg-rose-500 border-rose-650 text-white shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-300'
                    }`}
                  >
                    🥩 لحوم وصيد فقط
                  </button>
                  <button 
                    disabled={selectedFood !== null}
                    onClick={() => handleFeed('both')}
                    className={`flex-1 p-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      selectedFood === 'both' ? 'bg-indigo-500 border-indigo-650 text-white shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    🌽🐛 عشب ولحوم معاً
                  </button>
                </div>

                {/* Feedback Box */}
                {feedback && (
                  <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed text-right animate-shake">
                    <p>{feedback}</p>
                    <button 
                      onClick={nextAnimal}
                      className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-black border-2 border-emerald-400 cursor-pointer block mr-auto"
                    >
                      إطعام الحيوان التالي 🐾➔
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: Table */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <div className="text-right">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                جدول المقارنة المبسط لمجموعات الحيوانات الست 📊
              </h4>
              <p className="text-xs text-slate-500 mt-1">تمرين رائع لتذكر الفروق البصرية والبيئية لتفوقك في الامتحان:</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
              <table className="w-full text-right text-xs sm:text-sm leading-normal">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-200">
                    <th className="p-3 font-black">المجموعة</th>
                    <th className="p-3 font-black">غطاء الجسم</th>
                    <th className="p-3 font-black">كيفية التنفس</th>
                    <th className="p-3 font-black">طريقة التكاثر</th>
                    <th className="p-3 font-black">طريقة الحركة</th>
                    <th className="p-3 font-black">أمثلة سودانية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  <tr>
                    <td className="p-3 font-black text-pink-700">🐇 الثدييات</td>
                    <td className="p-3 font-semibold">الشعر أو الفرو أو الوبر</td>
                    <td className="p-3 font-semibold">بالرئتين (الهواء)</td>
                    <td className="p-3 font-bold text-rose-600">ولادة حية صغاراً</td>
                    <td className="p-3 font-semibold">مشي وجري / قفز</td>
                    <td className="p-3 font-bold text-slate-700">الجمال، الأرانب، الغنم</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-cyan-700">🐦 الطيور</td>
                    <td className="p-3 font-semibold">الريش الخفيف الملون</td>
                    <td className="p-3 font-semibold">بالرئتين (الهواء)</td>
                    <td className="p-3 font-bold text-amber-600">وضع البيض في الأعشاش</td>
                    <td className="p-3 font-semibold">طيران بالهواء / مشي</td>
                    <td className="p-3 font-bold text-slate-700">الحمام، الصقور، الدجاج</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-amber-700">🦎 الزواحف</td>
                    <td className="p-3 font-semibold">جلد جاف وحراشف صلبة</td>
                    <td className="p-3 font-semibold">بالرئتين (الهواء)</td>
                    <td className="p-3 font-bold text-amber-600">وضع بيض جلدي قوي</td>
                    <td className="p-3 font-semibold">زحف بالبطن / مشي قصير</td>
                    <td className="p-3 font-bold text-slate-700">الضب، التمساح، الثعبان</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-emerald-700">🐸 البرمائيات</td>
                    <td className="p-3 font-semibold">جلد ناعم رطب جداً</td>
                    <td className="p-3 font-semibold">خياشيم (صغير) ثم رئة (بالغ)</td>
                    <td className="p-3 font-bold text-amber-600">وضع بيض هلامي بالماء</td>
                    <td className="p-3 font-semibold">سباحة بالماء / قفز</td>
                    <td className="p-3 font-bold text-slate-700">الضفادع الخضراء</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-blue-700">🐟 الأسماك</td>
                    <td className="p-3 font-semibold">قشور صلبة ولامعة ملساء</td>
                    <td className="p-3 font-bold text-blue-600">بالخياشيم (الأكسجين بالماء)</td>
                    <td className="p-3 font-bold text-amber-600">وضع ملايين البيض بالماء</td>
                    <td className="p-3 font-semibold">سباحة بالزعانف والذيل</td>
                    <td className="p-3 font-bold text-slate-700">سمك البلطي، سمك البياض</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-rose-700">🦗 الحشرات</td>
                    <td className="p-3 font-semibold">هيكل خارجي صلب رقيق</td>
                    <td className="p-3 font-semibold">ثقوب وتنفس هوائي</td>
                    <td className="p-3 font-bold text-amber-600">وضع بيض صغير جداً</td>
                    <td className="p-3 font-semibold">مشي بـ ٦ أرجل / طيران</td>
                    <td className="p-3 font-bold text-slate-700">النمل، النحل، الجراد، الفراش</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
