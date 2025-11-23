import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, ArrowUpRight } from 'lucide-react';

const motivationalQuotes = [
  "Focus on the step in front of you, not the whole staircase.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
];

interface DashboardProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onNewTask: () => void;
  onViewAllTasks: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onStatusChange, onDelete, onNewTask, onViewAllTasks }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sort by urgency
  const urgentTasks = [...pendingTasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const data = [
    { name: 'Pending', value: pendingTasks.length, color: '#18181b' }, // Zinc-900
    { name: 'Completed', value: completedTasks.length, color: '#e4e4e7' }, // Zinc-200
  ];

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary-100 pb-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-900 tracking-tight mb-2">
              Study<br/>Dashboard
            </h1>
            <p className="text-primary-400 font-medium">Track your academic progress.</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
             <p className="text-sm font-medium text-primary-400 uppercase tracking-widest">Active Tasks</p>
             <p className="text-3xl font-display font-bold text-primary-900">{pendingTasks.length}</p>
           </div>
           <div className="w-px bg-primary-200 h-12"></div>
           <div className="text-right">
             <p className="text-sm font-medium text-primary-400 uppercase tracking-widest">Completion</p>
             <p className="text-3xl font-display font-bold text-primary-900">{completionRate}%</p>
           </div>
        </div>
      </header>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Call to Action */}
        <div 
            onClick={onNewTask}
            className="col-span-1 md:col-span-4 bg-primary-900 rounded-3xl p-8 text-white flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-primary-900/10"
        >
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Sparkles className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
                <h3 className="text-2xl font-display font-bold mb-1">New Task</h3>
                <p className="text-primary-400 text-sm">Create a new assignment or quiz.</p>
            </div>
        </div>

        {/* Completion Chart */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-3xl p-6 border border-primary-100 flex flex-col items-center justify-center relative overflow-hidden">
             <h3 className="absolute top-6 left-6 font-medium text-sm text-primary-400">Overview</h3>
             <div className="h-32 w-32 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-primary-900">{tasks.length}</span>
                    <span className="text-[10px] text-primary-400 uppercase tracking-wider">Total</span>
                </div>
            </div>
        </div>

        {/* Motivation Card */}
        <div className="col-span-1 md:col-span-4 bg-primary-50 rounded-3xl p-8 border border-primary-100 flex flex-col justify-center relative overflow-hidden">
             <p className="font-display text-2xl font-bold text-primary-800 leading-tight transition-opacity duration-500">
               "{motivationalQuotes[currentQuoteIndex]}"
             </p>
             <div className="flex gap-1.5 mt-4 justify-center">
               {motivationalQuotes.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentQuoteIndex(index)}
                   className={`w-2 h-2 rounded-full transition-all ${
                     index === currentQuoteIndex 
                       ? 'bg-primary-800 w-6' 
                       : 'bg-primary-300 hover:bg-primary-500'
                   }`}
                   aria-label={`Go to quote ${index + 1}`}
                 />
               ))}
             </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-primary-900">Up Next</h3>
            <button onClick={onViewAllTasks} className="text-sm text-primary-400 hover:text-primary-900 transition-colors">View all tasks →</button>
        </div>
        
        {urgentTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">Everything is clear. Relax.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {urgentTasks.map(task => (
                <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={onStatusChange} 
                    onDelete={onDelete}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};