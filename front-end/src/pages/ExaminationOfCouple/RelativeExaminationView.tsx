import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
//@ts-ignore
import { downloadRelativeExaminationPDF, getRelativeExaminationByPatientId } from '../../redux/actions/relativeExamination.actions';
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

const RelativeExaminationView = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { relativeExaminations, loading } = useSelector((state: RootState) => state.reoc);
    const [expandedRelativeExaminationId, setExpandedRelativeExaminationId] = useState<string | null>(null);
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

    const getStatusBadge = (status: string) => {
        if (!status) return null;
        const isNormal = status.toLowerCase() === 'normal';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isNormal
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                {status}
            </span>
        );
    };

    const fetchRelativeExamination = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getRelativeExaminationByPatientId(patientId) as any);
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
                        fetchRelativeExamination(patient._id)
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
    }, [fetchRelativeExamination]);

    const handleDownloadPDF = async (relativeExaminationId: string) => {
        try {
            setDownloadingId(relativeExaminationId);
            await dispatch(downloadRelativeExaminationPDF(relativeExaminationId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const togglePrescriptionDetails = (relativeExaminationId: string) => {
        setExpandedRelativeExaminationId(expandedRelativeExaminationId === relativeExaminationId ? null : relativeExaminationId);
    };

    const renderSystemStatus = (system: string) => {
        if (!system) return <span className="text-gray-400 text-sm">Not recorded</span>;
        return (
            <div className="flex items-center gap-2">
                {getStatusBadge(system)}
            </div>
        );
    };

    const renderVitalSign = (label: string, value: string, unit: string, icon: string) => {
        if (!value) return null;
        return (
            <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {value} {unit}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <>
            <PageMeta title="Husband Examination" description="Husband/Relative examination" />
            <PageBreadcrumb pageTitle="Relative / Husband Examination View" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <PatientInfoCard
                    selectedPatient={selectedPatient}
                    isExistingConsultation={false}
                    isLoading={false}
                />

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading examinations...</p>
                    </div>
                ) : !selectedPatient ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No patient selected</p>
                        <p className="text-sm mt-2">Please select a patient from the header to view their relative examinations</p>
                    </div>
                ) : relativeExaminations?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No examination found</p>
                        <p className="text-sm mt-2">This patient has no relative examination records yet</p>
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
                                            CNS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            CVS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Respiratory
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            GIT
                                        </th>
                                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created By
                                        </th> */}
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {relativeExaminations?.map((relativeExamination: any) => (
                                        <>
                                            <tr
                                                key={relativeExamination._id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                                onClick={() => togglePrescriptionDetails(relativeExamination._id)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatDateTime(relativeExamination.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderSystemStatus(relativeExamination.cns)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderSystemStatus(relativeExamination.cvs)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(relativeExamination.respiratorySystem) || <span className="text-gray-400 text-sm">Not recorded</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(relativeExamination.git) || <span className="text-gray-400 text-sm">Not recorded</span>}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {relativeExamination.createdBy?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {relativeExamination.createdBy?.email || ''}
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadPDF(relativeExamination._id);
                                                            }}
                                                            disabled={downloadingId === relativeExamination._id}
                                                            className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Download PDF"
                                                        >
                                                            {downloadingId === relativeExamination._id ? (
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                            ) : (
                                                                <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable Details Row */}
                                            <tr key={`${relativeExamination._id}-details`}>
                                                <td colSpan={7} className="px-0 py-0">
                                                    <div
                                                        className={`transition-all duration-300 ease-in-out ${expandedRelativeExaminationId === relativeExamination._id
                                                                ? 'max-h-[5000px] opacity-100'
                                                                : 'max-h-0 opacity-0'
                                                            } overflow-hidden`}
                                                    >
                                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="p-6 space-y-6">
                                                                {/* Vitals Section */}
                                                                {relativeExamination.vitals && (
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                            </svg>
                                                                            Vital Signs
                                                                        </h4>

                                                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                                            {renderVitalSign('PR', relativeExamination.vitals.pr, relativeExamination.vitals.prUnit, '❤️')}
                                                                            {renderVitalSign('BP', relativeExamination.vitals.bp, relativeExamination.vitals.bpUnit, '🩸')}
                                                                            {renderVitalSign('Height', relativeExamination.vitals.height, relativeExamination.vitals.heightUnit, '📏')}
                                                                            {renderVitalSign('Weight', relativeExamination.vitals.weight, relativeExamination.vitals.weightUnit, '⚖️')}
                                                                            {renderVitalSign('BMI', relativeExamination.vitals.bmi, relativeExamination.vitals.bmiUnit, '📊')}
                                                                        </div>

                                                                        {relativeExamination.vitals.abdominalExamination && (
                                                                            <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Abdominal Examination</span>
                                                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {relativeExamination.vitals.abdominalExamination}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* System Details */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {relativeExamination.cns === 'abnormal' && relativeExamination.cnsDetails && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CNS</span>
                                                                                {getStatusBadge(relativeExamination.cns)}
                                                                            </div>
                                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                                {relativeExamination.cnsDetails}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {relativeExamination.cvs === 'abnormal' && relativeExamination.cvsDetails && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CVS</span>
                                                                                {getStatusBadge(relativeExamination.cvs)}
                                                                            </div>
                                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                                {relativeExamination.cvsDetails}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {relativeExamination.respiratorySystem === 'abnormal' && relativeExamination.respiratorySystemDetails && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Respiratory System</span>
                                                                                {getStatusBadge(relativeExamination.respiratorySystem)}
                                                                            </div>
                                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                                {relativeExamination.respiratorySystemDetails}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {relativeExamination.git === 'abnormal' && relativeExamination.gitDetails && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">GIT</span>
                                                                                {getStatusBadge(relativeExamination.git)}
                                                                            </div>
                                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                                {relativeExamination.gitDetails}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Meta Information */}
                                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {relativeExamination.createdBy?.name || 'N/A'}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">

                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400">Examination Date:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {formatDateTime(relativeExamination.createdAt)}
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

export default RelativeExaminationView