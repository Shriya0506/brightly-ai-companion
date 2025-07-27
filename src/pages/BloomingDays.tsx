import _React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext"; 
import { Flower2, Calendar, Heart, Info, Droplets, Sparkles, Send } from 'lucide-react';

const BloomingDays = () => {
  const { userProfile } = useAuth();
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const [_currentDate, _setCurrentDate] = useState(new Date());
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateNextPeriod = () => {
    if (!lastPeriod) return null;
    const lastDate = new Date(lastPeriod);
    const nextDate = new Date(lastDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);
    return nextDate;
  };

  const getDaysUntilNext = () => {
    const nextPeriod = calculateNextPeriod();
    if (!nextPeriod) return null;
    const today = new Date();
    const timeDiff = nextPeriod.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getAgeAppropriateContent = () => {
    const age = userProfile?.age || 16;

    if (age < 13) {
      return {
        title: "Understanding Your Body",
        description: "It's normal for your body to change as you grow. Blooming Days helps you track those changes, and you can ask Brightly any questions you may have.",
        tips: [
          "Use this tracker to note changes",
          "Talk to a trusted adult",
          "Every girl's body is unique",
          "Ask Brightly anything you're curious about!"
        ]
      };
    } else if (age < 16) {
      return {
        title: "Period Tracking & Care",
        description: "Blooming Days helps you track your cycle, predicts your period, and gives gentle reminders. It also suggests products and care tips suited for your age.",
        tips: [
          "Check this calendar often",
          "Pack essentials ahead of time",
          "Hydrate and eat well",
          "Light yoga helps with cramps",
          "Ask Brightly about safe products for teens"
        ]
      };
    } else {
      return {
        title: "Cycle Wellness & Health",
        description: "This tab acts as your period calendar and wellness guide. It provides advice, product suggestions, emotional support, and adapts to your body's pattern.",
        tips: [
          "Log your cycle every month",
          "Practice hygiene and self-care",
          "Try iron-rich foods",
          "Exercise regularly",
          "Ask Brightly for product and wellness advice"
        ]
      };
    }
  };

  const fetchAIResponse = async (query: string) => {
  try {
    setIsLoading(true);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Brightly, a sweet AI companion helping girls with period tracking, cravings, cramps, mood swings, and product suggestions. Provide age-appropriate and sensitive responses based on the user's age (${userProfile?.age || "unknown"}).`,
          },
          {
            role: "user",
            content: query,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      setAiAnswer(data.choices[0].message.content.trim());
    } else {
      setAiAnswer("Sorry, Brightly didn't understand. Try rephrasing your question.");
    }
  } catch (error) {
    console.error("Brightly AI error:", error);
    setAiAnswer("Oops! Brightly couldn't respond right now. Please try again later.");
  } finally {
    setIsLoading(false);
  }
};

const handleAsk = async () => {
  if (!question.trim()) return;

  setIsLoading(true);
  setAiAnswer('');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: question }],
              role: "user"
            }
          ]
        }),
      }
    );

    const data = await response.json();
    console.log("🟡 Gemini Raw Response:", data);

    const candidate = data?.candidates?.[0];

    if (candidate && candidate.content && candidate.content.parts) {
      const textPart = candidate.content.parts[0].text;
      console.log("✅ Parsed Text:", textPart);
      setAiAnswer(textPart);
    } else {
      console.log("❌ Unexpected structure:", data);
      setAiAnswer("Sorry, Brightly couldn’t find an answer.");
    }
  } catch (error) {
    console.error('🔥 Error while calling Gemini:', error);
    setAiAnswer('Something went wrong while contacting Brightly.');
  } finally {
    setIsLoading(false);
  }
};

  const content = getAgeAppropriateContent();
  const daysUntilNext = getDaysUntilNext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Flower2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-poppins">Blooming Days</h2>
            <p className="text-white/80">Your personal wellness companion</p>
          </div>
        </div>
      </div>

      {/* Period Tracker */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-pink-500" />
          Period Tracker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycle Length (days)
            </label>
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              min="21"
              max="35"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {daysUntilNext !== null && (
          <div className="mt-6 p-4 bg-pink-50 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Droplets className="w-6 h-6 text-pink-600" />
              <div>
                <p className="font-medium text-pink-800">
                  Next Period Prediction
                </p>
                <p className="text-pink-700">
                  {daysUntilNext > 0
                    ? `Expected in ${daysUntilNext} days`
                    : daysUntilNext === 0
                    ? "Expected today"
                    : "May be late - consider tracking more data"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Age-appropriate content */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins flex items-center">
          <Heart className="w-6 h-6 mr-2 text-pink-500" />
          {content.title}
        </h3>

        <p className="text-gray-600 mb-4">{content.description}</p>

        <div className="space-y-3">
          {content.tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-pink-50 rounded-xl">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-pink-500" />
          Ask Brightly
        </h3>
        <div className="space-y-4">
          <textarea
            className="w-full p-4 border border-pink-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
            rows={3}
            placeholder="Ask something about your cycle, symptoms, mood, or what products to use..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            onClick={handleAsk}
            className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" /> <span>Ask Brightly</span>
          </button>
          {isLoading ? (
            <p className="text-pink-500 font-medium">Brightly is thinking...</p>
          ) : (
            aiAnswer && <p className="text-gray-700 bg-pink-50 p-4 rounded-xl whitespace-pre-line">{aiAnswer}</p>
          )}
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Remember</p>
            <p className="text-blue-700 text-sm">
              Blooming Days is your personal cycle and care tracker. If you experience severe pain or need help deciding on safe products or remedies, just ask Brightly, or talk to a trusted adult.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloomingDays;