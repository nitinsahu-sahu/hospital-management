import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import { PdfIcon } from '../../icons';
import { RootState } from "../../redux/store/store";
import { useDispatch, useSelector } from "react-redux";
//@ts-ignore
import { getPrescriptionsByPatient, downloadPrescriptionPDF } from "../../redux/actions/prescription.action";

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

const ViewPrescription = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { prescriptions, loading } = useSelector((state: RootState) => state.prescriptions);
    const [expandedPrescriptionId, setExpandedPrescriptionId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);

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

    // Memoize the fetch function
    const fetchPrescription = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getPrescriptionsByPatient(patientId) as any);
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

                    if (currentPatientIdRef.current !== patient._id) {
                        currentPatientIdRef.current = patient._id;
                        fetchPrescription(patient._id);
                        setSelectedPatient(patient);
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                    }
                }
            } else {
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                }
            }
        };

        getPatientFromSession();

        const interval = setInterval(getPatientFromSession, 1000);
        window.addEventListener('storage', getPatientFromSession);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', getPatientFromSession);
        };
    }, [fetchPrescription]);

    const handleDownloadPDF = async (prescriptionId: string) => {
        try {
            setDownloadingId(prescriptionId);
            await dispatch(downloadPrescriptionPDF(prescriptionId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const togglePrescriptionDetails = (prescriptionId: string) => {
        setExpandedPrescriptionId(expandedPrescriptionId === prescriptionId ? null : prescriptionId);
    };

    // Get frequency color based on value
    const getFrequencyColor = (frequency: string) => {
        const colors: { [key: string]: string } = {
            'Once Daily': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'Twice Daily': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'Three Times Daily': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'Every 4 Hours': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            'Every 6 Hours': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'Every 8 Hours': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        };
        return colors[frequency] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    // Get route icon
    const getRouteIcon = (route: string) => {
        switch (route) {
            case 'Oral':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                );
            case 'Intravenous (IV)':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                );
            case 'Topical':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />

            {/* Prescriptions List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading prescriptions...</p>
                </div>
            ) : !selectedPatient ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No patient selected</p>
                    <p className="text-sm mt-2">Please select a patient from the header to view their prescriptions</p>
                </div>
            ) : prescriptions?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No prescription found</p>
                    <p className="text-sm mt-2">This patient has no prescription yet</p>
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
                                        Medications
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Instructions
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {prescriptions?.map((prescription: any) => (
                                    <>
                                        <tr
                                            key={prescription._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                            onClick={() => togglePrescriptionDetails(prescription._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(prescription.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {prescription.medications?.length || 0} Medication{(prescription.medications?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {prescription.createdBy?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {prescription.createdBy?.email || ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {prescription.specialInstructions ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                        </svg>
                                                        Has instructions
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(prescription._id);
                                                        }}
                                                        disabled={downloadingId === prescription._id}
                                                        className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Download PDF"
                                                    >
                                                        {downloadingId === prescription._id ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                        ) : (
                                                            <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable Details Row */}
                                        <tr key={`${prescription._id}-details`}>
                                            <td colSpan={5} className="px-0 py-0">
                                                <div
                                                    className={`transition-all duration-300 ease-in-out ${expandedPrescriptionId === prescription._id
                                                            ? 'max-h-[5000px] opacity-100'
                                                            : 'max-h-0 opacity-0'
                                                        } overflow-hidden`}
                                                >
                                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                        <div className="p-6 space-y-6">
                                                            {/* Medications List */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                                    </svg>
                                                                    Prescribed Medications
                                                                </h4>

                                                                {prescription.medications?.map((medication: any, index: number) => (
                                                                    <div
                                                                        key={medication._id || index}
                                                                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                                                                    >
                                                                        <div className="flex items-start justify-between mb-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                                                                    {index + 1}
                                                                                </span>
                                                                                <h5 className="font-semibold text-gray-900 dark:text-white text-base">
                                                                                    {medication.drugName}
                                                                                </h5>
                                                                            </div>
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyColor(medication.frequency)}`}>
                                                                                {medication.frequency}
                                                                            </span>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-10">
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Dosage</span>
                                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{medication.dosage} mg</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Duration</span>
                                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{medication.duration} days</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                {getRouteIcon(medication.route)}
                                                                                <div>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Route</span>
                                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{medication.route}</p>
                                                                                </div>
                                                                            </div>

                                                                            {medication.instructions && (
                                                                                <div className="col-span-2 md:col-span-3 flex items-start gap-2">
                                                                                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    <div>
                                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Instructions</span>
                                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{medication.instructions}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Special Instructions */}
                                                            {prescription.specialInstructions && (
                                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                                                        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                                        </svg>
                                                                        Special Instructions
                                                                    </h4>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 ml-6">
                                                                        {prescription.specialInstructions}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Metadata */}
                                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {prescription.createdBy?.name || 'N/A'}
                                                                            </span>
                                                                        </div>

                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Prescription at:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {formatDateTime(prescription.createdAt)}
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
    )
}

export default ViewPrescription