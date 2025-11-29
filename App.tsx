import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskCard } from './components/TaskCard';
import { AuthPage } from './components/AuthPage';
import { ConfirmModal } from './components/ConfirmModal';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { Task, TaskStatus, Course } from './types';
import { v4 as uuidv4 } from 'uuid';
import { db } from './services/db';
import { supabase } from './services/auth';
import { Session } from '@supabase/supabase-js';

// Lazy load CreateTask component since it's only needed when creating a task
const CreateTask = lazy(() => import('./components/CreateTask'));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const isInitialAuthChange = React.useRef(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedCourses] = await Promise.all([
        db.getTasks(),
        db.getCourses()
      ]);
      setTasks(fetchedTasks);
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
          await loadData();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isInitialAuthChange.current) {
        isInitialAuthChange.current = false;
        return;
      }

      setSession(session);

      if (session) {
        await loadData();
      } else {
        setTasks([]);
        setCourses([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    let courseName = taskData.course!;
    let newCourseAdded: Course | null = null;

    // Check if course exists, if not create it
    const existingCourse = courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());

    if (!existingCourse) {
      const newCourse: Course = {
        id: uuidv4(),
        name: courseName,
        color: '#3B82F6', // Default blue
        createdAt: new Date().toISOString(),
      };

      try {
        // Save course to database FIRST
        await db.addCourse(newCourse);
        // Only update UI after successful database save
        setCourses(prev => [...prev, newCourse]);
        newCourseAdded = newCourse;
      } catch (e) {
        console.error("Failed to auto-create course", e);
        alert("Failed to create course. Please try again.");
        return; // Exit early if course creation fails
      }
    }

    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title!,
      course: courseName,
      description: taskData.description || '',
      type: taskData.type!,
      status: TaskStatus.PENDING,
      dueDate: taskData.dueDate!,
      priority: taskData.priority!,
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to database FIRST, before updating UI
      await db.addTask(newTask);
      // Only update UI after successful database save
      setTasks(prev => [...prev, newTask]);
      setCurrentView('dashboard');
    } catch (e) {
      console.error("Failed to save task", e);
      // Rollback newly created course if any (since task failed)
      if (newCourseAdded) {
        setCourses(prev => prev.filter(c => c.id !== newCourseAdded.id));
        // Also try to delete the course from the database
        try {
          await db.deleteCourse(newCourseAdded.id);
        } catch (deleteError) {
          console.error("Failed to rollback course", deleteError);
        }
      }
      alert("Failed to save task. Please try again.");
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const previousStatus = task.status;
    const updatedTask = { ...task, status };
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));

    try {
      await db.updateTask(updatedTask);
    } catch (e) {
      console.error("Failed to update task", e);
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: previousStatus } : t));
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDelete = (id: string) => {
    setTaskToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    // Store task for potential rollback
    const taskBeingDeleted = tasks.find(t => t.id === taskToDelete);
    
    setTasks(tasks.filter(t => t.id !== taskToDelete));
    try {
      await db.deleteTask(taskToDelete);
    } catch (e) {
      console.error("Failed to delete", e);
      // Rollback on failure
      if (taskBeingDeleted) {
        setTasks(prev => [...prev, taskBeingDeleted]);
      }
      alert("Failed to delete task. Please try again.");
    }
    setTaskToDelete(null);
  };

  const renderContent = () => {
    if (isLoading && tasks.length === 0 && courses.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-primary-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (currentView === 'dashboard') {
      return <Dashboard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} onNewTask={() => setCurrentView('add')} onViewAllTasks={() => setCurrentView('tasks')} />;
    }

    if (currentView === 'courses') {
      return (
        <CourseList
          courses={courses}
          onCourseClick={(course) => {
            setSelectedCourse(course);
            setCurrentView('course-detail');
          }}
          onRefresh={loadData}
          onAddCourse={(course) => setCourses(prev => [...prev, course])}
          onRemoveCourse={(courseId) => setCourses(prev => prev.filter(c => c.id !== courseId))}
        />
      );
    }

    if (currentView === 'course-detail' && selectedCourse) {
      return (
        <CourseDetail
          course={selectedCourse}
          onBack={() => setCurrentView('courses')}
          tasks={tasks.filter(t => t.course === selectedCourse.name)}
          onTaskUpdate={handleStatusChange}
          onTaskDelete={handleDelete}
        />
      );
    }

    if (currentView === 'add') {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin"></div>
          </div>
        }>
          <CreateTask onSave={handleSaveTask} onCancel={() => setCurrentView('dashboard')} courses={courses} />
        </Suspense>
      );
    }

    if (currentView === 'tasks') {
      return (
        <div className="space-y-8">
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
                .map((task) => (
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

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage onAuthSuccess={() => { }} />;
  }

  return (
    <>
      <Layout
        currentView={currentView}
        setCurrentView={setCurrentView}
        userEmail={session.user.email || ''}
        onSignOut={() => {
          setSession(null);
          setTasks([]);
          setCourses([]);
        }}
      >
        {renderContent()}
      </Layout>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default App;