'use client';

import { useEffect, useState } from 'react';
import { ThemeContext } from '@/hooks/useTheme';

type Theme = 'light' | 'dark' | 'system';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setActualTheme(systemTheme);
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateActualTheme);
      return () => mediaQuery.removeEventListener('change', updateActualTheme);
    }
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme to html element for Tailwind dark mode
    const applyTheme = () => {
      const html = document.documentElement;
      
      // Force remove all theme classes and attributes first
      html.classList.remove('light', 'dark');
      html.removeAttribute('data-theme');
      
      // Add the correct theme class
      html.classList.add(actualTheme);
      
      // Also set data attribute for additional targeting
      html.setAttribute('data-theme', actualTheme);
      
      // Also apply to body for consistency
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(actualTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#0a0a0a' : '#ffffff');
      }
      
      // Force a style recalculation
      html.style.colorScheme = actualTheme === 'dark' ? 'dark' : 'light';
      
      // Debug log
      console.log('Theme applied:', actualTheme, 'HTML classes:', html.className, 'Data theme:', html.getAttribute('data-theme'));
    };

    // Apply immediately and also after a short delay to ensure it sticks
    applyTheme();
    setTimeout(applyTheme, 10);
    setTimeout(applyTheme, 100);
  }, [actualTheme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      actualTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
