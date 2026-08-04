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
import { ExaminationFormData } from '../../types/examination';

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

    const [formData, setFormData] = useState<ExaminationFormData>(getInitialExaminationForm());

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
        setFormData(prev => ({
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
console.log("res",result);

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