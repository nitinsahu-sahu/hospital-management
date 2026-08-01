import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import { RootState } from "../../redux/store/store";
import { useDispatch, useSelector } from "react-redux";
//@ts-ignore
import { getPatientHistoryByPatientId, downloadPationtHistoryPDF } from '../../redux/actions/patientHistory.action';
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

const ViewHistory = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { patientHistories, loading } = useSelector((state: RootState) => state.patientHistory);
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);

    // Memoize the fetch function
    const fetchPatientHistory = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getPatientHistoryByPatientId(patientId) as any);
        }
    }, [dispatch]);

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

    // Handle patient selection from session storage
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
                        fetchPatientHistory(patient._id);
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

    const handleDownloadPDF = async (patientHistoryId: any) => {
        try {
            await dispatch(downloadPationtHistoryPDF(patientHistoryId) as any);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const toggleHistoryDetails = (historyId: string) => {
        setExpandedHistoryId(expandedHistoryId === historyId ? null : historyId);
    };

    // First, let's add a helper function to handle "other" cases
const formatChiefComplaint = (history:any) => {
    if (history.chiefComplaints === "other") {
        return history.chiefComplaintsDetails || "Other (No details provided)";
    }
    return history.chiefComplaints || "N/A";
};

// Helper function to format display labels
const formatLabel = (key:any) => {
    const labels = {
        onset: "Onset",
        duration: "Duration",
        associatedSymptoms: "Associated Symptoms",
        cycleLength: "Cycle Length",
        daysOfFlow: "Days of Flow",
        lmp: "Last Menstrual Period",
        gravida: "Gravida",
        para: "Para",
        living: "Living",
        abortion: "Abortion",
        sb_iod_dead: "Still Birth/IOD/Dead",
        ectopic: "Ectopic",
        diabetes: "Diabetes",
        hypertension: "Hypertension",
        asthma: "Asthma",
        thyroid: "Thyroid",
        drugAllergy: "Drug Allergy",
        drugAllergyDetails: "Drug Allergy Details",
        geneticDiseaseSelf: "Genetic Disease (Self)",
        geneticDiseaseFamily: "Genetic Disease (Family)",
        downSyndrome: "Down Syndrome",
        smoking: "Smoking",
        drugAddiction: "Drug Addiction"
    };
    return labels[key] || key;
};

// Helper function to format boolean values
const formatBooleanValue = (value:any) => {
    if (value === true || value === "true" || value === "yes") return "Yes";
    if (value === false || value === "false" || value === "no") return "No";
    return value || "N/A";
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
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading history...</p>
                </div>
            ) : !selectedPatient ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No patient selected</p>
                    <p className="text-sm mt-2">Please select a patient from the header to view their patient history</p>
                </div>
            ) : patientHistories?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No consultations found</p>
                    <p className="text-sm mt-2">This patient has no patient history yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {patientHistories?.map((history: any) => (
                        <div
                            key={history._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out"
                        >
                            {/* Main Row */}
                            <div
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                                onClick={() => toggleHistoryDetails(history._id)}

                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex-1 grid grid-cols-5 gap-4">
                                        <div className="col-span-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(history.patientHistoryDate)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDateTime(history.createdAt)}
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={history.diagnosis}>
                                                {history.chiefComplaints || 'No diagnosis'}
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {history.createdBy?.name || 'N/A'}
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {history.historyOfIllness?.associatedSymptoms}
                                            </span>
                                        </div>

                                        <div className="col-span-1">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {history.husbandMedicalHistory?.diabetes || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side - Action buttons */}
                                    <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleDownloadPDF(history._id)}
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
                                className={`transition-all duration-300 ease-in-out ${expandedHistoryId === history._id
                                    ? 'max-h-[5000px] opacity-100'
                                    : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                            >
                                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="p-6 space-y-6 transform transition-all duration-300 ease-in-out">

                                        {/* Chief Complaints */}
                                        <div className="transform transition-all duration-300 ease-in-out hover:bg-white dark:hover:bg-gray-800 rounded-lg p-3 -mx-1">
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                                Chief Complaints
                                            </label>
                                            <p className="text-gray-900 dark:text-white mt-1 font-medium">
                                                {formatChiefComplaint(history)}
                                            </p>
                                        </div>

                                        {/* History of Illness */}
                                        {history.historyOfIllness && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    History of Illness
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4 ml-4">
                                                    {history.historyOfIllness.onset && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('onset')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(history.historyOfIllness.onset)}</p>
                                                        </div>
                                                    )}
                                                    {history.historyOfIllness.duration && history.historyOfIllness.duration.length > 0 && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('duration')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {history.historyOfIllness.duration.map((d:any) => `${d.number} ${d.unit}`).join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {history.historyOfIllness.associatedSymptoms && (
                                                        <div className="col-span-2">
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('associatedSymptoms')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.historyOfIllness.associatedSymptoms}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Menstrual History */}
                                        {history.menstrualHistory && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Menstrual History
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4 ml-4">
                                                    {history.menstrualHistory.cycleLength && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('cycleLength')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.menstrualHistory.cycleLength} days</p>
                                                        </div>
                                                    )}
                                                    {history.menstrualHistory.daysOfFlow && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('daysOfFlow')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.menstrualHistory.daysOfFlow} days</p>
                                                        </div>
                                                    )}
                                                    {history.menstrualHistory.lmp && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('lmp')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(history.menstrualHistory.lmp)}</p>
                                                        </div>
                                                    )}
                                                    {history.menstrualHistory.associatedSymptoms && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('associatedSymptoms')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.menstrualHistory.associatedSymptoms}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Obstetric History */}
                                        {history.obstetricHistory && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Obstetric History
                                                </h4>
                                                <div className="grid grid-cols-3 gap-4 ml-4">
                                                    {history.obstetricHistory.gravida && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('gravida')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.gravida}</p>
                                                        </div>
                                                    )}
                                                    {history.obstetricHistory.para && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('para')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.para}</p>
                                                        </div>
                                                    )}
                                                    {history.obstetricHistory.living && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('living')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.living}</p>
                                                        </div>
                                                    )}
                                                    {history.obstetricHistory.abortion && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('abortion')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.abortion}</p>
                                                        </div>
                                                    )}
                                                    {history.obstetricHistory.sb_iod_dead && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('sb_iod_dead')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.sb_iod_dead}</p>
                                                        </div>
                                                    )}
                                                    {history.obstetricHistory.ectopic && (
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel('ectopic')}</label>
                                                            <p className="text-sm text-gray-900 dark:text-white">{history.obstetricHistory.ectopic}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Wife Medical History */}
                                        {history.wifeMedicalHistory && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Wife Medical History
                                                </h4>
                                                <div className="grid grid-cols-3 gap-4 ml-4">
                                                    {Object.entries(history.wifeMedicalHistory).map(([key, value]) => {
                                                        // Skip drugAllergyDetails if drugAllergy is not "yes"
                                                        if (key === 'drugAllergyDetails' && history.wifeMedicalHistory.drugAllergy?.toLowerCase() !== 'yes') {
                                                            return null;
                                                        }

                                                        // Skip empty values
                                                        if (!value) return null;

                                                        return (
                                                            <div key={key}>
                                                                <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel(key)}</label>
                                                                <p className="text-sm text-gray-900 dark:text-white">{formatBooleanValue(value)}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Husband Medical History */}
                                        {history.husbandMedicalHistory && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Husband Medical History
                                                </h4>
                                                <div className="grid grid-cols-3 gap-4 ml-4">
                                                    {Object.entries(history.husbandMedicalHistory).map(([key, value]) => {
                                                        // Skip drugAllergyDetails if drugAllergy is not "yes"
                                                        if (key === 'drugAllergyDetails' && history.husbandMedicalHistory.drugAllergy?.toLowerCase() !== 'yes') {
                                                            return null;
                                                        }

                                                        // Skip empty values
                                                        if (!value) return null;

                                                        return (
                                                            <div key={key}>
                                                                <label className="text-xs text-gray-500 dark:text-gray-400">{formatLabel(key)}</label>
                                                                <p className="text-sm text-gray-900 dark:text-white">{formatBooleanValue(value)}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default ViewHistory