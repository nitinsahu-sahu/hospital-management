import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
//@ts-ignore
import { getPatientExaminationByPatientId, downloadPatientExaminationPDF } from '../../redux/actions/patientExamination.actions';
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

const PatientExaminationView = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { patientExaminations, loading } = useSelector((state: RootState) => state.eoc);
    const [expandedPatientExaminationId, setExpandedPatientExaminationId] = useState<string | null>(null);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        if (!status) return null;
        const isNormal = status.toLowerCase() === 'normal';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isNormal 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
                {status}
            </span>
        );
    };

    // Memoize the fetch function
    const fetchPatitentExamination = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getPatientExaminationByPatientId(patientId) as any);
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
                        fetchPatitentExamination(patient._id);
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
    }, []);

    const handleDownloadPDF = async (patientExaminationId: string) => {
        try {
            await dispatch(downloadPatientExaminationPDF(patientExaminationId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    const togglePrescriptionDetails = (patientExaminationId: string) => {
        setExpandedPatientExaminationId(expandedPatientExaminationId === patientExaminationId ? null : patientExaminationId);
    };

    const renderSystemStatus = (system: string, details: string) => {
        if (!system) return <span className="text-gray-400 text-sm">Not recorded</span>;
        return (
            <div className="flex items-center gap-2">
                {getStatusBadge(system)}
                {system === 'abnormal' && details && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {details}
                    </span>
                )}
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
                    <p className="text-sm mt-2">Please select a patient from the header to view their examinations</p>
                </div>
            ) : patientExaminations?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No examination found</p>
                    <p className="text-sm mt-2">This patient has no examination records yet</p>
                </div>
            ) : (
                <div className="space-y-3 mt-4">
                    {patientExaminations?.map((patientExamination: any, index: number) => (
                        <div
                            key={patientExamination._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out"
                        >
                            {/* Main Row - Clickable */}
                            <div
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                                onClick={() => togglePrescriptionDetails(patientExamination._id)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        {/* Date */}
                                        <div className="col-span-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(patientExamination.patientExaminationDate)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDateTime(patientExamination.createdAt).split(',')[1] || ''}
                                            </div>
                                        </div>

                                        {/* CNS Status */}
                                        <div className="col-span-1">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">CNS</div>
                                            <div className="mt-1">
                                                {renderSystemStatus(patientExamination.cns, patientExamination.cnsDetails)}
                                            </div>
                                        </div>

                                        {/* CVS Status */}
                                        <div className="col-span-1">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">CVS</div>
                                            <div className="mt-1">
                                                {renderSystemStatus(patientExamination.cvs, patientExamination.cvsDetails)}
                                            </div>
                                        </div>

                                        {/* Respiratory & GIT */}
                                        <div className="col-span-1">
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Respiratory: </span>
                                                    {getStatusBadge(patientExamination.respiratorySystem)}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">GIT: </span>
                                                    {getStatusBadge(patientExamination.git)}
                                                </div>

                                            </div>
                                        </div>

                                        
                                    </div>
                                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                            <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadPDF(patientExamination._id);
                                            }}
                                            className="p-1.5 rounded-lg text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110"
                                            title="Download PDF"
                                        >
                                            <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                        </button>
                                        </div>
                                </div>
                            </div>

                            {/* Expandable Details Section */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${
                                    expandedPatientExaminationId === patientExamination._id
                                        ? 'max-h-[5000px] opacity-100'
                                        : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="p-6 space-y-6">
                                        {/* Vitals Section */}
                                        {patientExamination.vitals && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Vital Signs
                                                </h4>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {renderVitalSign('PR', patientExamination.vitals.pr, patientExamination.vitals.prUnit, '❤️')}
                                                    {renderVitalSign('BP', patientExamination.vitals.bp, patientExamination.vitals.bpUnit, '🩸')}
                                                    {renderVitalSign('Height', patientExamination.vitals.height, patientExamination.vitals.heightUnit, '📏')}
                                                    {renderVitalSign('Weight', patientExamination.vitals.weight, patientExamination.vitals.weightUnit, '⚖️')}
                                                    {renderVitalSign('BMI', patientExamination.vitals.bmi, patientExamination.vitals.bmiUnit, '📊')}
                                                </div>

                                                {patientExamination.vitals.abdominalExamination && (
                                                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Abdominal Examination</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                            {patientExamination.vitals.abdominalExamination}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Local Examination */}
                                                {(patientExamination.vitals.localExamination?.perVaginalExamination || 
                                                  patientExamination.vitals.localExamination?.perSpeculumExamination) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {patientExamination.vitals.localExamination.perVaginalExamination && (
                                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Per Vaginal Examination</span>
                                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                    {patientExamination.vitals.localExamination.perVaginalExamination}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {patientExamination.vitals.localExamination.perSpeculumExamination && (
                                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Per Speculum Examination</span>
                                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                    {patientExamination.vitals.localExamination.perSpeculumExamination}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* System Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {patientExamination.cns === 'abnormal' && patientExamination.cnsDetails && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CNS</span>
                                                        {getStatusBadge(patientExamination.cns)}
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {patientExamination.cnsDetails}
                                                    </p>
                                                </div>
                                            )}

                                            {patientExamination.cvs === 'abnormal' && patientExamination.cvsDetails && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CVS</span>
                                                        {getStatusBadge(patientExamination.cvs)}
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {patientExamination.cvsDetails}
                                                    </p>
                                                </div>
                                            )}

                                            {patientExamination.respiratorySystem === 'abnormal' && patientExamination.respiratorySystemDetails && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Respiratory System</span>
                                                        {getStatusBadge(patientExamination.respiratorySystem)}
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {patientExamination.respiratorySystemDetails}
                                                    </p>
                                                </div>
                                            )}

                                            {patientExamination.git === 'abnormal' && patientExamination.gitDetails && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">GIT</span>
                                                        {getStatusBadge(patientExamination.git)}
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {patientExamination.gitDetails}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta Information */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <div>
                                                    <span>Created by: </span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {patientExamination.createdBy?.name || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span>Created at: </span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {formatDateTime(patientExamination.createdAt)}
                                                    </span>
                                                </div>
                                                {patientExamination.updatedBy && patientExamination.updatedBy._id !== patientExamination.createdBy?._id && (
                                                    <div>
                                                        <span>Updated by: </span>
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {patientExamination.updatedBy.name}
                                                        </span>
                                                    </div>
                                                )}
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
};

export default PatientExaminationView;