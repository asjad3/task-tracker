import React, { useState } from 'react';
import { Course } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';

interface CourseListProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
    onRefresh: () => void;
    onAddCourse?: (course: Course) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onCourseClick, onRefresh, onAddCourse }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseColor, setNewCourseColor] = useState('#3B82F6'); // Default blue

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseName.trim()) return;

        const newCourse: Course = {
            id: uuidv4(),
            name: newCourseName,
            color: newCourseColor,
            createdAt: new Date().toISOString(),
        };

        // Optimistic update if callback provided
        if (onAddCourse) {
            onAddCourse(newCourse);
            setNewCourseName('');
            setIsAdding(false);

            try {
                await db.addCourse(newCourse);
            } catch (error: any) {
                console.error('Failed to add course', error);
                alert(`Failed to add course: ${error.message || error.error_description || 'Unknown error'}`);
            }
        } else {
            // Fallback to original behavior
            try {
                await db.addCourse(newCourse);
                setNewCourseName('');
                setIsAdding(false);
                onRefresh();
            } catch (error: any) {
                console.error('Failed to add course', error);
                alert(`Failed to add course: ${error.message || error.error_description || 'Unknown error'}`);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-display font-bold text-primary-900">My Courses</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition-all shadow-lg shadow-primary-900/20"
                >
                    + Add Course
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAddCourse} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-primary-700 mb-1">Course Name</label>
                            <input
                                type="text"
                                value={newCourseName}
                                onChange={(e) => setNewCourseName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                placeholder="e.g. Introduction to Computer Science"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-1">Color</label>
                            <input
                                type="color"
                                value={newCourseColor}
                                onChange={(e) => setNewCourseColor(e.target.value)}
                                className="h-10 w-20 rounded-lg cursor-pointer border border-primary-200 p-1"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-primary-900 text-white px-6 py-2 rounded-xl hover:bg-black transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-primary-200">
                    <p className="text-primary-400">No courses yet. Add one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => onCourseClick(course)}
                            className="group bg-white p-6 rounded-3xl border border-primary-100 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-900/5 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                                    style={{ backgroundColor: course.color }}
                                >
                                    {course.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this course? All notes will be lost.')) {
                                            db.deleteCourse(course.id).then(onRefresh).catch(err => alert('Failed to delete'));
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors">
                                {course.name}
                            </h3>
                            <p className="text-sm text-primary-400">Click to view notes & tasks</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
