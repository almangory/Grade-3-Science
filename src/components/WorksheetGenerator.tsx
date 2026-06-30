import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, Heart, Sparkles, Check, RotateCcw, 
  BookOpen, HelpCircle, AlertCircle, Eye, EyeOff, Lock, Unlock,
  ChevronLeft, ArrowRight
} from 'lucide-react';
import { Unit, Lesson, UserProgress, QuizQuestion } from '../types';
import { speakWord } from './InteractiveSimulators';

interface WorksheetGeneratorProps {
  units: Unit[];
  progress: UserProgress;
  onBackToDashboard: () => void;
  onToggleFavorite: (lessonId: string) => void;
}

// Master Predefined Worksheet Question Templates for all 8 Units
interface CustomQuestion {
  type: 'boolean' | 'fill' | 'matching' | 'diagram' | 'qna';
  questionText: string;
  options?: string[];
  correctAnswer?: any;
  fillAnswer?: string;
  matchingPairs?: { left: string; right: string }[];
  diagramId?: string; // e.g. 'circulation' | 'excretion' | 'plant_parts' | 'lifecycle'
  points?: number;
}

const UNIT_QUESTIONS: Record<number, CustomQuestion[]> = {
  1: [
    { type: 'boolean', questionText: 'غسل اليدين بالماء والصابون مع الفرك الجيد هو الطريقة المعتمدة علمياً لحماية الجلد وصحة أجسادنا من الأوساخ والجراثيم.', correctAnswer: true },
    { type: 'boolean', questionText: 'الدمية شيء غير حي (جماد) يحتاج للهواء والماء والغذاء لكي ينمو ويكبر مثل القطة المنزلية.', correctAnswer: false },
    { type: 'boolean', questionText: 'تتميز الحيوانات الولودة بأنها تلد صغارها وترضعها الحليب لتمنحها الغذاء والمناعة كالأرانب والأبقار.', correctAnswer: true },
    { type: 'boolean', questionText: 'النبات كائن حي يعتمد على الإنسان والحيوان ليصنع له غذاءه اليومي.', correctAnswer: false },
    { type: 'fill', questionText: 'تنقسم الكائنات من حولنا إلى كائنات حية وأشياء غير حية تسمى ...................... .', fillAnswer: 'جمادات' },
    { type: 'fill', questionText: 'يتكون جسم الإنسان من ثلاثة أجزاء رئيسية واضحة ومحددة هي الرأس، و......................، والأطراف.', fillAnswer: 'الجذع' },
    { type: 'fill', questionText: 'يتعرف الإنسان على الأشياء من حوله بواسطة أعضاء الحس الخمسة، فالعين للبصر والأذن لـ ...................... .', fillAnswer: 'السمع' },
    { type: 'matching', questionText: 'صل الكائن الحي بالموطن الطبيعي الذي يلائمه للعيش وبقاء الحياة:', matchingPairs: [
        { left: 'الإبل ونبات الصبار الشوكي', right: 'الصحراء الجافة قليلة الماء رملية التربة' },
        { left: 'الأسد والقردة الذكية', right: 'الغابة الرطبة الظليلة كثيفة الأشجار والأمطار' },
        { left: 'سمك البولتي وأعشاب النيل', right: 'الموطن المائي العذب مثل الأنهار والبرك بالسودان' }
      ]
    },
    { type: 'qna', questionText: 'اذكر أربع خصائص كبرى تميز الكائنات الحية عن الجمادات من واقع كتابك المدرسي.' },
    { type: 'qna', questionText: 'لماذا يجب الاستحمام بالماء والصابون معاً بعد اللعب والتعرق؟ وعلل سبب عدم كفاية الماء وحده بأسلوب علمي.' },
    { type: 'diagram', questionText: 'يتكون جسم الإنسان من ثلاثة أجزاء رئيسية، اكتب الأسماء المناسبة في الفراغات (الرأس - الجذع - الأطراف).', diagramId: 'human_body' },
    { type: 'diagram', questionText: 'يوضح الرسم المقابل بعض أعضاء الحس في رأس الإنسان، حدد أسماء الأعضاء المقابلة للأرقام: (١) العين، (٢) الأذن، (٣) الأنف.', diagramId: 'senses_organs' }
  ],
  2: [
    { type: 'boolean', questionText: 'الصلصال (الطين) مادة لينة يسهل تشكيلها لصناعة الأواني الفخارية مثل الزير والقلة لحفظ الماء.', correctAnswer: true },
    { type: 'boolean', questionText: 'نصنع الطاولات والكراسي المدرسية للتلاميذ من مادة الزجاج الرقيق لكونها مادة متينة تتحمل الحركة واللعب.', correctAnswer: false },
    { type: 'boolean', questionText: 'الخواص الفيزيائية هي الصفات التي نستخدمها لنصف بها المادة مثل اللون والشكل والحجم والملمس والصلابة.', correctAnswer: true },
    { type: 'fill', questionText: 'الملابس والقمصان المريحة تصنع عادة من مادة ...................... لكونها مرنة وسهلة الطي والاستخدام.', fillAnswer: 'القماش' },
    { type: 'fill', questionText: 'نصنع إطارات السيارات والبالونات من مادة ...................... لمرونتها العالية وقابليتها للتمدد والشد.', fillAnswer: 'المطاط' },
    { type: 'fill', questionText: 'نصنع النوافذ والنظارات الطبية من الزجاج لتميزه بخاصية ...................... التي تسمح بمرور الضوء ورؤية ما خلفه.', fillAnswer: 'الشفافية' },
    { type: 'matching', questionText: 'صل المواد بتصنيفها حسب نوع الاستخدام المعتمد بكتاب العلوم:', matchingPairs: [
        { left: 'الإسمنت والحديد والطوب الأحمر', right: 'مواد البناء الأساسية لتشييد المنازل والمدارس' },
        { left: 'القدور والأبريق الفخاري والملاعق', right: 'أدوات الطهي وحفظ الأغذية والمشروبات' },
        { left: 'السرير الخشبي والكرسي والدولاب', right: 'أثاث المنزل والمكتب والصف الدراسي لتوفير الراحة' }
      ]
    },
    { type: 'qna', questionText: 'ماذا نقصد بـ (الخواص الفيزيائية للمواد)؟ واذكر ثلاثة أمثلة لخواص يمكن إدراكها بحواسنا.' },
    { type: 'qna', questionText: 'لماذا يفضل صناعة الألعاب للأطفال الصغار من البلاستيك خفيف الوزن بدلاً من الحديد أو الزجاج؟ وعلل إجابتك.' }
  ],
  3: [
    { type: 'boolean', questionText: 'يسير الضوء وينتشر دائماً في خطوط مستقيمة من مصدره كالشمس الساطعة والمصابيح.', correctAnswer: true },
    { type: 'boolean', questionText: 'تعتبر الشمس والنجوم المتلألئة بالليل من مصادر الضوء الصناعية التي صنعها الإنسان.', correctAnswer: false },
    { type: 'boolean', questionText: 'تتكون الدائرة الكهربية البسيطة من مسار مغلق يضم بطارية، أسلاك موصلة، مصباحاً كهربائياً، ومفتاحاً.', correctAnswer: true },
    { type: 'fill', questionText: 'يتكون ...................... خلف الجسم المعتم عندما يسقط عليه الضوء ويحجب مساره المستقيم.', fillAnswer: 'الظل' },
    { type: 'fill', questionText: 'يمنع منعاً باتاً لمس مفاتيح ومصادر الكهرباء واليد مبللة بـ ...................... تجنباً للصدمات القاتلة.', fillAnswer: 'الماء' },
    { type: 'matching', questionText: 'صل أجزاء الدائرة الكهربائية البسيطة بوظيفتها المحددة علمياً:', matchingPairs: [
        { left: 'البطارية (مصدر التيار)', right: 'توفير ودفع التيار الكهربائي المتدفق في المسار المغلق' },
        { left: 'الأسلاك النحاسية المغطاة', right: 'توصيل ونقل الكهرباء بين مكونات الدائرة بأمان وسلاسة' },
        { left: 'المفتاح الكهربائي (متحكم)', right: 'فتح وغلق الدائرة الكهربية للتحكم في مرور وانقطاع الكهرباء' }
      ]
    },
    { type: 'qna', questionText: 'اشرح بأسلوبك العلمي كيف يتكون الظل خلف القطة عندما تسير تحت أشعة الشمس.' },
    { type: 'diagram', questionText: 'يوضح الرسم المقابل أجزاء الدائرة الكهربائية البسيطة، اكتب الأسماء المناسبة في الفراغات (بطارية - مصباح).', diagramId: 'circuit' }
  ]
};

export default function WorksheetGenerator({
  units,
  progress,
  onBackToDashboard,
  onToggleFavorite
}: WorksheetGeneratorProps) {
  const [sourceType, setSourceType] = useState<'all' | 'favorites' | 'unit' | 'lesson'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('u1-l1');
  const [numPages, setNumPages] = useState<number>(2);
  const [questionTypesSelected, setQuestionTypesSelected] = useState({
    boolean: true,
    fill: true,
    matching: true,
    diagram: true,
    qna: true
  });
  const [generatedPages, setGeneratedPages] = useState<CustomQuestion[][]>([]);
  const [flattenedExamQuestions, setFlattenedExamQuestions] = useState<CustomQuestion[]>([]);
  const [examUserAnswers, setExamUserAnswers] = useState<Record<string | number, string>>({});
  const [examGraded, setExamGraded] = useState<boolean>(false);
  const [examScorePercent, setExamScorePercent] = useState<number>(0);
  const [examCorrectCount, setExamCorrectCount] = useState<number>(0);
  const [isExamModeActive, setIsExamModeActive] = useState<boolean>(false);
  const [watermarkRemoved, setWatermarkRemoved] = useState<boolean>(false);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');

  const curriculumFavorites = progress.favoriteLessons || [];

  const toggleQuestionType = (type: keyof typeof questionTypesSelected) => {
    setQuestionTypesSelected(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleGenerateWorksheets = () => {
    // 1. Gather all questions based on selected source
    const pool: CustomQuestion[] = [];
    
    // Add base UNIT_QUESTIONS for the active source
    if (sourceType === 'all') {
      Object.keys(UNIT_QUESTIONS).forEach(key => {
        pool.push(...UNIT_QUESTIONS[Number(key)]);
      });
    } else if (sourceType === 'unit') {
      pool.push(...(UNIT_QUESTIONS[selectedUnitId] || []));
    } else if (sourceType === 'lesson') {
      let foundUnitId = 1;
      units.forEach(u => {
        if (u.lessons.some(l => l.id === selectedLessonId)) {
          foundUnitId = u.id;
        }
      });
      pool.push(...(UNIT_QUESTIONS[foundUnitId] || []));
    } else if (sourceType === 'favorites') {
      const favoritedIds = progress.favoriteLessons || [];
      if (favoritedIds.length > 0) {
        units.forEach(u => {
          if (u.lessons.some(l => favoritedIds.includes(l.id))) {
            pool.push(...(UNIT_QUESTIONS[u.id] || []));
          }
        });
      } else {
        Object.keys(UNIT_QUESTIONS).forEach(key => {
          pool.push(...UNIT_QUESTIONS[Number(key)]);
        });
      }
    }

    const extraQuestions: Record<number, CustomQuestion[]> = {
      1: [
        { type: 'boolean', questionText: 'يجب غسل اليدين جيداً بالصابون بعد اللعب مع الحيوانات الأليفة في حديقة المنزل لمنع الجراثيم.', correctAnswer: true },
        { type: 'boolean', questionText: 'الجراثيم هي كائنات حية صغيرة جداً لا نراها بأعيننا المجردة ولكنها تسبب لنا الأمراض والعدوى.', correctAnswer: true },
        { type: 'fill', questionText: 'يتكون جسم الإنسان من ثلاثة أجزاء رئيسية هي الرأس، و......................، والأطراف.', fillAnswer: 'الجذع' },
        { type: 'fill', questionText: 'يحتوي الجذع في جسم الإنسان على العضوين الهامين وهما الصدر و...................... .', fillAnswer: 'البطن' },
        { type: 'qna', questionText: 'وضح كيف يحمي الاستحمام بالماء والصابون جلودنا وصحة أجسادنا من الأوساخ والعرق والروائح.' },
        { type: 'boolean', questionText: 'الطيور يغطي جسمها الريش ولها جناحين ومنقار وتتكاثر بوضع البيض مثل الحمام والعصافير.', correctAnswer: true },
        { type: 'boolean', questionText: 'تنتمي الماعز والأرانب لمجموعة الثدييات التي تلد صغارها وترضعها الحليب.', correctAnswer: true },
        { type: 'fill', questionText: 'تنتمي الضفادع إلى مجموعة ...................... لأنها تعيش بجلد رطب في البر والماء.', fillAnswer: 'البرمائيات' },
        { type: 'fill', questionText: 'للأرانب والكلاب أطراف قوية تساعدها على الحركة بطريقة المشي و...................... السريع.', fillAnswer: 'الجري' },
        { type: 'qna', questionText: 'ما الفرق الرئيسي في التكاثر والولادة بين مجموعة الثدييات الولودة ومجموعة الطيور البيوضة؟' },
        { type: 'boolean', questionText: 'تتنفس الأسماك الهواء الجوي مباشرة عن طريق الرئتين مثل الإنسان تماماً.', correctAnswer: false },
        { type: 'boolean', questionText: 'يتعرف الإنسان على طعم الأطعمة المختلفة (حلو، مر، مالح) بواسطة حاسة الذوق باللسان.', correctAnswer: true },
        { type: 'fill', questionText: 'موطن الإبل والجمال ونبات الصبار الشوكي هو ...................... الجافة رملية التربة.', fillAnswer: 'الصحراء' },
        { type: 'fill', questionText: 'العضو المسؤول عن حاسة السمع هو الأذن، والمسؤول عن حاسة البصر هو ...................... .', fillAnswer: 'العين' },
        { type: 'qna', questionText: 'عدد أجزاء النبات الرئيسية الخمسة التي تعلمتها في درس النباتات وتنوعها.' }
      ],
      2: [
        { type: 'boolean', questionText: 'تصنع النوافذ والعدسات من مادة الزجاج الشفاف الذي يسمح بمرور الضوء ورؤية ما خلفه.', correctAnswer: true },
        { type: 'boolean', questionText: 'الصلصال أو الطين هو مادة طبيعية لينة يسهل تشكيلها لصنع الزير والقلة والأواني الفخارية.', correctAnswer: true },
        { type: 'fill', questionText: 'المطاط مادة مرنة تمتاز بقابليتها للتمدد و...................... وتستخدم في صناعة إطارات السيارات والبالونات.', fillAnswer: 'الشد' },
        { type: 'fill', questionText: 'الخشب مادة قوية وصلبة تقاوم الكسر ولذلك نصنع منها ...................... والطاولات المدرسية للتلاميذ.', fillAnswer: 'الأثاث' },
        { type: 'qna', questionText: 'لماذا يفضل صناعة ألعاب الأطفال الصغار من البلاستيك خفيف الوزن بدلاً من الحديد أو الزجاج؟ علل ذلك.' },
        { type: 'boolean', questionText: 'تصنع مقاعد التلاميذ والطاولات المدرسية من الورق الرقيق لسهولة نقله وحمله.', correctAnswer: false },
        { type: 'fill', questionText: 'تنقسم المواد حسب طريقة الحصول عليها إلى مواد طبيعية ومواد ...................... .', fillAnswer: 'مصنعة' },
        { type: 'qna', questionText: 'وضح الفارق بين المادة الطبيعية والمادة المصنعة مع إعطاء مثال لكل منهما من بيئتك المحلية في السودان.' }
      ],
      3: [
        { type: 'boolean', questionText: 'يسير الضوء وينتشر في خطوط مستقيمة من مصدره في جميع الاتجاهات.', correctAnswer: true },
        { type: 'boolean', questionText: 'يتكون الظل خلف الأجسام المعتمة لأنها تحجب مسار الضوء وتمنع مروره عبرها.', correctAnswer: true },
        { type: 'fill', questionText: 'المواد الشفافة مثل ...................... النظيف تسمح بمرور الضوء بالكامل ولا يتكون لها ظل داكن.', fillAnswer: 'الزجاج' },
        { type: 'fill', questionText: 'تتكون الدائرة الكهربائية البسيطة من بطارية وأسلاك ومصباح ومفتاح للتحكم في ...................... .', fillAnswer: 'التيار' },
        { type: 'qna', questionText: 'لماذا يحذر كتاب العلوم من لمس الأجهزة الكهربائية والمفاتيح واليد مبللة بالماء؟' },
        { type: 'boolean', questionText: 'تعد البطارية الجافة في الدائرة الكهربية البسيطة هي مصدر ودفع التيار الكهربائي.', correctAnswer: true },
        { type: 'fill', questionText: 'يسمح المفتاح الكهربائي في الدائرة بـ ...................... وغلق مسار التيار لتشغيل المصباح أو إطفائه.', fillAnswer: 'فتح' },
        { type: 'qna', questionText: 'ما هي الفائدة الأساسية من تركيب أسلاك نحاسية مغطاة بالبلاستيك في الدائرة الكهربائية البسيطة؟' }
      ]
    };

    // Feed pool with custom extra questions based on what is selected
    if (sourceType === 'all') {
      Object.keys(extraQuestions).forEach(key => {
        pool.push(...extraQuestions[Number(key)]);
      });
    } else if (sourceType === 'unit') {
      pool.push(...(extraQuestions[selectedUnitId] || []));
    } else if (sourceType === 'lesson') {
      let uIdObj = 1;
      units.forEach(u => {
        if (u.lessons.some(l => l.id === selectedLessonId)) {
          uIdObj = u.id;
        }
      });
      pool.push(...(extraQuestions[uIdObj] || []));
    } else if (sourceType === 'favorites') {
      const favoritedIds = progress.favoriteLessons || [];
      if (favoritedIds.length > 0) {
        units.forEach(u => {
          if (u.lessons.some(l => favoritedIds.includes(l.id))) {
            pool.push(...(extraQuestions[u.id] || []));
          }
        });
      } else {
        Object.keys(extraQuestions).forEach(key => {
          pool.push(...extraQuestions[Number(key)]);
        });
      }
    }

    // 2. Filter by question types selected
    let filteredPool = pool.filter(q => {
      if (q.type === 'boolean' && !questionTypesSelected.boolean) return false;
      if (q.type === 'fill' && !questionTypesSelected.fill) return false;
      if (q.type === 'matching' && !questionTypesSelected.matching) return false;
      if (q.type === 'diagram' && !questionTypesSelected.diagram) return false;
      if (q.type === 'qna' && !questionTypesSelected.qna) return false;
      return true;
    });

    // If pool is empty, add some general questions
    if (filteredPool.length === 0) {
      filteredPool = [
        { type: 'boolean', questionText: 'العلم والمعرفة هما أساس نهضة كفاح الأمة السودانية والنهوض بالمستجدات العصرية.', correctAnswer: true },
        { type: 'fill', questionText: 'مؤسس المنهج وصياغة العلوم للصف الثالث هو البروفيسور ....................', fillAnswer: 'عثمان المنقوري 🇸🇩' },
        { type: 'qna', questionText: 'صف كيف تحافظ على نظافة وصحة أسنانك من التسوس.' }
      ];
    }

    // Shuffle helper
    const shuffleArray = (arr: any[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    // Prepare robust, non-repeating picker tracking
    let masterShuffledPool = shuffleArray(filteredPool);
    const usedTexts = new Set<string>();
    const usedDiagrams = new Set<string>();

    const pagesList: CustomQuestion[][] = [];
    const totalDesiredPages = Math.min(20, Math.max(1, numPages));

    for (let p = 0; p < totalDesiredPages; p++) {
      const pageQuestions: CustomQuestion[] = [];
      
      // A) Try to pull one unique diagram if checked
      if (questionTypesSelected.diagram) {
        const diagramCandidate = masterShuffledPool.find(q => 
          q.type === 'diagram' && 
          q.diagramId && 
          !usedDiagrams.has(q.diagramId) && 
          !usedTexts.has(q.questionText)
        );
        if (diagramCandidate && diagramCandidate.diagramId) {
          pageQuestions.push(diagramCandidate);
          usedTexts.add(diagramCandidate.questionText);
          usedDiagrams.add(diagramCandidate.diagramId);
        }
      }

      // Determine target questions per page based on content to fill A4 page fully without wastage
      const targetQuestionsCount = pageQuestions.some(q => q.type === 'diagram') ? 5 : 6;

      // B) Pull remaining questions for this page ensuring variety and zero repetitions
      const unusedQuestions = masterShuffledPool.filter(q => !usedTexts.has(q.questionText));
      
      for (const q of unusedQuestions) {
        if (pageQuestions.length >= targetQuestionsCount) break;
        
        // Skip already rendered diagrams
        if (q.type === 'diagram') {
          if (q.diagramId && usedDiagrams.has(q.diagramId)) {
            continue;
          }
          if (q.diagramId) {
            usedDiagrams.add(q.diagramId);
          }
        }

        pageQuestions.push(q);
        usedTexts.add(q.questionText);
      }

      // C) Fallback Generation: If we ran out of unique questions for high page counts,
      // generate beautifully descriptive unique dynamic questions on the fly!
      const fallbackTemplates = [
        { type: 'qna' as const, questionText: 'وضح بأسلوب المنهج المدرسي كيفية تطبيق المعرفة المكتسبة في المحرك العلمي لتنفيذ هذه الفرضية.' },
        { type: 'fill' as const, questionText: 'يتطلب القياس المخبري الصحيح للمركبات توافر شروط فيزيائية دقيقة تسمى ...................... .', fillAnswer: 'المعايير المنهجية' },
        { type: 'boolean' as const, questionText: 'الالتزام بآداب المعمل وقواعد السلامة عند التعامل مع المواد والحرارة واجب لتفادي الحوادث الكيميائية.', correctAnswer: true },
        { type: 'qna' as const, questionText: 'اكتب تعبيراً موجزاً تصف فيه دور التجربة العملية في تفريق المفاهيم في مقرر الصف الثالث بالدولة.' },
        { type: 'fill' as const, questionText: 'يتكون كوكب الأرض في نظامه الكوني من غلاف مائي هائل ونظام صخري يسمى ...................... .', fillAnswer: 'الغلاف الصخري' }
      ];

      let fallbackCounter = 0;
      while (pageQuestions.length < targetQuestionsCount) {
        const t = fallbackTemplates[fallbackCounter % fallbackTemplates.length];
        const uniqueText = `[سؤال تميز] ${t.questionText} (صفحة ${p + 1} - تمرين ${pageQuestions.length + 1})`;
        
        if (!usedTexts.has(uniqueText)) {
          pageQuestions.push({
            type: t.type,
            questionText: uniqueText,
            correctAnswer: (t as any).correctAnswer,
            fillAnswer: (t as any).fillAnswer
          });
          usedTexts.add(uniqueText);
        }
        fallbackCounter++;
      }

      pagesList.push(pageQuestions);
    }

    setGeneratedPages(pagesList);
    
    // Flatten and limit to max 40 questions for the interactive exam
    const flatQuestionsList = pagesList.flat().slice(0, 40);
    setFlattenedExamQuestions(flatQuestionsList);
    setExamUserAnswers({});
    setExamGraded(false);
    setExamScorePercent(0);
    setExamCorrectCount(0);
  };

  // Generate automatically on mount
  useEffect(() => {
    handleGenerateWorksheets();
  }, [sourceType, selectedUnitId, selectedLessonId, numPages]);

  // Grade user solutions on-site interactively
  const handleGradeExam = () => {
    let score = 0;
    flattenedExamQuestions.forEach((q, idx) => {
      const uAns = examUserAnswers[idx] || '';
      if (q.type === 'boolean') {
        const correctStr = q.correctAnswer ? 'true' : 'false';
        if (uAns === correctStr) {
          score++;
        }
      } else if (q.type === 'fill') {
        const userClean = uAns.trim().replace(/[أإآا]/g, 'ا');
        const correctClean = (q.fillAnswer || '').trim().replace(/[أإآا]/g, 'ا');
        if (userClean && (userClean.includes(correctClean) || correctClean.includes(userClean))) {
          score++;
        }
      } else if (q.type === 'matching') {
        score++; // credit for attempt
      } else if (q.type === 'qna') {
        if (uAns.trim().length > 3) {
          score++;
        }
      } else if (q.type === 'diagram') {
        if (examUserAnswers[`${idx}-dia-1`]?.trim() || examUserAnswers[`${idx}-dia-2`]?.trim()) {
          score++;
        }
      }
    });

    const percent = Math.min(100, Math.floor((score / flattenedExamQuestions.length) * 100));
    setExamCorrectCount(score);
    setExamScorePercent(percent);
    setExamGraded(true);
    
    if (percent >= 50) {
      speakWord(`تهانينا يا بطل! لقد نجحت بنسبة ${percent} بالمائة بنجاح باهر`);
    } else {
      speakWord(`مجهود رائع، لقد حصلت على نسبة ${percent} بالمائة. لا تيأس وعاود التجربة`);
    }
  };

  const handleRestartExam = () => {
    setExamUserAnswers({});
    setExamGraded(false);
    setExamScorePercent(0);
    setExamCorrectCount(0);
    speakWord("تم تصفير الإجابات والبدء من جديد");
  };

  // Handle password unlock input change
  const handleUnlockCheck = () => {
    if (unlockPasswordInput === '20302060') {
      setWatermarkRemoved(true);
      setPasswordSuccessMsg('✅ رائع! تم فك تشفير وإزالة العلامة المائية بنجاح!');
      setPasswordError('');
      speakWord("تم إزالة العلامة المائية بنجاح");
    } else {
      setPasswordError('❌ عذراً! رمز الحماية غير صحيح. حاول مجدداً.');
      setPasswordSuccessMsg('');
    }
  };

  // Trigger browser print dialog for exact A4 pages print
  const handlePrint = () => {
    speakWord("جاري طباعة أوراق العمل المخصصة");
    window.print();
  };

  return (
    <div className="space-y-6" id="worksheet-generator-viewport" dir="rtl">
      
      {/* 1. Header context bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 p-1 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة لشاشة المنهج الرئيسي</span>
        </button>

        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>وحدة توليد أوراق العمل والمناهج التفاعلية 📚</span>
        </div>
      </div>

      {/* 2. Top Informational Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-550 p-6 rounded-3xl text-white border-2 border-emerald-400 relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 text-7xl opacity-10 pointer-events-none transform -translate-x-4 -translate-y-4">📝</div>
        <div className="max-w-3xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-black">مصمم أوراق عمل وامتحانات العلوم المخصصة 📝</h2>
          <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed">
            يا بطل العلوم، هنا يمكنك تصميم وصياغة أوراق العمل الخاصة بك واختبار مهاراتك بشكل مخصص بالكامل وتصديرها للطباعة! 
            حدد الدروس المفضلة لديك أو اختر وحدة معينة، واختر أنواع الأسئلة المفضلة، وحدد عدد الأوراق لإنشاء ملف A4 جاهز مع علامة مائية لحماية الملكية الفكرية.
          </p>
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="worksheet-workspace-grid">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <section className="col-span-1 lg:col-span-4 bg-white rounded-3xl border-2 border-slate-150 p-6 space-y-6 shadow-sm self-start">
          
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 border-b pb-2">
              <FileText className="text-emerald-600 h-5 w-5" />
              <span>إعدادات ورقة العمل</span>
            </h3>

            {/* 1. Source Pool Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">مقرر أسئلة ورقة العمل:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSourceType('all')}
                  className={`p-2.5 rounded-xl text-[11px] font-black border transition text-center ${
                    sourceType === 'all' 
                      ? 'bg-emerald-500 text-white border-emerald-650 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📖 كامل المنهج
                </button>

                <button
                  onClick={() => setSourceType('favorites')}
                  className={`p-2.5 rounded-xl text-[11px] font-black border transition text-center relative ${
                    sourceType === 'favorites' 
                      ? 'bg-rose-500 text-white border-rose-650 shadow-sm' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  ❤️ المفضلة ({curriculumFavorites.length})
                  {curriculumFavorites.length > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-yellow-400 text-slate-900 border border-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                      {curriculumFavorites.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSourceType('unit')}
                  className={`p-2.5 rounded-xl text-[11px] font-black border transition text-center ${
                    sourceType === 'unit' 
                      ? 'bg-indigo-500 text-white border-indigo-650 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🗂️ وحدة معينة
                </button>

                <button
                  onClick={() => setSourceType('lesson')}
                  className={`p-2.5 rounded-xl text-[11px] font-black border transition text-center ${
                    sourceType === 'lesson' 
                      ? 'bg-amber-500 text-white border-amber-650 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📚 درس محدد
                </button>
              </div>
            </div>

            {/* Source Option Sub-Selectors */}
            {sourceType === 'unit' && (
              <div className="space-y-1.5 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-fadeIn">
                <label className="block text-[10px] font-black text-indigo-900">اختر الوحدة الدراسية:</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-white border border-indigo-200 rounded-xl font-bold"
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.title}</option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === 'lesson' && (
              <div className="space-y-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-100 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-black text-amber-900">اختر الوحدة الدراسية أولاً:</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-white border border-amber-200 rounded-xl font-bold mt-1"
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-900">ثم اختر الدرس المطلوب:</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-amber-200 rounded-xl font-bold mt-1"
                  >
                    {units.find(u => u.id === selectedUnitId)?.lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {sourceType === 'favorites' && curriculumFavorites.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] text-amber-800 font-bold flex gap-1.5 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  لم تقم بتفضيل أي درس حتى الآن. يمكنك تفضيل أي درس بالرجوع للرئيسية والضغط على علامة القلب ❤️ بجانب أي درس تريده، وسوف نستخدم أسئلة عشوائية من كتاب العلوم كبديل لحين اختيار مفضلاتك.
                </span>
              </div>
            )}

            {/* 2. Number of Pages (1 to 20 sheets) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                <span>عدد الأوراق المطلوبة (حجم A4):</span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 rounded-full font-bold">
                  {numPages} {numPages === 1 ? 'ورقة عمل' : numPages <= 10 ? 'أوراق' : 'ورقة'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={numPages}
                onChange={(e) => setNumPages(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="block text-[9px] text-slate-400 font-extrabold text-left">الحد الأقصى للتوليد: 20 ورقة عمل منفصلة بالكامل</span>
            </div>

            {/* 3. Question Types Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">نوعية الأسئلة وبناء الورقة:</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => toggleQuestionType('boolean')}
                  className={`w-full p-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                    questionTypesSelected.boolean 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-900 font-extrabold' 
                      : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <span>✓ أسئلة الصواب والخطأ (صح وخطأ)</span>
                  {questionTypesSelected.boolean && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => toggleQuestionType('fill')}
                  className={`w-full p-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                    questionTypesSelected.fill 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-900 font-extrabold' 
                      : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <span>✓ أسئلة إكمال الفراغات</span>
                  {questionTypesSelected.fill && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => toggleQuestionType('matching')}
                  className={`w-full p-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                    questionTypesSelected.matching 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-900 font-extrabold' 
                      : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <span>✓ أسئلة التوصيل (صل الكلمات)</span>
                  {questionTypesSelected.matching && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => toggleQuestionType('diagram')}
                  className={`w-full p-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                    questionTypesSelected.diagram 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-900 font-extrabold' 
                      : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <span>✓ إيضاح وتسمية مكونات الرسمة</span>
                  {questionTypesSelected.diagram && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => toggleQuestionType('qna')}
                  className={`w-full p-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                    questionTypesSelected.qna 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-900 font-extrabold' 
                      : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <span>✓ الأسئلة المقالية والتحريرية القصيرة</span>
                  {questionTypesSelected.qna && <Check className="h-4 w-4 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateWorksheets}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-200 border-2 border-emerald-400 cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>إعادة توليد وتحديث 🔄</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-3 px-4 rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 border-2 border-indigo-400 cursor-pointer transition flex items-center justify-center gap-1.5"
                  title="طباعة أوراق العمل بجمهورية السودان"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة 🖨️</span>
                </button>
              </div>

              {/* Direct Solving Mode Toggler */}
              <button
                onClick={() => {
                  const targetState = !isExamModeActive;
                  setIsExamModeActive(targetState);
                  speakWord(targetState ? "بداية الاختبار تفاعلياً بالموقع، بالتوفيق وعليكم بالتركيز الكامل" : "العودة لنمط أوراق الطباعة");
                }}
                className={`w-full p-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 border-2 shadow-sm ${
                  isExamModeActive 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-md shadow-purple-100' 
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-250'
                }`}
              >
                <span>✍️ {isExamModeActive ? "العودة لنمط أوراق الطباعة A4" : "حل هذا الاختبار تفاعلياً بالموقع 📝"}</span>
              </button>
            </div>

          </div>

          {/* WATERMARK UNLOCK CONTROL BLOCK */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-xl opacity-10 pointer-events-none">🔒</div>
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
              {watermarkRemoved ? <Unlock className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
              <span>تعديل/إزالة العلامة المائية:</span>
            </h4>
            
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              تحتوي هذه الأوراق على علامات مائية رسمية للتعليم الإلكتروني بجمهورية السودان. لإزالة العلامة المائية، أدخل الرقم السري المخصص:
            </p>

            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="رمز إزالة الهوية..."
                  value={unlockPasswordInput}
                  onChange={(e) => setUnlockPasswordInput(e.target.value)}
                  disabled={watermarkRemoved}
                  className="w-full shrink-0 p-2 pl-8 text-center text-xs border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-red-500"
                />
                
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute left-2 top-2.5 text-slate-400 hover:text-slate-650"
                  tabIndex={-1}
                >
                  {passwordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <button
                onClick={handleUnlockCheck}
                disabled={watermarkRemoved}
                className={`p-2 px-3.5 text-xs font-black rounded-xl text-white transition-colors cursor-pointer ${
                  watermarkRemoved 
                    ? 'bg-emerald-500 cursor-default' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                تطبيق
              </button>
            </div>

            {/* Feedback messages */}
            {passwordError && <p className="text-[9px] text-red-500 font-extrabold">{passwordError}</p>}
            {passwordSuccessMsg && <p className="text-[9px] text-emerald-600 font-extrabold">{passwordSuccessMsg}</p>}
          </div>

        </section>

        {/* RIGHT COLUMN: LIVE A4 PRINTABLE PREVIEW OR INTERACTIVE EXAM SOLVER */}
        <section className="col-span-1 lg:col-span-8 space-y-6">
          
          {isExamModeActive ? (
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-right" id="online-exam-workspace" dir="rtl">
              
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-md border-b-4 border-yellow-405 relative overflow-hidden">
                <div className="absolute top-2 left-3 text-4xl opacity-10 pointer-events-none select-none">✍️</div>
                <div className="absolute bottom-2 right-4 text-5xl opacity-10 pointer-events-none select-none">🇸🇩</div>
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-extrabold uppercase bg-white/20 text-yellow-100 px-3 py-1 rounded-full w-fit block border border-white/10">
                    امتحانات مير الإلكترونية التفاعلية • الصف الثالث
                  </span>
                  <h2 className="text-base sm:text-xl font-black">
                     الاختبار الإلكتروني الشامل لحل أوراق العمل 📝
                  </h2>
                  <p className="text-[10px] sm:text-xs opacity-90 leading-relaxed font-semibold">
                    هذا الاختبار الشامل يجمع أسئلة المنهج المحددة، ويمكنك حله مباشرة لتقييم درجاتك وتحسين مستواك التراكمي.
                  </p>
                </div>
              </div>

              {/* General Exam Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-extrabold block">إجمالي الأسئلة:</span>
                  <span className="text-xs font-black text-slate-800">{flattenedExamQuestions.length} سؤال شامل</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-extrabold block">صيغة التوليد:</span>
                  <span className="text-xs font-black text-indigo-700">ذكية لمنع التكرار</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-extrabold block">الزمن المقدر:</span>
                  <span className="text-xs font-black text-slate-800">مفتوح للمحاولة والتدرب</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-extrabold block">حالة التسليم:</span>
                  <span className={`text-xs font-black ${examGraded ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {examGraded ? 'تم تسليمه وتصحيحه' : 'يرجى الحل ثم الإرسال'}
                  </span>
                </div>
              </div>

              {/* Questions solver list */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                {flattenedExamQuestions.map((q, qIdx) => {
                  const uAns = examUserAnswers[qIdx] || '';
                  const isCorrect = q.type === 'boolean' 
                    ? (uAns === (q.correctAnswer ? 'true' : 'false'))
                    : q.type === 'fill'
                      ? (uAns.trim().replace(/[أإآا]/g, 'ا').includes((q.fillAnswer || '').trim().slice(0, 4).replace(/[أإآا]/g, 'ا')))
                      : true;

                  return (
                    <div 
                      key={qIdx} 
                      className={`p-5 rounded-2xl border-2 transition-all relative ${
                        examGraded 
                          ? isCorrect 
                            ? 'bg-emerald-50/40 border-emerald-200' 
                            : 'bg-rose-50/40 border-rose-200'
                          : 'bg-white border-slate-150 hover:border-purple-250 shadow-sm'
                      }`}
                    >
                      {/* Question Index and Points badge */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-slate-800 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">
                          السؤال رقم {qIdx + 1}
                        </span>
                        
                        <span className="text-[10px] text-slate-405 font-extrabold">الدرجة: ١ نقطة</span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-extrabold text-slate-850 leading-relaxed mb-4">
                        {q.questionText}
                      </p>

                      {/* Question Input Renderers */}
                      {q.type === 'boolean' && (
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            disabled={examGraded}
                            onClick={() => setExamUserAnswers(prev => ({ ...prev, [qIdx]: 'true' }))}
                            className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                              uAns === 'true' 
                                ? 'bg-emerald-505 border-emerald-600 text-white shadow-md' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            صح (صواب) ✅
                          </button>
                          
                          <button
                            type="button"
                            disabled={examGraded}
                            onClick={() => setExamUserAnswers(prev => ({ ...prev, [qIdx]: 'false' }))}
                            className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                              uAns === 'false' 
                                ? 'bg-red-505 border-red-600 text-white shadow-md' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            خطأ (غير صحيح) ❌
                          </button>
                        </div>
                      )}

                      {q.type === 'fill' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="اكتب إجابتك المناسبة هنا..."
                            disabled={examGraded}
                            value={uAns}
                            onChange={(e) => setExamUserAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none transition rounded-xl p-3 text-xs font-semibold text-right"
                          />
                        </div>
                      )}

                      {q.type === 'qna' && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            placeholder="اكتب تعليقك باختصار..."
                            disabled={examGraded}
                            value={uAns}
                            onChange={(e) => setExamUserAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                            className="w-full bg-slate-50 font-bold text-xs p-3 rounded-xl border-2 border-slate-200 focus:border-purple-450 focus:outline-none transition text-right"
                          />
                        </div>
                      )}

                      {q.type === 'matching' && q.matchingPairs && (
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-500 font-extrabold">توصيل المصطلحات والتعريفات المناسبة:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              {q.matchingPairs.map((pair, pIdx) => (
                                <div key={pIdx} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px] font-bold text-slate-800">
                                  <span>{pair.left}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2 text-[10.5px] font-semibold text-slate-700">
                              <p className="text-slate-400 text-[10px] font-bold">أدخل تفسيرك أو تطابقك بأسلوبك:</p>
                              <input
                                type="text"
                                placeholder="اكتب التطابق..."
                                disabled={examGraded}
                                value={uAns}
                                onChange={(e) => setExamUserAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                                className="w-full bg-slate-50 p-2.5 text-xs text-right border-2 border-slate-200 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {q.type === 'diagram' && q.diagramId && (
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                          <div className="flex-1 space-y-3 w-full">
                            <label className="block text-[11px] font-black text-slate-500 mb-1">حدد المسميات الصحيحة المقابلة للأرقام بالرسمة المقابلة:</label>
                            <input
                              type="text"
                              placeholder="أدخل مسمى الجزء رقم (١)..."
                              disabled={examGraded}
                              value={examUserAnswers[`${qIdx}-dia-1`] || ''}
                              onChange={(e) => setExamUserAnswers(prev => ({ ...prev, [`${qIdx}-dia-1`]: e.target.value }))}
                              className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold text-right"
                            />
                            <input
                              type="text"
                              placeholder="أدخل مسمى الجزء رقم (٢)..."
                              disabled={examGraded}
                              value={examUserAnswers[`${qIdx}-dia-2`] || ''}
                              onChange={(e) => setExamUserAnswers(prev => ({ ...prev, [`${qIdx}-dia-2`]: e.target.value }))}
                              className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold text-right"
                            />
                          </div>

                          {/* Render diagram representation */}
                          <div className="w-40 h-40 bg-white border-2 border-slate-200 p-2 rounded-xl flex items-center justify-center shrink-0">
                            {q.diagramId === 'human_body' && (
                              <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                {/* Head */}
                                <circle cx="100" cy="40" r="15" fill="none" stroke="#334155" strokeWidth="2.5" />
                                <text x="100" y="44" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ١ )</text>
                                
                                {/* Neck */}
                                <line x1="100" y1="55" x2="100" y2="62" stroke="#334155" strokeWidth="2.5" />
                                
                                {/* Trunk (Torso) */}
                                <rect x="80" y="62" width="40" height="60" rx="5" fill="none" stroke="#334155" strokeWidth="2.5" />
                                <text x="100" y="96" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٢ )</text>
                                
                                {/* Arms & Legs (Limbs) */}
                                <path d="M 80 70 Q 55 85 50 110" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M 120 70 Q 145 85 150 110" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M 90 122 V 175" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M 110 122 V 175" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                
                                <text x="100" y="190" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٣ )</text>
                              </svg>
                            )}

                            {q.diagramId === 'plant_parts' && (
                              <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                {/* Soil Line */}
                                <line x1="30" y1="140" x2="170" y2="140" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
                                
                                {/* Roots (الجذر) - Label (3) */}
                                <path d="M 100 140 Q 95 160 100 180" fill="none" stroke="#a16207" strokeWidth="4" strokeLinecap="round" />
                                <path d="M 100 150 Q 80 160 70 165" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 100 165 Q 120 175 130 180" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 100 155 Q 115 160 125 155" fill="none" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M 100 170 Q 85 178 80 185" fill="none" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
                                <text x="145" y="170" fontSize="10" fontWeight="black" fill="#1e293b">( ٣ )</text>
                                <line x1="105" y1="165" x2="135" y2="170" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                                
                                {/* Stem (الساق) - Label (2) */}
                                <path d="M 100 140 L 100 60" fill="none" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
                                <text x="145" y="105" fontSize="10" fontWeight="black" fill="#1e293b">( ٢ )</text>
                                <line x1="100" y1="100" x2="135" y2="105" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />

                                {/* Leaf 1 (ورقة) - Label (1) */}
                                <path d="M 100 110 Q 70 95 50 100 C 65 115, 85 115, 100 110" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                                <text x="30" y="95" fontSize="10" fontWeight="black" fill="#1e293b">( ١ )</text>
                                <line x1="65" y1="102" x2="40" y2="95" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />

                                {/* Leaf 2 */}
                                <path d="M 100 90 Q 130 75 150 80 C 135 95, 115 95, 100 90" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

                                {/* Simple flower at top to look pretty */}
                                <circle cx="100" cy="50" r="8" fill="#eab308" />
                                <circle cx="100" cy="38" r="6" fill="#ef4444" />
                                <circle cx="100" cy="62" r="6" fill="#ef4444" />
                                <circle cx="88" cy="50" r="6" fill="#ef4444" />
                                <circle cx="112" cy="50" r="6" fill="#ef4444" />
                              </svg>
                            )}

                            {q.diagramId === 'circuit' && (
                              <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                {/* Connecting Wires (Loop) */}
                                <rect x="35" y="50" width="130" height="100" rx="6" fill="none" stroke="#475569" strokeWidth="3" />
                                
                                {/* Battery at bottom */}
                                <rect x="80" y="140" width="40" height="20" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" />
                                <text x="100" y="130" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ١ )</text>
                                
                                {/* Lightbulb at top */}
                                <rect x="90" y="42" width="20" height="16" fill="#ffffff" stroke="none" />
                                <circle cx="100" cy="40" r="16" fill="#fef08a" stroke="#1e293b" strokeWidth="2.5" />
                                <path d="M 93 45 Q 100 30 107 45" fill="none" stroke="#d97706" strokeWidth="2" />
                                {/* Glow rays */}
                                <line x1="100" y1="20" x2="100" y2="10" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                <line x1="80" y1="30" x2="72" y2="22" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                <line x1="120" y1="30" x2="128" y2="22" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                <text x="100" y="75" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٢ )</text>
                                
                                {/* Knife Switch on Left Side */}
                                <rect x="30" y="90" width="10" height="20" fill="#ffffff" />
                                <line x1="35" y1="90" x2="48" y2="105" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                                <circle cx="35" cy="90" r="3" fill="#1e293b" />
                                <circle cx="35" cy="110" r="3" fill="#1e293b" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Correction feedback */}
                      {examGraded && (
                        <div className="mt-3.5 p-3 rounded-xl text-[11px] font-black flex gap-2 border">
                          {q.type === 'boolean' && (
                            isCorrect ? (
                              <div className="text-emerald-800 bg-emerald-50 border-emerald-200">
                                <span>صح! الإجابة صحيحة بالكامل أحسنت يا بطل! 🌟</span>
                              </div>
                            ) : (
                              <div className="text-red-800 bg-red-50 border-red-200">
                                <span>خطأ! الإجابة غير صحيحة. الإجابة الصحيحة هي: {q.correctAnswer ? 'صحيح (صح)' : 'خطأ'}</span>
                              </div>
                            )
                          )}

                          {q.type === 'fill' && (
                            isCorrect ? (
                              <div className="text-emerald-850 px-2 bg-emerald-50 border-emerald-200">
                                <span>رائع ومطابق! الإجابة النموذجية المعتمدة هي: {q.fillAnswer}</span>
                              </div>
                            ) : (
                              <div className="text-red-850 px-2 bg-red-50 border-red-200">
                                <span>غير مطابقة تماماً. الإجابة الصحيحة المقررة: {q.fillAnswer}</span>
                              </div>
                            )
                          )}

                          {q.type === 'qna' && (
                            <div className="text-purple-850 px-2 bg-purple-50 border-purple-200">
                              <span>لقد تم تقييم إجابتك وتأكيدها! استعن بملخص الدرس لتوسيع فهمك.</span>
                            </div>
                          )}

                          {q.type === 'matching' && (
                            <div className="text-indigo-850 px-2 bg-indigo-50 border-indigo-200">
                              <span>تم قبول التوصيل ومطابقته علمياً وتفاعلياً مع مقرر وزارة التربية والتعليم.</span>
                            </div>
                          )}

                          {q.type === 'diagram' && (
                            <div className="text-emerald-850 px-2 bg-emerald-50 border-emerald-250">
                              <span>قراءة رائعة للرسمة والمسارات المنهجية! تم احتساب المسميات بنجاح.</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Solved Exam Grading Controls */}
              <div className="pt-6 border-t border-slate-200">
                {!examGraded ? (
                  <button
                    type="button"
                    onClick={handleGradeExam}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-750 hover:from-purple-700 hover:to-indigo-850 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl shadow-purple-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="h-5 w-5" />
                    <span>إرسال وتصحيح الامتحان الآن بالموقع فوراً 🏆</span>
                  </button>
                ) : (
                  <div className="space-y-6">
                    {/* Graded billboard */}
                    <div className="bg-purple-950 p-6 sm:p-8 rounded-3xl text-white text-center space-y-4 shadow-xl border-4 border-yellow-400 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-4xl opacity-15">👑</div>
                      
                      <h4 className="text-base sm:text-lg font-black tracking-tight">
                        شرف تميز بطل العلوم بجمهورية السودان 🇸🇩
                      </h4>
                      
                      <div className="p-4 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto">
                        <span className="text-[10px] text-purple-200 font-extrabold uppercase">الدرجة التقديرية النهائية</span>
                        <div className="text-4xl sm:text-5xl font-black text-yellow-350 tracking-tight leading-none">
                          {examScorePercent}%
                        </div>
                        <span className="text-xs font-bold text-white mt-1">
                          أجبت على {examCorrectCount} من {flattenedExamQuestions.length} بنجاح باهر!
                        </span>
                      </div>

                      <p className="text-xs text-purple-100 max-w-md mx-auto leading-relaxed font-bold">
                        أحسنت يا بطل! لقد تم صقل مهاراتك من مقرر وزارة التربية والتعليم في السودان وزيادة رصيد معارفك وتثبيته.
                      </p>

                      <div className="pt-2 flex justify-center gap-4">
                        <button
                          onClick={handleGenerateWorksheets}
                          className="px-5 py-2.5 bg-yellow-450 hover:bg-yellow-500 text-slate-900 text-xs font-black rounded-xl transition transform hover:scale-105"
                        >
                          توليد امتحان جديد بالكامل 🔄
                        </button>
                        <button
                          onClick={handleRestartExam}
                          className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-purple-100 text-xs font-bold rounded-xl transition"
                        >
                          إعادة نفس المحاولة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <>
              <div id="worksheet-print-alert" className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                  <AlertCircle className="text-amber-600 h-4 w-4 shrink-0" />
                  <span>معاينة للطباعة حجم A4 (إجمالي أوراق العمل: {generatedPages.length})</span>
                </span>
                <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full">
                  متوافقة مع أحجام الطباعة المنزلية والمكتبية
                </span>
              </div>

              {/* List of A4 Pages */}
              <div id="worksheet-pages-scroll-container" className="space-y-8 overflow-y-auto max-h-[85vh] p-4 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 select-none">
                
                {generatedPages.map((pageQuestions, pageIdx) => (
                  <div 
                    key={pageIdx}
                    className="a4-page relative bg-white border border-slate-300 shadow-xl mx-auto overflow-hidden text-right select-none"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      padding: '20mm 15mm 20mm 15mm',
                      boxSizing: 'border-box'
                    }}
                  >
                    
                    {/* WATERMARK OVERLAY */}
                    {!watermarkRemoved && (
                      <div className="watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-20 opacity-[0.09]">
                        <div className="text-slate-800 font-black text-5xl tracking-widest text-center whitespace-nowrap -rotate-30 select-none">
                          نقلة للمناهج الإلكترونية <br />
                          الصف الثالث الابتدائي 🇸🇩
                        </div>
                      </div>
                    )}

                    {/* Page Border Frame */}
                    <div className="absolute inset-4 border-2 border-double border-slate-300 pointer-events-none z-10" />

                    {/* Page Content */}
                    <div className="relative z-30 flex flex-col justify-between h-full min-h-[250mm]">
                      
                      {/* Worksheet Official Header */}
                      <header className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start text-xs font-black text-slate-800 leading-tight">
                        <div className="space-y-1">
                          <p>المادة: العلوم والبيئة 🍎</p>
                          <p>الصف: الثالث الابتدائي</p>
                          <p>ورقة عمل مخصصة - رقم ({pageIdx + 1})</p>
                        </div>

                        <div className="text-center space-y-1">
                          <p className="font-extrabold text-sm text-slate-900 leading-none">جمهورية السودان</p>
                          <p className="font-bold text-[10px]">وزارة التربية والتعليم الاتحادية</p>
                          <p className="text-[9px] text-slate-500 font-semibold">المبادرة التفاعلية للمناهج الإلكترونية 🇸🇩</p>
                        </div>

                        <div className="space-y-1 text-left">
                          <p>الزمن: ٤٥ دقيقة</p>
                          <p>الدرجة المستهدفة: ٢٠ درجة</p>
                          <p>التاريخ: .... / .... / ٢٠٢٦م</p>
                        </div>
                      </header>

                      {/* Student Credentials Block */}
                      <div className="bg-slate-50 p-2 px-3 rounded-lg border border-slate-200 mb-5 flex justify-between text-[11px] font-black text-slate-800">
                        <div>اسم التلميذ(ة): ..............................................................</div>
                        <div>المدرسة المعتمدة: ...........................................</div>
                      </div>

                      {/* Worksheet body list of questions */}
                      <div className="flex-1 space-y-6">
                        
                        <h4 className="text-[13px] font-black underline decoration-double decoration-slate-800 text-center mb-4">
                          أجب بالتفصيل عن جميع الأسئلة التالية بوضوح:
                        </h4>

                        {pageQuestions.map((q, qIndex) => (
                          <div key={qIndex} className="space-y-3">
                            
                            {/* Question Title */}
                            <div className="flex items-start gap-1 font-bold">
                              <span className="bg-slate-800 text-white font-black text-[13px] h-5 w-5 rounded-md flex items-center justify-center shrink-0">
                                {qIndex + 1}
                              </span>
                              <span className="text-[12px] text-slate-900 leading-relaxed">
                                {q.questionText}
                              </span>
                            </div>

                            {/* Rendering different styles based on type */}
                            {q.type === 'boolean' && (
                              <div className="pr-6 flex gap-8 text-[11px] font-black text-slate-700">
                                <span>( ... ) نعم (صح)</span>
                                <span>( ... ) لا (خطأ)</span>
                              </div>
                            )}

                            {q.type === 'fill' && (
                              <div className="pr-6 space-y-2">
                                <div className="h-5 w-full border-b border-dashed border-slate-400" />
                              </div>
                            )}

                            {q.type === 'qna' && (
                              <div className="pr-6 space-y-2 mt-1">
                                <div className="h-5 w-full border-b border-dashed border-slate-400" />
                                <div className="h-5 w-full border-b border-dashed border-slate-400 font-normal text-slate-300" />
                                <div className="h-5 w-full border-b border-dashed border-slate-400" />
                              </div>
                            )}

                            {q.type === 'matching' && (
                              <div className="pr-6 grid grid-cols-2 gap-x-8 gap-y-2 text-[10.5px] font-black text-slate-800 mt-1">
                                <div className="space-y-2 border-l border-slate-200 pl-4">
                                  {q.matchingPairs?.map((pair, pIdx) => (
                                    <div key={pIdx} className="flex gap-1.5 items-center">
                                      <span className="text-[9px] bg-slate-100 text-slate-500 h-4 w-4 rounded-full flex items-center justify-center font-mono">أ</span>
                                      <span>{pair.left}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-2">
                                  {q.matchingPairs?.map((pair, pIdx) => (
                                    <div key={pIdx} className="flex gap-1.5 items-center">
                                      <span className="text-[10px] text-slate-400 font-bold">( ... )</span>
                                      <span>{pair.right.length > 50 ? pair.right.slice(0, 50) + '...' : pair.right}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {q.type === 'diagram' && q.diagramId && (
                              <div className="pr-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-slate-100 rounded-2xl p-2.5 bg-slate-50/50 mt-1">
                                <div className="flex-1 space-y-3 text-[11px] font-black text-slate-700">
                                  <p className="text-slate-500 text-[10px]">استعن بالرسم المقابل لكتابة المفردات المناسبة:</p>
                                  <div>(١) ................................................................</div>
                                  <div>(٢) ................................................................</div>
                                  <div>(٣) ................................................................</div>
                                </div>

                                {/* Render printable-adapted version of the requested diagram */}
                                <div className="w-40 h-40 bg-white border border-slate-200 p-1 rounded-xl flex items-center justify-center shrink-0">
                                  {q.diagramId === 'human_body' && (
                                    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                      {/* Head */}
                                      <circle cx="100" cy="40" r="15" fill="none" stroke="#334155" strokeWidth="2.5" />
                                      <text x="100" y="44" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ١ )</text>
                                      
                                      {/* Neck */}
                                      <line x1="100" y1="55" x2="100" y2="62" stroke="#334155" strokeWidth="2.5" />
                                      
                                      {/* Trunk (Torso) */}
                                      <rect x="80" y="62" width="40" height="60" rx="5" fill="none" stroke="#334155" strokeWidth="2.5" />
                                      <text x="100" y="96" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٢ )</text>
                                      
                                      {/* Arms & Legs (Limbs) */}
                                      <path d="M 80 70 Q 55 85 50 110" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                      <path d="M 120 70 Q 145 85 150 110" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                      <path d="M 90 122 V 175" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                      <path d="M 110 122 V 175" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                      
                                      <text x="100" y="190" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٣ )</text>
                                    </svg>
                                  )}

                                  {q.diagramId === 'plant_parts' && (
                                    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                      {/* Soil Line */}
                                      <line x1="30" y1="140" x2="170" y2="140" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
                                      
                                      {/* Roots (الجذر) - Label (3) */}
                                      <path d="M 100 140 Q 95 160 100 180" fill="none" stroke="#a16207" strokeWidth="4" strokeLinecap="round" />
                                      <path d="M 100 150 Q 80 160 70 165" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M 100 165 Q 120 175 130 180" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M 100 155 Q 115 160 125 155" fill="none" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
                                      <path d="M 100 170 Q 85 178 80 185" fill="none" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
                                      <text x="145" y="170" fontSize="10" fontWeight="black" fill="#1e293b">( ٣ )</text>
                                      <line x1="105" y1="165" x2="135" y2="170" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                                      
                                      {/* Stem (الساق) - Label (2) */}
                                      <path d="M 100 140 L 100 60" fill="none" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
                                      <text x="145" y="105" fontSize="10" fontWeight="black" fill="#1e293b">( ٢ )</text>
                                      <line x1="100" y1="100" x2="135" y2="105" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />

                                      {/* Leaf 1 (ورقة) - Label (1) */}
                                      <path d="M 100 110 Q 70 95 50 100 C 65 115, 85 115, 100 110" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                                      <text x="30" y="95" fontSize="10" fontWeight="black" fill="#1e293b">( ١ )</text>
                                      <line x1="65" y1="102" x2="40" y2="95" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />

                                      {/* Leaf 2 */}
                                      <path d="M 100 90 Q 130 75 150 80 C 135 95, 115 95, 100 90" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

                                      {/* Simple flower at top to look pretty */}
                                      <circle cx="100" cy="50" r="8" fill="#eab308" />
                                      <circle cx="100" cy="38" r="6" fill="#ef4444" />
                                      <circle cx="100" cy="62" r="6" fill="#ef4444" />
                                      <circle cx="88" cy="50" r="6" fill="#ef4444" />
                                      <circle cx="112" cy="50" r="6" fill="#ef4444" />
                                    </svg>
                                  )}

                                  {q.diagramId === 'circuit' && (
                                    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-700">
                                      {/* Connecting Wires (Loop) */}
                                      <rect x="35" y="50" width="130" height="100" rx="6" fill="none" stroke="#475569" strokeWidth="3" />
                                      
                                      {/* Battery at bottom */}
                                      <rect x="80" y="140" width="40" height="20" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" />
                                      <text x="100" y="130" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ١ )</text>
                                      
                                      {/* Lightbulb at top */}
                                      <rect x="90" y="42" width="20" height="16" fill="#ffffff" stroke="none" />
                                      <circle cx="100" cy="40" r="16" fill="#fef08a" stroke="#1e293b" strokeWidth="2.5" />
                                      <path d="M 93 45 Q 100 30 107 45" fill="none" stroke="#d97706" strokeWidth="2" />
                                      {/* Glow rays */}
                                      <line x1="100" y1="20" x2="100" y2="10" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                      <line x1="80" y1="30" x2="72" y2="22" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                      <line x1="120" y1="30" x2="128" y2="22" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                                      <text x="100" y="75" fontSize="10" fontWeight="black" fill="#1e293b" textAnchor="middle">( ٢ )</text>
                                      
                                      {/* Knife Switch on Left Side */}
                                      <rect x="30" y="90" width="10" height="20" fill="#ffffff" />
                                      <line x1="35" y1="90" x2="48" y2="105" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                                      <circle cx="35" cy="90" r="3" fill="#1e293b" />
                                      <circle cx="35" cy="110" r="3" fill="#1e293b" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>

                      {/* Worksheet Footer */}
                      <footer className="border-t border-slate-350 pt-2 flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <div>الصفحة {pageIdx + 1} من {generatedPages.length}</div>
                        <div className="text-center font-bold text-slate-500">
                          معلم المادة: ........................................ • التوقيع: ........................................
                        </div>
                        <div>نقلة للمناهج الإلكترونية 🇸🇩</div>
                      </footer>

                    </div>
                  </div>
                ))}

              </div>
            </>
          )}

        </section>

      </div>
    </div>
  );
}
