import React from 'react';
import { InvestigationItem, GynaeOption, PelvicSubOption } from '../../../types/investigation.types';

interface GynaeInvestigationsProps {
  gynaeOptions: GynaeOption[];
  pelvicSubOptions: PelvicSubOption[];
  selectedSubCategory: string;
  selectedInvestigations: InvestigationItem[];
  onGynaeSubCategoryChange: (option: GynaeOption) => void;
  onPelvicSubSelection: (option: PelvicSubOption) => void;
  onFMSelection: (option: PelvicSubOption) => void;
  isPelvicSelected: () => boolean;
  getSelectedPelvicName: () => string;
  isFMSelected?: () => boolean;
}

const GynaeInvestigations: React.FC<GynaeInvestigationsProps> = ({
  gynaeOptions,
  pelvicSubOptions,
  selectedSubCategory,
  selectedInvestigations,
  onGynaeSubCategoryChange,
  onPelvicSubSelection,
  onFMSelection,
}) => {

  // Get FM options (category should be 'fm' for FM)
  const fmOptions = pelvicSubOptions.filter(
    option => option.category === 'fm'
  );

  // Get Pelvic options (category should be 'pelvic' for Pelvic)
  const pelvicOptions = pelvicSubOptions.filter(
    option => option.category === 'pelvic'
  );

  // Check if FM is selected
  const isFMChecked = (optionName: string) => {
    return selectedInvestigations.some(
      item => item.category === 'fm' && item.name === optionName
    );
  };

  // Check if Pelvic is selected
  const isPelvicChecked = (optionName: string) => {
    return selectedInvestigations.some(
      item => item.category === 'pelvic' && item.name === optionName
    );
  };

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

      {/* FM Options */}
      {selectedSubCategory === 'fm' && (
        <div className="mt-4 pl-6 border-l-2 border-green-500 space-y-3">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Select FM (Follicular Monitoring) Type:
          </h4>
          {fmOptions.length > 0 ? (
            fmOptions.map((option) => (
              <label
                key={option._id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-green-200 dark:border-green-800 ${
                  isFMChecked(option.name) ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="fmOption"
                    checked={isFMChecked(option.name)}
                    onChange={() => onFMSelection(option)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-800 dark:text-white">{option.name}</span>
                </div>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{option.price}/-
                </span>
              </label>
            ))
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-300">
                ✓ FM (Follicular Monitoring) - Free of cost (₹0/-)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pelvic Options */}
      {selectedSubCategory === 'pelvic' && (
        <div className="mt-4 pl-6 border-l-2 border-blue-500 space-y-3">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Select Pelvic Ultrasound Type:
          </h4>
          {pelvicOptions.length > 0 ? (
            pelvicOptions.map((option) => (
              <label
                key={option._id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 ${
                  isPelvicChecked(option.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pelvicOption"
                    checked={isPelvicChecked(option.name)}
                    onChange={() => onPelvicSubSelection(option)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 dark:text-white">{option.name}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{option.price}/-
                </span>
              </label>
            ))
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-300">
                ⚠️ No pelvic ultrasound options available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GynaeInvestigations;