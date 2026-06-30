import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Flower, Sun, Layers, Activity, 
  RotateCw, RefreshCw, Zap, Sparkles, HelpCircle,
  Info, ShieldAlert, Droplets, Droplet, Eye, BookOpen, 
  Volume2, VolumeX, Headphones, Quote, Play, Pause, Bookmark, FileText, ExternalLink,
  Battery, Lightbulb, EyeOff, ShieldCheck, Footprints, Smile, TreePine, CloudSnow, Waves, AlertTriangle
} from 'lucide-react';
import AnimalLifecycles from './AnimalLifecycles';

const TASHKEEL_MAP: Record<string, string> = {
  // Living vs Non-Living
  "الكائنات الحية": "الكائِناتُ الحَيَّةُ",
  "أشياء غير حية": "أَشْياءُ غَيْرُ حَيَّةٍ",
  "جماد": "جَمادٌ",
  "قطة": "قِطَّةٌ",
  "شجرة": "شَجَرَةٌ",
  "صخرة": "صَخْرَةٌ",
  "دمية": "دُمْيَةٌ",
  "طفل": "طِفْلٌ",
  "قلم": "قَلَمٌ",
  "شمس": "شَمْسٌ",
  
  // Senses
  "العينان": "العَيْنانِ",
  "الأذنان": "الأُذُنانِ",
  "الأنف": "الأَنْفُ",
  "اللسان": "اللِّسانُ",
  "الجلد": "الجِلْدُ",
  "حاسة السمع": "حاسَّةُ السَّمْعِ",
  "حاسة البصر": "حاسَّةُ البَصَرِ",
  "حاسة الشم": "حاسَّةُ الشَّمِّ",
  "حاسة التذوق": "حاسَّةُ التَّذَوُّقِ",
  "حاسة اللمس": "حاسَّةُ اللَّمْسِ",
  
  // Body Parts
  "الرأس": "الرَّأْسُ",
  "الجذع": "الجِذْعُ",
  "الأطراف": "الأَطْرافُ",
  "الصدر": "الصَّدْرُ",
  "البطن": "البَطْنُ",
  "اليدان": "اليَدانِ",
  "الرجلان": "الرِّجْلانِ",
  
  // Needs & Characteristics
  "النمو": "النُّمُوُّ",
  "الحركة": "الحَرَكَةُ",
  "التكاثر": "التَّكاثُرُ",
  "الإحساس": "الإِحْساسُ",
  "الماء": "الماءُ",
  "الهواء": "الهَواءُ",
  "الغذاء": "الغِذاءُ",
  "ضوء الشمس": "ضَوْءُ الشَّمْسِ",
  
  // Habitats
  "الصحراء": "الصَّحْراءُ",
  "الغابة": "الغابَةُ",
  "المناطق القطبية": "المَناطِقُ القُطْبِيَّةُ",
  "مياه عذبة": "مِياهٌ عَذْبَةٌ",
  "مياه مالحة": "مِياهٌ مالِحَةٌ",
  "الإبل": "الإِبِلُ",
  "الصبار": "الصَّبَّارُ",
  "البطريق": "البَطْرِيقُ",
  "البولتي": "البُولْتِيُّ",
  "الحوت": "الحُوتُ",

  // Plants
  "نباتات صغيرة": "نَباتاتٌ صَغِيرَةٌ",
  "شجيرات متوسطة": "شُجَيْراتٌ مُتَوَسِّطَةٌ",
  "أشجار كبيرة": "أَشْجارٌ كَبِيرَةٌ",
  "النخيل": "النَّخِيلُ",
  "الدوم": "الدُّومُ",

  // Animals
  "الثدييات": "الثَّدْيِيّاتُ",
  "الطيور": "الطُّيُورُ",
  "الزواحف": "الزَّواحِفُ",
  "الأسماك": "الأسْماكُ",
  "البرمائيات": "الْبَرْمائِيَّاتُ",
  "الحشرات": "الحَشَراتُ",
  "الضفدعة": "الضَّفْدَعَةُ",

  // Matter
  "الخشب": "الخَشَبُ",
  "البلاستيك": "البِلَاسْتِيكُ",
  "الزجاج": "الزُّجاجُ",
  "الصلصال": "الصَّلْصالُ",
  "المطاط": "المَطَّاطُ",
  "القماش": "القُماشُ",
  "الزير": "الزِّيرُ",
  "القلة": "القُلَّةُ",

  // Light
  "لوح الزجاج": "لَوْحُ الزُّجاجِ",
  "منديل الشاش": "مِنْدِيلُ الشَّاشِ",
  "لوح الخشب": "لَوْحُ الخَشَبِ",
  "الظل": "الظِّلُّ",

  // Electricity
  "البطارية": "البَطَّارِيَّةُ",
  "أسلاك نحاسية": "أَسْلاكٌ نُحاسِيَّةُ",
  "مصباح كهربائي": "مِصْباحٌ كَهْرَبائِيٌّ",
  "المفتاح": "المِفْتاحُ"
};

/**
 * Speaks a technical scientific word clearly in Arabic using Web Speech API synthesis
 * with high quality and beautiful diacritics.
 */
function speakWord(word: string, isKid: boolean = false) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const diacritized = TASHKEEL_MAP[word] || word;
    const utterance = new SpeechSynthesisUtterance(diacritized);
    utterance.lang = 'ar-SA';
    
    const voices = window.speechSynthesis.getVoices();
    let activeVoice = voices.find(v => v.lang.includes('ar-SA') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Maged') || v.name.includes('Majed')));
    if (!activeVoice) activeVoice = voices.find(v => v.lang.includes('ar-SA') || v.lang.includes('ar_SA'));
    if (!activeVoice) activeVoice = voices.find(v => v.lang.startsWith('ar'));
    
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    
    utterance.rate = isKid ? 0.90 : 0.83; 
    utterance.pitch = isKid ? 1.35 : 0.95; 
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported.");
  }
}

interface ConversationLine {
  speaker: 'الأستاذ عادل 👨‍🏫' | 'المكتشفة مريم 👧';
  text: string;
  isKid: boolean;
}

interface TextbookCitation {
  id: string;
  label: string;
  quoteText: string;
  chapterSource: string;
}

interface EducationalDiagramProps {
  interactiveId: 'circulation' | 'flower' | 'lifecycle' | 'foodchain' | 'changes' | 'dissolution' | 'light' | 'moon' | 'excretion' | 'senses';
  lessonTitle: string;
}

export default function EducationalDiagram({ interactiveId, lessonTitle }: EducationalDiagramProps) {
  // NotebookLM States
  const [activeCitation, setActiveCitation] = useState<TextbookCitation | null>(null);
  const [podcastPlaying, setPodcastPlaying] = useState<boolean>(false);
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(0);
  const [bars, setBars] = useState<number[]>([10, 20, 15, 30, 25, 10, 35, 20, 15, 30, 40, 25, 10]);

  // Determine actual sub-topic index for accurate interactive rendering
  let activeId: 'living' | 'senses' | 'lifecycle' | 'dissolution' | 'foodchain' | 'circulation' | 'plants' | 'animals' | 'changes' | 'light' | 'moon' = 'living';

  if (interactiveId === 'senses') {
    activeId = 'senses';
  } else if (interactiveId === 'excretion') {
    activeId = 'living';
  } else if (interactiveId === 'flower') {
    if (lessonTitle.includes('نبات')) {
      activeId = 'plants';
    } else {
      activeId = 'animals';
    }
  } else if (interactiveId === 'lifecycle') {
    activeId = 'lifecycle';
  } else if (interactiveId === 'dissolution') {
    activeId = 'dissolution';
  } else if (interactiveId === 'foodchain') {
    activeId = 'foodchain';
  } else if (interactiveId === 'circulation') {
    activeId = 'circulation';
  } else if (interactiveId === 'changes') {
    activeId = 'changes';
  } else if (interactiveId === 'light') {
    activeId = 'light';
  } else if (interactiveId === 'moon') {
    activeId = 'moon';
  }

  // Podcast Dialogue Lines Config mapped by the unified Grade 3 lesson ID
  const podcastData: Record<string, ConversationLine[]> = {
    living: [
      { speaker: 'المكتشفة مريم 👧', text: 'أستاذ عادل، انظر إلى لعبتي الجديدة! لماذا لا تأكل العشب والخبز مثل قطتي الصغيرة؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'سؤال ممتاز يا مريم! لأن الدمية شيء غير حي (جماد) لا تتنفس ولا تنمو ولا تحتاج لطعام، بينما قطتك كائن حي يحتاج للماء والهواء والغذاء لكي يعيش ويكبر!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'آها! يعني الصخور والألعاب والكرسي والشمس كلها جمادات؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'بالضبط يا بطلة! الجمادات لا تنمو ولا تشعر، بينما الأحياء تتنفس وتتحرك وتكبر وتتكاثر لتنتج صغاراً.', isKid: false }
    ],
    senses: [
      { speaker: 'المكتشفة مريم 👧', text: 'أستاذ عادل، كيف نشم رائحة الورد الجميلة ونميز برودة الثلج؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لقد وهبنا الله خمسة أعضاء حس مدهشة! الأنف لشم الروائح، والجلد للمس وتمييز الحرارة والبرودة والنعومة والخشونة!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وكيف نحافظ على سلامة جلدنا بعد اللعب والتعرق؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'عبر الاستحمام المستمر بالماء والصابون معاً يا مريم! فالماء وحده لا يزيل الدهون والأوساخ الملتصقة بالجلد.', isKid: false }
    ],
    lifecycle: [
      { speaker: 'المكتشفة مريم 👧', text: 'ما هي الخصائص الكبرى التي تميز الكائنات الحية عن الجمادات؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'هي أربع خصائص كبرى: النمو، الحركة من تلقاء النفس، التكاثر لإنتاج صغار، والإحساس بظروف البيئة من حولنا!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وهل تتكاثر كل الكائنات الحية بالولادة مثل الإنسان؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لا، فالحيوانات تنقسم إلى ولودة تلد وترضع صغارها كالماعز والأرانب، وبيوضة تضع البيض كالدجاج والتمساح والأسماك!', isKid: false }
    ],
    dissolution: [
      { speaker: 'المكتشفة مريم 👧', text: 'أستاذ عادل، ما الذي تفعله تجربة الأصيصين التي درسناها في كتاب العلوم؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'تثبت أن الماء شريان الحياة! عندما نسقي الأصيص الأول بالماء العذب ينمو أخضر جميلاً، بينما الأصيص الثاني الذي حرمناه من الماء يذبل ويموت فوراً!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وماذا عن ضوء الشمس والهواء؟ هل يحتاجها النبات أيضاً؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'نعم! فالنبات يحتاج للهواء ليتنفس، وضوء الشمس لكي يصنع غذائه بنفسه، بعكس الحيوان الذي يعتمد على غيره.', isKid: false }
    ],
    foodchain: [
      { speaker: 'المكتشفة مريم 👧', text: 'لماذا لا يعيش الجمل في القطب المتجمد أو يعيش البطريق في صحراء السودان؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لأن لكل كائن حي موطناً طبيعياً يلائمه! فالصحراء بيئة جافة قليلة الماء تناسب الإبل والصبار، والقطب البارد يناسب البطريق وجلده السميك!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وهل هناك مواطن مائية أيضاً؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'نعم! مواطن مائية عذبة كالأنهار والبرك يعيش فيها سمك البولتي وأعشاب النيل، ومواطن مائية مالحة كالبحار والمحيطات يعيش فيها الحوت الكنعاني العظيم!', isKid: false }
    ],
    circulation: [
      { speaker: 'المكتشفة مريم 👧', text: 'مم يتكون جسمنا الصغير يا أستاذ عادل؟ لقد رأيت الرسمة في كتاب العلوم!', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'يتكون من ثلاثة أجزاء رئيسية: الرأس في الأعلى وبداخله الدماغ وأعضاء الحس، الجذع في الوسط ويضم الصدر والبطن، والأطراف!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وما هي أطرافنا بالضبط وكيف نستخدمها؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'اليدان هما الأطراف العليا نكتب ونعمل بهما، والرجلان هما الأطراف السفلى نمشي ونجري بهما بحرية ونشاط!', isKid: false }
    ],
    plants: [
      { speaker: 'المكتشفة مريم 👧', text: 'هل جميع النباتات من حولنا متشابهة في الحجم والشكل؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لا يا مريم، تختلف أحجامها بوضوح! فهناك حشائش وأعشاب صغيرة، وهناك شجيرات متوسطة الحجم مثل شجيرة الفل والياسمين الجميلة.', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وماذا عن أشجار النخيل والدوم الكبيرة التي نراها في السودان؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'هذه أشجار ضخمة وكبيرة الحجم ولها جذوع خشبية قوية وعميقة لكي تتحمل الرياح والحرارة العالية!', isKid: false }
    ],
    animals: [
      { speaker: 'المكتشفة مريم 👧', text: 'أستاذ عادل، كم مجموعة كبرى للحيوانات صنفها علماء العلوم؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'صنفوها إلى ست مجموعات كبرى: الثدييات الولودة، الطيور ذات الريش والأجنحة، الزواحف الزاحفة بجلدها الجاف، الأسماك، البرمائيات كالضفدع، والحشرات الصغيرة ذات الأرجل الستة!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'واو! وكلها تضع البيض لتتكاثر ما عدا الثدييات؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'نعم يا مريم، الثدييات هي المجموعة الوحيدة التي تلد صغارها وترضعها حليباً طازجاً مغذياً!', isKid: false }
    ],
    changes: [
      { speaker: 'المكتشفة مريم 👧', text: 'أستاذ عادل، هل يمكن استخدام البلاستيك الخفيف لصنع قدر طهي نضعه فوق النار مباشرة؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'ضحكة لطيفة! لا يا مريم، لأن البلاستيك يذوب ويحترق بالنار، بعكس الطين الصلصالي أو المعادن التي نستخدمها لصنع الزير والقدر لقدرتها على تحمل الحرارة!', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وماذا عن الزجاج؟ لماذا لا نصنع منه الكراسي المدرسية؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لأن الزجاج مادة هشّة وسهلة الكسر وتسبب خطراً كبيراً وجروحاً للتلاميذ، لذا نختار الخشب والحديد للصلابة والمتانة!', isKid: false }
    ],
    light: [
      { speaker: 'المكتشفة مريم 👧', text: 'كيف يتكون ظل القطة خلفها عندما تسير في ضوء الشمس المستقيم؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'لأن جسم القطة معتم لا يسمح بمرور الضوء، فيحجبه ويتشكل الظل المظلم خلفه! فالضوء يسير دائماً في خطوط مستقيمة.', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وما هي المواد الشفافة التي تسمح للضوء بالعبور من خلالها؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'مثل لوح الزجاج النظيف والماء النقي، بينما ورق الكرتون والخشب مواد معتمة تصنع ظلالاً واضحة وقوية!', isKid: false }
    ],
    moon: [
      { speaker: 'المكتشفة مريم 👧', text: 'كيف يمر التيار الكهربائي ليضيء مصباح غرفتي الصغير؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'يمر عبر مسار مغلق يسمى الدائرة الكهربائية! يتكون من بطارية، أسلاك نحاسية، ومفتاح نغلقه لتمر الكهرباء ونفتحه لنفصل التيار.', isKid: false },
      { speaker: 'المكتشفة مريم 👧', text: 'وهل هناك خطر وقواعد سلامة يجب أن ننتبه إليها؟', isKid: true },
      { speaker: 'الأستاذ عادل 👨‍🏫', text: 'تحذير صارم جداً! يمنع منعاً باتاً لمس مفاتيح ومصادر الكهرباء واليد مبللة بالماء تجنباً للصدمات الكهربائية القاتلة يا مريم!', isKid: false }
    ]
  };

  // Textbook Citations Mapped by Lesson Code - exact reference material of Grade 3
  const citationsData: Record<string, TextbookCitation[]> = {
    living: [
      { id: '1', label: 'الدمية شيء غير حي والقطة كائن حي', quoteText: 'الدمية شيء غير حي (جماد) لا يحتاج للغذاء، بينما القطة كائن حي يحتاج للغذاء والماء والهواء ليعيش وينمو ويكبر مع مرور الزمن [ص ٣ للكتاب المدرسي الوزاري].', chapterSource: 'الوحدة الأولى: الدرس الأول - الكائنات من حولنا' },
      { id: '2', label: 'تصنيف الكائنات والجمادات', quoteText: 'الأشياء غير الحية (الجمادات) لا تحتاج للهواء والماء والغذاء للبقاء، ومن أمثلتها: الصخور، الحديد، الكرسي، الشمس، والقمر [ص ٥ للكتاب المدرسي الوزاري].', chapterSource: 'الوحدة الأولى: الدرس الأول - تصنيف الجمادات' }
    ],
    senses: [
      { id: '1', label: 'أعضاء الحس الخمسة ووظائفها', quoteText: 'يتعرف الإنسان على الأشياء من حوله بواسطة أعضاء الحس الخمسة: العين للبصر، الأذن للسمع، الأنف للشم، اللسان للذوق، والجلد يغطي الجسم كله للمس [ص ١٦].', chapterSource: 'الوحدة الأولى: الدرس السادس - أعضاء الحس' },
      { id: '2', label: 'صحة الجلد ونظافته بالاستحمام الصحيح', quoteText: 'عند اللعب والتعرق، تتجمع ذرات الغبار والأوساخ على الجلد. لإزالتها وحماية جلدنا يجب الاستحمام بالماء والصابون معاً، فالماء وحده لا يكفي لإزالة الدهون [ص ٢١].', chapterSource: 'الوحدة الأولى: الدرس الحادي عشر - صحة الجلد' }
    ],
    lifecycle: [
      { id: '1', label: 'أهم خصائص الكائنات الحية الأربعة', quoteText: 'تتميز الكائنات الحية بأربع خصائص كبرى تفصلها عن الجمادات وهي: النمو، الحركة من تلقاء نفسها، التكاثر لضمان البقاء، والإحساس بالمؤثرات [ص ٦].', chapterSource: 'الوحدة الأولى: الدرس الثاني - خصائص الكائنات' },
      { id: '2', label: 'التكاثر بالولادة والبيض في الحيوان', quoteText: 'تتكاثر الحيوانات بطريقتين: حيوانات ولودة تلد وترضع صغارها كالأرانب والقطط، وحيوانات بيوضة تضع البيض كالدجاج والتمساح والأسماك [ص ٨].', chapterSource: 'الوحدة الأولى: الدرس الثاني - طرق التكاثر' }
    ],
    dissolution: [
      { id: '1', label: 'تجربة الأصيصين وحاجة النبات للماء', quoteText: 'إذا أحضرنا نباتين متشابهين في أصيصين، وسقينا أحدهما بالماء وتركنا الآخر بدون ماء لمدة أسبوع، فإن النبات الذي لم يسق يذبل ويموت، فالماء ضروري لبقاء الكائنات [ص ١٠].', chapterSource: 'الوحدة الأولى: الدرس الثالث - تجربة الأصيصين' },
      { id: '2', label: 'صنع الغذاء والضوء في النباتات', quoteText: 'النبات كائن حي يصنع غذاءه بنفسه بمساعدة ضوء الشمس والماء والهواء، بينما يعتمد الإنسان والحيوان في غذائه على النبات أو حيوانات أخرى [ص ١١].', chapterSource: 'الوحدة الأولى: الدرس الثالث - حاجات الكائنات' }
    ],
    foodchain: [
      { id: '1', label: 'مواطن اليابسة الصحراء والغابة والقطب', quoteText: 'الموطن هو المكان الطبيعي لعيش الكائن. الصحراء جافة (صبار، إبل)، الغابة بيئة رطبة ظليلة كثيفة الأشجار (الأسد، القرد)، والمناطق القطبية شديدة البرودة (البطريق) [ص ١٢].', chapterSource: 'الوحدة الأولى: الدرس الرابع - مواطن اليابسة' },
      { id: '2', label: 'المواطن المائية العذبة والمالحة بالسودان', quoteText: 'المواطن المائية نوعان: عذبة كالأنهار والبرك (سمك البولتي، أعشاب النيل)، ومالحة كالبحار والمحيطات (الحوت، أعشاب البحر) [ص ١٤].', chapterSource: 'الوحدة الأولى: الدرس الرابع - المواطن المائية' }
    ],
    circulation: [
      { id: '1', label: 'الأجزاء الثلاثة الرئيسية لجسم الإنسان', quoteText: 'يتكون جسم الإنسان من ثلاثة أجزاء رئيسية واضحة ومحددة هي: الرأس، الجذع (ويشمل الصدر والبطن)، والأطراف (اليدان والرجلان) [ص ١٥].', chapterSource: 'الوحدة الأولى: الدرس الخامس - تركيبة جسم الإنسان' },
      { id: '2', label: 'الأطراف العليا والأطراف السفلى للحركة', quoteText: 'اليدان هما الأطراف العليا المستخدمة في العمل والكتابة واللمس، والرجلان هما الأطراف السفلى المستخدمة في المشي والجري والحركة المتفاعلة [ص ١٥].', chapterSource: 'الوحدة الأولى: الدرس الخامس - الأطراف' }
    ],
    plants: [
      { id: '1', label: 'أحجام النباتات المختلفة في البيئة', quoteText: 'تختلف النباتات بوضوح في أحجامها وتصنف إلى: نباتات صغيرة (حشائش وأعشاب)، نباتات متوسطة وتسمى شجيرات (الفل والياسمين)، ونباتات كبيرة وتسمى أشجار [ص ٢٣].', chapterSource: 'الوحدة الأولى: الدرس الثاني عشر - تنوع النباتات' },
      { id: '2', label: 'الأشجار الكبيرة والسيقان الخشبية القوية', quoteText: 'الأشجار الكبيرة تتميز بساق خشبية ضخمة وجذور قوية ممتدة تمكنها من الثبات والحصول على الغذاء والماء (مثل شجرة النخيل، الدوم، المانجو، والسنط) [ص ٢٤].', chapterSource: 'الوحدة الأولى: الدرس الثاني عشر - الأشجار' }
    ],
    animals: [
      { id: '1', label: 'المجموعات الحيوانية الست الكبرى للعلماء', quoteText: 'صنف العلماء الحيوانات لست مجموعات متميزة: الثدييات (تلد وترضع)، الطيور (ريش وأجنحة)، الزواحف (جلد جاف وقشور)، الأسماك، البرمائيات، والحشرات [ص ٢٥].', chapterSource: 'الوحدة الأولى: الدرس الثالث عشر - تصنيف الحيوانات' },
      { id: '2', label: 'خصائص الثدييات الولودة والرضاعة', quoteText: 'الثدييات هي المجموعة الحيوانية الوحيدة التي تلد صغارها وترضعها الحليب لتمنحها المناعة والغذاء (مثل الأبقار، القطط، الأرانب، الغنم، والإنسان) [ص ٢٦].', chapterSource: 'الوحدة الأولى: الدرس الثالث عشر - الثدييات' }
    ],
    changes: [
      { id: '1', label: 'اختيار المواد لصناعة الأشياء وخواصها', quoteText: 'نختار المواد المناسبة لصناعة الأشياء وفق خواصها: البلاستيك خفيف الوزن متين للألعاب، القماش مرن سهل الطي للملابس، والصلصال يسهل تشكيله للأواني الفخارية كالزير [ص ٣٦].', chapterSource: 'الوحدة الثانية: الدرس الرابع - استخدام وصناعة المواد' },
      { id: '2', label: 'الزجاج مادة هشة سهلة الكسر والتحذير منها', quoteText: 'لا نستخدم الزجاج الرقيق لصناعة الكراسي المدرسية لكونه مادة هشّة وسهلة الكسر وتسبب خطراً كبيراً وجروحاً بالغة للتلاميذ عند لعبهم وحركتهم [ص ٣٧].', chapterSource: 'الوحدة الثانية: الدرس الرابع - المواد الهشة' }
    ],
    light: [
      { id: '1', label: 'مسار الضوء المستقيم وتكون الظلال', quoteText: 'يسير وينتشر الضوء دائماً في خطوط مستقيمة. ويتكون الظل (المساحة المظلمة) خلف الجسم المعتم عندما يسقط عليه الضوء ويحجب مساره المستقيم [ص ٤٤].', chapterSource: 'الوحدة الثالثة: الدرس الثاني - تكون الظلال' },
      { id: '2', label: 'المواد الشفافة ونصف الشفافة والمعتمة', quoteText: 'تصنف المواد حسب نفاذ الضوء إلى: شفافة تسمح بمروره بالكامل (زجاج نظيف)، نصف شفافة (شاش ومنديل)، ومعتمة لا تسمح بمروره مطلقاً (خشب وكرتون) [ص ٤٥].', chapterSource: 'الوحدة الثالثة: الدرس الثاني - نفاذ الضوء' }
    ],
    moon: [
      { id: '1', label: 'الدائرة الكهربائية ومكوناتها الأربعة', quoteText: 'تسري الكهرباء في مسار مغلق يسمى الدائرة الكهربائية. وتتكون الدائرة البسيطة من: بطارية، أسلاك موصلة، مصباح كهربائي، ومفتاح يفتح ويغلق المسار [ص ٥١].', chapterSource: 'الوحدة الثالثة: الدرس الرابع - الدائرة الكهربائية' },
      { id: '2', label: 'قواعد الأمان والتحذير من لمس الكهرباء بالماء', quoteText: 'تحذير هام لسلامة الأطفال: يمنع منعاً باتاً لمس مفاتيح ومصادر الكهرباء المنزلية واليد مبللة بالماء تجنباً للصدمات الكهربائية والماس الكهربائي القاتل [ص ٥٣].', chapterSource: 'الوحدة الثالثة: الدرس الرابع - الأمان الكهربائي' }
    ]
  };

  const lessonConversations = podcastData[activeId] || [];
  const lessonCitations = citationsData[activeId] || [];

  const playPodcast = () => {
    if (lessonConversations.length === 0) return;
    
    if (podcastPlaying) {
      window.speechSynthesis.cancel();
      setPodcastPlaying(false);
      return;
    }

    setPodcastPlaying(true);
    
    const speakNextLine = (idx: number) => {
      if (idx >= lessonConversations.length) {
        setPodcastPlaying(false);
        setCurrentLineIdx(0);
        return;
      }
      
      setCurrentLineIdx(idx);
      const line = lessonConversations[idx];
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = 'ar-SA';
        
        const voices = window.speechSynthesis.getVoices();
        let activeVoice = voices.find(v => v.lang.includes('ar-SA') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Maged') || v.name.includes('Majed')));
        if (!activeVoice) activeVoice = voices.find(v => v.lang.includes('ar-SA') || v.lang.includes('ar_SA'));
        if (!activeVoice) activeVoice = voices.find(v => v.lang.startsWith('ar'));
        if (activeVoice) {
          utterance.voice = activeVoice;
        }

        utterance.rate = line.isKid ? 0.90 : 0.83; 
        utterance.pitch = line.isKid ? 1.35 : 0.95; 

        utterance.onend = () => {
          const nextTimer = setTimeout(() => {
            speakNextLine(idx + 1);
          }, 950);
          (window as any).podcastTimeout = nextTimer;
        };

        utterance.onerror = (e) => {
          console.warn("Speech synthesis error", e);
          const estimatedTime = (line.text.length * 85) + 1500;
          const nextTimer = setTimeout(() => {
            speakNextLine(idx + 1);
          }, estimatedTime);
          (window as any).podcastTimeout = nextTimer;
        };

        window.speechSynthesis.speak(utterance);
      } else {
        const estimatedTime = (line.text.length * 85) + 1500;
        const nextTimer = setTimeout(() => {
          speakNextLine(idx + 1);
        }, estimatedTime);
        (window as any).podcastTimeout = nextTimer;
      }
    };

    speakNextLine(currentLineIdx);
  };

  const stopPodcast = () => {
    window.speechSynthesis.cancel();
    clearTimeout((window as any).podcastTimeout);
    setPodcastPlaying(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearTimeout((window as any).podcastTimeout);
    };
  }, []);

  // Visual Interactive Components Local States
  const [selectedLivingItem, setSelectedLivingItem] = useState<string | null>(null);
  const [selectedSense, setSelectedSense] = useState<string | null>(null);
  const [activeGrowthStage, setActiveGrowthStage] = useState<number>(0);
  const [plantWatered, setPlantWatered] = useState<boolean>(false);
  const [activeHabitat, setActiveHabitat] = useState<string>('desert');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedPlantSize, setSelectedPlantSize] = useState<string | null>(null);
  const [selectedAnimalGroup, setSelectedAnimalGroup] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [materialTest, setMaterialTest] = useState<'none' | 'fire' | 'break'>('none');
  const [lightBarrier, setLightBarrier] = useState<'glass' | 'tissue' | 'wood'>('wood');
  const [circuitClosed, setCircuitClosed] = useState<boolean>(false);
  const [wetHandWarning, setWetHandWarning] = useState<boolean>(false);

  // Triggering test animation for materials
  useEffect(() => {
    if (materialTest !== 'none') {
      const timer = setTimeout(() => setMaterialTest('none'), 3000);
      return () => clearTimeout(timer);
    }
  }, [materialTest]);

  // Triggering warning reset
  useEffect(() => {
    if (wetHandWarning) {
      const timer = setTimeout(() => setWetHandWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [wetHandWarning]);

  return (
    <div className="space-y-6 text-right" id={`notebook-wrapper-${activeId}`}>
      
      {/* 📘 NotebookLM Signature Academic Header Panel (Loose-leaf study notebook) */}
      <div className="bg-[#FCFAF7] border-4 border-[#DDD4C3] rounded-3xl shadow-md p-5 sm:p-6 relative overflow-hidden">
        
        {/* Steel Binder Spiral Loops Simulation */}
        <div className="absolute top-0 left-6 right-6 h-4 flex justify-between pointer-events-none" style={{ transform: 'translateY(-8px)' }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-2.5 h-6 bg-gradient-to-b from-[#b5b0a3] to-[#ebdcc8] rounded-full border border-slate-400 shadow-sm" />
              <div className="w-1.5 h-1.5 bg-emerald-500/15 rounded-full -mt-1" />
            </div>
          ))}
        </div>

        {/* Notebook page margin strip line (RTL left edge bound) */}
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-rose-350 pointer-events-none opacity-40 mr-1" />

        <div className="pr-6 pt-4 space-y-6">
          
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-[#DDD4C3] pb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1 justify-start">
                <span className="p-1 bg-[#F5EFE4] text-amber-900 rounded-lg text-xs font-black border border-[#D5CBB9] flex items-center gap-1">
                  📚 مستندات كتاب الوزارة المعتمدة
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                  نشط في NotebookLM
                </span>
              </div>
              <h3 className="text-md sm:text-xl font-black text-slate-800 flex items-center gap-2 justify-start">
                <FileText className="h-5 w-5 text-[#8D7F67]" />
                <span>شرح تفاعلي دقيق لدرس: {lessonTitle}</span>
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#F0E9DC] text-slate-700 font-extrabold px-3 py-1.5 rounded-xl border border-slate-300 shrink-0">
                🎒 المنهج الجديد - الصف الثالث
              </span>
            </div>
          </div>

          {/* 🎙️ NotebookLM Killer Feature: Arabic Dual Co-Host AI Podcast Review Panel */}
          <div className="bg-[#FAF6EE] border-2 border-[#DDD4C3] p-4 rounded-2xl relative overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 bg-[#8D7F67] text-white text-[9px] font-black px-3 py-1 rounded-br-2xl flex items-center gap-1">
              <Headphones className="h-2.5 w-2.5 animate-bounce" />
              <span>Studio Quick Dialogue - استوديو المراجعة الذكية</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
              
              {/* Audio visual controls left */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={podcastPlaying ? stopPodcast : playPodcast}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 duration-200 cursor-pointer ${
                      podcastPlaying 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-250'
                    }`}
                  >
                    {podcastPlaying ? (
                      <>
                        <Pause className="h-4.5 w-4.5 fill-white" />
                        <span>إيقاف البودكاست مؤقتاً 🛑</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4.5 w-4.5 fill-white" />
                        <span>استمع لبودكاست الدرس التفاعلي 🎧</span>
                      </>
                    )}
                  </button>

                  {/* Frequency Wave Visualizer */}
                  <div className="flex items-end gap-[3px] h-8 pt-2">
                    {bars.map((height, i) => (
                      <div 
                        key={i} 
                        className="w-[3px] bg-emerald-600 rounded-full transition-all duration-100" 
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: podcastPlaying ? '#10b981' : '#b91c1c'
                        }} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-amber-950 font-black leading-relaxed text-right">
                  💡 <strong>ميزة نوت بوك ال ام:</strong> الأستاذ عادل والمكتشفة مريم يناقشان الدرس بصوت حواري ممتع! اضغط لتسمع بأذنك!
                </p>
              </div>

              {/* Speech dialog bubble scroll right */}
              <div className="md:col-span-7 bg-[#FDFCFB] border border-[#DDD4C3] p-3 rounded-xl min-h-[70px] flex flex-col justify-center">
                {lessonConversations.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[9px] bg-[#EFE4D2] text-[#6E5F46] font-extrabold px-2 py-0.5 rounded-full inline-block">
                      {lessonConversations[currentLineIdx]?.speaker} يتحدث الآن:
                    </span>
                    <p className="text-slate-800 text-xs font-bold leading-relaxed pr-1 animate-pulse" style={{ animationDuration: '3s' }}>
                      💬 "{lessonConversations[currentLineIdx]?.text}"
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">البودكاست الصوتي قيد التحضير في معمل العلوم.</span>
                )}
              </div>

            </div>
          </div>

          {/* 🌟 Centered Graphic Interactive Simulator Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* The Diagram Illustration Frame */}
            <div className="lg:col-span-7">
              <div className="text-center mb-1 flex items-center justify-between gap-2" dir="rtl">
                <span className="text-[10px] bg-[#EBE4D5] text-slate-700 font-black px-3 py-1 rounded-lg border border-[#DDD4C3] truncate">
                  رسم تفاعلي توضيحي (مستخرج من الصفحة المقررة لكتاب العلوم للوزارة) 📝
                </span>
                <span className="text-[9.5px] bg-sky-100 text-sky-800 font-extrabold px-2.5 py-1 rounded-lg border border-sky-300 flex items-center gap-1 shadow-sm">
                  <Eye className="h-2.5 w-2.5 animate-pulse" />
                  <span>المجهر الرقمي نشط 🔬</span>
                </span>
              </div>

              <div 
                className="bg-[#FCFAF7] rounded-2xl border-2 border-[#DDD4C3] p-4 min-h-[340px] hover:shadow-lg relative flex flex-col items-center justify-center overflow-hidden"
                style={{ 
                  backgroundImage: 'radial-gradient(circle, #EBE6DC 1.5px, transparent 1.5px)', 
                  backgroundSize: '16px 16px'
                }}
              >
                {/* 📌 APPROVED TAG */}
                <div className="absolute top-2 left-2 rotate-[-12deg] bg-yellow-250/70 border border-yellow-300 text-[8px] font-black px-2.5 py-0.5 text-slate-800 shadow-sm z-10">
                  📌 نموذج مدرسي معتمد
                </div>

                {/* 1. Living vs Non-Living Simulator */}
                {activeId === 'living' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">انقر على الكائن لتصنيفه وسماع النطق والحاجات المقررة:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { name: "قطة", icon: "🐱", isLiving: true, desc: "كائن حي: يحتاج للماء والهواء والغذاء لكي ينمو ويتحرك." },
                        { name: "شجرة", icon: "🌳", isLiving: true, desc: "كائن حي: يصنع غذاءه بضوء الشمس، ويتنفس الهواء ويشرب الماء." },
                        { name: "طفل", icon: "👶", isLiving: true, desc: "كائن حي: ينمو ويتحرك ويتكاثر ويحتاج للماء والوجبات والهواء." },
                        { name: "صخرة", icon: "🪨", isLiving: false, desc: "جماد (شيء غير حي): لا يتنفس ولا يأكل ولا ينمو أبداً." },
                        { name: "دمية", icon: "🧸", isLiving: false, desc: "جماد: لعبة صنعتها أمي من القماش والقطن، لا تحتاج طعاماً." },
                        { name: "شمس", icon: "☀️", isLiving: false, desc: "جماد: نجم عملاق يعطينا الضوء والحرارة، لا يحتاج غذاءً." }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedLivingItem(item.name);
                            speakWord(item.name);
                          }}
                          className={`p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95 cursor-pointer flex flex-col items-center gap-1.5 ${
                            selectedLivingItem === item.name 
                              ? (item.isLiving ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300' : 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300')
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-xs font-black text-slate-800">🔊 {item.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.isLiving ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {item.isLiving ? 'كائن حي' : 'جماد'}
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedLivingItem && (
                      <div className="bg-white border-2 border-dashed border-[#DDD4C3] p-3 rounded-xl animate-fade-in text-right">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded">التفسير العلمي:</span>
                        <p className="text-slate-700 text-xs font-bold leading-relaxed mt-1">
                          {selectedLivingItem === 'قطة' && "🐱 قطة: كائن حي (حيوان من الثدييات) تلد وترضع صغارها، وتتحرك بمفردها بحثاً عن الغذاء العشبي أو اللحوم وتتنفس الهواء."}
                          {selectedLivingItem === 'شجرة' && "🌳 شجرة: كائن حي (نبات كبير) يثبت جذوره في التربة السودانية ليمتص الماء العذب، ويصنع غذاءه بتمثيله الضوئي لضوء الشمس."}
                          {selectedLivingItem === 'طفل' && "👶 طفل: كائن حي (إنسان بطل) يولد صغيراً فينمو ويكبر، يتنفس الهواء بانتظام، ويشرب الماء، ويتحرك للتعلم واللعب."}
                          {selectedLivingItem === 'صخرة' && "🪨 صخرة: شيء غير حي (جماد صلب) لا ينمو حجمها، ولا تتنفس الهواء، ولا تتحرك من مكانها إلا بجهد ودفع خارجي."}
                          {selectedLivingItem === 'دمية' && "🧸 دمية: جماد (لعبة أمل) لا تأكل ولا تشرب كقطة البيت، ولا تشعر بالأشياء من حولها لعدم وجود أعضاء حس حقيقية."}
                          {selectedLivingItem === 'شمس' && "☀️ شمس: جماد (جرم كوني) لا يحتاج لهواء أو طعام لكي يستمر بالبقاء، ولكنه يرسل لنا طاقة الضوء لتستعين بها النباتات لإنتاج سكر الغذاء."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Senses Simulator */}
                {activeId === 'senses' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">انقر على عضو الحس لسماع النطق وقراءة صحته والمحافظة عليه:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { name: "العينان", icon: "👁️", sense: "البصر", health: "لا ننظر لمصادر الضوء القوية كالشمس مباشرة، ونغسل عيوننا بالماء النظيف لإبعاد الذباب والوقاية من مرض الرمد." },
                        { name: "الأذنان", icon: "👂", sense: "السمع", health: "لا نستخدم الأشياء الحادة كعيدان الثقاب لتنظيف الأذن لئلا نثقب طبلة الأذن، ونتجنب الصراخ والضرب عليها." },
                        { name: "الأنف", icon: "أنف", textIcon: "👃", sense: "الشم", health: "نستخدم الأنف لشم وتمييز الروائح كالعطور الطيبة وغاز البخت المحترق المنبه، ونحافظ عليه بالنظافة الدائمة بالمناديل." },
                        { name: "اللسان", icon: "لسان", textIcon: "👅", sense: "التذوق", health: "نميز طعم الأطعمة (حلو كالسكر، مالح كالملح، حامض كالليمون، ومر كالأعشاب). نحميه بعدم تذوق كيمياويات مجهولة أو ساخنة." },
                        { name: "الجلد", icon: "جلد", textIcon: "✋", sense: "اللمس", health: "يغطي كامل الجسم، نشعر به بالسخونة والبرودة والخشونة والنعومة. لسلامته نستحم بالماء والصابون معاً لإزالة العرق والغبار." }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedSense(item.name);
                            speakWord(item.name);
                          }}
                          className={`p-2.5 rounded-xl border-2 transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1 ${
                            selectedSense === item.name 
                              ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-2xl">{item.textIcon || item.icon}</span>
                          <span className="text-[11px] font-black text-slate-800">🔊 {item.name}</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 rounded font-extrabold">حاسة {item.sense}</span>
                        </button>
                      ))}
                    </div>

                    {selectedSense && (
                      <div className="bg-white border-2 border-dashed border-[#DDD4C3] p-3 rounded-xl animate-fade-in text-right">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded">صحة هذا العضو والحفاظ عليه:</span>
                        <p className="text-slate-700 text-xs font-bold leading-relaxed mt-1">
                          {selectedSense === 'العينان' && "👁️ العينان (البصر): تحتاج للضوء لترى الأشياء. نقي أنفسنا برؤية الكتب بإضاءة مريحة، ونغسل عيوننا بالماء النظيف لطرد الأتربة وتجنب الذباب الناقل لمرض الرمد."}
                          {selectedSense === 'الأذنان' && "👂 الأذنان (السمع): عضو رقيق جداً به غشاء طبلة حساس، لذا يمنع إدخال المسامير أو الأعواد الحادة فيها لتفادي ثقب الغشاء والصمم، كما نتجنب الصراخ بآذان زملائنا."}
                          {selectedSense === 'الأنف' && "👃 الأنف (الشم): يتعرف على الروائح الذكية كالعطور والفاكهة والروائح الكريهة المنبهة. حيوانات ككلاب الصيد تعتمد عليه كلياً في حركتها وبقائها وتتبع غذائها."}
                          {selectedSense === 'اللسان' && "👅 اللسان (الذوق): نحدد عبره طعم الأشياء حلوها وحامضها (عصير ليمون) ومالحها ومرها (أدوية)، ويحظر تماماً لمس المواد الكيماوية السامة أو المشروبات شديدة الغليان."}
                          {selectedSense === 'الجلد' && "✋ الجلد (اللمس وصحة الجسد): يغطي جسمنا كله لحمايته. عند لعبنا في جو حار يفرز العرق فيلتصق به الغبار. لتنظيفه، نستحم بالماء والصابون معاً فالماء وحده لا يذيب الأوساخ الدهنية."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Characteristics Simulator */}
                {activeId === 'lifecycle' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">اضغط لتشاهد خصائص الكائنات الحية الأربعة وتفاعل معها:</p>
                    
                    {/* Character Controls */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button 
                        onClick={() => { speakWord("النمو"); setActiveGrowthStage(prev => (prev + 1) % 4); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        🌱 🔊 النمو (اضغط للتكبير)
                      </button>
                      <button 
                        onClick={() => { speakWord("الحركة"); alert("الحركة 🏃: الكائنات الحية تتحرك من تلقاء نفسها للبحث عن الغذاء أو الهروب من الأعداء!"); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        🏃 🔊 الحركة
                      </button>
                      <button 
                        onClick={() => { speakWord("التكاثر"); alert("التكاثر 🐣: لإنتاج صغار تشبه آباءها لضمان البقاء. الماعز يلد ويرضع، والدجاج يضع البيض، والنبات بالبذور!"); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        🐣 🔊 التكاثر
                      </button>
                      <button 
                        onClick={() => { speakWord("الإحساس"); alert("الإحساس 🧠: الكائنات تشعر بالحرارة والبرودة وتستجيب للبيئة لحماية نفسها!"); }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        🧠 🔊 الإحساس
                      </button>
                    </div>

                    {/* Interactive growth stages frame */}
                    <div className="bg-white border-2 border-[#EBE4D5] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px]">
                      {activeGrowthStage === 0 && (
                        <div className="animate-bounce">
                          <span className="text-4xl">🌱</span>
                          <p className="text-xs font-black text-slate-700 mt-1">النمو (المرحلة ١): البذرة الصغيرة تبذر في الأرض وتسقى بالماء.</p>
                        </div>
                      )}
                      {activeGrowthStage === 1 && (
                        <div className="animate-pulse">
                          <span className="text-4xl">🌿</span>
                          <p className="text-xs font-black text-slate-700 mt-1">النمو (المرحلة ٢): البذرة تفقس برعماً صغيراً يتنفس الهواء.</p>
                        </div>
                      )}
                      {activeGrowthStage === 2 && (
                        <div>
                          <span className="text-4xl">🪴</span>
                          <p className="text-xs font-black text-slate-700 mt-1">النمو (المرحلة ٣): تكبر الأوراق وتحتاج لضوء الشمس لصناعة الغذاء.</p>
                        </div>
                      )}
                      {activeGrowthStage === 3 && (
                        <div className="animate-bounce" style={{ animationDuration: '3s' }}>
                          <span className="text-4xl">🌳</span>
                          <p className="text-xs font-black text-emerald-800 mt-1">النمو (المرحلة ٤): شجرة عملاقة تنتج بذوراً وثماراً لذيذة!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Needs (Plant Experiment) Simulator */}
                {activeId === 'dissolution' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">تجربة الأصيصين المقررة بالمنهج: تفاعل لترى أثر سقي الماء وعدمه:</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pot A */}
                      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">الأصيص (أ): سُقي بالماء 💧</span>
                        <div className="text-5xl my-2 transition-transform duration-300 hover:scale-110">
                          {plantWatered ? "🌻" : "🪴"}
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold leading-relaxed">نبات نامٍ أخضر واقف بقوة ونشاط لأننا نسقيه بالماء العذب.</p>
                        <button
                          onClick={() => {
                            setPlantWatered(true);
                            speakWord("الماء");
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black cursor-pointer active:scale-95"
                        >
                          اسقِ بالماء 💧
                        </button>
                      </div>

                      {/* Pot B */}
                      <div className="bg-white border-2 border-rose-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-black">الأصيص (ب): بدون ماء ❌</span>
                        <div className="text-5xl my-2 opacity-60">
                          🥀
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold leading-relaxed">نبات ذبل وأوراقه صفراء متساقطة لامتناع وسحب الماء عنه لأسبوع كامل.</p>
                        <button
                          onClick={() => {
                            setPlantWatered(false);
                            speakWord("ذبل ومات");
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer active:scale-95"
                        >
                          شاهد الذبول 🥀
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700">
                      💡 <strong>نتيجة تجربة العلوم:</strong> الماء والضوء والهواء حاجات أساسية لا يستغني عنها أي كائن حي للبقاء.
                    </div>
                  </div>
                )}

                {/* 5. Habitats Simulator */}
                {activeId === 'foodchain' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">انقر على الموطن لاستكشاف الطبيعة وساكنيها وتكيفهم:</p>
                    
                    {/* Habitat selection tabs */}
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        { id: 'desert', label: "الصحراء 🏜️", word: "الصحراء" },
                        { id: 'forest', label: "الغابة 🌳", word: "الغابة" },
                        { id: 'polar', label: "القطبية ❄️", word: "المناطق القطبية" },
                        { id: 'fresh', label: "مياه عذبة 💧", word: "مياه عذبة" },
                        { id: 'salty', label: "مياه مالحة 🌊", word: "مياه مالحة" }
                      ].map((tab, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveHabitat(tab.id);
                            speakWord(tab.word);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition cursor-pointer active:scale-95 ${
                            activeHabitat === tab.id 
                              ? 'bg-[#8D7F67] text-white shadow-sm'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Display Habitat details */}
                    <div className="bg-white border-2 border-[#EBE4D5] rounded-2xl p-4 text-right space-y-2">
                      {activeHabitat === 'desert' && (
                        <div className="animate-fade-in space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">🐪 🌵</span>
                            <span className="text-[10px] bg-amber-150 text-amber-800 px-2 py-0.5 rounded-full font-black">بيئة جافة رملية</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">موطن الصحراء الجافة:</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            يندر فيها وجود الماء وتربتها رملية أو صخرية، حرارتها مرتفعة نهاراً باردة ليلاً. يعيش فيها نبات <strong>الصبار</strong> وشجرة <strong>السنط</strong>، وحيوان <strong>الإبل</strong> (سفينة الصحراء) الذي يتكيف مع العطش.
                          </p>
                        </div>
                      )}
                      {activeHabitat === 'forest' && (
                        <div className="animate-fade-in space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">🦁 🐒 🌳</span>
                            <span className="text-[10px] bg-emerald-150 text-emerald-800 px-2 py-0.5 rounded-full font-black">بيئة رطبة ظليلة</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">موطن الغابة الكثيفة:</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            موطن ظليل تصل إليه كميات قليلة من أشعة الشمس لكثافة الأشجار وتشابكها. وهي بيئة رطبة وممطرة بغزارة، يعيش فيها حيوانات قوية كالأسد والقرود التي تقفز بين الأغصان.
                          </p>
                        </div>
                      )}
                      {activeHabitat === 'polar' && (
                        <div className="animate-fade-in space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">🐧 🐻‍❄️ ❄️</span>
                            <span className="text-[10px] bg-sky-150 text-sky-800 px-2 py-0.5 rounded-full font-black">جليد وبرودة شديدة</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">موطن المناطق القطبية المتجمدة:</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            تتميز بالبرودة الشديدة والجليد الدائم طوال شهور العام. يندر وجود النباتات الخضراء الكبيرة بها، ويعيش فيها حيوانات مجهزة بفراء وجلد سميك كحيوان الدب القطبي وطائر <strong>البطريق</strong>.
                          </p>
                        </div>
                      )}
                      {activeHabitat === 'fresh' && (
                        <div className="animate-fade-in space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">🐟 🌿 💧</span>
                            <span className="text-[10px] bg-teal-150 text-teal-800 px-2 py-0.5 rounded-full font-black">مياه عذبة للشرب</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">مواطن المياه العذبة (الأنهار والبرك):</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            مياه عذبة جارية أو راكدة غنية بالحياة. يعيش فيها سمك <strong>البولتي</strong> النيلي اللذيذ، وتطفو فوقها <strong>أعشاب النيل</strong> الخضراء وتنمو على ضفافها الأشجار لتصنع غذاءها.
                          </p>
                        </div>
                      )}
                      {activeHabitat === 'salty' && (
                        <div className="animate-fade-in space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">🐋 🪸 🌊</span>
                            <span className="text-[10px] bg-blue-150 text-blue-800 px-2 py-0.5 rounded-full font-black">مياه مالحة عميقة</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">مواطن المياه المالحة (البحار والمحيطات):</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            مياه مالحة وعميقة جداً تمثل الجزء الأكبر من سطح الأرض. يعيش فيها حيوان <strong>الحوت</strong> العظيم، وأسماك القرش، وتنمو فيها <strong>أعشاب البحر</strong> المتنوعة.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Body Parts Simulator */}
                {activeId === 'circulation' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">أقسام جسم الإنسان الثلاثة: انقر لتشاهد أجزاءها وتسمع النطق والوظيفة:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: "الرأس", area: "أعلى الجسم", parts: "العينان، الأذنان، الأنف، الفم، الدماغ", icon: "👤" },
                        { name: "الجذع", area: "وسط الجسم", parts: "منطقة الصدر، منطقة البطن", icon: "🎽" },
                        { name: "الأطراف", area: "القسم المتحرك", parts: "أطراف عليا (اليدان للكتابة)، أطراف سفلى (الرجلان للمشي والجري)", icon: "🦵" }
                      ].map((part, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedBodyPart(part.name);
                            speakWord(part.name);
                          }}
                          className={`p-3.5 rounded-2xl border-2 transition-all duration-200 text-right cursor-pointer flex items-start gap-2.5 ${
                            selectedBodyPart === part.name 
                              ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-3xl">{part.icon}</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-slate-800">🔊 {part.name}</h4>
                            <p className="text-[10px] text-slate-500 font-extrabold">{part.area}</p>
                            <p className="text-[9.5px] text-slate-600 leading-tight mt-1">{part.parts}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedBodyPart && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 leading-relaxed text-right animate-fade-in">
                        📝 <strong>ملاحظة المنهج لـ {selectedBodyPart}:</strong> {
                          selectedBodyPart === 'الرأس' ? "👤 الرأس يضم أهم الحواس كالعين للبصر والأنف للشم، والدماغ لإدارة الحركة والذكاء وحفظ معلومات العلوم."
                          : selectedBodyPart === 'الجذع' ? "🎽 الجذع يتوسط الجسم ويحمي الأجزاء والأعضاء الداخلية بالصدر والبطن من الصدمات الخارجية."
                          : "🦵 الأطراف تنقسم ليدين لكتابة الواجبات المدرسية وحمل الأشياء، ورجلين للقفز والمشي والرياضة المفيدة لصحة الجسد."
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Plants Simulator */}
                {activeId === 'plants' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">تصنيف النباتات حسب حجمها: انقر لترى الفئة وتسمع أمثلة السودان:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: "نباتات صغيرة", size: "حشائش وأعشاب برية 🌱", examples: "الحشائش المنزلية والأعشاب الملتصقة بالتربة." },
                        { name: "شجيرات متوسطة", size: "شجيرات متوسطة الحجم 🌹", examples: "شجيرة الفل، شجيرة الياسمين العطرية." },
                        { name: "أشجار كبيرة", size: "أشجار خشبية ضخمة 🌴", examples: "شجرة النخيل، شجرة الدوم، شجرة المانجو، والسنط." }
                      ].map((plant, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedPlantSize(plant.name);
                            speakWord(plant.name);
                          }}
                          className={`p-3.5 rounded-2xl border-2 transition text-right cursor-pointer ${
                            selectedPlantSize === plant.name 
                              ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <h4 className="text-xs font-black text-slate-800">🔊 {plant.name}</h4>
                          <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">{plant.size}</p>
                          <p className="text-[9.5px] text-slate-500 mt-1">{plant.examples}</p>
                        </button>
                      ))}
                    </div>

                    {selectedPlantSize && (
                      <div className="bg-white border-2 border-dashed border-[#DDD4C3] p-3 rounded-xl text-xs font-bold text-slate-700 leading-relaxed text-right animate-fade-in">
                        🌳 <strong>التوضيح العلمي:</strong> {
                          selectedPlantSize === 'نباتات صغيرة' ? "🌱 الأعشاب والحشائش صغيرة جداً وسيقانها لينة خضراء تنمو بسرعة في موسم الأمطار وتسقى بالماء."
                          : selectedPlantSize === 'شجيرات متوسطة' ? "🌹 شجيرة الياسمين والفل متوسطة الحجم وتتفرع سيقانها من أسفل التربة مباشرة لتعطينا منظراً جميلاً ورائحة عطرة."
                          : "🌴 الأشجار الكبيرة كشجرة النخيل والدوم والسنط والمانجو تمتاز بجذع خشبي قوي وثخين يمد الأغصان للأعلى ويعيش لسنوات طويلة."
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Animals Simulator */}
                {activeId === 'animals' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">المجموعات الست الكبرى للحيوانات: انقر لترى التكاثر والصفة والسماع:</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { name: "الثدييات", rep: "ولودة وترضع 🐄", ex: "الأبقار، الغنم، القطط" },
                        { name: "الطيور", rep: "بيوضة (ريش) 🦅", ex: "الدجاج، الحمام، الصقور" },
                        { name: "الزواحف", rep: "بيوضة (قشور) 🐊", ex: "الثعابين، التمساح" },
                        { name: "الأسماك", rep: "بيوضة (زعانف) 🐟", ex: "البلطي، أسماك البحر" },
                        { name: "البرمائيات", rep: "بيوضة (بر وماء) 🐸", ex: "الضفادع" },
                        { name: "الحشرات", rep: "بيوضة (٦ أرجل) 🦟", ex: "الذباب، الفراش، البعوض" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedAnimalGroup(item.name);
                            speakWord(item.name);
                          }}
                          className={`p-2 rounded-xl border-2 transition text-right cursor-pointer flex flex-col gap-0.5 justify-center ${
                            selectedAnimalGroup === item.name 
                              ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <h4 className="text-[11px] font-black text-slate-800">🔊 {item.name}</h4>
                          <span className="text-[9px] text-purple-700 font-extrabold">{item.rep}</span>
                          <span className="text-[8.5px] text-slate-500 truncate">{item.ex}</span>
                        </button>
                      ))}
                    </div>

                    {selectedAnimalGroup && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 leading-relaxed text-right animate-fade-in">
                        🐾 <strong>معايير المجموعة:</strong> {
                          selectedAnimalGroup === 'الثدييات' ? "🐄 الثدييات تلد صغاراً يافعة تشبه آباءها وترضعها الحليب من صدر الأم لنمو عظامها وأطرافها."
                          : selectedAnimalGroup === 'الطيور' ? "🦅 الطيور يغطي ريش ملون جلدها ولها منقار صلب وأجنحة للطيران، وتتكاثر بوضع بيوض دافئة تحضنها."
                          : selectedAnimalGroup === 'الزواحف' ? "🐊 الزواحف تزحف ببطنها على الأرض ولها جلد جاف مغطى بقشور وحراشف صلبة لحمايتها وتتكاثر بالبيض."
                          : selectedAnimalGroup === 'الأسماك' ? "🐟 تعيش الأسماك في مياه السودان العذبة والمالحة وتتنفس بالخياشيم وتتحرك بالزعانف وتضع البيض بكثرة."
                          : selectedAnimalGroup === 'البرمائيات' ? "🐸 البرمائيات كالضفادع تضع بيضها بالماء وتعيش طفولتها كأبي ذنيبة خيشومي ثم تكبر لتعيش على اليابسة برئتين."
                          : "🦟 الحشرات كائنات صغيرة بجسم مقسم ولها ستة أرجل قرون استشعار وتتكاثر بالبيض كالذباب والبعوض المضر."
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* 9. Matter Laboratory Simulator */}
                {activeId === 'changes' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">مختبر المادة واستخداماتها: اختر مادة ثم اختبر قوتها ومقاومتها للحرارة والكسر:</p>
                    
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        { name: "الخشب", icon: "🪵", word: "الخشب" },
                        { name: "البلاستيك", icon: "🥤", word: "البلاستيك" },
                        { name: "الزجاج", icon: "🥛", word: "الزجاج" },
                        { name: "الصلصال", icon: "🏺", word: "الصلصال" },
                        { name: "المطاط", icon: "🎈", word: "المطاط" },
                        { name: "القماش", icon: "👕", word: "القماش" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedMaterial(item.name);
                            speakWord(item.word);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                            selectedMaterial === item.name 
                              ? 'bg-[#8D7F67] text-white shadow'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedMaterial && (
                      <div className="bg-white border-2 border-dashed border-[#DDD4C3] p-4 rounded-xl text-right space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-[#FAF6EE] text-slate-700 border border-[#DDD4C3] px-2 py-0.5 rounded font-black">
                            المادة المختارة: <strong>{selectedMaterial}</strong>
                          </span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setMaterialTest('fire')}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[9px] font-black rounded border border-red-300 cursor-pointer"
                            >
                              🔥 اختبر على النار
                            </button>
                            <button 
                              onClick={() => setMaterialTest('break')}
                              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] font-black rounded border border-blue-300 cursor-pointer"
                            >
                              🔨 اختبر الكسر والضغط
                            </button>
                          </div>
                        </div>

                        {/* Test Animate Outcome */}
                        {materialTest === 'none' ? (
                          <p className="text-slate-600 text-xs font-bold leading-relaxed">
                            {selectedMaterial === 'الخشب' && "🪵 الخشب: قوي ومتين ويتحمل الضغط والحرارة المتوسطة. نستخدمه لصناعة الكراسي والسرائر وأبواب المنازل."}
                            {selectedMaterial === 'البلاستيك' && "🥤 البلاستيك: خفيف الوزن، قوي، غير قابل للكسر السريع. نستخدمه لصناعة الألعاب الملونة وقناني الماء."}
                            {selectedMaterial === 'الزجاج' && "🥛 الزجاج: شفاف نرى من خلاله، ولكنه هشّ سريع الكسر جداً ويشكل جروحاً بالغة، لذا يحظر عمل كراسي الفصول منه."}
                            {selectedMaterial === 'الصلصال' && "🏺 الصلصال (الطين): مرن وسهل التشكيل باليد عند بلله بالماء، ويصنع منه الزير والقلة لتبريد المياه بالسودان."}
                            {selectedMaterial === 'المطاط' && "🎈 المطاط: مرن جداً ويتمدد عند شده، لذا نصنع منه البالونات وإطارات العجلات المطاطية للدراجات."}
                            {selectedMaterial === 'القماش' && "👕 القماش: متين وناعم ومرن وسهل الطي والغسيل بالصابون، وهو مناسب جداً لحياكة الملابس والستائر."}
                          </p>
                        ) : (
                          <div className="bg-[#FAF6EE] p-2.5 rounded-lg text-xs font-black text-slate-800 text-center animate-pulse border border-[#DDD4C3]">
                            {materialTest === 'fire' && (
                              <span>
                                {selectedMaterial === 'البلاستيك' && "⚠️ نتيجة الفحص: ذاب البلاستيك بسرعة وسال كيميائياً! يحظر تعريضه للنار والطهي به."}
                                {selectedMaterial === 'الخشب' && "🔥 نتيجة الفحص: يحترق الخشب ويتحول لرماد أسود غير قابل للرجوع (تغير كيميائي)."}
                                {selectedMaterial === 'الزجاج' && "🔥 نتيجة الفحص: يتحمل الزجاج الحرارة العالية ولا يحترق، لكنه قد يتشقق بالبرودة المفاجئة."}
                                {selectedMaterial === 'الصلصال' && "🏺 نتيجة الفحص: يجف الصلصال ويصبح فخاراً صلباً قوياً جداً عند حرقه بفرن الفخار!"}
                                {selectedMaterial === 'المطاط' && "⚠️ نتيجة الفحص: يحترق المطاط وتتصاعد منه روائح كريهة ومضرة بالبيئة."}
                                {selectedMaterial === 'القماش' && "⚠️ نتيجة الفحص: يحترق القماش ويذوب بسرعة، لذا يجب إبعاد الملابس عن النار."}
                              </span>
                            )}
                            {materialTest === 'break' && (
                              <span>
                                {selectedMaterial === 'الزجاج' && "💥 تحذير كسر! تكسر الزجاج وتحول لشظايا حادة وخطيرة! الزجاج مادة هشّة للغاية."}
                                {selectedMaterial === 'الخشب' && "🪵 نتيجة الفحص: الخشب صلب ومتين، يحتاج لقوة طرق هائلة ليصنع شقاً."}
                                {selectedMaterial === 'البلاستيك' && "🥤 نتيجة الفحص: البلاستيك متين ومرن يمتص الصدمة دون كسر، مما يجعله ممتازاً لألعاب الأطفال."}
                                {selectedMaterial === 'الصلصال' && "🏺 نتيجة الفحص: الأواني الفخارية هشة قد تتكسر عند سقوطها على الأرض الصلبة."}
                                {selectedMaterial === 'المطاط' && "🎈 نتيجة الفحص: يتمدد المطاط ويرتد بقوة دون أن ينكسر لمرونته الاستثنائية!"}
                                {selectedMaterial === 'القماش' && "👕 نتيجة الفحص: القماش متين وقابل للطي والشد، لا ينكسر لمرونة خيوطه المنسوجة."}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 10. Light & Shadows Simulator */}
                {activeId === 'light' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">تجربة تكون الظلال: تحكم بنوع المادة المانعة لمسار شعاع الشمعة المستقيم:</p>
                    
                    {/* Material Barriers selector */}
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => { setLightBarrier('glass'); speakWord("لوح الزجاج"); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer active:scale-95 ${lightBarrier === 'glass' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                      >
                        لوح زجاج (شفاف) 🔍
                      </button>
                      <button 
                        onClick={() => { setLightBarrier('tissue'); speakWord("منديل الشاش"); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer active:scale-95 ${lightBarrier === 'tissue' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                      >
                        منديل شاش (نصف شفاف) 🌫️
                      </button>
                      <button 
                        onClick={() => { setLightBarrier('wood'); speakWord("لوح الخشب"); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer active:scale-95 ${lightBarrier === 'wood' ? 'bg-amber-850 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                      >
                        لوح خشب (معتم) 🪵
                      </button>
                    </div>

                    {/* Bench visualizer */}
                    <div className="bg-slate-900 border-4 border-slate-800 p-4 rounded-2xl flex justify-between items-center relative overflow-hidden min-h-[140px]">
                      
                      {/* Left: Candle Source */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <span className="text-3xl animate-pulse">🕯️</span>
                        <span className="text-[9px] text-amber-300 font-black">شمعة مضيئة</span>
                      </div>

                      {/* Rays flowing */}
                      <div className="flex-1 flex justify-center items-center relative h-10">
                        {/* Golden rays */}
                        <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-100 absolute left-8 right-8 pointer-events-none opacity-80" />
                        
                        {/* The selected Barrier */}
                        <div className="bg-slate-800 border border-slate-700 p-2 rounded-lg z-20 text-center text-white min-w-[80px]">
                          {lightBarrier === 'glass' && "🔍 لوح زجاج"}
                          {lightBarrier === 'tissue' && "🌫️ منديل شاش"}
                          {lightBarrier === 'wood' && "🪵 لوح خشب"}
                        </div>
                      </div>

                      {/* Right: Screen & Shadow */}
                      <div className="flex flex-col items-center gap-1 z-10 w-24">
                        {lightBarrier === 'glass' && (
                          <div className="w-14 h-14 bg-amber-200/90 rounded-full flex items-center justify-center text-[10px] text-amber-900 font-black border-2 border-amber-400 animate-pulse">
                            مر بالكامل! ☀️
                          </div>
                        )}
                        {lightBarrier === 'tissue' && (
                          <div className="w-14 h-14 bg-amber-100/50 rounded-full flex items-center justify-center text-[9px] text-amber-800 font-black border border-amber-300/60">
                            ظل خفيف 🌫️
                          </div>
                        )}
                        {lightBarrier === 'wood' && (
                          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-[10px] text-slate-400 font-black border-2 border-slate-700 shadow-inner">
                            ظل معتم 🖤
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 font-black">حائل الاستقبال</span>
                      </div>

                    </div>

                    <p className="text-right text-xs font-bold text-slate-700 leading-relaxed bg-[#FAF6EE] p-3 border-r-4 border-[#8D7F67] rounded-l-xl">
                      💡 <strong>دليل انتشار الضوء:</strong> {
                        lightBarrier === 'glass' ? "🔍 لوح الزجاج مادة شفافة تسمح بمرور الضوء بالكامل من خلاله، لذا لا يتكون له ظل معتم على الحائل."
                        : lightBarrier === 'tissue' ? "🌫️ المنديل مادة نصف شفافة تسمح بمرور بعض الضوء فقط، فيتكون له ظل خفيف غير محدد المعالم."
                        : "🪵 لوح الخشب مادة معتمة لا تسمح بنفاذ الضوء مطلقاً، فيحجب الضوء المستقيم ويتشكل له ظل مظلم تام السواد خلفه."
                      }
                    </p>
                  </div>
                )}

                {/* 11. Electric Circuits Simulator */}
                {activeId === 'moon' && (
                  <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-slate-500 font-black">دائرة الكهرباء البسيطة المقررة: انقر لتشغيل المفتاح أو فحص الأمان:</p>
                    
                    {/* Controls */}
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => {
                          setCircuitClosed(!circuitClosed);
                          speakWord(circuitClosed ? "دائرة مفتوحة" : "دائرة مغلقة");
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer active:scale-95 flex items-center gap-1 ${circuitClosed ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                      >
                        {circuitClosed ? "🔴 افتح الدائرة الكهربية" : "🟢 أغلق المفتاح (تشغيل) 💡"}
                      </button>

                      <button
                        onClick={() => {
                          setWetHandWarning(true);
                          speakWord("الجلد");
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black cursor-pointer animate-pulse flex items-center gap-1"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        اللمس بيدك مبللة؟ 💦
                      </button>
                    </div>

                    {/* Circuit Schematic Visual Board */}
                    <div className="bg-slate-950 border-4 border-slate-900 p-4 rounded-3xl flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                      {wetHandWarning && (
                        <div className="absolute inset-0 bg-red-950/95 z-30 flex flex-col items-center justify-center p-4 border-2 border-red-500 rounded-2xl animate-pulse">
                          <AlertTriangle className="h-8 w-8 text-red-500 animate-bounce" />
                          <h4 className="text-red-400 font-black text-sm mt-1">🚨 تحذير أمان العلوم الصارم:</h4>
                          <p className="text-white text-xs leading-relaxed text-center mt-1" dir="rtl">
                            يمنع منعاً باتاً لمس مفاتيح الكهرباء المنزلية واليد مبللة بالماء لتجنب الصدمات الكهربية والماس الكهربائي القاتل!
                          </p>
                        </div>
                      )}

                      {/* Components Board */}
                      <div className="grid grid-cols-3 gap-6 items-center w-full max-w-sm">
                        {/* Battery */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-3xl">🔋</span>
                          <span className="text-[10px] text-slate-300 font-extrabold">البطارية (جافة)</span>
                        </div>

                        {/* Wires & Switch */}
                        <div className="flex flex-col items-center justify-center gap-1 relative">
                          <div className={`h-1.5 w-16 rounded transition-colors duration-300 ${circuitClosed ? 'bg-yellow-400 shadow-md shadow-yellow-200' : 'bg-slate-700'}`} />
                          <span className="text-2xl mt-1">{circuitClosed ? "🔌" : "📴"}</span>
                          <span className="text-[10px] text-slate-300 font-extrabold">{circuitClosed ? "مفتاح مغلق" : "مفتاح مفتوح"}</span>
                        </div>

                        {/* Bulb */}
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-4xl transition-all duration-300 ${circuitClosed ? 'animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'opacity-40'}`}>💡</span>
                          <span className="text-[10px] text-slate-300 font-extrabold">المصباح الصغير</span>
                        </div>
                      </div>

                      {/* State Description */}
                      <p className="text-center text-[10px] text-slate-400 mt-4">
                        {circuitClosed 
                          ? "⚡ دائرة مغلقة: يمر التيار الكهربائي من القطب الجاف عبر الأسلاك النحاسية الموصولة ليضيء المصباح."
                          : "🔌 دائرة مفتوحة: المفتاح يقطع سريان الكهرباء بوجود فجوة هوائية، فلا تمر الطاقة ولا يضيء المصباح."
                        }
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 📋 Textbook Documents Citation Cards List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-right">
                <span className="text-xs text-[#8D7F67] font-black block mb-1">📌 مقتبسات موثقة من مرجع الطالب:</span>
                <p className="text-slate-500 text-[10px]">انقر على المقتبس العلمي لتحديده وتثبيته في مستند الدراسة اللطيف:</p>
              </div>

              <div className="space-y-2.5">
                {lessonCitations.map((citation, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveCitation(citation);
                      speakWord(citation.label);
                    }}
                    className={`w-full text-right p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-2.5 ${
                      activeCitation?.id === citation.id
                        ? 'bg-[#FAF6EE] border-[#8D7F67] shadow-md shadow-slate-100'
                        : 'bg-[#FCFAF7] border-[#DDD4C3] hover:bg-white shadow-sm'
                    }`}
                  >
                    <Bookmark className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${activeCitation?.id === citation.id ? 'text-[#8D7F67] fill-[#8D7F67]' : 'text-slate-400'}`} />
                    <div className="space-y-1">
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-black px-2 py-0.5 rounded-md">
                        [{citation.id}] {citation.label}
                      </span>
                      <p className="text-slate-700 text-xs font-bold leading-relaxed line-clamp-2">
                        "{citation.quoteText}"
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Display full active citation board */}
              {activeCitation && (
                <div className="bg-[#FAF6EE] border-2 border-dashed border-[#8D7F67] p-4 rounded-2xl space-y-2 animate-fade-in text-right">
                  <div className="flex items-center gap-1.5 border-b border-dashed border-[#DDD4C3] pb-2 justify-start">
                    <Quote className="h-4 w-4 text-[#8D7F67]" />
                    <span className="text-xs text-[#8D7F67] font-black">مراجعة كامل الفقرة والصفحة:</span>
                  </div>
                  <p className="text-slate-800 text-xs font-black leading-relaxed">
                    💬 "{activeCitation.quoteText}"
                  </p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2.5 py-0.5 rounded-full">
                      📍 {activeCitation.chapterSource}
                    </span>
                    <button 
                      onClick={() => speakWord(activeCitation.quoteText)}
                      className="text-[9px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black px-2 py-1 rounded border border-emerald-300 cursor-pointer active:scale-95"
                    >
                      🔊 قراءة المقتبس كاملاً
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* ℹ️ Footnote Note of matching */}
          <div className="bg-[#FAF6EE] border border-[#DDD4C3] p-3 rounded-2xl flex items-center gap-2 justify-start">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-[10px] text-slate-600 font-extrabold leading-tight text-right">
              تذكير للعلوم والامتحان: جميع هذه الرسومات والمراجعات دُرّست بعناية من واقع كتاب الطالب لوزارة التربية والتعليم بجمهورية السودان لعام ٢٠٢٦ م.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
