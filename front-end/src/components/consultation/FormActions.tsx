import React from 'react';
import { Save } from '../../icons';

interface FormActionsProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  isExisting: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onSubmit, isSubmitting, isExisting }) => {
  return (
    <div className="flex justify-end gap-4">
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save />
        {isSubmitting ? 'Saving...' : isExisting ? 'Update Consultation' : 'Save Consultation'}
      </button>
    </div>
  );
};