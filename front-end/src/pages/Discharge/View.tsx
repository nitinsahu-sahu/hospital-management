import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
//@ts-ignore
import { downloadDischargePDF, getDischargeData } from '../../redux/actions/discharge.actions';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { PdfIcon } from '../../icons';

export interface SelectedPatient {
    _id: string;
    name: string;
    UH_ID: string;
    pic?: {
        url: string;
    };
    mobileNumber?: string;
    relative?: {
        _id?: string
    }
}

const ViewDischarge = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { dischargesRecord, loading } = useSelector((state: RootState) => state.discharge);
    const [expandedDischargeId, setExpandedDischargeId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);
    
    console.log('dischargesRecord', dischargesRecord);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
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

    const fetchDischargeData = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getDischargeData(patientId) as any);
        }
    }, [dispatch]);

    useEffect(() => {
        const getPatientFromSession = () => {
            const patientId = sessionStorage.getItem('selectedPatientId');
            const patientUHID = sessionStorage.getItem('selectedPatientUHID');
            const patientData = sessionStorage.getItem('selectedPatient');

            if (patientId && patientUHID && patientData) {
                try {
                    const patient = JSON.parse(patientData);

                    // Check if patient has changed using ref
                    if (currentPatientIdRef.current !== patient._id) {
                        // Update ref immediately
                        currentPatientIdRef.current = patient._id;
                        fetchDischargeData(patient._id)
                        setSelectedPatient(patient);
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                    }
                }
            } else {
                // No patient in session
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                }
            }
        };

        // Run immediately
        getPatientFromSession();

        // Set up interval and storage listener
        const interval = setInterval(getPatientFromSession, 1000);
        window.addEventListener('storage', getPatientFromSession);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', getPatientFromSession);
        };
    }, [fetchDischargeData]);

    const handleDownloadPDF = async (dischargeId: string) => {
        try {
            setDownloadingId(dischargeId);
            await dispatch(downloadDischargePDF(dischargeId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleDischargeDetails = (dischargeId: string) => {
        setExpandedDischargeId(expandedDischargeId === dischargeId ? null : dischargeId);
    };

    return (
        <>
            <PageMeta title="Discharge Summary" description="Patient Discharge Summary" />
            <PageBreadcrumb pageTitle="Discharge Summary View" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <PatientInfoCard
                    selectedPatient={selectedPatient}
                    isExistingConsultation={false}
                    isLoading={false}
                />

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading discharge summaries...</p>
                    </div>
                ) : !selectedPatient ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No patient selected</p>
                        <p className="text-sm mt-2">Please select a patient from the header to view their discharge summaries</p>
                    </div>
                ) : dischargesRecord?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No discharge summary found</p>
                        <p className="text-sm mt-2">This patient has no discharge summary records yet</p>
                    </div>
                ) : (
                    <div className="mt-4">
                        {/* Table View */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Discharge Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Follow Up Date
                                        </th>
                                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Final Diagnosis
                                        </th> */}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created By
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {dischargesRecord?.map((discharge: any) => (
                                        <>
                                            <tr
                                                key={discharge._id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                                onClick={() => toggleDischargeDetails(discharge._id)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatDate(discharge.dischargeDate)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(discharge.createdAt).split(',')[1]?.trim() || ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {discharge.followUpDate ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            {formatDate(discharge.followUpDate)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Not set</span>
                                                    )}
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={discharge.finalDiagnosis}>
                                                        {discharge.finalDiagnosis || 'N/A'}
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {discharge.createdBy?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {discharge.createdBy?.email || ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadPDF(discharge._id);
                                                            }}
                                                            disabled={downloadingId === discharge._id}
                                                            className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Download PDF"
                                                        >
                                                            {downloadingId === discharge._id ? (
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                            ) : (
                                                                <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                            )}
                                                        </button>
                                                       
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable Details Row */}
                                            <tr key={`${discharge._id}-details`}>
                                                <td colSpan={5} className="px-0 py-0">
                                                    <div
                                                        className={`transition-all duration-300 ease-in-out ${
                                                            expandedDischargeId === discharge._id
                                                                ? 'max-h-[5000px] opacity-100'
                                                                : 'max-h-0 opacity-0'
                                                        } overflow-hidden`}
                                                    >
                                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="p-6 space-y-6">
                                                                {/* Final Diagnosis */}
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                                        </svg>
                                                                        Final Diagnosis
                                                                    </h4>
                                                                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                                                        {discharge.finalDiagnosis || 'N/A'}
                                                                    </p>
                                                                </div>

                                                                {/* Treatment Summary */}
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                        </svg>
                                                                        Treatment Summary
                                                                    </h4>
                                                                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                                                        {discharge.treatmentSummary || 'N/A'}
                                                                    </p>
                                                                </div>

                                                                {/* Discharge Advice */}
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                        </svg>
                                                                        Discharge Advice
                                                                    </h4>
                                                                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                                                        {discharge.dischargeAdvice || 'N/A'}
                                                                    </p>
                                                                </div>

                                                                {/* Dates */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                                                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                            Discharge Date
                                                                        </h4>
                                                                        <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">
                                                                            {formatDate(discharge.dischargeDate)}
                                                                        </p>
                                                                    </div>

                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            Follow Up Date
                                                                        </h4>
                                                                        <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">
                                                                            {discharge.followUpDate ? formatDate(discharge.followUpDate) : 'Not set'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Metadata */}
                                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {discharge.createdBy?.name || 'N/A'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400">Dischare at:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {formatDateTime(discharge.createdAt)}
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
        </>
    )
}

export default ViewDischarge