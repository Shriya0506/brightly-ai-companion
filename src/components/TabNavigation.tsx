import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageCircle, Calendar, Calculator, History,
  Pill, Activity, Stethoscope, Users, Newspaper,
  Palette, BookOpen, CheckSquare, HelpCircle, Flower2
} from 'lucide-react';

interface TabNavigationProps {
  onTabChange?: () => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const tabs = [
    { id: 'ask-brightly', name: 'Ask Brightly', icon: MessageCircle, gradient: 'from-purple-400 to-blue-500' },
    { id: 'blooming-days', name: 'Blooming Days', icon: Flower2, gradient: 'from-pink-400 to-rose-500', genderRestricted: 'Girl' },
    { id: 'calculator', name: 'Calculator', icon: Calculator, gradient: 'from-gray-400 to-blue-500' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, gradient: 'from-green-400 to-blue-500' },
    { id: 'chat-history', name: 'Chat History', icon: History, gradient: 'from-yellow-400 to-orange-500' },
    { id: 'daily-dose', name: 'Daily Dose', icon: Pill, gradient: 'from-orange-400 to-green-500' },
    { id: 'fitness-tracker', name: 'Fitness Tracker', icon: Activity, gradient: 'from-green-400 to-lime-500' },
    { id: 'health-advice', name: 'Health Advice', icon: Stethoscope, gradient: 'from-teal-400 to-cyan-500' },
    // { id: 'special-care', name: 'Special Care', icon: Shield, gradient: 'from-purple-500 to-pink-600' },
    { id: 'need-friend', name: 'Need a Friend?', icon: Users, gradient: 'from-orange-400 to-pink-500' },
    { id: 'news-weather', name: 'News & Weather', icon: Newspaper, gradient: 'from-blue-400 to-gray-500' },
    { id: 'passion-lab', name: 'Passion Lab', icon: Palette, gradient: 'from-pink-400 to-purple-500' },
    { id: 'study-buddy', name: 'Study Buddy', icon: BookOpen, gradient: 'from-blue-600 to-yellow-500' },
    { id: 'todo-list', name: 'To-Do List', icon: CheckSquare, gradient: 'from-yellow-300 to-pink-400' },
    { id: 'learn-how', name: 'Learn How to Use', icon: HelpCircle, gradient: 'from-purple-400 to-pink-400' },
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.genderRestricted && userProfile?.gender !== tab.genderRestricted) {
      return false;
    }
    return !userProfile?.hiddenTabs?.includes(tab.id);
  });

  const handleTabClick = (tabId: string) => {
    navigate(`/${tabId}`);
    onTabChange?.();
  };

  return (
    <nav className="px-4 space-y-2">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === `/${tab.id}`;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <Icon size={20} />
            <span className="font-medium text-sm">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;