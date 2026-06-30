export type QuestionType = 'single' | 'boolean' | 'matching' | 'fill' | 'sorting';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // for single choice
  correctAnswer: any; // string, boolean, or array of pairs, or array of category mappings
  matchingPairs?: { left: string; right: string }[]; // for matching questions
  categories?: string[]; // for sorting questions (e.g., ['تغير فيزيائي', 'تغير كيميائي'])
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  pagesRange: string; // reference to pages in physical book
  summary: string;
  contentSection: {
    subtitleString: string;
    paragraphs: string[];
    bullets?: string[];
    diagramDescription?: string;
  }[];
  interactiveId: 'circulation' | 'flower' | 'lifecycle' | 'foodchain' | 'changes' | 'dissolution' | 'light' | 'moon' | 'excretion' | 'senses';
  quiz: QuizQuestion[];
}

export interface Unit {
  id: number;
  title: string;
  iconName: string; // Name of Lucide icon
  description: string;
  lessons: Lesson[];
  themeColor: string; // Tailwind class background like 'bg-indigo-500'
  textColor: string; // Tailwind class text color like 'text-indigo-600'
  borderColor: string; // border-indigo-200
}

export interface Message {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  timestamp: string;
}

export interface UserProgress {
  score: number;
  completedLessons: string[]; // ids of completed lessons
  quizScores: Record<string, number>; // quizId -> best score
  solvedSimulations: string[]; // interactiveIds solved or played
  level: number;
  stars: number;
  studentName?: string;
  studentCity?: string;
  studentAvatar?: string;
  favoriteLessons?: string[]; // ids of marked favorite lessons
  parentUnlockedLessons?: string[]; // ids of lessons unlocked by parent using math challenge
}
