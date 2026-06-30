import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Google GenAI client lazily (as recommended to avoid crashes on startup)
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY not found in environment. AI tutor will run with mock friendly answers.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface ChatMessage {
  id: string;
  studentName: string;
  studentCity: string;
  studentAvatar: string;
  content: string;
  timestamp: string;
}

// Keep 150 messages in memory with friendly seed messages
const chatMessages: ChatMessage[] = [
  {
    id: "seed-1",
    studentName: "مريم",
    studentCity: "بورتسودان",
    studentAvatar: "🌸",
    content: "يا جماعة محاكي الدورة الدموية ممتع شديد! فهمت كيف القلب بينبض ويوزع الأكسجين لكافة الجسم 😍",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "seed-2",
    studentName: "أحمد",
    studentCity: "أم درمان",
    studentAvatar: "🦁",
    content: "جربت محاكي منشور الضوء؟ بيقسم الضوء لسبعة ألوان طيفية رائعة للغاية 🌈✨ سبحان الله المبدع!",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "seed-3",
    studentName: "مازن",
    studentCity: "الخرطوم",
    studentAvatar: "🔬",
    content: "حللت تحدي اليوم وحصلت على 50 نقطة إضافية! مستواي الآن ارتفع وعايز أحقق الترتيب الأول هنا 🏆🥇",
    timestamp: new Date(Date.now() - 1200000).toISOString()
  }
];

// API: Get recent student chat messages
app.get("/api/chat", (req, res) => {
  const studentName = req.headers["x-student-name"];
  if (!studentName || String(studentName).trim() === "" || String(studentName) === "undefined") {
    return res.status(401).json({ error: "الرجاء تسجيل الدخول أولاً باسم الطالب لمشاهدة الدردشة وبث المحتوى! ⚠️" });
  }
  res.json({ messages: chatMessages });
});

// API: Post new student chat message
app.post("/api/chat", (req, res) => {
  const { studentName, studentCity, studentAvatar, content } = req.body;
  
  if (!studentName || !content || String(studentName).trim() === "") {
    return res.status(400).json({ error: "اسم الطالب والرسالة مطلوبان ومحفوظان للتلاميذ المسجلين فقط ⚠️" });
  }

  const cleanName = String(studentName).trim();
  if (cleanName.length < 2) {
    return res.status(400).json({ error: "عذراً! يجب أن يكون اسم الطالب المسجل حرفين أو أكثر ⚠️" });
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentName: cleanName.substring(0, 30),
    studentCity: String(studentCity || "السودان").substring(0, 30),
    studentAvatar: String(studentAvatar || "🦁").substring(0, 5),
    content: String(content).substring(0, 300),
    timestamp: new Date().toISOString()
  };

  chatMessages.push(newMessage);
  if (chatMessages.length > 150) {
    chatMessages.shift();
  }

  res.status(201).json({ success: true, message: newMessage });
});

// 1. API Route: AI Tutor Explainer with Gemini 3.5 Flash
app.post("/api/tutor", async (req, res) => {
  try {
    const { messages, currentContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Graceful fallback with simulated helpful teacher responses if no key provided
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const fallback = `مرحباً بك يا بطل! أنا "حكيم المعرفة" معلم العلوم السوداني الذكي. يبدو أن مفتاح الذكاء الإصطناعي (API Key) غير مفعل حالياً في إعدادات الخادم، ولكن يسعدني جداً تشجيعك على قراءة درس "${currentContext || 'العلوم للصف السادس'}". ما رأيك بأن تراجع شرح الوحدة وتلعب بالمحاكي التفاعلي المذهل وتحسن نقاطك لتصبح عالماً سودانياً متميزاً غداً؟ قل لي، ما هي الكائنات المستهلكة والمنتجة؟`;
      return res.json({ text: fallback });
    }

    const ai = getAI();
    
    // Construct simplified system instructions with Arabic-Sudanese educational tone
    const systemInstruction = `أنت "حكيم المعرفة"، المعلم الافتراضي الذكي لمادة العلوم للصف السادس الابتدائي بجمهورية السودان.
مهمتك هي مساعدة التلميذ (الولد أو البنت) على فهم دروس كتاب العلوم بأسلوب بساطة وبخت الرضا، مستخدماً لهجة سودانية ودودة ومبسطة ومحفزة أو عربية فصحى ميسرة جداً.
المنهج الذي تدرسه يشمل 8 وحدات: دوران الدم، الإخراج (الكلية والجلد والرئة)، التكاثر في النبات والزهرة، التكاثر في السمك والضفدع (أبو ذنيبة) والحشرات (ذبابة وجراد)، السلاسل الغذائية والعلاقات (تطفل وتعايش وتكافل)، التغيرات الفيزيائية والكيميائية، الضوء والمنشور والعدسات، والأرض والفضاء (أطوار القمر والكسوف والخسوف).
سياق الدرس الحالي للتلميذ هو: "${currentContext || 'المنهج العام للعلوم للصف السادس'}".
شجع التلميذ دائماً، واطرح عليه في نهاية الحديث سؤالاً بسيطاً من درس اليوم يجعله يفكر، ولا تعطه إجابات معقدة تناسب الجامعات. ابق دائماً مرحاً وهادئاً ومبنياً على الحقائق العلمية الدقيقة.`;

    // Map messages history to Gemini contents schema
    const contents = messages.map((m: any) => ({
      role: m.role === 'student' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95
      }
    });

    const reply = response.text || "عفواً يا بني، لم يستجب عقلي العلمي جيداً لهذه الفكرة. هل تعيد صياغة سؤالك الجميل بوضوح؟";
    res.json({ text: reply });

  } catch (error: any) {
    console.error("Gemini API Error in server:", error);
    res.status(500).json({ error: "فشل الخادم في معالجة طلب حكيم المعرفة الذكي.", details: error.message });
  }
});

// 2. Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
