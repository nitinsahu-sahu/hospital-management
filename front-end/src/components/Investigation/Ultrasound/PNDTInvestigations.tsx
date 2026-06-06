import React from 'react';
import { InvestigationItem, PNDTOption } from '../../../types/investigation.types';

interface PNDTInvestigationsProps {
  options: PNDTOption[];
  selectedInvestigations: InvestigationItem[];
  onSelectionChange: (option: PNDTOption) => void;
  isSelected: (optionId: string) => boolean;
}

const PNDTInvestigations: React.FC<PNDTInvestigationsProps> = ({
  options,
  onSelectionChange,
  isSelected
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
        Select PNDT/ANTINUTOL Investigation
      </h3>
      {options.map((option) => (
        <label
          key={option.id}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected(option.id)}
              onChange={() => onSelectionChange(option)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-800 dark:text-white">{option.name}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            ₹{option.price}/-
          </span>
        </label>
      ))}
    </div>
  );
};

export default PNDTInvestigations;