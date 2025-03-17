import React, { useState, useEffect } from 'react';

const TaskManager = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: []
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Set default tasks
      setTasks({
        todo: [
          { id: 1, title: 'Research project ideas', priority: 'medium' },
          { id: 2, title: 'Create project plan', priority: 'high' }
        ],
        inProgress: [
          { id: 3, title: 'Design user interface', priority: 'high' }
        ],
        completed: [
          { id: 4, title: 'Set up development environment', priority: 'low' }
        ]
      });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Generate a unique ID for new tasks
  const generateId = () => {
    return Math.floor(Math.random() * 10000);
  };

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: generateId(),
      title: newTaskTitle,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    
    setTasks({
      ...tasks,
      todo: [...tasks.todo, newTask]
    });
    
    setNewTaskTitle('');
  };

  // Delete a task
  const deleteTask = (id, status) => {
    const updatedTasks = {
      ...tasks,
      [status]: tasks[status].filter(task => task.id !== id)
    };
    setTasks(updatedTasks);
  };

  // Toggle task priority
  const togglePriority = (id, status) => {
    const priorities = ['low', 'medium', 'high'];
    
    const updatedTasks = {
      ...tasks,
      [status]: tasks[status].map(task => {
        if (task.id === id) {
          const currentIndex = priorities.indexOf(task.priority);
          const nextIndex = (currentIndex + 1) % priorities.length;
          return { ...task, priority: priorities[nextIndex] };
        }
        return task;
      })
    };
    
    setTasks(updatedTasks);
  };

  // Handle drag start
  const handleDragStart = (task, status) => {
    setDraggedTask(task);
    setDraggedFrom(status);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (status) => {
    if (!draggedTask || status === draggedFrom) return;

    // Remove task from original column
    const sourceColumn = tasks[draggedFrom].filter(task => task.id !== draggedTask.id);
    
    // Add task to target column
    const targetColumn = [...tasks[status], draggedTask];
    
    // Update state
    setTasks({
      ...tasks,
      [draggedFrom]: sourceColumn,
      [status]: targetColumn
    });
    
    // Reset dragged state
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  // Get class for priority
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400';
      case 'medium':
        return 'border-l-amber-400';
      case 'low':
        return 'border-l-emerald-400';
      default:
        return 'border-l-gray-400';
    }
  };

  // Get badge class for priority
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get column title styling
  const getColumnTitleClass = (status) => {
    switch (status) {
      case 'todo':
        return 'text-indigo-900';
      case 'inProgress':
        return 'text-purple-900';
      case 'completed':
        return 'text-teal-900';
      default:
        return 'text-gray-900';
    }
  };

  // Helper function to render task columns
  const renderTaskColumn = (title, status, tasks) => (
    <div 
      className="flex-1 min-h-64" 
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(status)}
    >
      <div className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className={`font-serif italic font-bold text-xl mb-6 flex items-center ${getColumnTitleClass(status)}`}>
          {title} 
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-sans">
            {tasks.length}
          </span>
        </h3>
        
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl bg-white border-l-4 shadow-md transition-all duration-300 hover:shadow-lg ${getPriorityClass(task.priority)}`}
              draggable
              onDragStart={() => handleDragStart(task, status)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{task.title}</span>
                <div className="flex space-x-2 ml-2">
                  <button 
                    onClick={() => togglePriority(task.id, status)}
                    className={`text-xs px-3 py-1 rounded-full border ${getPriorityBadgeClass(task.priority)}`}
                  >
                    {task.priority}
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id, status)}
                    className="text-xs px-2 py-1 rounded-full bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-center text-sm italic">
              No tasks here
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Vi Tasks</h1>
          <p className="text-gray-300 font-light"> Project Management tool made by Vikash</p>
        </div>
        
        {/* Add task form */}
        <form onSubmit={addTask} className="mb-12">
          <div className="bg-white bg-opacity-80 backdrop-blur-lg p-4 rounded-full shadow-lg flex border border-gray-100">
            <input
              type="text"
              placeholder="Add a new task..."
              className="flex-grow px-6 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
            >
              Add Task
            </button>
          </div>
        </form>
        
        {/* Task columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {renderTaskColumn('To Do', 'todo', tasks.todo)}
          {renderTaskColumn('In Progress', 'inProgress', tasks.inProgress)}
          {renderTaskColumn('Completed', 'completed', tasks.completed)}
        </div>
        
        <div className="mt-10 text-center text-gray-300 text-sm">
          <p>Drag tasks between columns to update their status</p>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;