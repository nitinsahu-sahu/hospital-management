import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import Alert from '../../components/ui/alert/Alert';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { createRelativeExamination } from '../../redux/actions/relativeExamination.actions';
import VitalsSection from '../../components/examination-of-couple/VitalsSection';
import SystemExaminationSection from '../../components/examination-of-couple/SystemExaminationSection';
// import { ExaminationFormData } from '../../types/examination';

// Blood group options
const BLOOD_GROUPS = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
];

const getInitialVitals = () => ({
    pr: '',
    prUnit: 'bpm',
    bp: '',
    bpUnit: 'mmHg',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bmi: '',
    bmiUnit: 'kg/m²',
    abdominalExamination: '',
    localExamination: {
        perVaginalExamination: '',
        perSpeculumExamination: '',
    },
});

const getInitialSystemExamination = () => ({
    status: '' as 'normal' | 'abnormal' | '',
    details: '',
});

const getInitialExaminationForm = (): any => ({
    relativeExaminationDate: new Date().toISOString().split('T')[0],
    vitals: getInitialVitals(),
    cns: getInitialSystemExamination(),
    cvs: getInitialSystemExamination(),
    respiratorySystem: getInitialSystemExamination(),
    git: getInitialSystemExamination(),
    // Husband specific fields
    investigations: {
        hiv: '',
        hbsAg: '',
        vdrl: '',
        hcv: '',
        bloodGroup: '',
        tsh: '',
        rbs: '',
        thalassemiaScreen: '',
        karyotype: '',
    },
    semenAnalysis: {
        count: '',
        countUnit: 'mil/ml',
        morphology: '',
        motility: '',
        motilityUnit: '%',
        hcv: '',
        remark: '',
        dfi: '',
        dfiUnit: '%',
        srFsh: '',
        srTestosterone: '',
        e2: '',
        sProlactin: '',
        karyotype: '',
        yMicrosomeDeletion: '',
        trusScrotalUsg: '',
        testicularBiopsy: '',
    },
    medicalHistory: {
        problem: '',
        currentMedications: '',
    },
    surgicalHistory: [
        {
            surgery: '',
            year: '',
            detailsFinding: '',
        }
    ],
});

const RelativeExaminationAdd = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector(
        (state: RootState) => state.reoc
    );

    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [relativeId, setRelativeId] = useState('');
    const currentPatientIdRef = useRef<string | null>(null);

    const [formData, setFormData] = useState<any>(getInitialExaminationForm());

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
                        setSelectedPatient(patient);

                        // Set relative ID if available
                        const relId = patient?.relative?._id;
                        if (relId) {
                            setRelativeId(relId);
                        }

                        // Reset form when new patient is selected
                        setFormData(getInitialExaminationForm());
                        setSuccessMessage('');
                        setError('');
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

    // Handle vitals input change
    const handleVitalsChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            vitals: {
                ...prev.vitals,
                [field]: value,
            },
        }));
    };

    // Handle system examination change
    const handleSystemExaminationChange = (
        system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
        field: 'status' | 'details',
        value: string
    ) => {
        setFormData((prev: any) => ({
            ...prev,
            [system]: {
                ...prev[system],
                [field]: value,
                ...(field === 'status' && value !== 'abnormal' ? { details: '' } : {}),
            },
        }));
    };

    // Handle investigation change
    const handleInvestigationChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            investigations: {
                ...prev.investigations,
                [field]: value,
            },
        }));
    };

    // Handle semen analysis change
    const handleSemenAnalysisChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            semenAnalysis: {
                ...prev.semenAnalysis,
                [field]: value,
            },
        }));
    };

    // Handle medical history change
    const handleMedicalHistoryChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                [field]: value,
            },
        }));
    };

    // Handle surgical history change
    const handleSurgicalHistoryChange = (index: number, field: string, value: string) => {
        setFormData((prev: any) => {
            const updatedSurgicalHistory = [...prev.surgicalHistory];
            updatedSurgicalHistory[index] = {
                ...updatedSurgicalHistory[index],
                [field]: value,
            };
            return {
                ...prev,
                surgicalHistory: updatedSurgicalHistory,
            };
        });
    };

    // Add new surgical history row
    const addSurgicalHistoryRow = () => {
        setFormData((prev: any) => ({
            ...prev,
            surgicalHistory: [
                ...prev.surgicalHistory,
                {
                    surgery: '',
                    year: '',
                    detailsFinding: '',
                }
            ],
        }));
    };

    // Remove surgical history row
    const removeSurgicalHistoryRow = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            surgicalHistory: prev.surgicalHistory.filter((_: any, i: number) => i !== index),
        }));
    };

    // Transform form data to API format
    const transformFormDataForAPI = () => {
        return {
            relativeExaminationDate: new Date().toISOString().split('T')[0],
            patientId: selectedPatient?._id,
            relativeId: relativeId,
            vitals: formData.vitals,
            cns: formData.cns.status,
            cnsDetails: formData.cns.details,
            cvs: formData.cvs.status,
            cvsDetails: formData.cvs.details,
            respiratorySystem: formData.respiratorySystem.status,
            respiratorySystemDetails: formData.respiratorySystem.details,
            git: formData.git.status,
            gitDetails: formData.git.details,
            investigations: formData.investigations,
            semenAnalysis: formData.semenAnalysis,
            medicalHistory: formData.medicalHistory,
            surgicalHistory: formData.surgicalHistory,
        };
    };

    // Handle form submit - CREATE ONLY
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            setError('Please select a patient first');
            return;
        }

        if (!relativeId) {
            setError('No relative found for this patient');
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setError('');

        const apiData = transformFormDataForAPI();

        try {
            const result = await dispatch(createRelativeExamination(
                selectedPatient._id,
                relativeId,
                apiData
            ) as any);
            console.log("res", result);

            if (result?.type === 'CREATE_RELATIVE_EXAMINATION_SUCCESS') {
                setSuccessMessage('Relative examination saved successfully!');
                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);

                // Reset form after successful submission
                setFormData(getInitialExaminationForm());
            } else {
                setError(result?.payload || 'Failed to save examination');
            }
        } catch (error: any) {
            setError(error.message || 'Error saving examination');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setFormData(getInitialExaminationForm());
        setSuccessMessage('');
        setError('');
    };

    return (
        <>
            <PageMeta title="Husband Examination" description="Husband/Relative examination" />
            <PageBreadcrumb pageTitle="Relative / Husband Examination Add" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/* Messages */}
                {successMessage && (
                    <div className='mb-6'>
                        <Alert
                            variant="success"
                            title="Success"
                            message={successMessage}
                            showLink={false}
                        />
                    </div>
                )}
                {error && (
                    <div className='mb-6'>
                        <Alert
                            variant="error"
                            title="Error"
                            message={error}
                            showLink={false}
                        />
                    </div>
                )}

                <PatientInfoCard
                    selectedPatient={selectedPatient}
                    isExistingConsultation={false}
                    isLoading={false}
                />

                {/* Examination Form - Create Only */}
                {selectedPatient && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Husband Examination
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Examination Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.relativeExaminationDate}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, relativeExaminationDate: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Investigations Section - Husband */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Investigations
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HIV</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.hiv}
                                        onChange={(e) => handleInvestigationChange('hiv', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HBsAg</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.hbsAg}
                                        onChange={(e) => handleInvestigationChange('hbsAg', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VDRL</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.vdrl}
                                        onChange={(e) => handleInvestigationChange('vdrl', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HCV</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.hcv}
                                        onChange={(e) => handleInvestigationChange('hcv', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                                    <select
                                        value={formData.investigations.bloodGroup}
                                        onChange={(e) => handleInvestigationChange('bloodGroup', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {BLOOD_GROUPS.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TSH</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.tsh}
                                        onChange={(e) => handleInvestigationChange('tsh', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RBS</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.rbs}
                                        onChange={(e) => handleInvestigationChange('rbs', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thalassemia Screen</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.thalassemiaScreen}
                                        onChange={(e) => handleInvestigationChange('thalassemiaScreen', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Karyotype</label>
                                    <input
                                        type="text"
                                        value={formData.investigations.karyotype}
                                        onChange={(e) => handleInvestigationChange('karyotype', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Semen Analysis Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Semen Analysis
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count (mil/ml)</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.count}
                                        onChange={(e) => handleSemenAnalysisChange('count', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Morphology</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.morphology}
                                        onChange={(e) => handleSemenAnalysisChange('morphology', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motility (%)</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.motility}
                                        onChange={(e) => handleSemenAnalysisChange('motility', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HCV</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.hcv}
                                        onChange={(e) => handleSemenAnalysisChange('hcv', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.remark}
                                        onChange={(e) => handleSemenAnalysisChange('remark', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DFI (%)</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.dfi}
                                        onChange={(e) => handleSemenAnalysisChange('dfi', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sr. FSH</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.srFsh}
                                        onChange={(e) => handleSemenAnalysisChange('srFsh', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sr. Testosterone</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.srTestosterone}
                                        onChange={(e) => handleSemenAnalysisChange('srTestosterone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E2</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.e2}
                                        onChange={(e) => handleSemenAnalysisChange('e2', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">S. Prolactin</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.sProlactin}
                                        onChange={(e) => handleSemenAnalysisChange('sProlactin', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Karyotype</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.karyotype}
                                        onChange={(e) => handleSemenAnalysisChange('karyotype', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Y-Microsome Deletion</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.yMicrosomeDeletion}
                                        onChange={(e) => handleSemenAnalysisChange('yMicrosomeDeletion', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRUS / Scrotal USG</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.trusScrotalUsg}
                                        onChange={(e) => handleSemenAnalysisChange('trusScrotalUsg', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Testicular Biopsy</label>
                                    <input
                                        type="text"
                                        value={formData.semenAnalysis.testicularBiopsy}
                                        onChange={(e) => handleSemenAnalysisChange('testicularBiopsy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Vitals Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Vitals & Physical Examination
                            </h2>

                            <VitalsSection
                                vitals={formData.vitals}
                                onVitalsChange={handleVitalsChange}
                            />
                        </div>

                        {/* System Examination Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                System Examination
                            </h2>
                            <SystemExaminationSection
                                cns={formData.cns}
                                cvs={formData.cvs}
                                respiratorySystem={formData.respiratorySystem}
                                git={formData.git}
                                onSystemExaminationChange={handleSystemExaminationChange}
                                person="husband"
                            />
                        </div>

                        {/* Medical History - Male */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Medical History - Male
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem</label>
                                    <input
                                        type="text"
                                        value={formData.medicalHistory.problem}
                                        onChange={(e) => handleMedicalHistoryChange('problem', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Medications</label>
                                    <input
                                        type="text"
                                        value={formData.medicalHistory.currentMedications}
                                        onChange={(e) => handleMedicalHistoryChange('currentMedications', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Surgical History - Male */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Surgical History - Male
                            </h2>
                            
                            {formData.surgicalHistory.map((surgery: any, index: number) => (
                                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
                                            Surgery #{index + 1}
                                        </h3>
                                        {formData.surgicalHistory.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSurgicalHistoryRow(index)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surgery</label>
                                            <input
                                                type="text"
                                                value={surgery.surgery}
                                                onChange={(e) => handleSurgicalHistoryChange(index, 'surgery', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                            <input
                                                type="text"
                                                value={surgery.year}
                                                onChange={(e) => handleSurgicalHistoryChange(index, 'year', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details / Finding</label>
                                            <input
                                                type="text"
                                                value={surgery.detailsFinding}
                                                onChange={(e) => handleSurgicalHistoryChange(index, 'detailsFinding', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <button
                                type="button"
                                onClick={addSurgicalHistoryRow}
                                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                            >
                                + Add Surgery
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || loading ? 'Saving...' : 'Save Examination'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default RelativeExaminationAdd;