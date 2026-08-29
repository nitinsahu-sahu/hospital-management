// ProcedureAdd.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { createProcedure } from '../../redux/actions/procedure.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import Alert from '../../components/ui/alert/Alert';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
//@ts-ignore
import { getCustomizationInv } from '../../redux/actions/customization.action';

interface SelectedProcedureDetails {
    id: string;
    name: string;
    price: number;
    type?: string;
    code?: string;
    description?: string;
}

export default function ProcedureAdd() {
    const dispatch = useDispatch();
    const { creating } = useSelector((state: RootState) => state.procedure);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('iui');
    const [selectedIuiType, setSelectedIuiType] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [iuiProcedures, setIuiProcedures] = useState<any[]>([]);
    const [otherProcedures, setOtherProcedures] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    // Load customizations sequentially
    useEffect(() => {
        loadCustomizationsSequentially();
    }, []);

    const loadCustomizationsSequentially = async () => {
        try {
            // Load IUI first
            const iuiResult = await dispatch(getCustomizationInv({ category: "iui", search: "", isActive: true }) as any);
            setIuiProcedures(iuiResult.payload || []);

            // Load procedures
            const procedureResult = await dispatch(getCustomizationInv({ category: "procedure", search: "", isActive: true }) as any);
            setOtherProcedures(procedureResult.payload || []);
        } catch (error) {
            console.error("Error loading customizations:", error);
        }
    };

    // Reset all states
    const resetAllStates = () => {
        setSelectedProcedures([]);
        setSelectedIuiType(null);
        setSuccessMessage('');
        setError('');
    };

    // Handle patient selection from session
    useEffect(() => {
        const getPatientFromSession = () => {
            const patientId = sessionStorage.getItem('selectedPatientId');
            const patientUHID = sessionStorage.getItem('selectedPatientUHID');
            const patientData = sessionStorage.getItem('selectedPatient');

            if (patientId && patientUHID && patientData) {
                try {
                    const patient = JSON.parse(patientData);
                    if (!selectedPatient || selectedPatient._id !== patient._id) {
                        setSelectedPatient(patient);
                        resetAllStates();
                    }
                } catch (error) {
                    setSelectedPatient(null);
                    resetAllStates();
                }
            } else {
                setSelectedPatient(null);
                resetAllStates();
            }
        };

        getPatientFromSession();
        const interval = setInterval(getPatientFromSession, 1000);
        window.addEventListener('storage', getPatientFromSession);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', getPatientFromSession);
        };
    }, [selectedPatient]);

    const handleProcedureToggle = (procedureId: string) => {
        setSelectedProcedures(prev =>
            prev.includes(procedureId)
                ? prev.filter(id => id !== procedureId)
                : [...prev, procedureId]
        );
    };

    const handleIuiTypeSelect = (procedureId: string) => {
        setSelectedIuiType(procedureId);
        // Remove any previously selected IUI procedures
        setSelectedProcedures(prev => prev.filter(id => !id.startsWith('iui_')));
        setSelectedProcedures(prev => [...prev, procedureId]);
    };

    const getSelectedProceduresDetails = (): SelectedProcedureDetails[] => {
        const details: SelectedProcedureDetails[] = [];
        const allProcedures = [...iuiProcedures, ...otherProcedures];

        selectedProcedures.forEach(procId => {
            const procedure = allProcedures.find(p => p._id === procId);
            if (procedure) {
                // Check if it's an IUI procedure
                const isIUI = iuiProcedures.some(p => p._id === procId);
                details.push({
                    id: procedure._id,
                    name: procedure.name,
                    price: procedure.price,
                    type: isIUI ? 'iui' : 'procedure',
                    code: procedure.code,
                    description: procedure.description
                });
            }
        });

        return details;
    };

    const getTotalPrice = () => {
        let total = 0;
        const allProcedures = [...iuiProcedures, ...otherProcedures];
        
        selectedProcedures.forEach(procId => {
            const procedure = allProcedures.find(p => p._id === procId);
            if (procedure) {
                total += procedure.price;
            }
        });
        return total;
    };

    const getProcedureDisplayName = (procedure: any) => {
        return procedure.name;
    };

    const handleSubmit = async () => {
        if (!selectedPatient) {
            setError('Please select a patient first');
            return;
        }

        if (selectedProcedures.length === 0) {
            setError('Please select at least one procedure');
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setError('');

        const procedureData = {
            procedureDate: new Date().toISOString().split('T')[0],
            patientId: selectedPatient._id,
            consultationId: null,
            procedures: getSelectedProceduresDetails().map(proc => ({
                procedureId: proc.id,
                name: proc.name,
                price: proc.price,
                subType: proc.type || null,
                description: proc.description || ''
            })),
        };

        try {
            const result = await dispatch(createProcedure(procedureData) as any);

            if (result?.status === 201 || result?.status === 200) {
                setSuccessMessage('Procedures saved successfully!');
                setSelectedProcedures([]);
                setSelectedIuiType(null);
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(result?.error || 'Error saving procedures. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Error saving procedures. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to render procedure item
    const renderProcedureItem = (procedure: any) => {
        const isSelected = selectedProcedures.includes(procedure._id);
        const isIUI = procedure.category === 'iui';

        // For IUI procedures, use radio buttons (only one can be selected)
        if (isIUI) {
            return (
                <div className="p-2 sm:p-3" key={procedure._id}>
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedIuiType === procedure._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}>
                        <div className="flex items-start gap-3">
                            <input
                                type="radio"
                                name="iui-type"
                                checked={selectedIuiType === procedure._id}
                                onChange={() => handleIuiTypeSelect(procedure._id)}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {procedure.name}
                                    </span>
                                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                        ₹{procedure.price}/-
                                    </span>
                                </div>
                                {procedure.description && (
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {procedure.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </label>
                </div>
            );
        }

        // For other procedures, use checkboxes
        return (
            <div className="p-4 sm:p-6" key={procedure._id}>
                <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}>
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProcedureToggle(procedure._id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">
                                    {getEmojiForProcedure(procedure.name)}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {procedure.name}
                                </span>
                            </div>
                            {procedure.description && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {procedure.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹{procedure.price}/-
                    </span>
                </label>
            </div>
        );
    };

    // Helper function to get emoji for procedure
    const getEmojiForProcedure = (name: string) => {
        const emojiMap: { [key: string]: string } = {
            'CVS (Chorionic Villus Sampling)': '🧬',
            'PRP (Platelet-Rich Plasma)': '💉',
            'LBC (Liquid Based Cytology)': '🔍',
            'LBC + HPV DNA': '🧪',
            'Amniocentesis': '💊',
            'IUI-H (IUI with Husband)': '👨‍👩‍👧',
            'IUI-D (IUI with Donor)': '🤝'
        };
        return emojiMap[name] || '📋';
    };

    return (
        <>
            <PageMeta title="Add Procedure | Dr. Yogita Verma" description="Add New Patient Procedure" />
            <PageBreadcrumb pageTitle="Add New Procedure" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

                {/* Success Alert */}
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

                {/* Error Alert */}
                {error && (
                    <div className='mb-6'>
                        <Alert
                            variant="error"
                            title="Error Message"
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

                {/* Procedures Selection */}
                {selectedPatient && (
                    <div className="mt-6 sm:mt-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                        Add New Procedures
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Choose from the available procedures below to add new procedures
                                    </p>
                                </div>
                            </div>

                            {/* Procedures List */}
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {/* IUI Section */}
                                {iuiProcedures.length > 0 && (
                                    <div className="p-4 sm:p-6">
                                        <button
                                            onClick={() => setExpandedCategory(expandedCategory === 'iui' ? null : 'iui')}
                                            className="w-full flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="text-xl sm:text-2xl">🔬</span>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    IUI (Intrauterine Insemination)
                                                </h3>
                                            </div>
                                            <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                                {expandedCategory === 'iui' ? '▼' : '▶'}
                                            </span>
                                        </button>

                                        {expandedCategory === 'iui' && (
                                            <div className="mt-1 sm:mt-6 space-y-3 sm:space-y-4">
                                                <div className="grid grid-cols-1 gap-1 sm:gap-4">
                                                    {iuiProcedures.map(procedure => renderProcedureItem(procedure))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Other Procedures */}
                                {otherProcedures.map(procedure => renderProcedureItem(procedure))}
                            </div>

                            {/* Summary Section */}
                            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Selected Procedures
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedProcedures.length > 0 ? (
                                                selectedProcedures.map(procId => {
                                                    const allProcedures = [...iuiProcedures, ...otherProcedures];
                                                    const procedure = allProcedures.find(p => p._id === procId);
                                                    return procedure ? (
                                                        <span key={procId} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {procedure.name}
                                                        </span>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    No procedures selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            ₹{getTotalPrice()}/-
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || creating || selectedProcedures.length === 0}
                                    className={`w-full mt-4 px-4 py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 ${
                                        isSubmitting || creating || selectedProcedures.length === 0
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-blue-700'
                                    }`}
                                >
                                    {isSubmitting || creating ? 'Saving...' : 'Save Procedures'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}