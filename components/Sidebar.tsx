'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Home, 
  Menu, 
  X,
  ChevronLeft,
  Users,
  Activity,
  Play
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Videos', href: '/videos', icon: Play },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const NavItem = ({ item, mobile = false }: { item: typeof navigation[0]; mobile?: boolean }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setIsMobileOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }
          ${isCollapsed && !mobile ? 'justify-center px-2' : ''}
        `}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {(!isCollapsed || mobile) && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white shadow-md border"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          hidden lg:flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Thai Vtubers</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-gray-700 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
          >
            <ChevronLeft 
              className={`w-4 h-4 transition-transform text-gray-700 cursor-pointer ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-2 text-sm text-gray-700 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <Activity className="w-4 h-4" />
            {!isCollapsed && <span>Made by keRLos</span>}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Thai Vtubers</h1>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavItem item={item} mobile />
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Activity className="w-4 h-4" />
            <span>made by keRLos</span>
          </div>
        </div>
      </div>
    </>
  );
};
