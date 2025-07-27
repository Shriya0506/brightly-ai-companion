import React, { useState, useEffect } from 'react';
import { Calendar as _CalendarIcon, Plus, Bell, Trash2, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import ChatInterface from '../components/ChatInterface';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'birthday' | 'deadline' | 'other';
  description?: string;
  reminder: boolean;
}

const Calendar: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [_selectedDate, setSelectedDate] = useState<string>('');
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    type: 'other',
    description: '',
    reminder: true,
  });

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(eventsQuery);
      const loadedEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
        loadedEvents.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addEvent = async () => {
    if (!user || !newEvent.title || !newEvent.date) return;
    console.log
    try {
      const eventId = `${user.uid}_${Date.now()}`;
      const eventData = {
        ...newEvent,
        userId: user.uid,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'events', eventId), eventData);
      setEvents([...events, { id: eventId, ...newEvent }]);
      setNewEvent({
        title: '',
        date: '',
        type: 'other',
        description: '',
        reminder: true,
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-100 border-blue-300' : ''
          }`}
          onClick={() => {
            setSelectedDate(dateString);
            setNewEvent({ ...newEvent, date: dateString });
            setShowAddEvent(true);
          }}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded truncate ${
                  event.type === 'exam' ? 'bg-red-100 text-red-700' :
                  event.type === 'birthday' ? 'bg-pink-100 text-pink-700' :
                  event.type === 'deadline' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to Calendar
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="calendar"
            gradient="from-green-400 to-blue-500"
            placeholder="Ask me about scheduling, time management, or planning..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-gray-600 mt-2">Organize your schedule with AI assistance</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>Chat with {userProfile?.buddyName}</span>
              </button>
              <button
                onClick={() => setShowAddEvent(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-xl overflow-hidden">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-4 text-center font-semibold text-gray-700 border-b border-gray-200">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendar()}
          </div>

          {/* Upcoming Events */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        event.type === 'exam' ? 'bg-red-400' :
                        event.type === 'birthday' ? 'bg-pink-400' :
                        event.type === 'deadline' ? 'bg-orange-400' :
                        'bg-blue-400'
                      }`}></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()} 
                          {event.description && ` • ${event.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.reminder && <Bell size={16} className="text-blue-500" />}
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Event</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="other">Other</option>
                  <option value="exam">Exam</option>
                  <option value="birthday">Birthday</option>
                  <option value="deadline">Deadline</option>
                </select>
                <textarea
                  placeholder="Description (optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  rows={3}
                />
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newEvent.reminder}
                    onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Enable reminder</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addEvent}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;