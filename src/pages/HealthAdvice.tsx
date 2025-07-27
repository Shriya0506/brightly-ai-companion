import React from 'react';
import ChatInterface from '../components/ChatInterface';

const HealthAdvice: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        tabType="health-advice"
        gradient="from-teal-400 to-cyan-500"
        placeholder="Ask me about symptoms, health concerns, home remedies, or wellness tips..."
      />
    </div>
  );
};

export default HealthAdvice;