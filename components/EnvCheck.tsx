import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const EnvCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if environment variables are configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-red-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-red-900">
              Configuration Required
            </h1>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <p className="font-medium text-red-800">
              UniTrack Pro requires Supabase configuration to run.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-900 mb-2">Missing Environment Variables:</p>
              <ul className="space-y-1 text-red-800">
                {!SUPABASE_URL && (
                  <li>• <code className="bg-red-100 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code></li>
                )}
                {!SUPABASE_ANON_KEY && (
                  <li>• <code className="bg-red-100 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                )}
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <p className="font-semibold text-gray-900">To set up UniTrack Pro:</p>
              
              <ol className="space-y-2 list-decimal list-inside text-gray-700">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">supabase.com</a></li>
                <li>Set up your database using the instructions in <code className="bg-gray-100 px-2 py-0.5 rounded">SETUP.md</code></li>
                <li>Create a <code className="bg-gray-100 px-2 py-0.5 rounded">.env</code> file in the project root</li>
                <li>Add your Supabase credentials to the <code className="bg-gray-100 px-2 py-0.5 rounded">.env</code> file:</li>
              </ol>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
<pre>{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}</pre>
              </div>

              <ol start={5} className="space-y-2 list-decimal list-inside text-gray-700">
                <li>Restart your development server: <code className="bg-gray-100 px-2 py-0.5 rounded">npm run dev</code></li>
              </ol>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                📚 <strong>Need help?</strong> Check out the detailed setup guide in the{' '}
                <code className="bg-gray-100 px-2 py-0.5 rounded">SETUP.md</code> file or visit the{' '}
                <a 
                  href="https://supabase.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase documentation
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
