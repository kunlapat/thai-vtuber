'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Home, 
  Menu, 
  X,
  ChevronLeft,
  Activity,
  Play,
  ExternalLink,
  Plus,
  Github
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle, isMobileOpen, onMobileToggle }: SidebarProps) => {
  const pathname = usePathname();

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
        onClick={() => mobile && onMobileToggle()}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'text-white dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
          ${isCollapsed && !mobile ? 'justify-center px-2' : ''}
        `}
        style={isActive ? { backgroundColor: '#155DFC', color: 'white' } : {}}
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
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Desktop Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          hidden lg:flex flex-col
        `}
      >
        {/* Header */}
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${
          isCollapsed ? 'flex-col gap-2' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2 justify-center">
            <Image 
              src="/images/logo.jpg" 
              alt="Thai Vtubers Logo" 
              width={isCollapsed ? 32 : 128}
              height={isCollapsed ? 32 : 128}
              className={`rounded-lg object-cover transition-all duration-300 ${
                isCollapsed ? 'w-8 h-8' : 'w-32 h-32'
              }`}
            />
          </div>
          <button
            onClick={onToggle}
            type='button'
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-900 dark:text-gray-100"
          >
            <ChevronLeft 
              className={`w-4 h-4 transition-transform text-gray-900 dark:text-gray-100 cursor-pointer ${
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

        {/* Submit Channel Section */}
        <div className="px-4 py-2">
          <hr className="border-gray-200 dark:border-gray-700 mb-3" />
          <Link
            href="https://vtuber.chuysan.com/#/register"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            prefetch={false}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">Submit new channel</span>
            )}
          </Link>
          
          {/* GitHub Repository Link */}
          <Link
            href="https://github.com/kunlapat/thai-vtuber"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 mt-2
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            prefetch={false}
          >
            <Github className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">Repository</span>
            )}
          </Link>
        </div>

        {/* Theme Toggle */}
        <div className="px-4 py-2">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <Activity className="w-4 h-4" />
            {!isCollapsed && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                <div>
                  Forked from{' '}
                  <Link
                    href="https://www.facebook.com/kerlosth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                    prefetch={false}
                  >
                    keRLos
                  </Link>
                </div>
                <div>Enhanced by kunlapat</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Image 
              src="/images/logo.jpg" 
              alt="Thai Vtubers Logo" 
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover" 
            />
          </div>
          <button
            onClick={onMobileToggle}
            type='button'
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-900 dark:text-gray-100" />
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

        {/* Mobile Submit Channel Section */}
        <div className="px-4 py-2">
          <hr className="border-gray-200 dark:border-gray-700 mb-3" />
          <Link
            href="https://vtuber.chuysan.com/#/register"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMobileToggle}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            prefetch={false}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Submit new channel</span>
          </Link>
          
          {/* GitHub Repository Link */}
          <Link
            href="https://github.com/kunlapat/thai-vtuber"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMobileToggle}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 mt-2"
            prefetch={false}
          >
            <Github className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Repository</span>
          </Link>
        </div>

        {/* Mobile Theme Toggle */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Activity className="w-4 h-4" />
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            <div>
              Forked from{' '}
              <Link
                href="https://www.facebook.com/kerlosth"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 dark:text-blue-400"
                prefetch={false}
              >
                keRLos
              </Link>
            </div>
            <div>Enhanced by kunlapat</div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};
