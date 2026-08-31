import React from 'react';
import { InfoIcon } from '../../icons';

interface PatientInfoCardProps {
  selectedPatient: any | null;
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
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 sm:h-12 sm:w-12"></div>
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
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 self-start">
            <InfoIcon />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
              No Patient Selected
            </h3>
            <p className="text-sm sm:text-base text-amber-700 dark:text-amber-400">
              Please search and select a patient from the header search bar (Ctrl+K) to continue with the consultation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Mobile Layout (default) */}
      <div className="flex flex-col gap-4">
        {/* Mobile: Centered content */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col items-center sm:flex-row gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
              {selectedPatient.pic?.url ? (
                <img src={selectedPatient.pic.url} alt={selectedPatient.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-xl font-bold text-blue-600 dark:text-blue-300">
                  {selectedPatient.name.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Patient Info */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {selectedPatient.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  UH ID: {selectedPatient.UH_ID}
                </span>
                {selectedPatient.mobileNumber && (
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    📱 {selectedPatient.mobileNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Existing Consultation Badge */}
          {isExistingConsultation && (
            <div className="self-center sm:self-auto">
              <span className="inline-flex items-center px-2.5 py-1 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                Existing Consultation
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};