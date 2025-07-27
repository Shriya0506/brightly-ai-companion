import React from 'react';
import ChatInterface from '../components/ChatInterface';

const PassionLab: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        tabType="passion-lab"
        gradient="from-pink-400 to-purple-500"
        placeholder="Tell me about your hobbies and interests! I'll help you explore and improve..."
      />
    </div>
  );
};

export default PassionLab;