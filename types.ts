export enum TaskType {
  ASSIGNMENT = 'Assignment',
  QUIZ = 'Quiz',
  PROJECT = 'Project',
  EXAM = 'Exam',
  READING = 'Reading'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  dueDate: string; // ISO string
  priority: Priority;
  subtasks: SubTask[];
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}