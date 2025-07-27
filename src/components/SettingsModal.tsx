import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import { updatePassword } from 'firebase/auth'; // ✅ Added
import { auth } from '../config/firebase'; // ✅ For current user

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    age: userProfile?.age || 0,
    gender: userProfile?.gender || '',
    email: userProfile?.email || '',
    country: userProfile?.country || '',
    state: userProfile?.state || '',
    city: userProfile?.city || '',
    buddyName: userProfile?.buddyName || 'Brightly',
    notificationsEnabled: userProfile?.notificationsEnabled ?? true,
  });

  const [hiddenTabs, setHiddenTabs] = useState<string[]>(userProfile?.hiddenTabs || []);

  const tabs = [
    { id: 'ask-brightly', name: 'Ask Brightly' },
    { id: 'blooming-days', name: 'Blooming Days' },
    { id: 'calculator', name: 'Calculator' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'chat-history', name: 'Chat History' },
    { id: 'daily-dose', name: 'Daily Dose' },
    { id: 'fitness-tracker', name: 'Fitness Tracker' },
    { id: 'health-advice', name: 'Health Advice' },
    // { id: 'special-care', name: 'Special Care' },
    { id: 'need-friend', name: 'Need a Friend?' },
    { id: 'news-weather', name: 'News & Weather' },
    { id: 'passion-lab', name: 'Passion Lab' },
    { id: 'study-buddy', name: 'Study Buddy' },
    { id: 'todo-list', name: 'To-Do List' },
    { id: 'learn-how', name: 'Learn How to Use' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    setSuccessMessage('');

    try {
      // ✅ Update profile info
      await updateProfile({
        ...formData,
        hiddenTabs,
      });

      // ✅ Optional password update
      if (password.length >= 6) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updatePassword(currentUser, password);
          setSuccessMessage('Profile and password updated successfully!');
        }
      } else if (password.length > 0 && password.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
      } else {
        setSuccessMessage('Profile updated successfully!');
      }

      if (!passwordError) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating:', error);
      setPasswordError('Error updating password. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleTabVisibility = (tabId: string) => {
    setHiddenTabs(prev =>
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="px-4 py-3 rounded-xl border">
              <option value="Girl">Girl</option>
              <option value="Boy">Boy</option>
              <option value="Other">Other</option>
            </select>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
          </div>

          {/* Password Update */}
          <div>
            <input
              type="password"
              placeholder="New Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
            />
            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* AI Companion */}
          <input
            type="text"
            name="buddyName"
            placeholder="AI Buddy Name"
            value={formData.buddyName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border"
          />

          {/* Notifications */}
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600"
            />
            <span>Enable notifications</span>
          </label>

          {/* Tab Visibility */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Tab Visibility</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tabs.map(tab => (
                <label key={tab.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!hiddenTabs.includes(tab.id)}
                    onChange={() => toggleTabVisibility(tab.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{tab.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {successMessage && <p className="text-green-600 text-sm mt-2 text-center">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
