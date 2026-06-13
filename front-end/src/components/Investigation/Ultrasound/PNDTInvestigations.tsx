import React from 'react';
import { InvestigationItem, PNDTOption } from '../../../types/investigation.types';
import BloodInvestigationsList from './BloodInvestigationsList';

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
    <div className="space-y-4 sm:space-y-5">
      <BloodInvestigationsList
        title="PNDT/ANTINUTOL Investigations"
        options={options}
        selectedInvestigations={isSelected}
        category="pndt"
        onSelectionChange={onSelectionChange}
        isSelected={isSelected}
      />
      {/* Mobile hint */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 sm:hidden mt-2">
        Tap to select/deselect test
      </p>
    </div>
  );
};

export default PNDTInvestigations;