import { Task } from '../types';
import { supabase } from './auth';

// --- Data Operations ---

// Helper function to get current authenticated user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return user;
};

export const db = {
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
      dueDate: row.due_date,
      priority: row.priority,
      subtasks: row.subtasks || [],
      createdAt: row.created_at
    }));
  },

  async addTask(task: Task): Promise<void> {
    const user = await getCurrentUser();

    const { error } = await supabase
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
      }]);
      
    if (error) throw error;
  },

  async updateTask(task: Task): Promise<void> {
    const user = await getCurrentUser();

    const { error } = await supabase
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
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};