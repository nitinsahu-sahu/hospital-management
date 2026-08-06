import { useEffect, useRef, useState, useCallback } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { PdfIcon } from '../../icons';
//@ts-ignore
import { getInvestigationByPatientId, downloadUltrasoundPDF } from '../../redux/actions/investigation.actions';

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

const UltrasoundView = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);
    const { ultrasounds, loading } = useSelector((state: RootState) => state.investigation);
    const [expandedUltrasoundId, setExpandedUltrasoundId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    console.log("ultrasounds", ultrasounds);

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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'pndt':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'gynae':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'pelvic':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const fetchUltrasounds = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getInvestigationByPatientId(patientId) as any);
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
                        fetchUltrasounds(patient._id)
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
    }, [fetchUltrasounds]);

    const handleDownloadPDF = async (ultrasoundId: string) => {
        try {
            setDownloadingId(ultrasoundId);
            await dispatch(downloadUltrasoundPDF(ultrasoundId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleUltrasoundDetails = (ultrasoundId: string) => {
        setExpandedUltrasoundId(expandedUltrasoundId === ultrasoundId ? null : ultrasoundId);
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
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading ultrasound investigations...</p>
                </div>
            ) : !selectedPatient ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No patient selected</p>
                    <p className="text-sm mt-2">Please select a patient from the header to view their ultrasound investigations</p>
                </div>
            ) : ultrasounds?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No ultrasound investigations found</p>
                    <p className="text-sm mt-2">This patient has no ultrasound records yet</p>
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
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Investigations
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
                                {ultrasounds?.map((ultrasound: any) => (
                                    <>
                                        <tr
                                            key={ultrasound._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                            onClick={() => toggleUltrasoundDetails(ultrasound._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(ultrasound.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(ultrasound.category)}`}>
                                                        {ultrasound.category}
                                                    </span>
                                                    {ultrasound.subCategory && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                            {ultrasound.subCategory}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {getInvestigationCount(ultrasound.investigations)} test{getInvestigationCount(ultrasound.investigations) !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(ultrasound.totalAmount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(ultrasound._id);
                                                        }}
                                                        disabled={downloadingId === ultrasound._id}
                                                        className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Download PDF"
                                                    >
                                                        {downloadingId === ultrasound._id ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                        ) : (
                                                            <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable Details Row */}
                                        <tr key={`${ultrasound._id}-details`}>
                                            <td colSpan={6} className="px-0 py-0">
                                                <div
                                                    className={`transition-all duration-300 ease-in-out ${expandedUltrasoundId === ultrasound._id
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
                                                                    Ultrasound Investigation Details
                                                                </h4>

                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Test Name</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                            {ultrasound.investigations?.map((investigation: any, index: number) => (
                                                                                <tr key={investigation._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                            {investigation.name}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                                            ID: {investigation.id}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(investigation.category)}`}>
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
                                                                                <td colSpan={2} className="px-4 py-3 text-right">
                                                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right">
                                                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                                        {formatCurrency(ultrasound.totalAmount)}
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
                                                                                {ultrasound.createdBy?.name || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                         <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Created at:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {formatDateTime(ultrasound.createdAt)}
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

export default UltrasoundView