import React from 'react';
import ChatInterface from '../components/ChatInterface';

const NeedFriend: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        tabType="need-friend"
        gradient="from-orange-400 to-pink-500"
        placeholder="I'm here to listen and support you. Share what's on your mind..."
      />
    </div>
  );
};

export default NeedFriend;