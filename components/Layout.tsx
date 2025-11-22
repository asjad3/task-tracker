import React from 'react';
import { LayoutGrid, Plus, List, Settings, Cloud } from 'lucide-react';
import { isCloudEnabled } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenSettings: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, onOpenSettings }) => {
  const cloudActive = isCloudEnabled();
  
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Overview' },
    { id: 'tasks', icon: List, label: 'Tasks' },
    { id: 'add', icon: Plus, label: 'Create' },
  ];

  return (
    <div className="min-h-screen bg-background text-primary-900 font-sans flex">
      {/* Desktop Navigation */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-col bg-surface border-r border-primary-100 h-screen sticky top-0 z-50">
        <div className="p-6 md:p-4 lg:p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center text-white font-display font-bold text-lg">
            U
          </div>
          <h1 className="hidden lg:block text-xl font-display font-bold tracking-tight">UniTrack</h1>
        </div>

        <nav className="flex-1 px-2 lg:px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 rounded-2xl transition-all duration-300 ease-out group ${
                currentView === item.id
                  ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/10'
                  : 'text-primary-400 hover:bg-primary-50 hover:text-primary-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : ''}`} />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-50 space-y-2">
          <div className="hidden lg:flex items-center gap-2 px-2 mb-2">
             <div className={`w-2 h-2 rounded-full ${cloudActive ? 'bg-green-500' : 'bg-primary-300'}`}></div>
             <span className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold">
                {cloudActive ? 'Cloud Active' : 'Local Mode'}
             </span>
          </div>
          
          <button onClick={onOpenSettings} className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-primary-400 hover:text-primary-900 rounded-xl hover:bg-primary-50 text-xs transition-colors">
             <Settings className="w-4 h-4" />
             <span className="hidden lg:block">Settings & Sync</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-b border-primary-100 p-4 flex items-center justify-between z-40">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center text-white font-display font-bold">U</div>
            <span className="font-display font-bold text-lg">UniTrack</span>
         </div>
         <button onClick={onOpenSettings} className="p-2 text-primary-500">
            <Settings className="w-5 h-5" />
         </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32 md:pb-12 pt-20 md:pt-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-primary-900 text-white rounded-full shadow-2xl shadow-primary-900/20 p-2 flex justify-around items-center z-50 backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`p-3 rounded-full transition-all duration-200 ${
              currentView === item.id ? 'bg-white/20' : 'text-white/60'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
};