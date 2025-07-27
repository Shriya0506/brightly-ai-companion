import React from 'react';
import ChatInterface from '../components/ChatInterface';

const SpecialCare: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        tabType="special-care"
        gradient="from-purple-500 to-pink-600"
        placeholder="Share your health concerns. I'm here to provide sensitive support and guidance..."
      />
    </div>
  );
};

export default SpecialCare;