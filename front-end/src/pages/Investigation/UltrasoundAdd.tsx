import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import Alert from '../../components/ui/alert/Alert';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
//@ts-ignore
import { createInvestigation } from '../../redux/actions/investigation.actions';
//@ts-ignore
import { getCustomizationInv } from '../../redux/actions/customization.action';
import CategorySelector from '../../components/Investigation/Ultrasound/CategorySelector';
import PNDTInvestigations from '../../components/Investigation/Ultrasound/PNDTInvestigations';
import GynaeInvestigations from '../../components/Investigation/Ultrasound/GynaeInvestigations';
import SelectedInvestigationsList from '../../components/Investigation/Ultrasound/SelectedInvestigationsList';
import { InvestigationItem, PNDTOption, GynaeOption, PelvicSubOption } from '../../types/investigation.types';
import { gynaeOptions } from '../../utils/investigationOptions';
import { RootState } from "../../redux/store/store";

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
    const { investigationsCustom } = useSelector((state: RootState) => state.customization);

    // State for investigations
    const [selectedMainCategory, setSelectedMainCategory] = useState<'pndt' | 'gynae' | ''>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [selectedInvestigations, setSelectedInvestigations] = useState<InvestigationItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (selectedMainCategory === 'pndt') {
            loadCustomizationPndt();
        }
    }, [selectedMainCategory]);

    // Load FM data when fm sub-category is selected
    useEffect(() => {
        if (selectedSubCategory === 'fm') {
            loadCustomizationFM();
        }
    }, [selectedSubCategory]);

    // Load Pelvic data when pelvic sub-category is selected
    useEffect(() => {
        if (selectedSubCategory === 'pelvic') {
            loadCustomizationPelvic();
        }
    }, [selectedSubCategory]);

    // Load discounts with pagination
    const loadCustomizationPndt = async () => {
        try {
            await dispatch(getCustomizationInv({ category: "pndt", search: "", isActive: true }) as any);
        } catch (error) {
            console.error("Error loading pndt:", error);
        }
    };

    // Load discounts with pagination
    const loadCustomizationFM = async () => {
        try {
            await dispatch(getCustomizationInv({ category: "fm", search: "", isActive: true }) as any);
        } catch (error) {
            console.error("Error loading pndt:", error);
        }
    };

    // Load discounts with pagination
    const loadCustomizationPelvic = async () => {
        try {
            await dispatch(getCustomizationInv({ category: "pelvic", search: "", isActive: true }) as any);
        } catch (error) {
            console.error("Error loading pndt:", error);
        }
    };
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
        setSelectedInvestigations([]);
    };

    // Handle PNDT selection
    const handlePNDTSelection = (option: PNDTOption) => {
        const existingIndex = selectedInvestigations.findIndex(
            item => item._id === option._id && item.category === 'pndt'
        );

        if (existingIndex !== -1) {
            setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
        } else {
            setSelectedInvestigations(prev => [
                ...prev,
                {
                    _id: option._id,
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
            // Remove any existing FM selection
            const filteredWithoutFM = selectedInvestigations.filter(
                item => !(item._id === 'fm' && item.category === 'gynae')
            );

            // Remove any pelvic selections when FM is selected
            const filteredWithoutPelvic = filteredWithoutFM.filter(
                item => item.category !== 'pelvic'
            );

            // Add FM if not already selected
            const fmExists = selectedInvestigations.some(
                item => item._id === 'fm' && item.category === 'gynae'
            );

            if (!fmExists) {
                setSelectedInvestigations([
                    ...filteredWithoutPelvic,
                    {
                        _id: 'fm',
                        name: 'FM (FOLLICULAR MONITORING)',
                        category: 'gynae',
                        price: 0,
                        selected: true
                    }
                ]);
            } else {
                // If FM already exists, just remove pelvic items
                setSelectedInvestigations(filteredWithoutPelvic);
            }
        } else if (option.id === 'pelvic') {
            // Remove FM and keep only non-FM items
            const filteredWithoutFM = selectedInvestigations.filter(
                item => item._id !== 'fm'
            );

            // Also remove any existing pelvic selections when switching to pelvic
            const filteredWithoutPelvic = filteredWithoutFM.filter(
                item => item.category !== 'pelvic'
            );

            setSelectedInvestigations(filteredWithoutPelvic);
        }
    };

    // Handle FM selection
    const handleFMSelection = (option: PelvicSubOption) => {
        // Remove any existing FM selection
        const filteredWithoutFM = selectedInvestigations.filter(
            item => !(item._id === 'fm' && item.category === 'gynae')
        );

        // Remove any pelvic selections when FM is selected
        const filteredWithoutPelvic = filteredWithoutFM.filter(
            item => item.category !== 'pelvic'
        );

        // Check if this FM option is already selected
        const isAlreadySelected = selectedInvestigations.some(
            item => item._id === option._id && item.category === 'fm'
        );

        if (!isAlreadySelected) {
            setSelectedInvestigations([
                ...filteredWithoutPelvic,
                {
                    _id: option._id,
                    name: option.name,
                    category: 'fm',
                    price: option.price,
                    selected: true
                }
            ]);
            setSelectedSubCategory('fm');
        } else {
            // If already selected, deselect it
            setSelectedInvestigations(filteredWithoutPelvic);
            setSelectedSubCategory('');
        }
    };

    // Handle Pelvic sub-option selection
    const handlePelvicSubSelection = (option: PelvicSubOption) => {
        const existingIndex = selectedInvestigations.findIndex(
            item => item._id === option._id && item.category === 'pelvic'
        );

        if (existingIndex !== -1) {
            // Remove the pelvic option
            setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
            // If no pelvic items left, clear the sub category
            const remainingPelvic = selectedInvestigations.filter(item => item.category === 'pelvic');
            if (remainingPelvic.length === 1) { // Only the one being removed
                setSelectedSubCategory('');
            }
        } else {
            // Remove any FM selection when pelvic is selected
            const filteredWithoutFM = selectedInvestigations.filter(
                item => item._id !== 'fm'
            );

            // Remove any existing pelvic selections
            const filteredWithoutPelvic = filteredWithoutFM.filter(
                item => item.category !== 'pelvic'
            );

            setSelectedInvestigations([
                ...filteredWithoutPelvic,
                {
                    _id: option._id,
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
        return selectedInvestigations.some(item => item._id === optionId && item.category === 'pndt');
    };

    // Check if any pelvic option is selected
    const isPelvicSelected = () => {
        return selectedInvestigations.some(item => item.category === 'pelvic');
    };

    // Check if FM is selected
    const isFMSelected = () => {
        return selectedInvestigations.some(item => item.category === 'fm');
    };

    // Get selected pelvic or FM option name
    const getSelectedPelvicName = () => {
        const selected = selectedInvestigations.find(item =>
            item.category === 'pelvic' || item.category === 'fm'
        );
        return selected ? selected.name : '';
    };

    // Handle remove investigation
    const removeInvestigation = (id: string) => {
        setSelectedInvestigations(prev => prev.filter(item => item._id !== id));

        const removedItem = selectedInvestigations.find(item => item._id === id);
        if (removedItem?.category === 'pelvic') {
            setSelectedSubCategory('');
        } else if (removedItem?.category === 'fm') {
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
        const hasFM = selectedInvestigations.some(item => item.category === 'fm');

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
                id: item._id,
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
                {selectedPatient && (
                    <div className="mt-6 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <CategorySelector
                                selectedMainCategory={selectedMainCategory}
                                onCategoryChange={handleMainCategoryChange}
                            />

                            {/* PNDT Options */}
                            {selectedMainCategory === 'pndt' && (
                                <PNDTInvestigations
                                    options={investigationsCustom}
                                    selectedInvestigations={selectedInvestigations}
                                    onSelectionChange={handlePNDTSelection}
                                    isSelected={isPNDTSelected}
                                />
                            )}

                            {/* GYNAE Options */}
                            {selectedMainCategory === 'gynae' && (
                                <GynaeInvestigations
                                    gynaeOptions={gynaeOptions}
                                    pelvicSubOptions={investigationsCustom}
                                    selectedSubCategory={selectedSubCategory}
                                    selectedInvestigations={selectedInvestigations}
                                    onGynaeSubCategoryChange={handleGynaeSubCategory}
                                    onPelvicSubSelection={handlePelvicSubSelection}
                                    onFMSelection={handleFMSelection}
                                    isPelvicSelected={isPelvicSelected}
                                    getSelectedPelvicName={getSelectedPelvicName}
                                    isFMSelected={isFMSelected}
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