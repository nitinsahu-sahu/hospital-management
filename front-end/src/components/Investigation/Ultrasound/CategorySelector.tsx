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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Select Investigation Category
      </h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onCategoryChange('pndt')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedMainCategory === 'pndt'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          PNDT / ANTINUTOL
        </button>
        <button
          onClick={() => onCategoryChange('gynae')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedMainCategory === 'gynae'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          GYNAE
        </button>
      </div>
    </>
  );
};

export default CategorySelector;