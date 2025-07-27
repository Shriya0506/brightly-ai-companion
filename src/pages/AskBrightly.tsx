import React from 'react';
import ChatInterface from '../components/ChatInterface';

const AskBrightly: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        tabType="ask-brightly"
        gradient="from-purple-400 to-blue-500"
        placeholder="Ask me about fashion, hobbies, general knowledge, or anything else!"
      />
    </div>
  );
};

export default AskBrightly;