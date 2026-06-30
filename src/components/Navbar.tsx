import React, { useState } from 'react';
import { Sparkles, Trophy, Star, GraduationCap, Volume2, VolumeX, MessageSquare, Settings, Eye, EyeOff } from 'lucide-react';
import { UserProgress } from '../types';
import { isMuted, setMuted } from '../utils/audio';

interface NavbarProps {
  progress: UserProgress;
  onHomeClick: () => void;
  onToggleChat: () => void;
  onChangeProfile: () => void;
  onWorksheetsClick: () => void;
  currentView: 'curriculum' | 'worksheets';
  chatOpen?: boolean;
}

export default function Navbar({ 
  progress, 
  onHomeClick, 
  onToggleChat, 
  onChangeProfile,
  onWorksheetsClick,
  currentView,
  chatOpen = false 
}: NavbarProps) {
  const [muted, setMutedState] = useState(isMuted());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setMuted(nextMuted);
  };

  if (isCollapsed) {
    return (
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b-2 border-yellow-400 py-1 px-4 flex justify-between items-center shadow-sm" dir="rtl">
        {/* Sudanese flag ribbon top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="bg-red-650 flex-1" />
          <div className="bg-white flex-1" />
          <div className="bg-emerald-500 flex-1" />
          <div className="bg-slate-900 flex-1" />
        </div>
        
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-sm">🎒</span>
          <span className="text-[10px] sm:text-xs font-black text-slate-700">العلوم تفاعلي 🇸🇩</span>
          <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded-lg font-black">⭐ {progress.stars}</span>
        </div>

        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 px-2.5 rounded-xl shadow-sm border border-emerald-400 flex items-center gap-1 cursor-pointer transition active:scale-95 text-[9px] sm:text-xs font-black"
          title="عرض شريط الأدوات بالكامل"
        >
          <span>عرض شريط الأدوات 🔽</span>
        </button>
      </div>
    );
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-4 border-yellow-400 sticky top-0 z-50 shadow-md rounded-b-2xl transition-all duration-300" id="main-header">
      {/* Sudanese flag ribbon top accent */}
      <div className="h-1.5 w-full flex">
        <div className="bg-red-650 flex-1" />
        <div className="bg-white flex-1" />
        <div className="bg-emerald-500 flex-1" />
        <div className="bg-slate-900 flex-1" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-3 flex flex-col lg:flex-row gap-2 lg:gap-3 items-center justify-between" dir="rtl">
        
        {/* Logo and home action */}
        <div className="flex w-full lg:w-auto items-center justify-between gap-2">
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-1.5 sm:gap-2.5 text-right hover:scale-103 active:scale-97 transition-transform"
            id="btn-logo"
          >
            <div className="bg-gradient-to-tr from-emerald-500 to-green-400 text-white p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow shadow-emerald-200 border-2 border-emerald-300">
              <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xs sm:text-base lg:text-lg font-black text-slate-800 tracking-tight leading-tight flex items-center gap-0.5">
                <span>🎒</span> العلوم <span className="hidden xs:inline">الصف الثالث</span> <span className="hidden sm:inline">المنهج السوداني تفاعلي</span> 🇸🇩
              </h1>
              <span className="text-[8px] sm:text-[9px] text-emerald-650 font-black block leading-none mt-0.5 lg:block hidden">مستقبل السودان يبدأ هنا • المنهج المعتمد</span>
            </div>
          </button>

          {/* Quick Collapse trigger for small devices to free up screen space */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="lg:hidden p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl border border-slate-200 text-[9px] sm:text-xs font-black flex items-center gap-1 cursor-pointer transition"
            title="إخفاء الشريط لتكبير مساحة العرض"
          >
            <EyeOff className="h-3 w-3" />
            <span>تصغير 📱</span>
          </button>
        </div>

        {/* Left-aligned controls (Stats, Chat Toggle, Student card) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 w-full lg:w-auto">
          
          {/* Student Profile Card (Only if logged in) */}
          {progress.studentName && (
            <div className="flex items-center gap-1 bg-emerald-50 border-2 border-emerald-250 p-1 px-2 rounded-xl sm:rounded-2xl shadow-sm text-right">
              <span className="text-sm sm:text-lg">{progress.studentAvatar || "🦁"}</span>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-800 leading-tight">
                  {progress.studentName}
                </p>
                <p className="text-[7px] sm:text-[8px] text-indigo-700 font-extrabold leading-none mt-0.5">
                  {progress.studentCity || "السودان"}
                </p>
              </div>
              <button 
                onClick={onChangeProfile}
                className="mr-1 p-0.5 sm:p-1 bg-emerald-100 hover:bg-emerald-200 transition text-emerald-800 rounded-lg text-[7px] sm:text-[8px] font-black leading-none"
                title="تعديل اسمك أو صورتك"
              >
                تعديل 🔄
              </button>
            </div>
          )}

          {/* Worksheets Generator Button */}
          {progress.studentName && (
            <button
              onClick={onWorksheetsClick}
              className={`p-1 sm:p-1.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border-2 transition duration-200 flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 shadow-sm text-[9px] sm:text-xs font-black ${
                currentView === 'worksheets'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-emerald-50 border-emerald-250 text-emerald-650 hover:bg-emerald-100'
              }`}
              title="توليد أوراق عمل مخصصة وامتحانات"
              id="btn-worksheets-toggle"
            >
              <span>أوراق العمل 📝</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border-2 transition duration-200 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 ${
              muted 
                ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                : 'bg-emerald-50 border-emerald-250 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
            id="btn-sound-toggle"
          >
            {muted ? <VolumeX className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> : <Volume2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />}
          </button>

          {/* Level badge */}
          <div className="bg-indigo-100 border-2 border-indigo-250 rounded-xl sm:rounded-2xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-0.5 sm:gap-1 shadow-sm text-[9px] sm:text-[11px] font-black text-indigo-950">
            <span>🏆</span>
            <span>{progress.level}</span>
          </div>

          {/* Points badge */}
          <div className="bg-amber-100 border-2 border-amber-250 rounded-xl sm:rounded-2xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-0.5 sm:gap-1 shadow-sm text-[9px] sm:text-[11px] font-black text-amber-950" id="user-stars">
            <span>⭐</span>
            <span>
              {progress.stars} <span className="hidden sm:inline">نجمة</span> <span className="text-amber-800/80 font-bold">({progress.score} ن)</span>
            </span>
          </div>

          {/* Desktop/Large screen Collapse trigger */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-2xl border-2 border-slate-200 hover:bg-slate-100 cursor-pointer transition"
            title="تصغير شريط الأدوات بالكامل"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>تصغير الشريط</span>
          </button>

          {/* App title right badge */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] text-emerald-800 font-black bg-emerald-50 px-2.5 py-2 rounded-2xl border-2 border-emerald-250">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>بخت الرضا 📚</span>
          </div>
        </div>

      </div>
    </header>
  );
}
