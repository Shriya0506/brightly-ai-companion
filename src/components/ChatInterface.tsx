import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { geminiService, ChatMessage } from '../services/gemini';
import { db } from '../config/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { updateMemory } from '../config/updateMemory';
import { useLocation } from 'react-router-dom';

interface ChatInterfaceProps {
  tabType: string;
  gradient: string;
  placeholder?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ tabType, gradient, placeholder = "Type your message..." }) => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const historyChatId = urlParams.get('chatId');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(historyChatId || 'default');
  const [_chatList, setChatList] = useState<{ id: string; timestamp: string }[]>([]);
  const [tonePreference, setTonePreference] = useState<'simple' | 'detailed' | 'casual'>('simple');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatList();
  }, [tabType]);

  useEffect(() => {
    if (chatId) loadChatHistory();
  }, [chatId, tabType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatList = async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, 'chats'));
    const filtered = snapshot.docs.filter(doc => doc.id.startsWith(`${user.uid}_${tabType}`));
    const ids = filtered.map(doc => {
      const id = doc.id.split('_').pop() || 'default';
      const timestamp = doc.data()?.lastUpdated?.toDate?.().toLocaleString?.() || 'Unknown';
      return { id, timestamp };
    });
    setChatList(ids);
  };

 const loadChatHistory = async () => {
  if (!user) return;

  const ref = doc(db, 'chats', `${user.uid}_${tabType}_${chatId}`);
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    const data = docSnap.data();

    const restoredMessages = (data.messages || []).map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp),
    }));

    setMessages(restoredMessages);
  }
};

  const saveChatHistory = async (updated: ChatMessage[]) => {
    if (!user) return;
    await setDoc(doc(db, 'chats', `${user.uid}_${tabType}_${chatId}`), {
      userId: user.uid,
      tabType,
      messages: updated,
      lastUpdated: new Date()
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !user || !userProfile) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 🔁 Load memory note
    const profileSnap = await getDoc(doc(db, 'users', userProfile.uid));
    const tabMemories = profileSnap.exists() ? profileSnap.data().tabMemories || {} : {};
    const memoryNote = tabMemories[tabType] || "";

    // 🧠 Save passion lab memory
    if (tabType === 'passion-lab' && input.toLowerCase().includes('sing')) {
      await updateMemory(userProfile.uid, 'passionLab', 'User loves singing and enjoys classical music.');
    }

    try {
      const response = await geminiService.generateResponse(input.trim(), {
        age: userProfile.age,
        gender: userProfile.gender,
        buddyName: userProfile.buddyName,
        tabType,
        language: (userProfile.language || 'english') as 'english' | 'hindi',
        chatHistory: messages.slice(-10),
        tonePreference,
        memoryNote
      });

      const botReply: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, botReply];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearCurrentChat = async () => {
    if (!user) return;
    await deleteDoc(doc(db, 'chats', `${user.uid}_${tabType}_${chatId}`));
    setMessages([]);
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    setChatId(newId);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Chat with {userProfile?.buddyName}</h2>
            <p className="text-white/80 text-sm">Your AI companion is here to help</p>
            <div className="mt-3 flex items-center space-x-4">
              <label className="text-white text-sm">Tone:</label>
              <select
                value={tonePreference}
                onChange={(e) => setTonePreference(e.target.value as any)}
                className="text-black px-3 py-2 rounded-md border"
              >
                <option value="simple">✨ Simple</option>
                <option value="detailed">🎓 Detailed</option>
                <option value="casual">😎 Casual</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={startNewChat} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <RotateCcw size={20} />
            </button>
            <button onClick={clearCurrentChat} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? `bg-gradient-to-r ${gradient} text-white`
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <span className="animate-pulse text-gray-500">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
