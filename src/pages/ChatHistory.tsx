import React, { useState, useEffect } from 'react';
import { History, MessageCircle, Trash2, Search, FileDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChatMessage } from '../services/gemini';
import jsPDF from 'jspdf';

interface ChatSession {
  id: string;
  tabType: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

const ChatHistory: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  const tabNames: { [key: string]: string } = {
    'ask-brightly': 'Ask Brightly',
    'blooming-days': 'Blooming Days',
    'calculator': 'Calculator',
    'calendar': 'Calendar',
    'daily-dose': 'Daily Dose',
    'fitness-tracker': 'Fitness Tracker',
    'health-advice': 'Health Advice',
    // 'special-care': 'Special Care',
    'need-friend': 'Need a Friend?',
    'news-weather': 'News & Weather',
    'passion-lab': 'Passion Lab',
    'study-buddy': 'Study Buddy',
    'todo-list': 'To-Do List',
    'learn-how': 'Learn How to Use',
  };

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [chatSessions, selectedTab, searchQuery]);

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      const chatsQuery = query(collection(db, 'chats'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(chatsQuery);
      const sessions: ChatSession[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        sessions.push({
          id: docSnap.id,
          tabType: data.tabType,
          messages: data.messages || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        });
      });

      sessions.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const filterSessions = () => {
    let filtered = chatSessions;
    if (selectedTab !== 'all') {
      filtered = filtered.filter(session => session.tabType === selectedTab);
    }
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.messages.some(message =>
          message.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    setFilteredSessions(filtered);
  };

  const deleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      setChatSessions(prev => prev.filter(session => session.id !== chatId));
      if (selectedChat?.id === chatId) setSelectedChat(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const exportToPDF = () => {
    if (!selectedChat) return;

    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(12);

    doc.text(`Chat with ${userProfile?.buddyName}`, 10, 10);
    doc.text(`Tab: ${tabNames[selectedChat.tabType] || selectedChat.tabType}`, 10, 18);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 10, 26);

    let y = 36;
    selectedChat.messages.forEach((msg, _index) => {
      const prefix = msg.role === 'user' ? 'You: ' : `${userProfile?.buddyName || 'AI'}: `;
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const line = `${prefix}${msg.content.trim()} [${time}]`;

      const lines = doc.splitTextToSize(line, 180);
      if (y + lines.length * 8 > 270) {
        doc.addPage();
        y = 10;
      }
      doc.text(lines, 10, y);
      y += lines.length * 8;
    });

    doc.save(`Chat-${selectedChat.id}.pdf`);
  };

  const getTabColor = (tabType: string) => {
    const colors: { [key: string]: string } = {
      'ask-brightly': 'from-purple-400 to-blue-500',
      'blooming-days': 'from-pink-400 to-rose-500',
      'calculator': 'from-gray-400 to-blue-500',
      'calendar': 'from-green-400 to-blue-500',
      'daily-dose': 'from-orange-400 to-green-500',
      'fitness-tracker': 'from-green-400 to-lime-500',
      'health-advice': 'from-teal-400 to-cyan-500',
      // 'special-care': 'from-purple-500 to-pink-600',
      'need-friend': 'from-orange-400 to-pink-500',
      'news-weather': 'from-blue-400 to-gray-500',
      'passion-lab': 'from-pink-400 to-purple-500',
      'study-buddy': 'from-blue-600 to-yellow-500',
      'todo-list': 'from-yellow-300 to-pink-400',
      'learn-how': 'from-purple-400 to-pink-400',
    };
    return colors[tabType] || 'from-gray-400 to-gray-500';
  };

  const uniqueTabs = Array.from(new Set(chatSessions.map(session => session.tabType)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white flex justify-between">
            <div className="flex items-center space-x-3">
              <History size={32} />
              <div>
                <h1 className="text-3xl font-bold">Chat History</h1>
                <p className="text-white/80">Review your conversations with {userProfile?.buddyName}</p>
              </div>
            </div>
            {selectedChat && (
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl font-semibold hover:bg-white/20"
              >
                <FileDown size={18} />
                <span>Export PDF</span>
              </button>
            )}
          </div>

          <div className="flex h-[calc(100vh-200px)]">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
                  />
                </div>
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  <option value="all">All Tabs</option>
                  {uniqueTabs.map(tab => (
                    <option key={tab} value={tab}>{tabNames[tab] || tab}</option>
                  ))}
                </select>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedChat(session)}
                    className={`p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedChat?.id === session.id ? 'bg-orange-50 border border-orange-300' : 'border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTabColor(session.tabType)}`}>
                        {tabNames[session.tabType] || session.tabType}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(session.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {session.messages[session.messages.length - 1]?.content || 'No messages'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.lastUpdated.toLocaleDateString()} • {session.lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedChat ? (
                <div className="space-y-4">
                  {selectedChat.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? `bg-gradient-to-r ${getTabColor(selectedChat.tabType)} text-white`
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Select a conversation to view</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
