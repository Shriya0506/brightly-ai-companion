// components/StudyPlanner.tsx
import React from 'react';

const subjects = [
  { name: 'Maths', color: 'bg-blue-500' },
  { name: 'Science', color: 'bg-green-500' },
  { name: 'SST', color: 'bg-pink-500' },
  { name: 'Hindi', color: 'bg-yellow-400' },
  { name: 'English', color: 'bg-orange-400' },
  { name: 'Sanskrit', color: 'bg-red-400' },
  { name: 'German', color: 'bg-indigo-500' },
  { name: 'Computer', color: 'bg-teal-400' },
  { name: 'Art', color: 'bg-purple-400' },
  { name: 'Music', color: 'bg-cyan-500' },
  { name: 'GK', color: 'bg-lime-500' }
];

const timeSlots = [
  "7:00 AM - 8:00 AM", "8:30 AM - 9:30 AM",
  "10:00 AM - 11:00 AM", "11:30 AM - 12:30 PM",
  "1:30 PM - 2:30 PM", "3:00 PM - 4:00 PM",
  "4:30 PM - 5:30 PM", "6:00 PM - 7:00 PM"
];

interface StudyPlannerProps {
  view: 'daily' | 'weekly' | 'monthly';
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ view }) => {
  const getRandomSubject = () => subjects[Math.floor(Math.random() * subjects.length)];

  const renderDaily = () => (
    <div className="grid gap-4">
      {timeSlots.map((slot, idx) => {
        const subject = getRandomSubject();
        return (
          <div key={idx} className={`rounded-xl px-4 py-3 text-white ${subject.color}`}>
            <p className="text-sm font-semibold">{slot}</p>
            <h3 className="text-lg">{subject.name}</h3>
          </div>
        );
      })}
    </div>
  );

  const renderWeekly = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-center">{day}</h4>
            {timeSlots.slice(0, 2).map((slot, slotIdx) => {
              const subject = getRandomSubject();
              return (
                <div key={slotIdx} className={`rounded-lg px-3 py-2 text-white text-sm ${subject.color}`}>
                  <p>{slot}</p>
                  <p>{subject.name}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthly = () => (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, idx) => {
        const subject = getRandomSubject();
        return (
          <div key={idx} className={`rounded-xl px-4 py-6 text-white text-center ${subject.color}`}>
            <h3 className="font-bold">Month {idx + 1}</h3>
            <p>{subject.name} focus</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      {view === 'daily' && renderDaily()}
      {view === 'weekly' && renderWeekly()}
      {view === 'monthly' && renderMonthly()}
    </div>
  );
};

export default StudyPlanner;
