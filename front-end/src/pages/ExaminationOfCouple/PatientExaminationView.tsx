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
    console.log("==>", patientExaminations);

    const [expandedPatientExaminationId, setExpandedPatientExaminationId] = useState<string | null>(null);
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
    }, [fetchPatitentExamination]);

    const handleDownloadPDF = async (patientExaminationId: string) => {
        try {
            setDownloadingId(patientExaminationId);
            await dispatch(downloadPatientExaminationPDF(patientExaminationId) as any);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const togglePrescriptionDetails = (patientExaminationId: string) => {
        setExpandedPatientExaminationId(expandedPatientExaminationId === patientExaminationId ? null : patientExaminationId);
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

    // Render investigation field
    const renderInvestigationField = (label: string, value: string) => {
        if (!value) return null;
        return (
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
        );
    };

    // Render blood group badge
    const renderBloodGroupBadge = (bloodGroup: string) => {
        if (!bloodGroup) return null;
        const colors: { [key: string]: string } = {
            'A+': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'A-': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            'B+': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'B-': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            'AB+': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'AB-': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            'O+': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'O-': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${colors[bloodGroup] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                {bloodGroup}
            </span>
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
                                        Blood Group
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
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {patientExaminations?.map((patientExamination: any) => (
                                    <>
                                        <tr
                                            key={patientExamination._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                                            onClick={() => togglePrescriptionDetails(patientExamination._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(patientExamination.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderBloodGroupBadge(patientExamination.investigations?.bloodGroup)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderSystemStatus(patientExamination.cns)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderSystemStatus(patientExamination.cvs)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(patientExamination.respiratorySystem) || <span className="text-gray-400 text-sm">Not recorded</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(patientExamination.git) || <span className="text-gray-400 text-sm">Not recorded</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(patientExamination._id);
                                                        }}
                                                        disabled={downloadingId === patientExamination._id}
                                                        className="p-2 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Download PDF"
                                                    >
                                                        {downloadingId === patientExamination._id ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                        ) : (
                                                            <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable Details Row */}
                                        <tr key={`${patientExamination._id}-details`}>
                                            <td colSpan={7} className="px-0 py-0">
                                                <div
                                                    className={`transition-all duration-300 ease-in-out ${expandedPatientExaminationId === patientExamination._id
                                                            ? 'max-h-[5000px] opacity-100'
                                                            : 'max-h-0 opacity-0'
                                                        } overflow-hidden`}
                                                >
                                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                        <div className="p-6 space-y-6">
                                                            {/* Investigations Section */}
                                                            {patientExamination.investigations && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                        </svg>
                                                                        Investigations
                                                                    </h4>

                                                                    {/* Blood Group */}
                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Group:</span>
                                                                            {renderBloodGroupBadge(patientExamination.investigations.bloodGroup)}
                                                                        </div>
                                                                    </div>

                                                                    {/* Blood Tests Grid */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                                        {renderInvestigationField('HIV', patientExamination.investigations.hiv)}
                                                                        {renderInvestigationField('TSH', patientExamination.investigations.tsh)}
                                                                        {renderInvestigationField('HBsAg', patientExamination.investigations.hbsAg)}
                                                                        {renderInvestigationField('RBS', patientExamination.investigations.rbs)}
                                                                        {renderInvestigationField('HCV', patientExamination.investigations.hcv)}
                                                                        {renderInvestigationField('PRL', patientExamination.investigations.prl)}
                                                                        {renderInvestigationField('VDRL', patientExamination.investigations.vdrl)}
                                                                        {renderInvestigationField('SGOT', patientExamination.investigations.sgot)}
                                                                        {renderInvestigationField('DTAH', patientExamination.investigations.dtah)}
                                                                        {renderInvestigationField('SGPT', patientExamination.investigations.sgpt)}
                                                                        {renderInvestigationField('BUN', patientExamination.investigations.bun)}
                                                                        {renderInvestigationField('Sr. Creatinine', patientExamination.investigations.srCreatinine)}
                                                                    </div>

                                                                    {/* Rubella Tests */}
                                                                    {patientExamination.investigations.rubella && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rubella</h5>
                                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                                {renderInvestigationField('IgG', patientExamination.investigations.rubella.igg)}
                                                                                {renderInvestigationField('IgM', patientExamination.investigations.rubella.igm)}
                                                                                {renderInvestigationField('AMH', patientExamination.investigations.rubella.amh)}
                                                                                {renderInvestigationField('Avidity Test', patientExamination.investigations.rubella.avidityTest)}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Other Investigations */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {renderInvestigationField('Thalassemia Screen', patientExamination.investigations.thalassemiaScreen)}
                                                                        {renderInvestigationField('Pap Test', patientExamination.investigations.papTest)}
                                                                        {renderInvestigationField('Karyotype', patientExamination.investigations.karyotype)}
                                                                        {patientExamination.investigations.hsg && (
                                                                            <>
                                                                                {renderInvestigationField('HSG Year', patientExamination.investigations.hsg.year)}
                                                                                {renderInvestigationField('HSG Finding', patientExamination.investigations.hsg.finding)}
                                                                            </>
                                                                        )}
                                                                        {renderInvestigationField('Echocardiography', patientExamination.investigations.echocardiography)}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Medical History Section */}
                                                            {(patientExamination.medicalHistory?.problem || patientExamination.medicalHistory?.currentMedications) && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                        </svg>
                                                                        Medical History
                                                                    </h4>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {patientExamination.medicalHistory.problem && (
                                                                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Problem</span>
                                                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {patientExamination.medicalHistory.problem}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {patientExamination.medicalHistory.currentMedications && (
                                                                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Medications</span>
                                                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {patientExamination.medicalHistory.currentMedications}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Surgical History Section */}
                                                            {patientExamination.surgicalHistory && patientExamination.surgicalHistory.length > 0 && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Surgical History
                                                                    </h4>

                                                                    <div className="space-y-3">
                                                                        {patientExamination.surgicalHistory.map((surgery: any, index: number) => (
                                                                            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                        Surgery #{index + 1}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                                    <div>
                                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Surgery</span>
                                                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                            {surgery.surgery || 'N/A'}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Year</span>
                                                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                            {surgery.year || 'N/A'}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Details / Finding</span>
                                                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                            {surgery.detailsFinding || 'N/A'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Vitals Section */}
                                                            {patientExamination.vitals && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                        </svg>
                                                                        Vital Signs
                                                                    </h4>

                                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                                        {renderVitalSign('PR', patientExamination.vitals.pr, patientExamination.vitals.prUnit, '❤️')}
                                                                        {renderVitalSign('BP', patientExamination.vitals.bp, patientExamination.vitals.bpUnit, '🩸')}
                                                                        {renderVitalSign('Height', patientExamination.vitals.height, patientExamination.vitals.heightUnit, '📏')}
                                                                        {renderVitalSign('Weight', patientExamination.vitals.weight, patientExamination.vitals.weightUnit, '⚖️')}
                                                                        {renderVitalSign('BMI', patientExamination.vitals.bmi, patientExamination.vitals.bmiUnit, '📊')}
                                                                    </div>

                                                                    {patientExamination.vitals.abdominalExamination && (
                                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Abdominal Examination</span>
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
                                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Per Vaginal Examination</span>
                                                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                            {patientExamination.vitals.localExamination.perVaginalExamination}
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                                {patientExamination.vitals.localExamination.perSpeculumExamination && (
                                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Per Speculum Examination</span>
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
                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {patientExamination.createdBy?.name || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400">Examination Date:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                {formatDateTime(patientExamination.createdAt)}
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
};

export default PatientExaminationView;