import React, { useState, useEffect } from 'react';
import { Course, Note, Task, TaskStatus } from '../types';
import { db } from '../services/db';
import { v4 as uuidv4 } from 'uuid';
import { TaskCard } from './TaskCard';

interface CourseDetailProps {
    course: Course;
    onBack: () => void;
    tasks: Task[];
    onTaskUpdate: (id: string, status: TaskStatus) => void;
    onTaskDelete: (id: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, tasks, onTaskUpdate, onTaskDelete }) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Note Editing State
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [currentNote, setCurrentNote] = useState<Partial<Note>>({});

    useEffect(() => {
        loadNotes();
    }, [course.id]);

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const fetchedNotes = await db.getNotes(course.id);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Failed to load notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!currentNote.title || !currentNote.content) return;

        try {
            if (currentNote.id) {
                // Update
                await db.updateNote({ ...currentNote, courseId: course.id } as Note);
            } else {
                // Create
                const newNote: Note = {
                    id: uuidv4(),
                    courseId: course.id,
                    title: currentNote.title,
                    content: currentNote.content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await db.addNote(newNote);
            }
            setIsEditingNote(false);
            setCurrentNote({});
            loadNotes();
        } catch (error) {
            console.error('Failed to save note', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await db.deleteNote(id);
            loadNotes();
        } catch (error) {
            console.error('Failed to delete note', error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    ← Back
                </button>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: course.color }}
                >
                    {course.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-3xl font-bold text-primary-900">{course.name}</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'notes' ? 'text-primary-900' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Notes
                    {activeTab === 'notes' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-900 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'tasks' ? 'text-primary-900' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Tasks ({tasks.length})
                    {activeTab === 'tasks' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-900 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        {!isEditingNote ? (
                            <>
                                <button
                                    onClick={() => {
                                        setCurrentNote({});
                                        setIsEditingNote(true);
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>+ Create new note</span>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {notes.map(note => (
                                        <div
                                            key={note.id}
                                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                                            onClick={() => {
                                                setCurrentNote(note);
                                                setIsEditingNote(true);
                                            }}
                                        >
                                            <h3 className="font-bold text-lg text-gray-900 mb-2">{note.title}</h3>
                                            <p className="text-gray-500 line-clamp-3 text-sm">{note.content}</p>
                                            <div className="mt-4 text-xs text-gray-300">
                                                Updated {new Date(note.updatedAt).toLocaleDateString()}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                }}
                                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg animate-in fade-in zoom-in-95">
                                <input
                                    type="text"
                                    value={currentNote.title || ''}
                                    onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })}
                                    placeholder="Note Title"
                                    className="w-full text-2xl font-bold mb-4 border-none focus:ring-0 placeholder-gray-300 p-0"
                                    autoFocus
                                />
                                <textarea
                                    value={currentNote.content || ''}
                                    onChange={e => setCurrentNote({ ...currentNote, content: e.target.value })}
                                    placeholder="Start typing your note..."
                                    className="w-full h-64 resize-none border-none focus:ring-0 text-gray-600 leading-relaxed p-0"
                                />
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setIsEditingNote(false)}
                                        className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveNote}
                                        className="bg-primary-900 text-white px-6 py-2 rounded-xl hover:bg-black transition-colors"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={onTaskUpdate}
                                onDelete={onTaskDelete}
                            />
                        ))}
                        {tasks.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-10">
                                No tasks found for this course.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
