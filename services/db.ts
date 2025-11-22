import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

const STORAGE_KEY = 'unitrack_data';
const CONFIG_KEY = 'unitrack_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
}

let supabase: SupabaseClient | null = null;

// --- Configuration Management ---

export const getSupabaseConfig = (): SupabaseConfig | null => {
  // 1. Check Environment Variables (Deployment Configuration)
  // We check both process.env and standard Vite prefixes for maximum compatibility
  const envUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const envKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  // 2. Fallback to LocalStorage (Manual Entry)
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
  initSupabase();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
  supabase = null;
};

export const initSupabase = () => {
  const config = getSupabaseConfig();
  if (config) {
    try {
      supabase = createClient(config.url, config.key);
      return true;
    } catch (e) {
      console.error("Failed to init Supabase", e);
      return false;
    }
  }
  return false;
};

// Initialize on load
initSupabase();

export const isCloudEnabled = () => !!supabase;

// --- Data Operations ---

export const db = {
  async getTasks(): Promise<Task[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
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
    } else {
      const local = localStorage.getItem(STORAGE_KEY);
      return local ? JSON.parse(local) : [];
    }
  },

  async addTask(task: Task): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          id: task.id,
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
    } else {
      const tasks = await db.getTasks();
      tasks.push(task);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  },

  async updateTask(task: Task): Promise<void> {
    if (supabase) {
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
        .eq('id', task.id);

      if (error) throw error;
    } else {
      const tasks = await db.getTasks();
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        tasks[index] = task;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      const tasks = await db.getTasks();
      const filtered = tasks.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  }
};