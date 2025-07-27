// 📘 StudyBuddy Tab with AI + Schedule Builder
import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { ListTodo, MessageCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';

type Task = {
  subject: string;
  time: string;
  duration: string;
  done: boolean;
};

const StudyBuddy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'schedule'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-400 to-yellow-400 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Study Buddy</h1>
            <p className="text-white/80">Get help with learning and build your study schedule</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl font-semibold ${activeTab === 'chat' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}
            >
              <MessageCircle size={18} className="inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl font-semibold ${activeTab === 'schedule' ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}
            >
              <ListTodo size={18} className="inline mr-2" />
              Schedule
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'chat' ? (
            <ChatInterface
              tabType="study-buddy"
              gradient="from-indigo-400 to-yellow-400"
              placeholder="Ask questions, get explanations, homework help, and more..."
            />
          ) : (
            <ScheduleBuilder />
          )}
        </div>
      </div>
    </div>
  );
};

const ScheduleBuilder: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('studyTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
  }, [tasks]);

  const updateTask = (index: number, key: keyof Task, value: string | boolean) => {
    const updated = [...tasks];
    updated[index][key] = value as never;
    setTasks(updated);
  };

  const addTask = () => {
    setTasks([...tasks, { subject: '', time: '', duration: '', done: false }]);
  };

  const toggleDone = (index: number) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Study Schedule', 10, 10);
    tasks.forEach((task, i) => {
      doc.text(
        `${i + 1}. ${task.subject} | Time: ${task.time} | Duration: ${task.duration} | ${task.done ? '✅ Done' : '❌ Pending'}`,
        10,
        20 + i * 10
      );
    });
    doc.save('study-schedule.pdf');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">📅 Build Your Study Schedule</h2>
      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50 p-4 rounded-xl items-center">
            <input
              type="text"
              value={task.subject}
              onChange={(e) => updateTask(i, 'subject', e.target.value)}
              placeholder="Subject/Topic"
              className="px-4 py-2 rounded-md border border-gray-300"
            />
            <input
              type="time"
              value={task.time}
              onChange={(e) => updateTask(i, 'time', e.target.value)}
              className="px-4 py-2 rounded-md border border-gray-300"
            />
            <input
              type="text"
              value={task.duration}
              onChange={(e) => updateTask(i, 'duration', e.target.value)}
              placeholder="Duration (e.g. 1hr)"
              className="px-4 py-2 rounded-md border border-gray-300"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(i)}
              />
              <span className={task.done ? 'line-through text-gray-500' : ''}>Done</span>
            </label>
          </div>
        ))}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={addTask}
            className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-600 transition"
          >
            + Add Another Task
          </button>
          <button
            onClick={exportPDF}
            className="bg-yellow-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center"
          >
            <Download size={16} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
