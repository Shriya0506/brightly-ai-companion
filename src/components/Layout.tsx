import React, { useState, useEffect } from 'react'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Settings, LogOut, HelpCircle, Menu, X } from 'lucide-react';
import TabNavigation from './TabNavigation';
import SettingsModal from './SettingsModal';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBellPopup, setShowBellPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const [reminders, setReminders] = useState<string[]>([]);

useEffect(() => {
  if (!userProfile?.uid) return;

  const fetchReminders = async () => {
    try {
      const docRef = doc(db, 'users', userProfile.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      const storedReminders = data?.reminders || [];
      setReminders(storedReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  fetchReminders();
}, [userProfile?.uid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src="/BRIGHTLY-removebg-preview.png"
                alt="Brightly"
                className="w-10 h-10 rounded-full"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Brightly
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-4 relative">
              <span className="text-gray-700 font-medium">
                Hello, {userProfile?.name}!
              </span>

              {/* 🔔 Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowBellPopup(!showBellPopup)}
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                    {reminders.length}
                  </span>
                </button>

                {showBellPopup && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 text-sm">
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b">Notifications</div>
                    {reminders.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">No new reminders</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {reminders.map((item, idx) => (
                          <li key={idx} className="px-4 py-2 text-gray-700 hover:bg-gray-50">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userProfile?.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/learn-how');
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle size={16} />
                      <span>Help</span>
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        <div
          className={`${
            showMobileMenu ? 'block' : 'hidden'
          } md:block fixed md:relative inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100 transform transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto pt-4">
            <TabNavigation onTabChange={() => setShowMobileMenu(false)} />
          </div>
        </div>

        <main className="flex-1 min-h-screen">{children}</main>
      </div>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default Layout;