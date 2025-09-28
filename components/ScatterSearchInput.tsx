'use client';

import { ChangeEvent, KeyboardEvent, useState, useCallback, useRef, useEffect, useMemo } from 'react';

// Text normalization function for advanced search matching
const normalizeText = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

interface ScatterSearchInputProps {
  onChannelSelect: (channel: string) => void;
  onChannelRemove: (channel: string) => void;
  onClearAll: () => void;
  selectedChannels: string[];
  allChannels: string[];
  placeholder?: string;
}

export default function ScatterSearchInput({
  onChannelSelect,
  onChannelRemove,
  onClearAll,
  selectedChannels,
  allChannels,
  placeholder = "Search for VTuber channels here..."
}: ScatterSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Advanced search suggestions with text normalization and scoring
  const suggestions = useMemo(() => {
    const normalizedTerm = normalizeText(searchTerm.trim());
    const available = allChannels.filter(name => !selectedChannels.includes(name));

    if (!normalizedTerm) {
      return available.slice(0, 20);
    }

    return available
      .map(name => ({
        name,
        normalized: normalizeText(name),
      }))
      .filter(item => item.normalized.includes(normalizedTerm))
      .sort((a, b) => {
        const aStarts = a.normalized.startsWith(normalizedTerm);
        const bStarts = b.normalized.startsWith(normalizedTerm);
        if (aStarts !== bStarts) {
          return aStarts ? -1 : 1;
        }
        return a.normalized.localeCompare(b.normalized);
      })
      .map(item => item.name)
      .slice(0, 20);
  }, [searchTerm, allChannels, selectedChannels]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsOpen(value.trim().length > 0);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const [firstOption] = suggestions;
      if (firstOption) {
        onChannelSelect(firstOption);
        setSearchTerm('');
        setIsOpen(false);
        return;
      }

      const exactMatch = allChannels.find(
        name => name.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (exactMatch) {
        onChannelSelect(exactMatch);
        setSearchTerm('');
        setIsOpen(false);
        return;
      }

      setIsOpen(false);
    }
  }, [suggestions, allChannels, searchTerm, onChannelSelect]);

  const handleBlur = useCallback(() => {
    // Delay closing to allow clicks on suggestions
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleChannelSelect = useCallback((channel: string) => {
    onChannelSelect(channel);
    setSearchTerm('');
    setIsOpen(false);
  }, [onChannelSelect]);

  const handleChannelRemove = useCallback((channel: string) => {
    onChannelRemove(channel);
  }, [onChannelRemove]);

  const handleClearAll = useCallback(() => {
    onClearAll();
    setSearchTerm('');
    setIsOpen(false);
  }, [onClearAll]);

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim().length > 0 && setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        {isOpen && searchTerm.trim() !== '' && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
            {suggestions.length > 0 ? (
              suggestions.map(name => (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleChannelSelect(name);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    {name}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No results found
              </li>
            )}
          </ul>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Type to search for channels. Press Enter or click a result to add it to the comparison list.
      </p>
      {selectedChannels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedChannels.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              {name}
              <button
                type="button"
                onClick={() => handleChannelRemove(name)}
                className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
              >
                x
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
