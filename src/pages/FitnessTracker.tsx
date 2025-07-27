import React, { useState, useEffect } from 'react';
import { Activity, Target, TrendingUp, MessageCircle, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import ChatInterface from '../components/ChatInterface';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FitnessData {
  id: string;
  date: string;
  steps: number;
  weight?: number;
  height?: number;
  activities: string[];
  duration: number; // minutes
  calories?: number;
  notes?: string;
}

interface Goal {
  type: 'steps' | 'weight' | 'activity';
  target: number;
  current: number;
  unit: string;
}

const FitnessTracker: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [fitnessData, setFitnessData] = useState<FitnessData[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([
    { type: 'steps', target: 10000, current: 0, unit: 'steps' },
    { type: 'weight', target: 70, current: 0, unit: 'kg' },
    { type: 'activity', target: 30, current: 0, unit: 'minutes' },
  ]);
  const [newEntry, setNewEntry] = useState<Omit<FitnessData, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    activities: [],
    duration: 0,
    notes: '',
  });

  useEffect(() => {
    loadFitnessData();
  }, [user]);

  useEffect(() => {
    updateGoals();
  }, [fitnessData]);

  const loadFitnessData = async () => {
    if (!user) return;

    try {
      const fitnessQuery = query(
        collection(db, 'fitness'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(fitnessQuery);
      const loadedData: FitnessData[] = [];
      querySnapshot.forEach((doc) => {
        loadedData.push({ id: doc.id, ...doc.data() } as FitnessData);
      });
      setFitnessData(loadedData);
    } catch (error) {
      console.error('Error loading fitness data:', error);
    }
  };

  const addEntry = async () => {
    if (!user) return;

    try {
      const entryId = `${user.uid}_${Date.now()}`;
      const entryData = {
        ...newEntry,
        userId: user.uid,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'fitness', entryId), entryData);
      setFitnessData([{ id: entryId, ...newEntry }, ...fitnessData]);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        activities: [],
        duration: 0,
        notes: '',
      });
      setShowAddEntry(false);
    } catch (error) {
      console.error('Error adding fitness entry:', error);
    }
  };

  const updateGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = fitnessData.find(entry => entry.date === today);
    const weekData = fitnessData.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    });

    const updatedGoals = goals.map(goal => {
      switch (goal.type) {
        case 'steps':
          return { ...goal, current: todayData?.steps || 0 };
        case 'weight':
          return { ...goal, current: todayData?.weight || 0 };
        case 'activity':
          const weeklyMinutes = weekData.reduce((sum, entry) => sum + entry.duration, 0);
          return { ...goal, current: weeklyMinutes };
        default:
          return goal;
      }
    });

    setGoals(updatedGoals);
  };

  const getBMI = () => {
    const latestEntry = fitnessData.find(entry => entry.weight && entry.height);
    if (!latestEntry || !latestEntry.weight || !latestEntry.height) return null;
    
    const heightInM = latestEntry.height / 100;
    return (latestEntry.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getWeeklyStats = () => {
    const weekData = fitnessData.slice(0, 7).reverse();
    return weekData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      steps: entry.steps,
      duration: entry.duration,
    }));
  };

  const addActivity = (activity: string) => {
    if (activity && !newEntry.activities.includes(activity)) {
      setNewEntry({
        ...newEntry,
        activities: [...newEntry.activities, activity]
      });
    }
  };

  const removeActivity = (activity: string) => {
    setNewEntry({
      ...newEntry,
      activities: newEntry.activities.filter(a => a !== activity)
    });
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-green-400 to-lime-500 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to Fitness Tracker
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="fitness-tracker"
            gradient="from-green-400 to-lime-500"
            placeholder="Ask me about workouts, nutrition, fitness goals, or health tips..."
          />
        </div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const bmi = getBMI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-lime-600 bg-clip-text text-transparent">
                Fitness Tracker
              </h1>
              <p className="text-gray-600 mt-2">Track your fitness journey with AI guidance</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-lime-600 hover:to-lime-700 transition-all transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>Chat with {userProfile?.buddyName}</span>
              </button>
              <button
                onClick={() => setShowAddEntry(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Entry</span>
              </button>
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {goals.map((goal, index) => (
              <div key={index} className="bg-gradient-to-r from-green-100 to-lime-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-lime-600 rounded-full flex items-center justify-center">
                      {goal.type === 'steps' && <Activity className="text-white" size={24} />}
                      {goal.type === 'weight' && <Target className="text-white" size={24} />}
                      {goal.type === 'activity' && <TrendingUp className="text-white" size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 capitalize">{goal.type}</h3>
                      <p className="text-sm text-gray-600">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-lime-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {fitnessData.reduce((sum, entry) => sum + entry.steps, 0).toLocaleString()}
              </div>
              <p className="text-blue-700 font-medium">Total Steps</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(fitnessData.reduce((sum, entry) => sum + entry.duration, 0) / 60)}h
              </div>
              <p className="text-purple-700 font-medium">Total Hours</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {fitnessData.reduce((sum, entry) => sum + (entry.calories || 0), 0)}
              </div>
              <p className="text-orange-700 font-medium">Calories Burned</p>
            </div>
            <div className="bg-pink-50 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-pink-600">
                {bmi || '--'}
              </div>
              <p className="text-pink-700 font-medium">BMI</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Steps</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Activity Duration</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#84cc16" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Entries */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h3>
            <div className="space-y-4">
              {fitnessData.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-lime-500 rounded-full flex items-center justify-center">
                      <Activity className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {new Date(entry.date).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {entry.steps.toLocaleString()} steps • {entry.duration} min
                        {entry.activities.length > 0 && ` • ${entry.activities.join(', ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.weight && (
                      <p className="text-sm text-gray-600">{entry.weight} kg</p>
                    )}
                    {entry.calories && (
                      <p className="text-sm text-orange-600">{entry.calories} cal</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Fitness Entry</h3>
              <div className="space-y-4">
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <input
                  type="number"
                  placeholder="Steps"
                  value={newEntry.steps}
                  onChange={(e) => setNewEntry({ ...newEntry, steps: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={newEntry.weight || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, weight: parseFloat(e.target.value) || undefined })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={newEntry.height || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, height: parseFloat(e.target.value) || undefined })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Activity duration (minutes)"
                  value={newEntry.duration}
                  onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <input
                  type="number"
                  placeholder="Calories burned (optional)"
                  value={newEntry.calories || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, calories: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activities
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newEntry.activities.map((activity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{activity}</span>
                        <button
                          onClick={() => removeActivity(activity)}
                          className="text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Running', 'Walking', 'Cycling', 'Swimming', 'Yoga', 'Gym'].map(activity => (
                      <button
                        key={activity}
                        onClick={() => addActivity(activity)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Notes (optional)"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addEntry}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-lime-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-lime-700 transition-all transform hover:scale-105"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessTracker;