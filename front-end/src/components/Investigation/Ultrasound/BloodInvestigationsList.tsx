import React from 'react';
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
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected(option.id)}
                onChange={() => onSelectionChange(option, category)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-gray-800 dark:text-white font-medium">
                  {option.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Code: {option.code}
                </span>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              ₹{option.price}/-
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default BloodInvestigationsList;