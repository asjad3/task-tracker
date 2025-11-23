import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CreateTask } from './components/CreateTask';
import { TaskCard } from './components/TaskCard';
import { AuthPage } from './components/AuthPage';
import { Task, TaskStatus } from './types';
import { v4 as uuidv4 } from 'uuid';
import { db } from './services/db';
import { authService, supabase } from './services/auth';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTasks = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
        const fetched = await db.getTasks();
        setTasks(fetched);
    } catch (error) {
        console.error("Failed to fetch tasks", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

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
      return <Dashboard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} onNewTask={() => setCurrentView('add')} onViewAllTasks={() => setCurrentView('tasks')} />;
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

  // Show loading state while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!session) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      userEmail={session.user.email || ''}
      onSignOut={() => {
        setSession(null);
        setTasks([]);
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;