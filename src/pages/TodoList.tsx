import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, MessageCircle, Check} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import ChatInterface from '../components/ChatInterface';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: Date;
}

const TodoList: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTodo, setNewTodo] = useState<Omit<Todo, 'id' | 'createdAt'>>({
    text: '',
    completed: false,
    priority: 'medium',
    category: 'Personal',
  });

  useEffect(() => {
    loadTodos();
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;

    try {
      const todosQuery = query(
        collection(db, 'todos'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(todosQuery);
      const loadedTodos: Todo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedTodos.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Todo);
      });
      loadedTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const addTodo = async () => {
    if (!user || !newTodo.text.trim()) return;
    console.log
    try {
      const todoId = `${user.uid}_${Date.now()}`;
      const todoData = {
        ...newTodo,
        userId: user.uid,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'todos', todoId), todoData);
      setTodos([{ id: todoId, ...newTodo, createdAt: new Date() }, ...todos]);
      setNewTodo({
        text: '',
        completed: false,
        priority: 'medium',
        category: 'Personal',
      });
      setShowAddTodo(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (todoId: string) => {
    try {
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      if (todoIndex === -1) return;

      const updatedTodos = [...todos];
      updatedTodos[todoIndex].completed = !updatedTodos[todoIndex].completed;

      await updateDoc(doc(db, 'todos', todoId), {
        completed: updatedTodos[todoIndex].completed
      });

      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Personal': 'bg-blue-100 text-blue-700',
      'Work': 'bg-purple-100 text-purple-700',
      'Study': 'bg-indigo-100 text-indigo-700',
      'Health': 'bg-green-100 text-green-700',
      'Shopping': 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-yellow-300 to-pink-400 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to To-Do List
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="todo-list"
            gradient="from-yellow-300 to-pink-400"
            placeholder="Ask me to help organize tasks, set priorities, or create schedules..."
          />
        </div>
      </div>
    );
  }

  const filteredTodos = getFilteredTodos();
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-pink-600 bg-clip-text text-transparent">
                To-Do List
              </h1>
              <p className="text-gray-600 mt-2">Stay organized with AI-powered task management</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>Chat with {userProfile?.buddyName}</span>
              </button>
              <button
                onClick={() => setShowAddTodo(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-r from-yellow-100 to-pink-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Progress</h3>
                <p className="text-gray-600">
                  {completedCount} of {totalCount} tasks completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-pink-600">
                  {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {(['all', 'active', 'completed'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">
                  {filter === 'all' ? 'No tasks yet' : 
                   filter === 'active' ? 'No active tasks' : 'No completed tasks'}
                </p>
                <p className="text-sm">
                  {filter === 'all' && "Add your first task to get started!"}
                </p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    todo.completed 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {todo.completed && <Check size={16} />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {todo.text}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(todo.category)}`}>
                          {todo.category}
                        </span>
                        {todo.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Todo Modal */}
      {showAddTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="What do you need to do?"
                  value={newTodo.text}
                  onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all resize-none"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Todo['priority'] })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={newTodo.dueDate || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddTodo(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTodo}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-pink-600 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;