'use client';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Data provided by{' '}
            <a 
              href="https://vtuber.chuysan.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 underline"
            >
              vtuber.chuysan.com
            </a>
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Thai VTuber. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
