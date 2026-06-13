import React from 'react';

interface CategorySelectorProps {
  selectedMainCategory: 'pndt' | 'gynae' | '';
  onCategoryChange: (category: 'pndt' | 'gynae') => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedMainCategory, 
  onCategoryChange 
}) => {
  return (
    <>

      {/* Responsive Button Group */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-6 sm:mb-8">
        {/* PNDT Button */}
        <button
          onClick={() => onCategoryChange('pndt')}
          className={`
            relative overflow-hidden group
            w-full sm:flex-1
            px-3 sm:px-4 md:px-6 lg:px-8
            py-2 sm:py-2.5 md:py-3 lg:py-3.5
            rounded-lg sm:rounded-xl
            font-medium text-xs sm:text-sm md:text-base
            transition-all duration-300
            transform hover:scale-[1.02] active:scale-[0.98]
            ${
              selectedMainCategory === 'pndt'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md'
            }
          `}
        >
          <span className="relative z-10">
            PNDT / ANTINUTOL
            {selectedMainCategory === 'pndt' && (
              <span className="absolute -right-1 -top-1 flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-white"></span>
              </span>
            )}
          </span>
        </button>

        {/* GYNAE Button */}
        <button
          onClick={() => onCategoryChange('gynae')}
          className={`
            relative overflow-hidden group
            w-full sm:flex-1
            px-3 sm:px-4 md:px-6 lg:px-8
            py-2 sm:py-2.5 md:py-3 lg:py-3.5
            rounded-lg sm:rounded-xl
            font-medium text-xs sm:text-sm md:text-base
            transition-all duration-300
            transform hover:scale-[1.02] active:scale-[0.98]
            ${
              selectedMainCategory === 'gynae'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md'
            }
          `}
        >
          <span className="relative z-10">
            GYNAE
            {selectedMainCategory === 'gynae' && (
              <span className="absolute -right-1 -top-1 flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-white"></span>
              </span>
            )}
          </span>
        </button>
      </div>
    </>
  );
};

export default CategorySelector;