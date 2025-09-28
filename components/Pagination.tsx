'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationState } from '@/types/vtuber';

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const Pagination = ({ pagination, onPageChange, onPageSizeChange }: PaginationProps) => {
  const { currentPage, pageSize, totalItems } = pagination;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Calculate what the current page should be with the new page size
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newCurrentPage = Math.ceil(currentFirstItem / newPageSize);
    
    onPageSizeChange(newPageSize);
    onPageChange(newCurrentPage);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show first few pages
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show last few pages
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between items-center">
        {/* Mobile view */}
        <div className="flex justify-between items-center w-full sm:hidden">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Desktop view */}
        <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-900 dark:text-gray-100">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-900 dark:text-gray-100">per page</span>
            </div>
          </div>

          <div className="flex items-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* Previous button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrentPage = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                      isCurrentPage
                        ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
