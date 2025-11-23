import React from 'react';
import { Task, TaskStatus, TaskType, Priority } from '../types';
import { Clock, Check, MoreHorizontal, Circle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const daysUntil = () => {
    const diff = new Date(task.dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d`;
  };

  const isUrgent = daysUntil() === 'Overdue' || daysUntil() === 'Today';

  return (
    <div className="group bg-white rounded-3xl p-6 border border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1 flex flex-col h-full animate-fade-in">
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                {task.course}
            </span>
            {task.priority === Priority.HIGH && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                    High
                </span>
            )}
        </div>
        
        <div className="relative">
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary-50 rounded-full transition-all text-primary-400 hover:text-red-500"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className={`text-xl font-display font-bold text-primary-900 mb-2 leading-snug ${task.status === TaskStatus.COMPLETED ? 'line-through opacity-40' : ''}`}>
          {task.title}
        </h3>
        <p className={`text-sm text-primary-500 line-clamp-3 leading-relaxed ${task.status === TaskStatus.COMPLETED ? 'opacity-40' : ''}`}>
          {task.description || "No additional details."}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-primary-50 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-primary-400'}`}>
          <Clock className="w-4 h-4" />
          <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span className="bg-primary-50 px-2 py-0.5 rounded-full text-primary-600 border border-primary-100">
            {daysUntil()}
          </span>
        </div>

        <button
          onClick={() => {
            const next = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING;
            onStatusChange(task.id, next);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            task.status === TaskStatus.COMPLETED 
                ? 'bg-primary-900 text-white' 
                : 'bg-primary-50 text-primary-300 hover:bg-primary-900 hover:text-white'
          }`}
        >
          {task.status === TaskStatus.COMPLETED ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};