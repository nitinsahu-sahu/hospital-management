// InvestigationCustomizeAdd.tsx
import { useState } from "react";
import Alert from '../../components/ui/alert/Alert';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
// @ts-ignore
import { addCustomizationInvestigation } from '../../redux/actions/customization.action';

interface InvestigationFormData {
    name: string;
    code: string;
    category: string;
    price: string;
    description: string; // Added description field
}

const InvestigationCustomizeAdd = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<InvestigationFormData>>({});

    const [formData, setFormData] = useState<InvestigationFormData>({
        name: "",
        code: "",
        category: "",
        price: "",
        description: "" // Added description field
    });

    // Category options
    const categoryOptions = [
        { value: "", label: "Select Category" },
        { value: "pndt", label: "PNDT" },
        { value: "pelvic", label: "Pelvic" },
        { value: "fm", label: "Follicular Monitoring" },
        { value: "gbt", label: "Genetic Blood Tests" },
        { value: "rbt", label: "Routine Blood Tests" },
        { value: "procedure", label: "Procedure Tests" },
        { value: "iui", label: "IUI (Intrauterine Insemination)" },
    ];

    // Check if selected category requires description
    const requiresDescription = formData.category === "procedure" || formData.category === "iui";

    // Get category label for dynamic messages
    const getCategoryLabel = () => {
        if (formData.category === "procedure") return "Procedure Tests";
        if (formData.category === "iui") return "IUI (Intrauterine Insemination)";
        return "";
    };

    // Get description placeholder based on category
    const getDescriptionPlaceholder = () => {
        if (formData.category === "procedure") {
            return "Describe the procedure in detail...\ne.g.,\n• Preparation: Fasting required for 8 hours\n• Process: Blood sample collection\n• Duration: 15-20 minutes\n• Special instructions: Please bring previous reports";
        }
        if (formData.category === "iui") {
            return "Describe the IUI procedure in detail...\ne.g.,\n• Preparation: Ovulation induction\n• Process: Sperm washing and insemination\n• Timing: Day 12-14 of cycle\n• Special instructions: Monitor ovulation with ultrasound";
        }
        return "Describe in detail...";
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            category: "",
            price: "",
            description: ""
        });
        setFormErrors({});
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<InvestigationFormData> = {};

        if (!formData.name.trim()) {
            errors.name = "Investigation name is required";
        } else if (formData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }

        if (!formData.code.trim()) {
            errors.code = "Investigation code is required";
        }

        if (!formData.category) {
            errors.category = "Please select a category";
        }

        if (!formData.price) {
            errors.price = "Price is required";
        } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
            errors.price = "Please enter a valid price";
        }

        // Validate description if category is "procedure" or "iui"
        if (formData.category === "procedure" || formData.category === "iui") {
            if (!formData.description.trim()) {
                errors.description = `Description is required for ${getCategoryLabel()}`;
            } else if (formData.description.trim().length < 10) {
                errors.description = "Description must be at least 10 characters";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (formErrors[name as keyof InvestigationFormData]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fix the validation errors before submitting.');
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim(),
                category: formData.category,
                price: Number(formData.price),
                description: formData.description.trim() // Added description in payload
            };

            const result = await dispatch(addCustomizationInvestigation(payload) as any);

            if (result?.type?.includes('SUCCESS')) {
                setSuccessMessage("Investigation added successfully!");
                resetForm();
                // Hide success message after 5 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else {
                setError(result?.payload || 'Failed to create investigation');
            }
        } catch (error: any) {
            console.error('Error creating investigation:', error);
            setError(error?.message || 'Failed to create investigation. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Add Investigation
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Create a new investigation/test entry
                    </p>
                </div>
                <button
                    onClick={() => navigate("/investigation-customizations")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    Back to List
                </button>
            </div>

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

            {/* Investigation Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Investigation Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Fill in the information below to add a new investigation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Investigation Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Investigation Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., Pelvic ultrasound (Trans Abdominal)"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${formErrors.name
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Investigation Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Investigation Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                placeholder="e.g., trans_abdominal or 10001"
                                value={formData.code}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${formErrors.code
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            />
                            {formErrors.code && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${formErrors.category
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            >
                                {categoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {formErrors.category && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                placeholder="e.g., 800"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={`w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${formErrors.price
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-700'
                                    }`}
                            />
                            {formErrors.price && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                            )}
                        </div>
                    </div>

                    {/* Description Field - Only visible when "Procedure Tests" or "IUI" is selected */}
                    {requiresDescription && (
                        <div className="mt-6">
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className={`rounded-lg p-4 mb-4 ${
                                    formData.category === "procedure" 
                                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                                        : 'bg-purple-50 dark:bg-purple-900/20'
                                }`}>
                                    <p className={`text-sm ${
                                        formData.category === "procedure" 
                                            ? 'text-blue-700 dark:text-blue-300' 
                                            : 'text-purple-700 dark:text-purple-300'
                                    }`}>
                                        <span className="font-semibold">
                                            ℹ️ {getCategoryLabel()}
                                        </span> - Please provide a detailed description including preparation, process, and any special instructions.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {formData.category === "procedure" ? "Procedure" : "IUI"} Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={5}
                                        placeholder={getDescriptionPlaceholder()}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-y ${formErrors.description
                                                ? 'border-red-500 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-700'
                                            }`}
                                    />
                                    {formErrors.description && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Minimum 10 characters required. Include steps, preparation, and special instructions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={isSaving}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors duration-200 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Save Investigation'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InvestigationCustomizeAdd;