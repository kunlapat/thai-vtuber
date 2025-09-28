'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { MobileHeader } from './MobileHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <MobileHeader onMenuClick={toggleMobileMenu} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={toggleMobileMenu}
      />
      
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
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
