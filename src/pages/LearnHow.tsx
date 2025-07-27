import React, { useState } from 'react';
import {
  MessageCircle, Book, Video, FileText, Calendar, Calculator,
  HeartPulse, Shield, Users, Newspaper, Palette, CheckSquare,
  HelpCircle, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
}

const LearnHow: React.FC = () => {
  const { userProfile } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const guides: GuideSection[] = [
    {
      id: 'ask-brightly',
      title: 'Ask Brightly',
      description: 'Chat with your AI companion about anything!',
      icon: <MessageCircle size={24} />,
      content: [
        'Start a conversation by typing your question or concern',
        'Ask about fashion, hobbies, school, moods, or general knowledge',
        'Use natural language — no special commands needed',
        'Your AI adapts based on your age and preferences',
        'Chat history is saved for easy access'
      ]
    },
    {
      id: 'blooming-days',
      title: 'Blooming Days (Girls Only)',
      description: 'Track your menstrual cycle with support',
      icon: <Book size={24} />,
      content: [
        'Enter your last period start date to begin tracking',
        'Set your usual cycle and period length',
        'Get predicted next dates and reminders',
        'Chat for emotional support during periods',
        'Record mood and symptoms daily'
      ]
    },
    {
      id: 'calculator',
      title: 'Calculator',
      description: 'Simple and scientific calculations',
      icon: <Calculator size={24} />,
      content: [
        'Perform quick math directly inside the app',
        'Supports percentages, square roots, and memory keys',
        'Useful for daily needs and school work'
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Manage your schedule and reminders',
      icon: <Calendar size={24} />,
      content: [
        'Add personal events like exams, birthdays, or goals',
        'Get daily notifications and summaries',
        'Sync reminders across tabs like Study Buddy and Fitness Tracker'
      ]
    },
    {
      id: 'chat-history',
      title: 'Chat History',
      description: 'View and manage your past chats',
      icon: <History size={24} />,
      content: [
        'See all saved conversations from every tab',
        'Search or filter by tab type',
        'Click any chat to reopen it fully',
        'Delete or start fresh chats anytime'
      ]
    },
    {
      id: 'daily-dose',
      title: 'Daily Dose',
      description: 'Medicine reminder and tracker',
      icon: <HeartPulse size={24} />,
      content: [
        'Log medicines and daily supplements',
        'Set reminders for each dose',
        'Get gentle notifications to stay consistent',
        'Track past doses for safety'
      ]
    },
    {
      id: 'fitness-tracker',
      title: 'Fitness Tracker',
      description: 'Track steps, workouts, BMI, and more',
      icon: <Video size={24} />,
      content: [
        'Log daily steps and activity',
        'Calculate BMI using your height and weight',
        'Track fitness goals weekly',
        'Get motivational tips from your AI coach'
      ]
    },
    {
      id: 'health-advice',
      title: 'Health Advice',
      description: 'Get medicine suggestions and home remedies',
      icon: <Shield size={24} />,
      content: [
        'Type your health issue (e.g. headache, cold, asthma)',
        'Get AI-suggested medicine names (common OTC)',
        'Also receive home remedy suggestions',
        'AI reminds you to consult a doctor if needed'
      ]
    },
    {
      id: 'need-friend',
      title: 'Need a Friend?',
      description: 'Emotional support through tough times',
      icon: <Users size={24} />,
      content: [
        'Feeling lonely, anxious or bullied? Chat freely',
        'Your AI buddy is here to listen and support',
        'Talk in Hinglish or Hindi if you like',
        'Everything you say stays private'
      ]
    },
    {
      id: 'news-weather',
      title: 'News & Weather',
      description: 'Stay updated and get explanations',
      icon: <Newspaper size={24} />,
      content: [
        'Read top news headlines based on your city',
        'See weather forecast for your location',
        'Click “Explain” to have AI summarize news',
        'Ask questions like “What does El Niño mean?”'
      ]
    },
    {
      id: 'passion-lab',
      title: 'Passion Lab',
      description: 'Explore and grow your hobbies',
      icon: <Palette size={24} />,
      content: [
        'Talk about your passions like music, dance, coding, or art',
        'Get YouTube links and resources',
        'Ask your buddy to remember your hobbies',
        'Track improvements or new ideas every week'
      ]
    },
    {
      id: 'study-buddy',
      title: 'Study Buddy',
      description: 'Homework help and study plans',
      icon: <FileText size={24} />,
      content: [
        'Ask chapter summaries and explanations',
        'Get help with tough homework questions',
        'Create study plans or revision schedules',
        'Get suggestions for notes and projects'
      ]
    },
    {
      id: 'todo-list',
      title: 'To-Do List',
      description: 'Jot down goals and reminders',
      icon: <CheckSquare size={24} />,
      content: [
        'Add tasks like “Submit maths project” or “Call grandma”',
        'Mark items done with a tap',
        'Edit and delete any task',
        'No date required — simple and free-form'
      ]
    },
    {
      id: 'learn-how',
      title: 'Learn How to Use',
      description: 'Help for every feature in Brightly',
      icon: <HelpCircle size={24} />,
      content: [
        'Read step-by-step guides for every tab',
        'Watch tutorials (coming soon!)',
        'Ask your buddy for help at any time',
        'Explore tips for privacy, safety, and setup'
      ]
    }
  ];

  const quickTips = [
    {
      title: 'Getting Started',
      tips: [
        'Complete your profile in Settings for personalized support',
        'Name your AI buddy something special to you',
        'Explore different tabs and discover what you love',
        'Your buddy adapts as you use Brightly more'
      ]
    },
    {
      title: 'Making the Most of Brightly',
      tips: [
        'Use the chat in every tab to ask anything',
        'Check your bell icon for reminders and updates',
        'Review chat history to reflect and learn',
        'Customize which tabs are visible in Settings'
      ]
    },
    {
      title: 'Privacy & Safety',
      tips: [
        'Your data is secure and encrypted',
        'You can delete any chat at any time',
        'Only you can see your activity',
        'Serious health concerns? Always talk to a real doctor too'
      ]
    }
  ];

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to Learn How
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="learn-how"
            gradient="from-purple-400 to-pink-400"
            placeholder="Ask me how to use any feature in Brightly..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Brightly Intro */}
          <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-purple-700 mb-2">What is Brightly?</h2>
            <p className="text-gray-800">
              <strong>Brightly</strong> is an AI-powered buddy made for <strong>everyone</strong> — for all <strong>ages</strong>, <strong>genders</strong>, and <strong>personal needs</strong>.
              Whether you're a child, teen, or adult — Brightly adapts to you with <strong>age-appropriate, friendly, and helpful guidance</strong>.
            </p>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                Learn How to Use Brightly
              </h1>
              <p className="text-gray-600 mt-2">Master all features with step-by-step guides</p>
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              <MessageCircle size={20} />
              <span>Ask {userProfile?.buddyName}</span>
            </button>
          </div>

          {/* Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide) => (
              <div key={guide.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setSelectedGuide(selectedGuide === guide.id ? null : guide.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-purple-600">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{guide.title}</h3>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </button>
                {selectedGuide === guide.id && (
                  <div className="px-6 pb-6">
                    <ul className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {guide.content.map((item, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <span className="bg-purple-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tips & FAQ */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickTips.map((section, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.tips.map((tip, j) => (
                      <li key={j} className="flex space-x-3 items-start">
                        <div className="w-2 h-2 mt-2 bg-purple-400 rounded-full" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnHow;
