import { Task, Course, Note } from '../types';
import { supabase } from './auth';
import { User } from '@supabase/supabase-js';

// --- Data Operations ---

// Helper function to get current authenticated user
// Always fetches fresh user data to avoid stale session issues
const getCurrentUser = async (): Promise<User> => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Auth error getting user:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user;
};

export const db = {
  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      course: row.course,
      description: row.description,
      type: row.type,
      status: row.status,
      priority: row.priority,
      subtasks: row.subtasks || [],
      dueDate: row.due_date,
      createdAt: row.created_at
    }));
  },

  async addTask(task: Task): Promise<void> {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        id: task.id,
        user_id: user.id,
        title: task.title,
        course: task.course,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        subtasks: task.subtasks,
        created_at: task.createdAt
      }])
      .select();

    if (error) throw error;
    
    // Verify the insert actually succeeded (RLS might silently reject)
    if (!data || data.length === 0) {
      throw new Error(`Failed to save task ${task.id} - no data returned`);
    }
  },

  async updateTask(task: Task): Promise<void> {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        course: task.course,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        subtasks: task.subtasks
      })
      .eq('id', task.id)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    
    // Verify the update actually succeeded
    if (!data || data.length === 0) {
      throw new Error(`Failed to update task ${task.id} - task not found or not authorized`);
    }
  },

  async deleteTask(id: string): Promise<void> {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // --- Courses ---

  async getCourses(): Promise<Course[]> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      createdAt: c.created_at
    }));
  },

  async addCourse(course: Course): Promise<void> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        id: course.id,
        user_id: user.id,
        name: course.name,
        color: course.color,
        icon: course.icon,
        created_at: course.createdAt
      }])
      .select();

    if (error) throw error;
    
    // Verify the insert actually succeeded
    if (!data || data.length === 0) {
      throw new Error(`Failed to save course ${course.id} - no data returned`);
    }
  },

  async updateCourse(course: Course): Promise<void> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('courses')
      .update({
        name: course.name,
        color: course.color,
        icon: course.icon
      })
      .eq('id', course.id)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    
    // Verify the update actually succeeded
    if (!data || data.length === 0) {
      throw new Error(`Failed to update course ${course.id} - course not found or not authorized`);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    const user = await getCurrentUser();
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // --- Notes ---

  async getNotes(courseId: string): Promise<Note[]> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map((n: any) => ({
      id: n.id,
      courseId: n.course_id,
      title: n.title,
      content: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at
    }));
  },

  async addNote(note: Note): Promise<void> {
    const user = await getCurrentUser();
    const { data, error } = await supabase.from('notes').insert([{
      id: note.id,
      user_id: user.id,
      course_id: note.courseId,
      title: note.title,
      content: note.content,
      created_at: note.createdAt,
      updated_at: note.updatedAt
    }]).select();
    
    if (error) throw error;
    
    // Verify the insert actually succeeded
    if (!data || data.length === 0) {
      throw new Error(`Failed to save note ${note.id} - no data returned`);
    }
  },

  async updateNote(note: Note): Promise<void> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: note.title,
        content: note.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    
    // Verify the update actually succeeded
    if (!data || data.length === 0) {
      throw new Error(`Failed to update note ${note.id} - note not found or not authorized`);
    }
  },

  async deleteNote(id: string): Promise<void> {
    const user = await getCurrentUser();
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }
};