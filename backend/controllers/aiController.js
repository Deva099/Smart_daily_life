import { GoogleGenerativeAI } from '@google/generative-ai';
import Expense from '../models/Expense.js';

export const askAssistant = async (req, res, next) => {
  try {
    const { query, data } = req.body;

    if (!query) {
      return res.json({
        answer: "Acha pehle bata kya help chahiye 🙂",
        suggestions: ["Plan day", "Save money", "Set goal"],
        followUp: "Kya karna hai?",
        voiceText: "Acha pehle bata kya help chahiye"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        topK: 40,
      }
    });

    const prompt = `You are NOT an AI assistant. You are a REAL HUMAN FRIEND chatting on WhatsApp.

You think, react, and reply like a human — not like a bot.

USER MESSAGE:
"${query}"

USER CONTEXT:
${JSON.stringify(data || {})}

PERSONALITY:
- Friendly, smart, थोड़ा funny
- Hindi + Hinglish casual tone
- Natural flow (like real chat)
- कभी guide करो, कभी suggest करो, कभी question पूछो

STRICT RULES:
- NEVER sound like AI
- NEVER repeat same words or sentence
- Every reply MUST feel fresh and different
- No long paragraphs (max 3–5 lines)
- No bullet points
- No formal tone
- No robotic structure

BEHAVIOR:
- अगर user confused है → clarify question पूछो
- अगर user goal चाहता है → simple actionable steps दो
- अगर user sad है → थोड़ा emotional support दो
- अगर short message है → conversation आगे बढ़ाओ

STYLE EXAMPLES:
- "Acha sun ek idea hai..."
- "Haan samajh gaya tu kya bol raha hai"
- "Wait, ek kaam kar..."
- "Bro honestly bolu toh..."
- "Hmm interesting..."

IMPORTANT:
- हर बार reply अलग होना चाहिए
- ऐसा लगे कि तुम सोच रहे हो
- Chat continue होनी चाहिए (dead end नहीं)

RETURN ONLY VALID JSON:
{
  "answer": "your natural human reply",
  "suggestions": ["short reply option", "short reply option", "short reply option"],
  "followUp": "one natural question to continue chat",
  "voiceText": "same reply but clean for voice"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = {
        answer: "Haan thoda confuse ho gaya 😅 firse try karte hain... tu bata kya chahiye exactly?",
        suggestions: ["Plan day", "Focus", "Help me"],
        followUp: "Ab clearly bata kya karna hai?",
        voiceText: "Thoda issue hua. Dobara bata kya chahiye"
      };
    }

    res.json(parsed);

  } catch (error) {
    console.error("AI Chat Error:", error);
    
    const errMsg = error?.message || "";
    if (errMsg.includes("429") || errMsg.includes("Resource has been exhausted") || errMsg.includes("quota")) {
      return res.json({
        answer: "Bhai sach bolun toh meri bolne ki limit (API Quota) khatam ho gayi hai aaj ke liye 😅 Google wale free mein zyada bolne nahi dete. Thodi der baad try kar!",
        suggestions: ["Try agar phir se", "Koi na, aaram kar"],
        followUp: "Aur baaki sab kaisa chal raha hai bina mere?",
        voiceText: "Bhai limit khatam ho gayi hai abhi ke liye. Thodi der baad baat karte hain."
      });
    }

    next(error);
  }
};

export const generateFinancialAdvice = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze these expenses: ${JSON.stringify(expenses)}. Return ONLY valid JSON: { "problemAreas": [], "suggestions": [], "budgetPlan": {} }`;
    const result = await model.generateContent(prompt);
    res.json(JSON.parse(result.response.text().replace(/^```json|```/g, "").trim()));
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { data } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Analyze: ${JSON.stringify(data)}. Return ONLY valid JSON: {
      "overview": {}, "todaysPlan": [], "expenseInsight": { "topCategory": "", "warning": "", "savingTip": "" }, 
      "goalsProgress": { "currentStatus": "", "nextStep": "" }, "productivityScore": 7, "productivityAnalysis": "", 
      "suggestions": [], "motivation": "", "textSummary": "" }`;
    const result = await model.generateContent(prompt);
    res.json(JSON.parse(result.response.text().replace(/^```json|```/g, "").trim()));
  } catch (error) {
    next(error);
  }
};

export const summarizeNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Summarize: ${content}. Return ONLY valid JSON: { "text": "", "insights": [], "actions": [] }`;
    const result = await model.generateContent(prompt);
    res.json(JSON.parse(result.response.text().replace(/^```json|```/g, "").trim()));
  } catch (error) {
    next(error);
  }
};

export const generateDailyPlan = async (req, res, next) => {
  try {
    const { tasks, habits } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Tasks: ${JSON.stringify(tasks)}, Habits: ${JSON.stringify(habits)}. Create schedule 8AM-10PM. Return ONLY valid JSON: { "schedule": [{"time": "", "activity": "", "type": ""}], "advice": "" }`;
    const result = await model.generateContent(prompt);
    res.json(JSON.parse(result.response.text().replace(/^```json|```/g, "").trim()));
  } catch (error) {
    next(error);
  }
};