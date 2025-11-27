# Database Update for Courses and Notes

Please run the following SQL in your Supabase SQL Editor to add support for Courses and Notes.

```sql
-- Create courses table
create table courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#000000',
  icon text,
  created_at text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create notes table
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  content text,
  created_at text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table courses enable row level security;
alter table notes enable row level security;

-- Policies for Courses
create policy "Users can view their own courses"
  on courses for select using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on courses for insert with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on courses for update using (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on courses for delete using (auth.uid() = user_id);

-- Policies for Notes
create policy "Users can view their own notes"
  on notes for select using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on notes for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on notes for update using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on notes for delete using (auth.uid() = user_id);
```
