import React from 'react';
import { SelectedPatient } from '../../types/consultation';
import { InfoIcon } from '../../icons';
interface PatientInfoCardProps {
  selectedPatient: SelectedPatient | null;
  isExistingConsultation: boolean;
  isLoading: boolean;
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({
  selectedPatient,
  isExistingConsultation,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <InfoIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">No Patient Selected</h3>
            <p className="text-amber-700 dark:text-amber-400">
              Please search and select a patient from the header search bar (Ctrl+K) to continue with the consultation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
            {selectedPatient.pic?.url ? (
              <img src={selectedPatient.pic.url} alt={selectedPatient.name} className="w-12 h-12 object-cover" />
            ) : (
              <span className="text-xl font-bold text-blue-600 dark:text-blue-300">{selectedPatient.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedPatient.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">UH ID: {selectedPatient.UH_ID}</span>
              {selectedPatient.mobileNumber && (
                <span className="text-sm text-gray-600 dark:text-gray-400">📱 {selectedPatient.mobileNumber}</span>
              )}
              {isExistingConsultation && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Existing Consultation
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};