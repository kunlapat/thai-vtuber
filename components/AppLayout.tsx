'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div 
        className={`
          flex flex-col flex-1 min-h-screen
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          lg:pl-0 pl-0
        `}
      >
        <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
