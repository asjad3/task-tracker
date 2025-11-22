import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CreateTask } from './components/CreateTask';
import { TaskCard } from './components/TaskCard';
import { Task, TaskStatus } from './types';
import { v4 as uuidv4 } from 'uuid';
import { X, Copy, CheckCircle2, Database, AlertTriangle } from 'lucide-react';
import { db, getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, initSupabase, isCloudEnabled } from './services/db';

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, onConfigUpdate }: { isOpen: boolean, onClose: () => void, onConfigUpdate: () => void }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [currentConfig, setCurrentConfig] = useState(getSupabaseConfig());
  
  useEffect(() => {
    const conf = getSupabaseConfig();
    setCurrentConfig(conf);
    if (conf) {
        setUrl(conf.url);
        setKey(conf.key);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (url && key) {
        saveSupabaseConfig(url, key);
        onConfigUpdate();
        onClose();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    onConfigUpdate();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-primary-900">Settings</h2>
                <button onClick={onClose}><X className="w-6 h-6 text-primary-400 hover:text-primary-900"/></button>
            </div>

            <div className="space-y-6">
                {/* Connection Status */}
                <div className={`p-4 rounded-2xl border ${currentConfig ? 'bg-green-50 border-green-200' : 'bg-primary-50 border-primary-100'}`}>
                    <div className="flex items-center gap-3">
                        {currentConfig ? <CheckCircle2 className="text-green-600 w-5 h-5" /> : <Database className="text-primary-400 w-5 h-5" />}
                        <div>
                            <h3 className={`font-bold text-sm ${currentConfig ? 'text-green-800' : 'text-primary-900'}`}>
                                {currentConfig ? 'Cloud Sync Active' : 'Local Storage Mode'}
                            </h3>
                            <p className="text-xs text-primary-500 mt-1">
                                {currentConfig ? 'Your tasks are syncing to Supabase.' : 'Tasks are saved only on this device.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary-400">Supabase Connection</h3>
                    <div>
                        <label className="block text-xs font-semibold text-primary-500 mb-2">Project URL</label>
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://xyz.supabase.co"
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary-900 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary-500 mb-2">Anon Key</label>
                        <input 
                            type="password" 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                            className="w-full bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary-900 outline-none transition-colors"
                        />
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    {currentConfig && (
                        <button 
                            onClick={handleDisconnect}
                            className="flex-1 py-3 border border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                        >
                            Disconnect
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        className="flex-[2] py-3 bg-primary-900 text-white hover:bg-black rounded-xl font-medium shadow-lg shadow-primary-900/20 transition-all"
                    >
                        {currentConfig ? 'Update Config' : 'Connect Cloud'}
                    </button>
                </div>

                {/* Setup Instructions */}
                {!currentConfig && (
                    <div className="pt-6 border-t border-primary-50 space-y-3">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Required Database Setup</span>
                        </div>
                        <p className="text-xs text-primary-500 leading-relaxed">
                            To use cloud sync, create a table named <code className="bg-primary-100 px-1 rounded">tasks</code> in your Supabase SQL Editor:
                        </p>
                        <div className="bg-primary-900 text-primary-200 p-4 rounded-xl text-[10px] font-mono overflow-x-auto">
<pre>{`create table tasks (
  id uuid primary key,
  title text,
  course text,
  description text,
  type text,
  status text,
  priority text,
  due_date text,
  subtasks jsonb,
  created_at text
);`}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
        const fetched = await db.getTasks();
        setTasks(fetched);
    } catch (error) {
        console.error("Failed to fetch tasks", error);
        // Optional: Show error toast
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title!,
      course: taskData.course!,
      description: taskData.description || '',
      type: taskData.type!,
      status: TaskStatus.PENDING,
      dueDate: taskData.dueDate!,
      priority: taskData.priority!,
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setTasks(prev => [...prev, newTask]);
    setCurrentView('dashboard');

    try {
        await db.addTask(newTask);
    } catch (e) {
        console.error("Failed to save task", e);
        alert("Failed to save to cloud. Please check your connection.");
        // Rollback would go here in a robust app
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, status };
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));

    try {
        await db.updateTask(updatedTask);
    } catch (e) {
        console.error("Failed to update task", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        // Optimistic
        setTasks(tasks.filter(t => t.id !== id));
        try {
            await db.deleteTask(id);
        } catch (e) {
            console.error("Failed to delete", e);
        }
    }
  };

  const renderContent = () => {
    if (isLoading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (currentView === 'dashboard') {
      return <Dashboard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} onNewTask={() => setCurrentView('add')} />;
    }
    if (currentView === 'add') {
      return <CreateTask onSave={handleSaveTask} onCancel={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'tasks') {
      return (
        <div className="space-y-8 animate-fade-in">
           <div className="flex items-center justify-between">
             <h2 className="text-4xl font-display font-bold text-primary-900">All Tasks</h2>
             <button 
               onClick={() => setCurrentView('add')}
               className="bg-primary-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg shadow-primary-900/20"
             >
               + Create New
             </button>
           </div>
           
           {tasks.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-primary-200">
                <p className="text-primary-400">No tasks found.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tasks
                 .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                 .map(task => (
                   <TaskCard 
                     key={task.id} 
                     task={task} 
                     onStatusChange={handleStatusChange} 
                     onDelete={handleDelete}
                   />
                 ))}
             </div>
           )}
        </div>
      );
    }
    return <div>Page not found</div>;
  };

  return (
    <>
        <Layout 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            onOpenSettings={() => setIsSettingsOpen(true)}
        >
            {renderContent()}
        </Layout>
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            onConfigUpdate={() => {
                initSupabase();
                fetchTasks();
            }}
        />
    </>
  );
};

export default App;