import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import AskBrightly from './pages/AskBrightly';
import BloomingDays from './pages/BloomingDays';
import Calculator from './pages/Calculator';
import Calendar from './pages/Calendar';
import ChatHistory from './pages/ChatHistory';
import DailyDose from './pages/DailyDose';
import FitnessTracker from './pages/FitnessTracker';
import HealthAdvice from './pages/HealthAdvice';
// import SpecialCare from './pages/SpecialCare';
import NeedFriend from './pages/NeedFriend';
import NewsWeather from './pages/NewsWeather';
import PassionLab from './pages/PassionLab';
import StudyBuddy from './pages/StudyBuddy';
import TodoList from './pages/TodoList';
import LearnHow from './pages/LearnHow';

const AppContent: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  if (user && !userProfile) {
  return <div className="text-center mt-20 text-gray-600 text-lg">Loading your profile...</div>;
}

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/ask-brightly" replace />} />
        <Route path="/ask-brightly" element={<AskBrightly />} />
        <Route path="/blooming-days" element={<BloomingDays />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/chat-history" element={<ChatHistory />} />
        <Route path="/daily-dose" element={<DailyDose />} />
        <Route path="/fitness-tracker" element={<FitnessTracker />} />
        <Route path="/health-advice" element={<HealthAdvice />} />
        {/* <Route path="/special-care" element={<SpecialCare />} /> */}
        <Route path="/need-friend" element={<NeedFriend />} />
        <Route path="/news-weather" element={<NewsWeather />} />
        <Route path="/passion-lab" element={<PassionLab />} />
        <Route path="/study-buddy" element={<StudyBuddy />} />
        <Route path="/todo-list" element={<TodoList />} />
        <Route path="/learn-how" element={<LearnHow />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;