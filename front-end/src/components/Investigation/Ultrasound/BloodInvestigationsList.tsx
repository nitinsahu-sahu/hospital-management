import React, { useState, useMemo } from 'react';
import { InvestigationItem, GeneticOption } from '../../../types/investigation.types';

interface BloodInvestigationsListProps {
  title: string;
  options: GeneticOption[];
  selectedInvestigations: InvestigationItem[];
  category: string;
  onSelectionChange: (option: GeneticOption, category: string) => void;
  isSelected: (optionId: string) => boolean;
}

const BloodInvestigationsList: React.FC<BloodInvestigationsListProps> = ({
  title,
  options,
  onSelectionChange,
  isSelected,
  category
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term (matches name or code)
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }

    const lowercasedSearch = searchTerm.toLowerCase().trim();
    return options.filter(option =>
      option.name.toLowerCase().includes(lowercasedSearch) ||
      option.code.toLowerCase().includes(lowercasedSearch)
    );
  }, [options, searchTerm]);

  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-3">
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {options.length} Tests
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          Select the required investigations from below
        </p>
      </div>
      {/* Search Bar */}
      <div className="sticky top-12 bg-white dark:bg-gray-800 z-10 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Search Icon */}
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Count */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Found {filteredOptions.length} result(s)
          </div>
        )}
      </div>

      {/* Scrollable container with max height */}
      <div className="max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        <div className="grid grid-cols-1 gap-3">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <label
                key={option.id}
                className={`
              relative overflow-hidden
              flex flex-col
              p-3 sm:p-4
              border-2 rounded-xl
              cursor-pointer
              transition-all duration-200
              hover:shadow-lg
              ${isSelected(option.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }
            `}

              >
                {isSelected(option.id) && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected(option.id)}
                    onChange={() => onSelectionChange(option, category)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white pr-6 sm:pr-8">
                      {option.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 sm:mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {option.code}
                      </span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        ₹{option.price}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">/-</span>
                    </div>
                  </div>
                </div>

              </label>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No items found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodInvestigationsList;