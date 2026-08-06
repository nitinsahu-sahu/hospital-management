import { useEffect, useRef, useState, useCallback } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { PdfIcon } from '../../icons';
//@ts-ignore
import { getBloodInvestigationByPatientId, downloadRoutinePDF } from '../../redux/actions/bloodInvestigation.actions';

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

const RoutineBloodView = () => {
    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { routinesBlood, loading } = useSelector((state: RootState) => state.bloodInvestigation);
    const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    console.log("routinesBlood", routinesBlood);

    const fetchRoutines = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getBloodInvestigationByPatientId(patientId) as any);
        }
    }, [dispatch]);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getInvestigationCount = (investigations: any[]) => {
        return investigations?.length || 0;
    };

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
                        fetchRoutines(patient._id)
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
    }, [fetchRoutines]);

    const handleDownloadPDF = async (routineId: string) => {
        try {
            setDownloadingId(routineId);
            await dispatch(downloadRoutinePDF(routineId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleRoutine = (routineId: string) => {
        setExpandedRoutineId(expandedRoutineId === routineId ? null : routineId);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading routine blood investigations...</p>
                </div>
            ) : !selectedPatient ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No patient selected</p>
                    <p className="text-sm mt-2">Please select a patient from the header to view their routine blood investigations</p>
                </div>
            ) : routinesBlood?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No routine blood investigations found</p>
                    <p className="text-sm mt-2">This patient has no routine blood investigation records yet</p>
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
                                        Investigations
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {routinesBlood?.map((routine: any) => (
                                    <>
                                        <tr
                                            key={routine._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                            onClick={() => toggleRoutine(routine._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(routine.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        {getInvestigationCount(routine.investigations)} test{getInvestigationCount(routine.investigations) !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(routine.totalAmount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {routine.createdBy?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {routine.createdBy?.email || ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(routine._id);
                                                        }}
                                                        disabled={downloadingId === routine._id}
                                                        className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Download PDF"
                                                    >
                                                        {downloadingId === routine._id ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                        ) : (
                                                            <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Expandable Details Row */}
                                        <tr key={`${routine._id}-details`}>
                                            <td colSpan={5} className="px-0 py-0">
                                                <div
                                                    className={`transition-all duration-300 ease-in-out ${
                                                        expandedRoutineId === routine._id
                                                            ? 'max-h-[5000px] opacity-100'
                                                            : 'max-h-0 opacity-0'
                                                    } overflow-hidden`}
                                                >
                                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                        <div className="p-6 space-y-6">
                                                            {/* Investigations List */}
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                    </svg>
                                                                    Routine Blood Investigation Details
                                                                </h4>
                                                                
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Test Name</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                            {routine.investigations?.map((investigation: any, index: number) => (
                                                                                <tr key={investigation._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                                                            {investigation.code}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                            {investigation.name}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize">
                                                                                            {investigation.category}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                            {formatCurrency(investigation.price)}
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                                                            <tr>
                                                                                <td colSpan={3} className="px-4 py-3 text-right">
                                                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right">
                                                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                                        {formatCurrency(routine.totalAmount)}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </div>

                                                            {/* Metadata */}
                                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {routine.createdBy?.name || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Created at:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {formatDateTime(routine.createdAt)}
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

export default RoutineBloodView