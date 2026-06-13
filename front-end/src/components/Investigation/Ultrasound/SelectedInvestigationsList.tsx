import React from 'react';
import { InvestigationItem } from '../../../types/investigation.types';

interface SelectedInvestigationsListProps {
  investigations: InvestigationItem[];
  totalAmount: number;
  onRemove: (id: string) => void;
}

const SelectedInvestigationsList: React.FC<SelectedInvestigationsListProps> = ({
  investigations,
  totalAmount,
  onRemove
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Selected Investigations
      </h2>

      <div className="space-y-3">
        {investigations.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <span className="text-gray-800 dark:text-white font-medium">
                {item.name}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 capitalize">
                ({item.category})
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                ₹{item.price}/-
              </span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Total Amount:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{totalAmount}/-
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectedInvestigationsList;