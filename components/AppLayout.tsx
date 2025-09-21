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
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div 
        className={`
          flex flex-col min-h-screen
          transition-all duration-300 ease-in-out
          w-full
          ${sidebarCollapsed ? 'lg:ml-16 lg:w-[calc(100vw-4rem)]' : 'lg:ml-64 lg:w-[calc(100vw-16rem)]'}
          lg:pl-0 pl-0
        `}
      >
        <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-x-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
