import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle2, ChevronLeft, Trophy, Star, ArrowLeft,
  GraduationCap, HelpCircle, Sparkles, Award, Heart
} from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LessonDetail from './components/LessonDetail';
import WorksheetGenerator from './components/WorksheetGenerator';
import { curriculumData } from './data/curriculum';
import { Unit, Lesson, UserProgress } from './types';
import { getTodayChallenge } from './data/dailyChallenges';
import DailyChallengeModal from './components/DailyChallengeModal';
import StudentLogin from './components/StudentLogin';
import StudentChat from './components/StudentChat';
import CartoonResearcher from './components/CartoonResearcher';

// Default initial state for student progresses
const defaultProgress: UserProgress = {
  score: 0,
  completedLessons: [],
  quizScores: {},
  solvedSimulations: [],
  level: 1,
  stars: 0,
  parentUnlockedLessons: []
};

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(curriculumData[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentView, setCurrentView] = useState<'curriculum' | 'worksheets'>('curriculum');
  const [dashboardViewMode, setDashboardViewMode] = useState<'units' | 'lessons'>('units');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Persistence state
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  // Daily Challenge States
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [isDailyChallengeSolved, setIsDailyChallengeSolved] = useState(false);
  const todayChallenge = getTodayChallenge();

  // Chat and profile configurations
  const [chatOpen, setChatOpen] = useState(false);
  const [isChangingProfile, setIsChangingProfile] = useState(false);

  // Synchronize offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Back-button popstate interceptor for mobile devices and browsers
  useEffect(() => {
    // Push an initial state if history is fresh
    if (!window.history.state || !window.history.state.appHome) {
      window.history.pushState({ appHome: true }, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      // Intercept the back click
      if (selectedLesson !== null) {
        // Go back from Lesson Detail to Lessons List
        setSelectedLesson(null);
        window.history.pushState({ appHome: true }, "");
      } else if (currentView === 'worksheets') {
        // Go back from Worksheets view to Curriculum Home
        setCurrentView('curriculum');
        setDashboardViewMode('units');
        window.history.pushState({ appHome: true }, "");
      } else if (dashboardViewMode === 'lessons') {
        // Go back from Units Lessons view to main Units map
        setDashboardViewMode('units');
        window.history.pushState({ appHome: true }, "");
      } else {
        // Already at the absolute homepage
        const confirmExit = window.confirm("هل أنت متأكد من رغبتك في مغادرة تطبيق العلوم الممتعة؟");
        if (confirmExit) {
          // Allow exit by going back twice to bypass the pushed stack guard
          window.history.go(-2);
        } else {
          // Stay in app, re-push the state guard
          window.history.pushState({ appHome: true }, "");
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedLesson, currentView, dashboardViewMode]);

  // Load progress from localStorage on start
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sudanese_science_3rd_progress');
      if (stored) {
        setProgress(JSON.parse(stored));
      }

      // Check daily challenge status
      const todayDate = new Date().toISOString().split('T')[0];
      const lastSolvedDate = localStorage.getItem('last_solved_challenge_date');
      const lastSeenDate = localStorage.getItem('last_seen_challenge_date');

      setIsDailyChallengeSolved(lastSolvedDate === todayDate);

      // Trigger automatic pop up ONLY ONCE a day on first load
      if (lastSeenDate !== todayDate) {
        setShowDailyChallenge(true);
        localStorage.setItem('last_seen_challenge_date', todayDate);
      }
    } catch (e) {
      console.error("Failed to load progress from local storage:", e);
    }
  }, []);

  // Save progress changes
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem('sudanese_science_3rd_progress', JSON.stringify(newProgress));
    } catch (e) {
      console.error("Failed to save progress to local storage:", e);
    }
  };

  // Lesson completions callback
  const handleLessonCompleted = (lessonId: string, scoreBonus: number) => {
    // If already completed, don't double award progress but keep points up to maximum
    const alreadyCompleted = progress.completedLessons.includes(lessonId);
    const updatedCompleted = alreadyCompleted 
      ? progress.completedLessons 
      : [...progress.completedLessons, lessonId];

    const nextScore = progress.score + (alreadyCompleted ? 5 : scoreBonus);
    const starBonus = alreadyCompleted ? 1 : 10;
    const nextStars = progress.stars + starBonus;
    
    // Level boundary definition (e.g. 100 points per level)
    const nextLevel = Math.max(1, Math.floor(nextScore / 100) + 1);

    const nextProgress: UserProgress = {
      ...progress,
      completedLessons: updatedCompleted,
      score: nextScore,
      stars: nextStars,
      level: nextLevel
    };

    saveProgress(nextProgress);
  };

  // Daily Challenge Correct Solution
  const handleSolveChallenge = (pointsBonus: number) => {
    const todayDate = new Date().toISOString().split('T')[0];
    localStorage.setItem('last_solved_challenge_date', todayDate);
    setIsDailyChallengeSolved(true);

    const nextScore = progress.score + pointsBonus;
    const nextStars = progress.stars + 5; // Good work stars!
    const nextLevel = Math.max(1, Math.floor(nextScore / 100) + 1);

    const nextProgress: UserProgress = {
      ...progress,
      score: nextScore,
      stars: nextStars,
      level: nextLevel
    };
    saveProgress(nextProgress);
  };

  // Home trigger
  const handleHomeClick = () => {
    setCurrentView('curriculum');
    setSelectedUnit(curriculumData[0]);
    setSelectedLesson(null);
    setDashboardViewMode('units');
  };

  // Toggle favorite lesson
  const handleToggleFavorite = (lessonId: string) => {
    const favoriteLessons = progress.favoriteLessons || [];
    const isFavorited = favoriteLessons.includes(lessonId);
    const updatedFavorites = isFavorited 
      ? favoriteLessons.filter(id => id !== lessonId)
      : [...favoriteLessons, lessonId];
    
    saveProgress({
      ...progress,
      favoriteLessons: updatedFavorites
    });
  };

  // Parent unlocked lesson callback
  const handleParentUnlockLesson = (lessonId: string) => {
    const parentUnlocked = progress.parentUnlockedLessons || [];
    if (!parentUnlocked.includes(lessonId)) {
      saveProgress({
        ...progress,
        parentUnlockedLessons: [...parentUnlocked, lessonId]
      });
    }
  };

  // Reset Progress option (handy for testing)
  const handleResetProgress = () => {
    if (confirm("هل أنت متأكد من رغبتك في إعادة تصفير نقاط التقدم وبدء منهج العلوم من البداية؟")) {
      saveProgress(defaultProgress);
    }
  };

  // Handle student login submit or update
  const handleStudentLogin = (name: string, city: string, avatar: string) => {
    const nextProgress: UserProgress = {
      ...progress,
      studentName: name,
      studentCity: city,
      studentAvatar: avatar
    };
    saveProgress(nextProgress);
    setIsChangingProfile(false);
  };

  // Profile gate: block app access if studentName is missing
  if (!progress.studentName || isChangingProfile) {
    return <StudentLogin onLogin={handleStudentLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-150 via-amber-50 to-emerald-100 flex flex-col font-sans transition-all duration-300 pb-16 relative" id="app-viewport">
      {/* Decorative environment elements for kids */}
      <div className="absolute top-20 left-10 text-4xl opacity-10 pointer-events-none select-none animate-bounce" style={{ animationDuration: '6s' }}>☁️</div>
      <div className="absolute top-48 right-12 text-3xl opacity-15 pointer-events-none select-none animate-pulse">🎈</div>
      <div className="absolute bottom-32 left-12 text-4xl opacity-15 pointer-events-none select-none animate-spin" style={{ animationDuration: '40s' }}>⭐</div>
      <div className="absolute bottom-96 right-16 text-5xl opacity-10 pointer-events-none select-none">🌈</div>
      <div className="absolute top-1/2 left-4 text-3xl opacity-10 pointer-events-none select-none">🛸</div>
      
      {/* 1. Header Navigation and Stats panel */}
      <Navbar 
        progress={progress} 
        onHomeClick={handleHomeClick} 
        onToggleChat={() => setChatOpen(!chatOpen)}
        onChangeProfile={() => setIsChangingProfile(true)}
        onWorksheetsClick={() => setCurrentView('worksheets')}
        currentView={currentView}
        chatOpen={chatOpen}
      />

      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="bg-amber-100 border-b-4 border-amber-300 text-amber-950 px-4 py-3 text-center text-xs sm:text-sm font-black shadow-inner flex items-center justify-center gap-2.5 transition-all duration-350" dir="rtl" id="offline-alert-banner">
          <span className="text-xl animate-bounce">📡</span>
          <span>أنت تعمل الآن في وضع الأوفلاين (بدون اتصال بالإنترنت)! 🌟 جميع دروس العلوم والأنشطة والألعاب تعمل بكفاءة، وسيتم حفظ نجومك ونقاطك محلياً بالكامل!</span>
        </div>
      )}

      {/* 2. Main content boundaries viewports */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'worksheets' ? (
          <WorksheetGenerator
            units={curriculumData}
            progress={progress}
            onBackToDashboard={() => setCurrentView('curriculum')}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : !selectedLesson ? (
          // View A & B: Unified gamified Dashboard with Journey Path representing unit selector and active lessons
          <Dashboard 
            units={curriculumData} 
            progress={progress} 
            selectedUnit={selectedUnit || curriculumData[0]}
            onSelectUnit={(unit) => setSelectedUnit(unit)}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            isDailyChallengeSolved={isDailyChallengeSolved}
            onOpenDailyChallenge={() => setShowDailyChallenge(true)}
            onToggleWorksheets={() => setCurrentView('worksheets')}
            viewMode={dashboardViewMode}
            onViewModeChange={setDashboardViewMode}
            onUnlockLesson={handleParentUnlockLesson}
          />
        ) : (
          // View C: Particular Lesson Workspace (explains, simulators, quizes, companion)
          <LessonDetail 
            lesson={selectedLesson} 
            unit={selectedUnit || curriculumData[0]} 
            progress={progress} 
            onBackClick={() => setSelectedLesson(null)} 
            onLessonCompleted={handleLessonCompleted} 
            onToggleFavorite={handleToggleFavorite}
          />
        )}

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-slate-400 text-[10px] font-bold border-t border-slate-100 mt-12 bg-white px-4">
        عثمان المنقوري © 2026. المبادرة الإلكترونية لتعليم علوم الصف الثالث الابتدائي بالسودان. جميع الحقوق المعنوية محفوظة للمنقوري 🇸🇩.
      </footer>

      {/* 3. Daily Challenge Alert Modal Overlay */}
      <DailyChallengeModal
        isOpen={showDailyChallenge}
        onClose={() => setShowDailyChallenge(false)}
        challenge={todayChallenge}
        isAlreadySolved={isDailyChallengeSolved}
        onSolveCorrectly={handleSolveChallenge}
      />

      {/* 4. Student Chat Drawer Component */}
      <StudentChat 
        progress={progress} 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />

      {/* 5. Animated Cartoon Quick Science Researcher */}
      <CartoonResearcher />



    </div>
  );
}
