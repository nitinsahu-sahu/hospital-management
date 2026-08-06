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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
      setDownloadingId(consultationId);
      await dispatch(downloadConsultancyPDF(consultationId) as any);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

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
        <div className="mt-4">
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {patientConsultations?.map((consultation: Consultation) => (
                  <>
                    <tr
                      key={consultation._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                      onClick={() => toggleConsultationDetails(consultation._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDateTime(consultation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={consultation.diagnosis}>
                          {consultation.diagnosis || 'No diagnosis'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {consultation.createdBy?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {consultation.createdBy?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          ₹{toNumber(consultation.totalAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(consultation._id);
                            }}
                            disabled={downloadingId === consultation._id}
                            className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download PDF"
                          >
                            {downloadingId === consultation._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                            ) : (
                              <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    <tr key={`${consultation._id}-details`}>
                      <td colSpan={6} className="px-0 py-0">
                        <div
                          className={`transition-all duration-300 ease-in-out ${expandedConsultationId === consultation._id
                            ? 'max-h-[5000px] opacity-100'
                            : 'max-h-0 opacity-0'
                            } overflow-hidden`}
                        >
                          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="p-6 space-y-6">


                              {/* Diagnosis */}
                              <div className="transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                  Diagnosis
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                  {consultation.diagnosis || 'N/A'}
                                </p>
                              </div>

                              {/* Doctor Notes */}
                              <div className="transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Doctor Notes
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                  {consultation.doctorNotes || 'N/A'}
                                </p>
                              </div>

                              {/* Fees Breakdown */}
                              <div className="transform transition-all duration-300 ease-in-out">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Fees Breakdown
                                </label>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                  <div className="space-y-2">
                                    {toNumber(consultation.fees?.emergencyConsultationFee) > 0 && (
                                      <div className="flex justify-between items-center py-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-3 -mx-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                          Emergency Consultation Fee
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          ₹{toNumber(consultation.fees.emergencyConsultationFee).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    {toNumber(consultation.fees?.geneticConsultationFee) > 0 && (
                                      <div className="flex justify-between items-center py-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-3 -mx-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                          Genetic Consultation Fee
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          ₹{toNumber(consultation.fees.geneticConsultationFee).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    {toNumber(consultation.fees?.opdConsultationFee) > 0 && (
                                      <div className="flex justify-between items-center py-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-3 -mx-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                          OPD Consultation Fee
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          ₹{toNumber(consultation.fees.opdConsultationFee).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    {consultation.fees?.additionalFees?.map((fee, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center py-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-3 -mx-3"
                                      >
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                          {fee.name}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          ₹{toNumber(fee.amount).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                      <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                                          ₹{toNumber(consultation.totalAmount).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {consultation.createdBy?.name || 'N/A'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 dark:text-gray-400">Consultation at:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {formatDateTime(consultation.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}