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
    patientExaminationDate:new Date().toISOString().split('T')[0],
    vitals: getInitialVitals(),
    cns: getInitialSystemExamination(),
    cvs: getInitialSystemExamination(),
    respiratorySystem: getInitialSystemExamination(),
    git: getInitialSystemExamination(),
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