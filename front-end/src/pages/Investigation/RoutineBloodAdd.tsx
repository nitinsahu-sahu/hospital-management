import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import Alert from '../../components/ui/alert/Alert';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { createBloodInvestigation, clearBloodInvestigationError } from '../../redux/actions/bloodInvestigation.actions';
import { InvestigationItem, InvestigationData } from '../../types/investigation.types';
import { routineOptions } from '../../utils/investigationOptions';
import SelectedInvestigationsSummary from '../../components/Investigation/Ultrasound/SelectedInvestigationsSummary';
import BloodInvestigationsList from '../../components/Investigation/Ultrasound/BloodInvestigationsList';

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

const RoutineBloodAdd = () => {
    const dispatch = useDispatch();
    const { success, error: bloodInvestigationError } = useSelector(
        (state: RootState) => state.bloodInvestigation
    );
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentPatientIdRef = useRef<string | null>(null);

    // Investigation state
    const [selectedInvestigations, setSelectedInvestigations] = useState<InvestigationItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // Calculate total whenever selectedInvestigations changes
    useEffect(() => {
        const total = selectedInvestigations.reduce((sum, item) => sum + item.price, 0);
        setTotalAmount(total);
    }, [selectedInvestigations]);

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
                        // Reset investigations when patient changes
                        setSelectedInvestigations([]);
                        
                        // Update ref immediately
                        currentPatientIdRef.current = patient._id;
                        setSelectedPatient(patient);
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                        setSelectedInvestigations([]);
                    }
                }
            } else {
                // No patient in session
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                    setSelectedInvestigations([]);
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

    // Handle success message from Redux
    useEffect(() => {
        if (success) {
            setSuccessMessage('Routine blood investigations saved successfully!');
            setSelectedInvestigations([]);
            setTimeout(() => {
                setSuccessMessage('');
                dispatch(clearBloodInvestigationError());
            }, 5000);
        }
    }, [success, dispatch]);

    // Handle errors from Redux
    useEffect(() => {
        if (bloodInvestigationError) {
            setError(bloodInvestigationError);
            setTimeout(() => {
                setError('');
                dispatch(clearBloodInvestigationError());
            }, 5000);
        }
    }, [bloodInvestigationError, dispatch]);

    // Handle selection change
    const handleSelectionChange = (option: any, category: string) => {
        const existingIndex = selectedInvestigations.findIndex(
            item => item.id === option.id
        );

        if (existingIndex !== -1) {
            setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
        } else {
            setSelectedInvestigations(prev => [
                ...prev,
                {
                    id: option.id,
                    code: option.code,
                    name: option.name,
                    category: category,
                    price: option.price,
                    selected: true
                }
            ]);
        }
    };

    // Check if an option is selected
    const isSelected = (optionId: string) => {
        return selectedInvestigations.some(item => item.id === optionId);
    };

    // Handle remove investigation
    const removeInvestigation = (id: string) => {
        setSelectedInvestigations(prev => prev.filter(item => item.id !== id));
    };

    // Handle submit - Only create new
    const handleSubmit = async () => {
        if (!selectedPatient) {
            setError('Please select a patient first');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (selectedInvestigations.length === 0) {
            setError('Please select at least one investigation');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const investigationData: InvestigationData = {
            patientId: selectedPatient._id,
            category: 'routine',
            investigations: selectedInvestigations.map(item => ({
                id: item.id,
                code: item.code,
                name: item.name,
                category: item.category,
                price: item.price,
                selected: true
            })),
            totalAmount: totalAmount,
        };

        console.log('Routine Blood Investigation Data:', investigationData);

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // Only create, no update logic
            const result = await dispatch(createBloodInvestigation(investigationData) as any);

            if (result?.type === 'CREATE_BLOOD_INVESTIGATION_SUCCESS') {
                setSuccessMessage('Routine blood investigations saved successfully!');
                setSelectedInvestigations([]); // Reset form
                setTimeout(() => setSuccessMessage(''), 5000);
            } else if (result?.type === 'CREATE_BLOOD_INVESTIGATION_FAILURE') {
                setError(result.payload || 'Failed to save routine blood investigations');
                setTimeout(() => setError(''), 5000);
            }
        } catch (error: any) {
            console.error('Error saving routine blood investigations:', error);
            setError(error?.message || 'Error saving routine blood investigations');
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Add Routine Blood Investigation | Dr. Yogita Verma"
                description="Add new routine blood investigations"
            />
            <PageBreadcrumb pageTitle="Add Routine Blood Investigation" />

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

                {/* Patient Info */}
                <PatientInfoCard
                    selectedPatient={selectedPatient}
                    isExistingConsultation={false}
                    isLoading={false}
                />

                {/* Investigation Form */}
                {selectedPatient && (
                    <div className="mt-6 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <BloodInvestigationsList
                                title="Routine Blood Tests"
                                options={routineOptions}
                                selectedInvestigations={selectedInvestigations}
                                category="routine"
                                onSelectionChange={handleSelectionChange}
                                isSelected={isSelected}
                            />
                        </div>

                        {/* Selected Investigations Summary */}
                        <SelectedInvestigationsSummary
                            investigations={selectedInvestigations}
                            totalAmount={totalAmount}
                            onRemove={removeInvestigation}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedInvestigations([])}
                                disabled={selectedInvestigations.length === 0 || isSubmitting}
                                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedInvestigations.length === 0 || isSubmitting}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Routine Investigations'}
                            </button>
                        </div>
                    </div>
                )}

                {/* No Patient Selected Message */}
                {!selectedPatient && (
                    <div className="mt-6 p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                            Please select a patient to add routine blood investigations
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default RoutineBloodAdd;