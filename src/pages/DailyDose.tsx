import React, { useState, useEffect } from 'react';
import { Pill, Plus, Check, X, MessageCircle, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, setDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import ChatInterface from '../components/ChatInterface';

interface Medication {
  id: string;
  userId: string; 
  createdAt: Date;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  taken: { [date: string]: { [time: string]: boolean } };
}

const DailyDose: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMed, setNewMed] = useState<Omit<Medication, 'id' | 'taken' | 'userId' | 'createdAt'>>({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadMedications();
  }, [user]);

  const loadMedications = async () => {
    if (!user) return;

    try {
      const medsQuery = query(
        collection(db, 'medications'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(medsQuery);
      const loadedMeds: Medication[] = [];
      querySnapshot.forEach((doc) => {
        loadedMeds.push({ id: doc.id, ...doc.data() } as Medication);
      });
      setMedications(loadedMeds);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const addMedication = async () => {
    if (!user || !newMed.name || !newMed.dosage) return;
    console.log
    try {
      const medId = `${user.uid}_${Date.now()}`;
      const medData: Medication = {
        ...newMed,
        id: medId,
        userId: user.uid,
        taken: {},
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'medications', medId), medData);
      setMedications([...medications, medData]);
      setNewMed({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowAddMed(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const markAsTaken = async (medId: string, date: string, time: string, taken: boolean) => {
    try {
      const medIndex = medications.findIndex(med => med.id === medId);
      if (medIndex === -1) return;

      const updatedMeds = [...medications];
      if (!updatedMeds[medIndex].taken[date]) {
        updatedMeds[medIndex].taken[date] = {};
      }
      updatedMeds[medIndex].taken[date][time] = taken;

      await updateDoc(doc(db, 'medications', medId), {
        taken: updatedMeds[medIndex].taken
      });

      setMedications(updatedMeds);
    } catch (error) {
      console.error('Error updating medication status:', error);
    }
  };

  const getTodaysDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    const doses: Array<{
      medication: Medication;
      time: string;
      taken: boolean;
    }> = [];

    medications.forEach(med => {
      med.times.forEach(time => {
        doses.push({
          medication: med,
          time,
          taken: med.taken[today]?.[time] || false,
        });
      });
    });

    return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getCompletionRate = () => {
    const today = new Date().toISOString().split('T')[0];
    let totalDoses = 0;
    let takenDoses = 0;

    medications.forEach(med => {
      med.times.forEach(time => {
        totalDoses++;
        if (med.taken[today]?.[time]) {
          takenDoses++;
        }
      });
    });

    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const addTimeSlot = () => {
    setNewMed({
      ...newMed,
      times: [...newMed.times, '12:00']
    });
  };

  const updateTimeSlot = (index: number, time: string) => {
    const updatedTimes = [...newMed.times];
    updatedTimes[index] = time;
    setNewMed({ ...newMed, times: updatedTimes });
  };

  const removeTimeSlot = (index: number) => {
    if (newMed.times.length > 1) {
      const updatedTimes = newMed.times.filter((_, i) => i !== index);
      setNewMed({ ...newMed, times: updatedTimes });
    }
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-orange-400 to-green-500 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to Daily Dose
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="daily-dose"
            gradient="from-orange-400 to-green-500"
            placeholder="Ask me about medications, health tips, or dosage reminders..."
          />
        </div>
      </div>
    );
  }

  const todaysDoses = getTodaysDoses();
  const completionRate = getCompletionRate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                Daily Dose
              </h1>
              <p className="text-gray-600 mt-2">Track your medications with AI reminders</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>Chat with {userProfile?.buddyName}</span>
              </button>
              <button
                onClick={() => setShowAddMed(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Medication</span>
              </button>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Today's Progress</h3>
                <p className="text-gray-600">Keep up the great work!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-400 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Today's Doses */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
            {todaysDoses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No medications scheduled for today</p>
                <button
                  onClick={() => setShowAddMed(true)}
                  className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                >
                  Add your first medication
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysDoses.map((dose, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        dose.taken ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <Pill className={dose.taken ? 'text-green-600' : 'text-orange-600'} size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{dose.medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {dose.medication.dosage} • {dose.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => markAsTaken(
                          dose.medication.id,
                          new Date().toISOString().split('T')[0],
                          dose.time,
                          true
                        )}
                        className={`p-2 rounded-lg transition-colors ${
                          dose.taken 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => markAsTaken(
                          dose.medication.id,
                          new Date().toISOString().split('T')[0],
                          dose.time,
                          false
                        )}
                        className={`p-2 rounded-lg transition-colors ${
                          !dose.taken 
                            ? 'bg-red-500 text-white' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Medications */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">All Medications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map(med => (
                <div key={med.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{med.name}</h4>
                    <Bell size={16} className="text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{med.dosage}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {med.times.map((time, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                        {time}
                      </span>
                    ))}
                  </div>
                  {med.notes && (
                    <p className="text-xs text-gray-500">{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Medication</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medication name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg, 2 tablets)"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Times
                  </label>
                  {newMed.times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                      />
                      {newMed.times.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTimeSlot}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    + Add another time
                  </button>
                </div>

                <input
                  type="date"
                  value={newMed.startDate}
                  onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddMed(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMedication}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-green-700 transition-all transform hover:scale-105"
                >
                  Add Medication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyDose;