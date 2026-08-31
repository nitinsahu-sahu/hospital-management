import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import Alert from '../../components/ui/alert/Alert';
import { ExaminationFormData } from '../../types/examination';
import VitalsSection from '../../components/examination-of-couple/VitalsSection';
import LocalExaminationSection from '../../components/examination-of-couple/LocalExaminationSection';
import SystemExaminationSection from '../../components/examination-of-couple/SystemExaminationSection';
//@ts-ignore
import { createPatientExamination } from '../../redux/actions/patientExamination.actions';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { Patient } from '../../types/patient';

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

const getInitialExaminationForm = (): ExaminationFormData => ({
    patientExaminationDate: new Date().toISOString().split('T')[0],
    vitals: getInitialVitals(),
    cns: getInitialSystemExamination(),
    cvs: getInitialSystemExamination(),
    respiratorySystem: getInitialSystemExamination(),
    git: getInitialSystemExamination(),
    // New fields for investigations
    investigations: {
        bloodGroup: '',
        hiv: '',
        tsh: '',
        hbsAg: '',
        rbs: '',
        hcv: '',
        prl: '',
        vdrl: '',
        sgot: '',
        dtah: '',
        sgpt: '',
        bun: '',
        srCreatinine: '',
        rubella: {
            igg: '',
            igm: '',
            amh: '',
            avidityTest: '',
        },
        thalassemiaScreen: '',
        papTest: '',
        karyotype: '',
        hsg: {
            year: '',
            finding: '',
        },
        echocardiography: '',
    },
    // Medical History
    medicalHistory: {
        problem: '',
        currentMedications: '',
    },
    // Surgical History (can be multiple entries)
    surgicalHistory: [
        {
            surgery: '',
            year: '',
            detailsFinding: '',
        }
    ],
});

const PatientExaminationAdd = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector(
        (state: RootState) => state.eoc
    );
    const [selectedPatient, setSelectedPatient] = useState<Patient|null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const currentPatientIdRef = useRef<string | null>(null);
    const [formData, setFormData] = useState<ExaminationFormData>(getInitialExaminationForm());

    // Handle patient selection from session
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
        setFormData(prev => ({
            ...prev,
            vitals: {
                ...prev.vitals,
                [field]: value,
            },
        }));
    };

    // Handle local examination change
    const handleLocalExaminationChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            vitals: {
                ...prev.vitals,
                localExamination: {
                    ...prev.vitals.localExamination,
                    [field]: value,
                },
            },
        }));
    };

    // Handle system examination change
    const handleSystemExaminationChange = (
        system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
        field: 'status' | 'details',
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [system]: {
                ...prev[system],
                [field]: value,
                ...(field === 'status' && value !== 'abnormal' ? { details: '' } : {}),
            },
        }));
    };

    // Handle investigation field change (for string fields)
    const handleInvestigationChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            investigations: {
                ...prev.investigations,
                [field]: value,
            },
        }));
    };

    // Handle rubella investigation change
    const handleRubellaChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            investigations: {
                ...prev.investigations,
                rubella: {
                    ...prev.investigations.rubella,
                    [field]: value,
                },
            },
        }));
    };

    // Handle HSG change
    const handleHSGChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            investigations: {
                ...prev.investigations,
                hsg: {
                    ...prev.investigations.hsg,
                    [field]: value,
                },
            },
        }));
    };

    // Handle medical history change
    const handleMedicalHistoryChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                [field]: value,
            },
        }));
    };

    // Handle surgical history change
    const handleSurgicalHistoryChange = (index: number, field: string, value: string) => {
        setFormData(prev => {
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
        setFormData(prev => ({
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
        setFormData(prev => ({
            ...prev,
            surgicalHistory: prev.surgicalHistory.filter((_, i) => i !== index),
        }));
    };

    // Transform form data to API format
    const transformFormDataForAPI = () => {
        return {
            patientId: selectedPatient?._id,
            vitals: formData.vitals,
            cns: formData.cns.status,
            cnsDetails: formData.cns.details,
            cvs: formData.cvs.status,
            cvsDetails: formData.cvs.details,
            respiratorySystem: formData.respiratorySystem.status,
            respiratorySystemDetails: formData.respiratorySystem.details,
            git: formData.git.status,
            gitDetails: formData.git.details,
            // New fields
            investigations: formData.investigations,
            medicalHistory: formData.medicalHistory,
            surgicalHistory: formData.surgicalHistory,
        };
    };

    // Handle form submit - Only CREATE operation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            setError('Please select a patient first');
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setError('');

        const apiData = transformFormDataForAPI();

        try {
            const result = await dispatch(createPatientExamination(apiData) as any);

            if (result?.type === 'CREATE_PATIENT_EXAMINATION_SUCCESS') {
                setSuccessMessage('Patient examination saved successfully!');
                // Reset form after successful creation
                setFormData(getInitialExaminationForm());

                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
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
            <PageMeta title="Patient Examination" description="Patient examination" />
            <PageBreadcrumb pageTitle="Patient / Wife Examination Add" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.05] lg:p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6">
                        <Alert
                            variant="success"
                            title="Success"
                            message={successMessage}
                            showLink={false}
                        />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6">
                        <Alert
                            variant="error"
                            title="Error"
                            message={error}
                            showLink={false}
                        />
                    </div>
                )}

                {/* Patient Info */}
                <PatientInfoCard
                    selectedPatient={selectedPatient}
                    isExistingConsultation={false}
                    isLoading={false}
                />

                {/* Examination Form - Only for Create */}
                {selectedPatient && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Patient Examination
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Patient Examination Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.patientExaminationDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, patientExaminationDate: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Investigations Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Investigations
                            </h2>
                            
                            {/* Blood Group - Select Dropdown */}
                            <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Blood Group <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.investigations.bloodGroup}
                                            onChange={(e) => handleInvestigationChange('bloodGroup', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HIV</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.hiv}
                                            onChange={(e) => handleInvestigationChange('hiv', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HBsAg</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.hbsAg}
                                            onChange={(e) => handleInvestigationChange('hbsAg', e.target.value)}
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HCV</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.hcv}
                                            onChange={(e) => handleInvestigationChange('hcv', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PRL</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.prl}
                                            onChange={(e) => handleInvestigationChange('prl', e.target.value)}
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SGOT</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.sgot}
                                            onChange={(e) => handleInvestigationChange('sgot', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DTAH</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.dtah}
                                            onChange={(e) => handleInvestigationChange('dtah', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SGPT</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.sgpt}
                                            onChange={(e) => handleInvestigationChange('sgpt', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BUN</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.bun}
                                            onChange={(e) => handleInvestigationChange('bun', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sr. Creatinine</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.srCreatinine}
                                            onChange={(e) => handleInvestigationChange('srCreatinine', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rubella Investigations */}
                            <div className="mb-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Rubella</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IgG</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.rubella.igg}
                                            onChange={(e) => handleRubellaChange('igg', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IgM</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.rubella.igm}
                                            onChange={(e) => handleRubellaChange('igm', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AMH</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.rubella.amh}
                                            onChange={(e) => handleRubellaChange('amh', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avidity Test</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.rubella.avidityTest}
                                            onChange={(e) => handleRubellaChange('avidityTest', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Other Investigations */}
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pap Test</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.papTest}
                                            onChange={(e) => handleInvestigationChange('papTest', e.target.value)}
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSG Year</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.hsg.year}
                                            onChange={(e) => handleHSGChange('year', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSG Finding</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.hsg.finding}
                                            onChange={(e) => handleHSGChange('finding', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Echocardiography</label>
                                        <input
                                            type="text"
                                            value={formData.investigations.echocardiography}
                                            onChange={(e) => handleInvestigationChange('echocardiography', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
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

                            {/* Local Examination - Only for Wife */}
                            <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                                    Local Examination
                                </h3>
                                <LocalExaminationSection
                                    localExamination={formData.vitals.localExamination}
                                    onLocalExaminationChange={handleLocalExaminationChange}
                                />
                            </div>
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
                                person="wife"
                            />
                        </div>

                        {/* Medical History Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Medical History - Female
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

                        {/* Surgical History Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Surgical History - Female
                            </h2>
                            
                            {formData.surgicalHistory.map((surgery, index) => (
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

export default PatientExaminationAdd;

// import { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import PageMeta from '../../components/common/PageMeta';
// import { RootState } from '../../redux/store/store';
// import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
// import Alert from '../../components/ui/alert/Alert';
// import { ExaminationFormData } from '../../types/examination';
// import VitalsSection from '../../components/examination-of-couple/VitalsSection';
// import LocalExaminationSection from '../../components/examination-of-couple/LocalExaminationSection';
// import SystemExaminationSection from '../../components/examination-of-couple/SystemExaminationSection';
// //@ts-ignore
// import { createPatientExamination } from '../../redux/actions/patientExamination.actions';
// import PageBreadcrumb from '../../components/common/PageBreadCrumb';
// import { Patient } from '../../types/patient';

// const getInitialVitals = () => ({
//     pr: '',
//     prUnit: 'bpm',
//     bp: '',
//     bpUnit: 'mmHg',
//     height: '',
//     heightUnit: 'cm',
//     weight: '',
//     weightUnit: 'kg',
//     bmi: '',
//     bmiUnit: 'kg/m²',
//     abdominalExamination: '',
//     localExamination: {
//         perVaginalExamination: '',
//         perSpeculumExamination: '',
//     },
// });

// const getInitialSystemExamination = () => ({
//     status: '' as 'normal' | 'abnormal' | '',
//     details: '',
// });

// const getInitialExaminationForm = (): ExaminationFormData => ({
//     patientExaminationDate:new Date().toISOString().split('T')[0],
//     vitals: getInitialVitals(),
//     cns: getInitialSystemExamination(),
//     cvs: getInitialSystemExamination(),
//     respiratorySystem: getInitialSystemExamination(),
//     git: getInitialSystemExamination(),
// });

// const PatientExaminationAdd = () => {
//     const dispatch = useDispatch();
//     const { loading } = useSelector(
//         (state: RootState) => state.eoc
//     );
//     const [selectedPatient, setSelectedPatient] = useState<Patient|null>(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [error, setError] = useState('');
//     const currentPatientIdRef = useRef<string | null>(null);
//     const [formData, setFormData] = useState<ExaminationFormData>(getInitialExaminationForm());

//     // Handle patient selection from session
//     useEffect(() => {
//         const getPatientFromSession = () => {
//             const patientId = sessionStorage.getItem('selectedPatientId');
//             const patientUHID = sessionStorage.getItem('selectedPatientUHID');
//             const patientData = sessionStorage.getItem('selectedPatient');

//             if (patientId && patientUHID && patientData) {
//                 try {
//                     const patient = JSON.parse(patientData);

//                     // Check if patient has changed using ref
//                     if (currentPatientIdRef.current !== patient._id) {
//                         // Update ref immediately
//                         currentPatientIdRef.current = patient._id;
//                         setSelectedPatient(patient);
//                         // Reset form when new patient is selected
//                         setFormData(getInitialExaminationForm());
//                         setSuccessMessage('');
//                         setError('');
//                     }
//                 } catch (error) {
//                     if (currentPatientIdRef.current !== null) {
//                         currentPatientIdRef.current = null;
//                         setSelectedPatient(null);
//                     }
//                 }
//             } else {
//                 // No patient in session
//                 if (currentPatientIdRef.current !== null) {
//                     currentPatientIdRef.current = null;
//                     setSelectedPatient(null);
//                 }
//             }
//         };

//         // Run immediately
//         getPatientFromSession();

//         // Set up interval and storage listener
//         const interval = setInterval(getPatientFromSession, 1000);
//         window.addEventListener('storage', getPatientFromSession);

//         return () => {
//             clearInterval(interval);
//             window.removeEventListener('storage', getPatientFromSession);
//         };
//     }, []);

//     // Handle vitals input change
//     const handleVitalsChange = (field: string, value: string) => {
//         setFormData(prev => ({
//             ...prev,
//             vitals: {
//                 ...prev.vitals,
//                 [field]: value,
//             },
//         }));
//     };

//     // Handle local examination change
//     const handleLocalExaminationChange = (field: string, value: string) => {
//         setFormData(prev => ({
//             ...prev,
//             vitals: {
//                 ...prev.vitals,
//                 localExamination: {
//                     ...prev.vitals.localExamination,
//                     [field]: value,
//                 },
//             },
//         }));
//     };

//     // Handle system examination change
//     const handleSystemExaminationChange = (
//         system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
//         field: 'status' | 'details',
//         value: string
//     ) => {
//         setFormData(prev => ({
//             ...prev,
//             [system]: {
//                 ...prev[system],
//                 [field]: value,
//                 ...(field === 'status' && value !== 'abnormal' ? { details: '' } : {}),
//             },
//         }));
//     };

//     // Transform form data to API format
//     const transformFormDataForAPI = () => {
//         return {
//             patientId: selectedPatient?._id,
//             vitals: formData.vitals,
//             cns: formData.cns.status,
//             cnsDetails: formData.cns.details,
//             cvs: formData.cvs.status,
//             cvsDetails: formData.cvs.details,
//             respiratorySystem: formData.respiratorySystem.status,
//             respiratorySystemDetails: formData.respiratorySystem.details,
//             git: formData.git.status,
//             gitDetails: formData.git.details,
//         };
//     };

//     // Handle form submit - Only CREATE operation
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!selectedPatient) {
//             setError('Please select a patient first');
//             return;
//         }

//         setIsSubmitting(true);
//         setSuccessMessage('');
//         setError('');

//         const apiData = transformFormDataForAPI();

//         try {
//             const result = await dispatch(createPatientExamination(apiData) as any);

//             if (result?.type === 'CREATE_PATIENT_EXAMINATION_SUCCESS') {
//                 setSuccessMessage('Patient examination saved successfully!');
//                 // Reset form after successful creation
//                 setFormData(getInitialExaminationForm());

//                 setTimeout(() => {
//                     setSuccessMessage("");
//                 }, 5000);
//             } else {
//                 setError(result?.payload || 'Failed to save examination');
//             }
//         } catch (error: any) {
//             setError(error.message || 'Error saving examination');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Reset form
//     const handleReset = () => {
//         setFormData(getInitialExaminationForm());
//         setSuccessMessage('');
//         setError('');
//     };

//     return (
//         <>
//             <PageMeta title="Patient Examination" description="Patient examination" />
//             <PageBreadcrumb pageTitle="Patient / Wife Examination Add" />
//             <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.05] lg:p-6">
//                 {/* Success Message */}
//                 {successMessage && (
//                     <div className="mb-6">
//                         <Alert
//                             variant="success"
//                             title="Success"
//                             message={successMessage}
//                             showLink={false}
//                         />
//                     </div>
//                 )}

//                 {/* Error Message */}
//                 {error && (
//                     <div className="mb-6">
//                         <Alert
//                             variant="error"
//                             title="Error"
//                             message={error}
//                             showLink={false}
//                         />
//                     </div>
//                 )}

//                 {/* Patient Info */}
//                 <PatientInfoCard
//                     selectedPatient={selectedPatient}
//                     isExistingConsultation={false}
//                     isLoading={false}
//                 />

//                 {/* Examination Form - Only for Create */}
//                 {selectedPatient && (
//                     <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                                 Patient Examination
//                             </h2>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Patient Examination Date <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="date"
//                                     value={formData.patientExaminationDate}
//                                     onChange={(e) => setFormData(prev => ({ ...prev, patientExaminationDate: e.target.value }))}
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Vitals Section */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                                 Vitals & Physical Examination
//                             </h2>

//                             <VitalsSection
//                                 vitals={formData.vitals}
//                                 onVitalsChange={handleVitalsChange}
//                             />

//                             {/* Local Examination - Only for Wife */}
//                             <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6">
//                                 <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
//                                     Local Examination
//                                 </h3>
//                                 <LocalExaminationSection
//                                     localExamination={formData.vitals.localExamination}
//                                     onLocalExaminationChange={handleLocalExaminationChange}
//                                 />
//                             </div>
//                         </div>

//                         {/* System Examination Section */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                                 System Examination
//                             </h2>
//                             <SystemExaminationSection
//                                 cns={formData.cns}
//                                 cvs={formData.cvs}
//                                 respiratorySystem={formData.respiratorySystem}
//                                 git={formData.git}
//                                 onSystemExaminationChange={handleSystemExaminationChange}
//                                 person="wife"
//                             />
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex justify-end gap-4">
//                             <button
//                                 type="button"
//                                 onClick={handleReset}
//                                 className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
//                             >
//                                 Reset
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isSubmitting || loading}
//                                 className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {isSubmitting || loading ? 'Saving...' : 'Save Examination'}
//                             </button>
//                         </div>
//                     </form>
//                 )}
//             </div>
//         </>
//     );
// };

// export default PatientExaminationAdd;

