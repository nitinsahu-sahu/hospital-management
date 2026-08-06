import { useEffect, useRef, useState } from "react";
import { useDispatch } from 'react-redux';
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import Alert from '../../components/ui/alert/Alert';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
//@ts-ignore
import { createInvestigation } from '../../redux/actions/investigation.actions';
import CategorySelector from '../../components/Investigation/Ultrasound/CategorySelector';
import PNDTInvestigations from '../../components/Investigation/Ultrasound/PNDTInvestigations';
import GynaeInvestigations from '../../components/Investigation/Ultrasound/GynaeInvestigations';
import SelectedInvestigationsList from '../../components/Investigation/Ultrasound/SelectedInvestigationsList';
import { InvestigationItem, PNDTOption, GynaeOption, PelvicSubOption } from '../../types/investigation.types';
import { pndtOptions, gynaeOptions, pelvicSubOptions } from '../../utils/investigationOptions';

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

const UltrasoundAdd = () => {
    const dispatch = useDispatch();

    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentPatientIdRef = useRef<string | null>(null);

    // State for investigations
    const [selectedMainCategory, setSelectedMainCategory] = useState<'pndt' | 'gynae' | ''>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
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
                        // Reset all investigation states when patient changes
                        setSelectedInvestigations([]);
                        setSelectedMainCategory('');
                        setSelectedSubCategory('');
                        
                        // Update ref immediately
                        currentPatientIdRef.current = patient._id;
                        setSelectedPatient(patient);
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                        resetForm();
                    }
                }
            } else {
                // No patient in session
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                    resetForm();
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

    // Reset form helper
    const resetForm = () => {
        setSelectedInvestigations([]);
        setSelectedMainCategory('');
        setSelectedSubCategory('');
    };

    // Handle main category change
    const handleMainCategoryChange = (category: 'pndt' | 'gynae') => {
        setSelectedMainCategory(category);
        setSelectedSubCategory('');
        // Clear previous selections when changing category
        setSelectedInvestigations([]);
    };

    // Handle PNDT selection
    const handlePNDTSelection = (option: PNDTOption) => {
        const existingIndex = selectedInvestigations.findIndex(
            item => item.id === option.id && item.category === 'pndt'
        );

        if (existingIndex !== -1) {
            setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
        } else {
            setSelectedInvestigations(prev => [
                ...prev,
                {
                    id: option.id,
                    name: option.name,
                    category: 'pndt',
                    price: option.price,
                    selected: true
                }
            ]);
        }
    };

    // Handle GYNAE sub-category selection
    const handleGynaeSubCategory = (option: GynaeOption) => {
        setSelectedSubCategory(option.id);

        if (option.id === 'fm') {
            const existingIndex = selectedInvestigations.findIndex(
                item => item.id === 'fm' && item.category === 'gynae'
            );

            if (existingIndex !== -1) {
                setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
            } else {
                const filteredInvestigations = selectedInvestigations.filter(
                    item => item.category !== 'pelvic'
                );

                setSelectedInvestigations([
                    ...filteredInvestigations,
                    {
                        id: 'fm',
                        name: 'FM (FOLLICULAR MONITORING)',
                        category: 'gynae',
                        price: 0,
                        selected: true
                    }
                ]);
            }
        } else if (option.id === 'pelvic') {
            const filteredInvestigations = selectedInvestigations.filter(
                item => item.id !== 'fm'
            );
            setSelectedInvestigations(filteredInvestigations);
        }
    };

    // Handle Pelvic sub-option selection
    const handlePelvicSubSelection = (option: PelvicSubOption) => {
        const existingIndex = selectedInvestigations.findIndex(
            item => item.id === option.id && item.category === 'pelvic'
        );

        if (existingIndex !== -1) {
            setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
            if (selectedInvestigations.filter(item => item.category === 'pelvic').length === 1) {
                setSelectedSubCategory('');
            }
        } else {
            const filteredInvestigations = selectedInvestigations.filter(
                item => item.category !== 'pelvic'
            );

            setSelectedInvestigations([
                ...filteredInvestigations,
                {
                    id: option.id,
                    name: option.name,
                    category: 'pelvic',
                    price: option.price,
                    selected: true
                }
            ]);

            setSelectedSubCategory('pelvic');
        }
    };

    // Check if a PNDT option is selected
    const isPNDTSelected = (optionId: string) => {
        return selectedInvestigations.some(item => item.id === optionId && item.category === 'pndt');
    };

    // Check if any pelvic option is selected
    const isPelvicSelected = () => {
        return selectedInvestigations.some(item => item.category === 'pelvic');
    };

    // Get selected pelvic option name
    const getSelectedPelvicName = () => {
        const pelvic = selectedInvestigations.find(item => item.category === 'pelvic');
        return pelvic ? pelvic.name : '';
    };

    // Handle remove investigation
    const removeInvestigation = (id: string) => {
        setSelectedInvestigations(prev => prev.filter(item => item.id !== id));

        const removedItem = selectedInvestigations.find(item => item.id === id);
        if (removedItem?.category === 'pelvic') {
            setSelectedSubCategory('');
        } else if (removedItem?.id === 'fm') {
            setSelectedSubCategory('');
        }
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

        let mainCategory = '';
        let subCategory = '';

        const hasPelvic = selectedInvestigations.some(item => item.category === 'pelvic');
        const hasFM = selectedInvestigations.some(item => item.id === 'fm');

        if (hasPelvic) {
            mainCategory = 'gynae';
            subCategory = 'pelvic';
        } else if (hasFM) {
            mainCategory = 'gynae';
            subCategory = 'fm';
        } else if (selectedInvestigations.some(item => item.category === 'pndt')) {
            mainCategory = 'pndt';
            subCategory = 'pndt';
        }

        const investigationData = {
            patientId: selectedPatient._id,
            category: mainCategory,
            subCategory: subCategory,
            investigations: selectedInvestigations.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                selected: true
            })),
            totalAmount: totalAmount,
            status: 'pending',
        };

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // Only create, no update logic
            const result = await dispatch(createInvestigation(investigationData) as any);

            if (result?.type === 'CREATE_INVESTIGATION_SUCCESS') {
                setSuccessMessage('Ultrasound investigations saved successfully!');
                resetForm(); // Reset form after successful creation
                setTimeout(() => setSuccessMessage(''), 5000);
            } else if (result?.type === 'CREATE_INVESTIGATION_FAILURE') {
                setError(result.payload || 'Failed to save ultrasound investigations');
                setTimeout(() => setError(''), 5000);
            }
        } catch (error: any) {
            console.error('Error saving ultrasound investigations:', error);
            setError(error?.message || 'Error saving ultrasound investigations');
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta 
                title="Add Ultrasound Investigation | Dr. Yogita Verma" 
                description="Add new ultrasound investigations" 
            />
            <PageBreadcrumb pageTitle="Add Ultrasound Investigation" />

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
                {selectedPatient  && (
                    <div className="mt-6 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <CategorySelector
                                selectedMainCategory={selectedMainCategory}
                                onCategoryChange={handleMainCategoryChange}
                            />

                            {/* PNDT Options */}
                            {selectedMainCategory === 'pndt' && (
                                <PNDTInvestigations
                                    options={pndtOptions}
                                    selectedInvestigations={selectedInvestigations}
                                    onSelectionChange={handlePNDTSelection}
                                    isSelected={isPNDTSelected}
                                />
                            )}

                            {/* GYNAE Options */}
                            {selectedMainCategory === 'gynae' && (
                                <GynaeInvestigations
                                    gynaeOptions={gynaeOptions}
                                    pelvicSubOptions={pelvicSubOptions}
                                    selectedSubCategory={selectedSubCategory}
                                    selectedInvestigations={selectedInvestigations}
                                    onGynaeSubCategoryChange={handleGynaeSubCategory}
                                    onPelvicSubSelection={handlePelvicSubSelection}
                                    isPelvicSelected={isPelvicSelected}
                                    getSelectedPelvicName={getSelectedPelvicName}
                                />
                            )}
                        </div>

                        {/* Selected Investigations Summary */}
                        {selectedInvestigations.length > 0 && (
                            <SelectedInvestigationsList
                                investigations={selectedInvestigations}
                                totalAmount={totalAmount}
                                onRemove={removeInvestigation}
                            />
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={resetForm}
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
                                {isSubmitting ? 'Saving...' : 'Save Ultrasound Investigation'}
                            </button>
                        </div>
                    </div>
                )}

                {/* No Patient Selected Message */}
                {!selectedPatient && (
                    <div className="mt-6 p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                            Please select a patient to add ultrasound investigations
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default UltrasoundAdd;