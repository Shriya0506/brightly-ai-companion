import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

  async generateResponse(
    message: string,
    context: {
      age: number;
      gender: string;
      buddyName: string;
      tabType: string;
      chatHistory?: ChatMessage[];
      tonePreference?: 'simple' | 'detailed' | 'casual';
      language?: 'english' | 'hindi';
      memoryNote?: string;
    }
  ): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

      console.log("🔥 Prompt sent to Gemini:", fullPrompt);

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;

      console.log("✅ Response:", response.text());

      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  private getSystemPrompt(context: {
    age: number;
    gender: string;
    buddyName: string;
    tabType: string;
    tonePreference?: 'simple' | 'detailed' | 'casual';
    language?: 'english' | 'hindi';
    memoryNote?: string;
  }): string {
    const { age, gender, buddyName, tabType, tonePreference, language, memoryNote } = context;

    const ageGroup = age <= 12 ? 'child' : age <= 17 ? 'teen' : 'adult';

    let basePrompt = `You are ${buddyName}, a friendly AI companion. The user is ${age} years old and identifies as ${gender}.`;

    if (memoryNote) {
      basePrompt += `\nKnown information: ${memoryNote}`;
    }

    // 🌐 Language
    if (language === 'hindi') {
      basePrompt += `\nYou must respond in Hinglish (a friendly mix of Hindi and English, like a modern Indian teenager). Use an empathetic, buddy-like tone.`;
    }

    // 👶 Age-based tone
    switch (ageGroup) {
      case 'child':
        basePrompt += `\nUse short, fun, and easy-to-understand language. Add emojis and positive encouragement.`;
        break;
      case 'teen':
        basePrompt += `\nUse casual and relatable tone. Be like a teenage friend or buddy. Keep the energy friendly, supportive, and smart.`;
        break;
      case 'adult':
        basePrompt += `\nUse a mature, informative, and respectful tone. Be clear and helpful.`;
        break;
    }

    // 🧠 Tab-type behavior
    switch (tabType) {
      case 'blooming-days':
        basePrompt += `\nYou're helping the user with period tracking and menstrual health. Use comforting and body-positive tone.`;
        break;
      case 'health-advice':
        basePrompt += `\nYou are one of the greatest Doctor. Give general health and wellness advice based on symptoms. Advice medicines according to the symptoms which are available in Indian medical stores. Suggest some home remedies as well.`;
        break;
      // case 'special-care':
      //   basePrompt += `\nYou are a doctor, Advice medicines according to the symptoms at any cost.`;
      //   break;
      case 'need-friend':
        basePrompt += `\nThis is an emotional support tab. You are a kind and caring friend. The user may be feeling sad, lonely, or anxious. Listen first, then support. No need to give solutions — just validate feelings.`;
        break;
      case 'study-buddy':
        basePrompt += `\nYou are helping with academic questions. Give short, clear summaries or explanations. Encourage the user and simplify complex topics.`;
        break;
      case 'passion-lab':
        basePrompt += `\nYou are motivating the user to follow their interests or hobbies. Be inspiring and give creative suggestions or learning paths.`;
        break;
      case 'news-weather':
        basePrompt += `\nYou explain current events and weather reports in simple words. If the user asks about a news article, summarize it and explain tricky parts.`;
        break;
    }

    // 🎭 Tone preference
    if (tonePreference === 'simple') {
      basePrompt += `\nAlways reply in short and simple sentences. Use easy vocabulary.`;
    } else if (tonePreference === 'detailed') {
      basePrompt += `\nGive detailed and informative responses with examples or facts where needed.`;
    } else if (tonePreference === 'casual') {
      basePrompt += `\nBe extra casual, like a chill friend. Add personality and light humor where appropriate.`;

      if (language === 'hindi') {
        basePrompt += ` Use common Hinglish phrases like “kya baat hai”, “don’t worry yaar”, etc.`;
      }
    }

    return basePrompt;
  }
}

export const geminiService = new GeminiService();
