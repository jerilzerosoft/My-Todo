import { useState, useEffect, JSX } from 'react';
import { Calendar, CheckSquare, Trash2, Plus, List, CheckCheck, Clock, Search, Filter, X, Bell, Star, MoreHorizontal, CheckCircle, Briefcase, User, ShoppingCart, Activity } from 'lucide-react';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
};

export default function EnhancedTodo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompletedList, setShowCompletedList] = useState(false);
  
  const [newTodo, setNewTodo] = useState({
    id: 0,
    title: '',
    completed: false,
    category: 'personal',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Load todos from localStorage on component mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    filterAndSortTodos();
  }, [todos, filter, searchQuery, sortBy]);

  const filterAndSortTodos = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First filter
    let filtered = [...todos];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category/date filter
    switch (filter) {
      case 'all':
        break;
      case 'work':
      case 'personal':
      case 'shopping':
      case 'health':
        filtered = filtered.filter(todo => todo.category === filter);
        break;
      case 'today':
        filtered = filtered.filter(todo => {
          if (!todo.dueDate) return false;
          const dueDate = new Date(todo.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
      case 'upcoming':
        filtered = filtered.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          const dueDate = new Date(todo.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate > today;
        });
        break;
      default:
        break;
    }

    // Then sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'priority':
        const priorityValues = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);
        break;
      case 'alpha':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredTodos(filtered);
  };

interface NewTodo {
    id: number;
    title: string;
    completed: boolean;
    category: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
}

interface AddTodoEvent extends React.FormEvent<HTMLFormElement> {}

const addTodo = (e: AddTodoEvent): void => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    const todo: NewTodo = {
        ...newTodo,
        id: Date.now()
    };

    setTodos([...todos, todo]);
    showToast('Task added successfully!');

    setNewTodo({
        id: 0,
        title: '',
        completed: false,
        category: 'personal',
        dueDate: '',
        priority: 'medium'
    });
    
    setShowAddForm(false);
};

const deleteTodo = (id: number): void => {
    setTodos(todos.filter((todo: Todo) => todo.id !== id));
    showToast('Task deleted successfully!');
};

  const toggleComplete = (id: number): void => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updatedTodo = { ...todo, completed: !todo.completed };
        showToast(`Task ${updatedTodo.completed ? 'completed' : 'reopened'}!`);
        return updatedTodo;
      }
      return todo;
    }));
  };

interface ToastOptions {
    message: string;
}

const showToast = (message: ToastOptions['message']): void => {
    if (typeof window === 'undefined') return;
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};

  const getCompletionPercentage = () => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(todo => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };

  const getCompletedCount = () => {
    return todos.filter(todo => todo.completed).length;
  };

  const getCompletedWorkTasks = () => {
    return todos.filter(todo => todo.completed && todo.category === 'work');
  };

interface TodoItem {
    dueDate: string;
    completed: boolean;
}

const isOverdue = (todo: TodoItem): boolean => {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
};

  const isDueToday = (todo:TodoItem): boolean => {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };



interface CategoryIconProps {
    category: string;

}

const getCategoryIcon = (category: CategoryIconProps['category']): JSX.Element => {
    switch (category) {
        case 'work':
            return <Briefcase size={16} className="text-blue-500" />;
        case 'personal':
            return <User size={16} className="text-purple-500" />;
        case 'shopping':
            return <ShoppingCart size={16} className="text-green-500" />;
        case 'health':
            return <Activity size={16} className="text-red-500" />;
        default:
            return <CheckSquare size={16} className="text-gray-500" />;
    }
};

interface PriorityBadgeProps {
    priority: 'low' | 'medium' | 'high';
}

const getPriorityBadge = (priority: PriorityBadgeProps['priority']): JSX.Element | null => {
    switch (priority) {
        case 'high':
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High</span>;
        case 'medium':
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Medium</span>;
        case 'low':
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Low</span>;
        default:
            return null;
    }
};

interface FormatDateProps {
    dateString: string;
}

const formatDate = (dateString: FormatDateProps['dateString']): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.getTime() === today.getTime()) {
        return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else if (date.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

interface CategoryColorProps {
    category: 'work' | 'personal' | 'shopping' | 'health' | string;
}

const getCategoryColor = (category: CategoryColorProps['category']): string => {
    switch (category) {
        case 'work':
            return 'border-blue-500 bg-blue-50';
        case 'personal':
            return 'border-purple-500 bg-purple-50';
        case 'shopping':
            return 'border-green-500 bg-green-50';
        case 'health':
            return 'border-red-500 bg-red-50';
        default:
            return 'border-gray-500 bg-gray-50';
    }
};

  const clearCompletedTasks = () => {
    if (window.confirm('Are you sure you want to clear all completed tasks?')) {
      setTodos(todos.filter(todo => !todo.completed));
      showToast('Completed tasks cleared!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-800 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-2">
          <CheckSquare size={24} className="text-white" />
          <h1 className="text-xl font-bold">TaskFlow</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button className="relative p-2 rounded-full hover:bg-white/20 transition">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold">
            J
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hi Jenni...</h1>
            <p className="text-gray-600">
              {getCompletedCount()} of {todos.length} tasks completed
            </p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            <span>{showAddForm ? 'Cancel' : 'Add Task'}</span>
          </button>
        </div>
        
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slide-down">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={addTodo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="What do you need to do?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!newTodo.title.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition"
              >
                <Filter size={18} />
                <span>Filter</span>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="alpha">Sort by Name</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'all' 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'today' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'upcoming' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'completed' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('work')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'work' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Work
              </button>
              <button
                onClick={() => setFilter('personal')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'personal' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setFilter('shopping')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'shopping' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Shopping
              </button>
              <button
                onClick={() => setFilter('health')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === 'health' 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Health
              </button>
            </div>
          )}
          
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <CheckCheck size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-xl font-medium text-gray-500">All done!</h3>
              <p className="text-gray-400 mt-1">No tasks found. Time to relax or add new tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`rounded-xl p-4 transition-all transform hover:scale-[1.01] ${
                    todo.completed 
                      ? 'bg-gray-50 border border-gray-200' 
                      : `border ${getCategoryColor(todo.category)}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          todo.completed 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'border-gray-300 hover:border-indigo-500'
                        }`}
                      >
                        {todo.completed && <CheckCheck size={14} />}
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.title}
                        </h3>
                        
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          {!todo.completed && getPriorityBadge(todo.priority)}
                          
                          {!todo.completed && isDueToday(todo) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                              <Clock size={12} className="mr-1" />
                              Today
                            </span>
                          )}
                          
                          {isOverdue(todo) && !todo.completed && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                              <Clock size={12} className="mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(todo.category)}
                          <span className="capitalize">{todo.category}</span>
                        </div>
                        
                        {todo.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} className="text-gray-500" />
                            <span>{formatDate(todo.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                        aria-label="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Work Tasks Section */}
        {showCompletedList && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800">Completed Work Tasks</h3>
              {getCompletedWorkTasks().length > 0 && (
                <button 
                  onClick={clearCompletedTasks}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {getCompletedWorkTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed work tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {getCompletedWorkTasks().map(todo => (
                  <div key={todo.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle size={18} className="text-green-500 mr-2" />
                      <span className="line-through text-gray-500">{todo.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{formatDate(todo.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {todos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Your Progress</h3>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {getCompletionPercentage()}% Complete
              </div>
            </div>
            
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-3 text-sm text-gray-500">
              <div>{getCompletedCount()} Completed</div>
              <div>{todos.length - getCompletedCount()} Remaining</div>
            </div>
          </div>
        )}
      </main>

 

                
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-2 px-4">
        <div className="max-w-2xl mx-auto flex justify-around">
          <button
            onClick={() => setFilter('all')}
            className={`flex flex-col items-center py-1 px-4 ${filter === 'all' ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <List size={24} />
            <span className="text-xs mt-1">All</span>
          </button>

          <button
            onClick={() => setFilter('today')}
            className={`flex flex-col items-center py-1 px-4 ${filter === 'today' ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Today</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex flex-col items-center justify-center px-4"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg transform -translate-y-4 hover:scale-110 transition">
              <Plus size={24} />
            </div>
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`flex flex-col items-center py-1 px-4 ${filter === 'upcoming' ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <Clock size={24} />
            <span className="text-xs mt-1">Upcoming</span>
          </button>

          <button
            onClick={() => setFilter('Completed')}
            className={`flex flex-col items-center py-1 px-4 ${filter === 'Completed' ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <Star size={24} />
            <span className="text-xs mt-1">Completed</span>
          </button>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  );
}
