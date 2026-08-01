import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationsByPatientId, downloadConsultancyPDF } from '../../redux/actions/consultationNew.actions';
import { SelectedPatient, Consultation } from '../../types/consultationNew';
import { PdfIcon } from '../../icons';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';

export default function View() {
  const dispatch = useDispatch();
  const { patientConsultations, loading } = useSelector((state: RootState) => state.consultation);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null);

  // Use a ref to track the previous patient ID to avoid unnecessary re-fetches
  const previousPatientId = useRef<string | null>(null);

  // Memoize the fetch function
  const fetchConsultations = useCallback((patientId: string) => {
    if (patientId && patientId !== previousPatientId.current) {
      previousPatientId.current = patientId;
      dispatch(getConsultationsByPatientId(patientId) as any);
    }
  }, [dispatch]);

  // Check session storage periodically and on window focus
  useEffect(() => {
    const checkPatientFromSession = () => {
      const patientData = sessionStorage.getItem('selectedPatient');
      if (patientData) {
        try {
          const patient = JSON.parse(patientData);
          // Only update if patient ID changed
          if (!selectedPatient || selectedPatient._id !== patient._id) {
            setSelectedPatient(patient);
            setExpandedConsultationId(null); // Reset expanded consultation when patient changes
            fetchConsultations(patient._id);
          }
        } catch (error) {
          console.error('Error parsing patient data:', error);
        }
      } else {
        // Clear if no patient in session
        setSelectedPatient(null);
        setExpandedConsultationId(null);
        previousPatientId.current = null;
      }
    };

    // Check immediately on mount
    checkPatientFromSession();

    // Check periodically (every 1 second)
    const interval = setInterval(checkPatientFromSession, 1000);

    // Also check when window gets focus (when user switches tabs)
    const handleFocus = () => {
      checkPatientFromSession();
    };
    window.addEventListener('focus', handleFocus);

    // Listen for storage changes (if using multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPatient' || e.key === 'selectedPatientId') {
        checkPatientFromSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Custom event listener for when patient is selected from header
    const handlePatientSelected = () => {
      checkPatientFromSession();
    };
    window.addEventListener('patientSelected', handlePatientSelected);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('patientSelected', handlePatientSelected);
    };
  }, [selectedPatient, fetchConsultations]);

  // Helper function to safely convert to number
  const toNumber = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value) || 0;
    return 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleConsultationDetails = (consultationId: string) => {
    setExpandedConsultationId(expandedConsultationId === consultationId ? null : consultationId);
  };

  const handleDownloadPDF = async (consultationId: any) => {
    try {
      await dispatch(downloadConsultancyPDF(consultationId) as any);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div>
      <PatientInfoCard
        selectedPatient={selectedPatient}
        isExistingConsultation={false}
        isLoading={false}
      />

      {/* Consultations List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading consultations...</p>
        </div>
      ) : !selectedPatient ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No patient selected</p>
          <p className="text-sm mt-2">Please select a patient from the header to view their consultation history</p>
        </div>
      ) : patientConsultations?.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No consultations found</p>
          <p className="text-sm mt-2">This patient has no consultation history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patientConsultations?.map((consultation: Consultation) => (
            <div
              key={consultation._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out"
            >
              {/* Main Row */}
              <div
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                onClick={() => toggleConsultationDetails(consultation._id)}

              >
                <div className="flex-1 grid grid-cols-5 gap-4">
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(consultation.consultationDate)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(consultation.createdAt)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={consultation.diagnosis}>
                      {consultation.diagnosis || 'No diagnosis'}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {consultation.createdBy?.name || 'N/A'}
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ₹{toNumber(consultation.totalAmount).toLocaleString()}
                    </span>
                  </div>

                  <div className="col-span-1 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${consultation.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : consultation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {consultation.status || 'completed'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  {/* <Button
                    // variant="primary"
                    onClick={handleDownloadPDF(consultation._id)}
                  >
                    <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                  </Button> */}
                  <button
                    onClick={() => handleDownloadPDF(consultation._id)}
                    className="p-1.5 rounded-lg text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110"
                    title="Download PDF"
                  >
                    <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                  </button>
                </div>
              </div>

              {/* Expandable Details Section with Animation */}
              <div
                className={`transition-all duration-300 ease-in-out ${expandedConsultationId === consultation._id
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  } overflow-hidden`}
              >
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="p-4 space-y-4 transform transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="transform transition-all duration-300 ease-in-out hover:translate-x-1">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Date
                        </label>
                        <p className="text-gray-900 dark:text-white mt-1 font-medium">
                          {formatDate(consultation.consultationDate)}
                        </p>
                      </div>

                      <div className="transform transition-all duration-300 ease-in-out hover:translate-x-1">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Doctor
                        </label>
                        <p className="text-gray-900 dark:text-white mt-1 font-medium">
                          {consultation.createdBy?.name || 'N/A'}
                        </p>
                      </div>

                      <div className="transform transition-all duration-300 ease-in-out hover:translate-x-1">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Status
                        </label>
                        <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full transition-all duration-300 ${consultation.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : consultation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {consultation.status || 'completed'}
                        </span>
                      </div>

                      <div className="transform transition-all duration-300 ease-in-out hover:translate-x-1">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Total Amount
                        </label>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 text-lg">
                          ₹{toNumber(consultation.totalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="transform transition-all duration-300 ease-in-out hover:bg-white dark:hover:bg-gray-800 rounded-lg p-3 -mx-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Diagnosis
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {consultation.diagnosis || 'N/A'}
                      </p>
                    </div>

                    <div className="transform transition-all duration-300 ease-in-out hover:bg-white dark:hover:bg-gray-800 rounded-lg p-3 -mx-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Doctor Notes
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {consultation.doctorNotes || 'N/A'}
                      </p>
                    </div>

                    <div className="transform transition-all duration-300 ease-in-out">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Fees Breakdown
                      </label>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                        <div className="space-y-2">
                          {toNumber(consultation.fees?.emergencyConsultationFee) > 0 && (
                            <div className="flex justify-between items-center py-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Emergency Consultation Fee
                              </span>
                              <span className="text-sm font-medium">
                                ₹{toNumber(consultation.fees.emergencyConsultationFee).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {toNumber(consultation.fees?.geneticConsultationFee) > 0 && (
                            <div className="flex justify-between items-center py-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Genetic Consultation Fee
                              </span>
                              <span className="text-sm font-medium">
                                ₹{toNumber(consultation.fees.geneticConsultationFee).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {toNumber(consultation.fees?.opdConsultationFee) > 0 && (
                            <div className="flex justify-between items-center py-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                OPD Consultation Fee
                              </span>
                              <span className="text-sm font-medium">
                                ₹{toNumber(consultation.fees.opdConsultationFee).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {consultation.fees?.additionalFees?.map((fee, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2"
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {fee.name}
                              </span>
                              <span className="text-sm font-medium">
                                ₹{toNumber(fee.amount).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg transition-all duration-300 hover:scale-110 transform">
                                ₹{toNumber(consultation.totalAmount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}