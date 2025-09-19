
import React, { useState, useCallback } from 'react';
import DashboardPage from './pages/Dashboard';
import AiAssistantPage from './pages/AiAssistant';
import { Icons } from './components/icons';
import { cn } from './lib/utils';

type Page = 'dashboard' | 'ai-assistant';

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = useCallback(() => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      default:
        return <DashboardPage />;
    }
  }, [activePage]);

  return (
    <div className="flex h-screen w-full bg-gray-900 font-sans">
      <aside className="w-64 flex-shrink-0 border-r border-gray-700/50 bg-gray-900 p-4">
        <div className="flex items-center space-x-2 pb-6 border-b border-gray-700/50">
           <Icons.bot className="h-8 w-8 text-blue-500" />
           <h1 className="text-xl font-bold text-white">Feedback AI</h1>
        </div>
        <nav className="mt-6 space-y-1">
          <NavItem
            label="Dashboard"
            icon={<Icons.dashboard className="h-5 w-5" />}
            isActive={activePage === 'dashboard'}
            onClick={() => setActivePage('dashboard')}
          />
          <NavItem
            label="AI Assistant"
            icon={<Icons.assistant className="h-5 w-5" />}
            isActive={activePage === 'ai-assistant'}
            onClick={() => setActivePage('ai-assistant')}
          />
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {renderPage()}
      </main>
    </div>
  );
}
