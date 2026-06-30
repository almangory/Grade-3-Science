import React, { useState } from 'react';
import { Sparkles, Trophy, Navigation, Heart, HelpCircle } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (name: string, city: string, avatar: string) => void;
}

const SUDAN_STATES = [
  "الخرطوم",
  "البحر الأحمر • بورتسودان",
  "الجزيرة • ود مدني",
  "نهر النيل • شندي والدامر",
  "شمال كردفان • الأبيض",
  "الشمالية • دنقلا ومروي",
  "كسلا • شرق السودان",
  "القضارف",
  "سنار",
  "النيل الأبيض • كوستي",
  "النيل الأزرق • الدمازين",
  "غرب دارفور",
  "جنوب دارفور",
  "شمال دارفور",
  "جنوب كردفان",
  "غرب كردفان",
  "شرق دارفور",
  "وسط دارفور"
];

const AVATARS = [
  { emoji: "🦁", label: "الأسد الباسل" },
  { emoji: "🔬", label: "العالِم الصغير" },
  { emoji: "🪐", label: "مكتشف الفضاء" },
  { emoji: "🌸", label: "الزهرة الذكية" },
  { emoji: "⚡", label: "المكتشف السريع" },
  { emoji: "🦅", label: "الصقر المحلّق" }
];

export default function StudentLogin({ onLogin }: StudentLoginProps) {
  const [name, setName] = useState('');
  const [state, setState] = useState(SUDAN_STATES[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].emoji);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('الرجاء كتابة اسمك الكريم أولاً لنسجله في لوحة الشرف! ✍️');
      return;
    }
    if (cleanName.length < 2) {
      setError('الرجاء كتابة اسم حقيقي أطول قليلاً من حرفين ليتعرف عليك أصحابك! 🥰');
      return;
    }
    // Success, trigger the login callback
    onLogin(cleanName, state, selectedAvatar);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden" id="student-login-root" dir="rtl">
      
      {/* Decorative environment elements */}
      <div className="absolute top-10 right-10 text-6xl opacity-20 animate-pulse pointer-events-none select-none">🪐</div>
      <div className="absolute bottom-10 left-10 text-6xl opacity-20 animate-bounce pointer-events-none select-none" style={{ animationDuration: '8s' }}>🧬</div>
      <div className="absolute top-1/3 left-10 text-5xl opacity-15 pointer-events-none select-none">🔬</div>
      <div className="absolute bottom-1/4 right-10 text-5xl opacity-15 pointer-events-none select-none">🌸</div>

      <div className="w-full max-w-xl bg-white rounded-3xl border-4 border-emerald-400 p-8 shadow-2xl relative z-15 transition-all transform hover:scale-[1.005]">
        
        {/* Sudanese National Seal / Shield Accent */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🇸🇩</span>
            <div className="text-right">
              <span className="text-[10px] bg-slate-900 text-emerald-350 px-2.5 py-0.5 rounded-full font-black border border-emerald-400">
                منهج بخت الرضا المعتمد 🎓
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">وزارة التربية والتعليم السودانية</p>
            </div>
          </div>
          <div className="flex bg-amber-100 px-3 py-1.5 rounded-2xl border border-amber-300 items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-900">لوحة شرف الأبطال</span>
          </div>
        </div>

        {/* Title Block */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex bg-emerald-50 text-emerald-700 p-2.5 rounded-full border border-emerald-200 animate-bounce">
            <Sparkles className="w-8 h-8 text-emerald-500 fill-emerald-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              العلوم الصف الثالث المنهج السوداني تفاعلي! 🔬✨
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              أهلاً بك يا بطل المستقبل في الصف الثالث الابتدائي. اكتب اسمك واختر ولايتك وصورتك المفضلة لتنضم لمليوون بطل سوداني يستكشفون عجائب نظافة الجسم، وعالم الحيوانات والنباتات والضوء!
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form input: Name */}
          <div className="space-y-2">
            <label htmlFor="student-name-input" className="block text-xs font-black text-slate-700 mr-1 text-right">
              ✍️ اكتب اسمك الثنائي أو اسم الشهرة الجميل:
            </label>
            <input
              id="student-name-input"
              type="text"
              maxLength={25}
              placeholder="مثال: أحمد محمد / فاطمة الزهراء"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 font-black text-sm p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-450 focus:outline-none transition-all shadow-inner text-right"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form input: State selection */}
            <div className="space-y-2">
              <label htmlFor="student-state-select" className="block text-xs font-black text-slate-700 mr-1 text-right">
                🗺️ ولايتك السودانية الجميلة:
              </label>
              <select
                id="student-state-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 font-black cursor-pointer text-xs p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-450 focus:outline-none transition-all text-right"
              >
                {SUDAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Hint Box */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col justify-center text-right">
              <div className="flex items-center gap-1 text-amber-800 font-black text-[11px] mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>تبادل المعرفة مع الطلاب</span>
              </div>
              <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                تستطيع استخدام اسمك وصورتك للمنافسة مع بقية أبطال السودان وتحصيل نجوم تفاعلية وحل أوراق العمل!
              </p>
            </div>
          </div>

          {/* Form input: Avatar selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 mr-1 text-right">
              🦁 اختر صورتك الرمزية المفضلة (الافتار):
            </label>
            <div className="grid grid-cols-6 gap-2" id="avatar-grid">
              {AVATARS.map((av) => (
                <button
                  key={av.emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(av.emoji)}
                  className={`py-3 rounded-2xl text-2xl flex flex-col items-center justify-center border-4 relative transition-all active:scale-95 ${
                    selectedAvatar === av.emoji
                      ? 'bg-emerald-50 border-emerald-400 scale-105 shadow-md shadow-emerald-100'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200'
                  }`}
                  title={av.label}
                >
                  <span>{av.emoji}</span>
                  <span className="text-[8px] font-black text-slate-500 mt-1 block truncate max-w-full">
                    {av.label}
                  </span>
                  
                  {selectedAvatar === av.emoji && (
                    <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[8px] flex items-center justify-center font-black">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-2xl border border-rose-200 text-xs font-bold text-center animate-shake" id="login-error-alert">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Action button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4.5 rounded-2xl text-sm font-black transition-all transform active:scale-98 shadow-lg shadow-emerald-200 border-2 border-emerald-400 block cursor-pointer text-center"
          >
            تسجيل الدخول والبدء في رحلة الاستكشاف! 🚀🔬
          </button>
        </form>

        <p className="text-center text-[9px] text-slate-400 font-extrabold mt-6 px-4">
          عثمان المنقوري © 2026. المبادرة الإلكترونية لتعليم علوم الصف الثالث الابتدائي بالسودان. جميع الحقوق المعنوية محفوظة للمنقوري 🇸🇩.
        </p>
      </div>
    </div>
  );
}
