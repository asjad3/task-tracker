# UniTrack Pro

A high performance, aesthetic academic planner for logging university quizzes, assignments, and deadlines with secure user authentication and cloud storage.

## Features

- 🔐 **Secure User Authentication** - Sign up and log in to access your tasks from anywhere
- ☁️ **Cloud Storage** - All tasks are stored securely in Supabase
- 📚 **Task Management** - Track assignments, quizzes, projects, exams, and reading tasks
- 🎯 **Organization** - Organize tasks by course and priority
- 📊 **Visual Dashboard** - Monitor task completion with an intuitive dashboard
- 🔒 **Privacy** - Your tasks are private and only accessible to you
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 16 or higher
- A Supabase account (free tier works great!)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase backend**
   
   Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
   - Create a Supabase project
   - Set up the database tables
   - Configure authentication
   - Get your API credentials

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` and create your account!

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment

This app can be deployed to any static hosting service:

- **Vercel** (Recommended): Connect your repository and add environment variables
- **Netlify**: Same process as Vercel
- **GitHub Pages**: Requires manual environment variable handling

**Important**: Remember to add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **Security**: Row Level Security (RLS) ensures users can only access their own data

## Documentation

- [Setup Guide](./SETUP.md) - Detailed backend setup instructions
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation

## Security

- User passwords are never stored directly - Supabase handles secure authentication
- All data access is protected by Row Level Security policies
- Each user can only see and modify their own tasks
- API keys are environment variables and never committed to the repository

