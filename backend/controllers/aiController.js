import { GoogleGenerativeAI } from '@google/generative-ai';
import Expense from '../models/Expense.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
export const askAssistant = async (req, res, next) => {
  try {
    const { query, data } = req.body;

    if (!query) {
      return res.status(200).json({
        success: true,
        data: {
          answer: "Acha pehle bata kya help chahiye 🙂",
          suggestions: ["Plan day", "Save money", "Set goal"],
          followUp: "Kya karna hai?",
          voiceText: "Acha pehle bata kya help chahiye"
        }
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
    USER MESSAGE: "${query}"
    USER CONTEXT: ${JSON.stringify(data || {})}
    PERSONALITY: Friendly, smart, casual Hinglish. No long paragraphs. No bullets.
    RETURN ONLY VALID JSON: { "answer": "", "suggestions": [], "followUp": "", "voiceText": "" }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = {
        answer: "Haan thoda confuse ho gaya 😅 firse try karte hain...",
        suggestions: ["Plan day", "Focus", "Help me"],
        followUp: "Ab clearly bata kya karna hai?",
        voiceText: "Thoda issue hua. Dobara bata kya chahiye"
      };
    }

    res.status(200).json({ success: true, data: parsed });

  } catch (error) {
    const errMsg = error?.message || "";
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted")) {
      return res.status(200).json({
        success: true,
        data: {
          answer: "Bhai sach bolun toh meri limit khatam ho gayi hai aaj ke liye 😅 Google wale free mein zyada bolne nahi dete. Thodi der baad try kar!",
          suggestions: ["Koi na, aaram kar"],
          followUp: "Aur baaki sab kaisa chal raha hai?",
          voiceText: "Bhai limit khatam ho gayi hai abhi ke liye."
        }
      });
    }
    next(error);
  }
};

// @desc    Generate financial advice
// @route   POST /api/ai/financial-advice
// @access  Private
export const generateFinancialAdvice = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    if (!expenses.length) {
      return res.status(200).json({ success: true, data: { problemAreas: [], suggestions: ["Add some expenses first!"], budgetPlan: {} } });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze these expenses and provide financial advice: ${JSON.stringify(expenses)}. Return ONLY valid JSON: { "problemAreas": [], "suggestions": [], "budgetPlan": {} }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/^```json|```/g, "").trim();
    res.status(200).json({ success: true, data: JSON.parse(text) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   POST /api/ai/dashboard-summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { data } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Analyze user dashboard data: ${JSON.stringify(data)}. Return ONLY valid JSON: { "overview": {}, "todaysPlan": [], "expenseInsight": { "topCategory": "", "warning": "", "savingTip": "" }, "goalsProgress": { "currentStatus": "", "nextStep": "" }, "productivityScore": 7, "productivityAnalysis": "", "suggestions": [], "motivation": "", "textSummary": "" }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/^```json|```/g, "").trim();
    res.status(200).json({ success: true, data: JSON.parse(text) });
  } catch (error) {
    next(error);
  }
};

// @desc    Summarize a note
// @route   POST /api/ai/summarize-note
// @access  Private
export const summarizeNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return next(new ErrorResponse('Note content is required', 400));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Summarize this note: ${content}. Return ONLY valid JSON: { "text": "", "insights": [], "actions": [] }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/^```json|```/g, "").trim();
    res.status(200).json({ success: true, data: JSON.parse(text) });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate daily plan
// @route   POST /api/ai/daily-plan
// @access  Private
export const generateDailyPlan = async (req, res, next) => {
  try {
    const { tasks, habits } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Create a daily schedule 8AM-10PM based on: Tasks: ${JSON.stringify(tasks)}, Habits: ${JSON.stringify(habits)}. Return ONLY valid JSON: { "schedule": [{"time": "", "activity": "", "type": ""}], "advice": "" }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/^```json|```/g, "").trim();
    res.status(200).json({ success: true, data: JSON.parse(text) });
  } catch (error) {
    next(error);
  }
};