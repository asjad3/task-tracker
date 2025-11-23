import React, { useState } from 'react';
import { TaskType, Priority, SubTask } from '../types';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CreateTaskProps {
  onSave: (task: any) => void;
  onCancel: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.ASSIGNMENT);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const addSubtask = (title: string) => {
    setSubtasks([...subtasks, { id: uuidv4(), title, isCompleted: false }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      course,
      description,
      type,
      priority,
      dueDate,
      subtasks
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onCancel} className="flex items-center gap-2 text-primary-400 hover:text-primary-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <div>
            <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                className="w-full text-4xl md:text-5xl font-display font-bold text-primary-900 placeholder-primary-200 bg-transparent outline-none border-none p-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Course Code</label>
                <input 
                    required
                    type="text" 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. CS101"
                    className="w-full bg-white rounded-2xl px-4 py-3 border border-primary-100 focus:border-primary-900 outline-none transition-colors text-primary-900 font-medium"
                />
            </div>
             <div className="group">
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                    required
                    type="datetime-local" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white rounded-2xl px-4 py-3 border border-primary-100 focus:border-primary-900 outline-none transition-colors text-primary-900 font-medium"
                />
            </div>
          </div>

          <div className="space-y-4">
             <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider">Description & Scope</label>
             <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Briefly describe what you need to do..."
                className="w-full bg-white rounded-3xl px-6 py-5 border border-primary-100 focus:border-primary-900 outline-none transition-colors text-primary-700 leading-relaxed resize-none"
            />
          </div>

          {/* Subtasks List */}
          <div className="bg-white rounded-3xl border border-primary-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-xl text-primary-900">Action Plan</h3>
                <button type="button" onClick={() => addSubtask("New step")} className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-900 hover:bg-primary-100 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-3">
                {subtasks.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-primary-100 rounded-xl">
                        <p className="text-sm text-primary-400">No steps defined.</p>
                    </div>
                )}
                {subtasks.map((st, idx) => (
                    <div key={st.id} className="flex items-center gap-4 group">
                        <span className="text-xs font-mono text-primary-300 w-4">{idx + 1}.</span>
                        <input 
                            type="text" 
                            value={st.title}
                            onChange={(e) => {
                                const newSub = [...subtasks];
                                newSub[idx].title = e.target.value;
                                setSubtasks(newSub);
                            }}
                            className="flex-1 bg-transparent border-b border-transparent focus:border-primary-200 outline-none py-1 text-primary-800"
                        />
                         <button type="button" onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} className="opacity-0 group-hover:opacity-100 text-primary-300 hover:text-red-500 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl border border-primary-200 text-primary-900 font-semibold hover:bg-primary-50 transition-colors"
             >
                Cancel
             </button>
             <button 
                type="submit"
                className="flex-[2] py-4 rounded-2xl bg-primary-900 text-white font-semibold hover:bg-black transition-all shadow-xl shadow-primary-900/20 active:scale-[0.98]"
             >
                Save Task
             </button>
          </div>
        </form>

        {/* Sidebar Settings */}
        <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 border border-primary-100 space-y-4">
                <h3 className="font-display font-bold text-lg">Settings</h3>
                <div>
                    <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(TaskType).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    type === t 
                                    ? 'bg-primary-900 text-white' 
                                    : 'bg-primary-50 text-primary-500 hover:bg-primary-100'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Priority</label>
                    <div className="flex gap-2">
                        {Object.values(Priority).map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                                    priority === p 
                                    ? 'border-primary-900 bg-primary-900 text-white' 
                                    : 'border-primary-100 text-primary-500 hover:border-primary-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;