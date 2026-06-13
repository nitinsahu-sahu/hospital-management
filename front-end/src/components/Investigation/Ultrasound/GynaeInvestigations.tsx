import React from 'react';
import { InvestigationItem, GynaeOption, PelvicSubOption } from '../../../types/investigation.types';

interface GynaeInvestigationsProps {
  gynaeOptions: GynaeOption[];
  pelvicSubOptions: PelvicSubOption[];
  selectedSubCategory: string;
  selectedInvestigations: InvestigationItem[];
  onGynaeSubCategoryChange: (option: GynaeOption) => void;
  onPelvicSubSelection: (option: PelvicSubOption) => void;
  isPelvicSelected: () => boolean;
  getSelectedPelvicName: () => string;
}

const GynaeInvestigations: React.FC<GynaeInvestigationsProps> = ({
  gynaeOptions,
  pelvicSubOptions,
  selectedSubCategory,
  onGynaeSubCategoryChange,
  onPelvicSubSelection,
  isPelvicSelected,
  getSelectedPelvicName
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
        Select GYNAE Investigation
      </h3>

      <select
        value={selectedSubCategory}
        onChange={(e) => {
          const selected = gynaeOptions.find(opt => opt.id === e.target.value);
          if (selected) onGynaeSubCategoryChange(selected);
        }}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select GYNAE Investigation</option>
        {gynaeOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      {/* Pelvic Ultrasound Sub-options */}
      {selectedSubCategory === 'pelvic' && (
        <div className="mt-4 pl-6 border-l-2 border-blue-500 space-y-3">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Select Pelvic Ultrasound Type:
          </h4>
          {pelvicSubOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pelvicOption"
                  checked={isPelvicSelected() && getSelectedPelvicName() === option.name}
                  onChange={() => onPelvicSubSelection(option)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800 dark:text-white">{option.name}</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                ₹{option.price}/-
              </span>
            </label>
          ))}
        </div>
      )}

      {/* FM Info */}
      {selectedSubCategory === 'fm' && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-300">
            ✓ FM (Follicular Monitoring) - Free of cost (₹0/-)
          </p>
        </div>
      )}
    </div>
  );
};

export default GynaeInvestigations;