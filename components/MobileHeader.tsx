'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 lg:hidden">
      <div className="flex items-center justify-between px-4 py-2 h-14">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          type='button'
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-gray-900 dark:text-gray-100" />
        </button>
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/logo.jpg" 
            alt="Thai Vtubers Logo" 
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg object-cover" 
            priority
          />
        </Link>
        
        {/* Spacer to center the logo */}
        <div className="w-9" />
      </div>
    </header>
  );
};
