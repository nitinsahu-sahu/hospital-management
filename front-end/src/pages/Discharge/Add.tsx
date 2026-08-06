import { useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import Alert from '../../components/ui/alert/Alert';
import { useDispatch } from "react-redux";
//@ts-ignore
import { createDischarge } from '../../redux/actions/discharge.actions';
import { useNavigate } from "react-router";
import DatePicker from '../../components/form/date-picker';

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

const AddDischarge = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const currentPatientIdRef = useRef<string | null>(null);

    const [formData, setFormData] = useState({
        finalDiagnosis: "",
        treatmentSummary: "",
        dischargeAdvice: "",
        followUpDate: ""
    });

    // Reset form
    const resetForm = () => {
        setFormData({
            finalDiagnosis: "",
            treatmentSummary: "",
            dischargeAdvice: "",
            followUpDate: ""
        });
    };

    // Get patient from session
    useEffect(() => {
        const getPatientFromSession = () => {
            const patientId = sessionStorage.getItem('selectedPatientId');
            const patientUHID = sessionStorage.getItem('selectedPatientUHID');
            const patientData = sessionStorage.getItem('selectedPatient');

            if (patientId && patientUHID && patientData) {
                try {
                    const patient = JSON.parse(patientData);

                    if (currentPatientIdRef.current !== patient._id) {
                        currentPatientIdRef.current = patient._id;
                        setSelectedPatient(patient);
                        resetForm(); // Always reset form for new discharge
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                        resetForm();
                    }
                }
            } else {
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                    resetForm();
                }
            }
        };

        getPatientFromSession();

        const interval = setInterval(getPatientFromSession, 1000);
        window.addEventListener('storage', getPatientFromSession);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', getPatientFromSession);
        };
    }, []);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle date change
    const handleDateChange = (dateString: string) => {
        setFormData(prev => ({
            ...prev,
            followUpDate: dateString
        }));
    };

    // Handle form submission - ONLY CREATE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            setError('Please select a patient.');
            return;
        }

        // Validate required fields
        if (!formData.finalDiagnosis.trim()) {
            setError('Please enter final diagnosis');
            return;
        }
        if (!formData.treatmentSummary.trim()) {
            setError('Please enter treatment summary');
            return;
        }
        if (!formData.dischargeAdvice.trim()) {
            setError('Please enter discharge advice');
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await dispatch(createDischarge({
                patientId: selectedPatient._id,
                finalDiagnosis: formData.finalDiagnosis,
                treatmentSummary: formData.treatmentSummary,
                dischargeAdvice: formData.dischargeAdvice,
                followUpDate: formData.followUpDate || null
            }) as any);
console.log("diss",result);

            if (result?.status === 200) {
                setSuccessMessage("Discharge added successfully!");
                resetForm();
                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else {
                setError(result?.message || 'Failed to create discharge summary');
            }
        } catch (error: any) {
            console.error('Error creating discharge:', error);
            setError(error?.message || 'Failed to create discharge summary. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
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

            {/* Patient Info Card */}
            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />

            {/* Discharge Form - Only shown when patient is selected and consultation exists */}
            {selectedPatient && (
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Discharge Summary Form
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {/* Final Diagnosis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Final Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="finalDiagnosis"
                                    placeholder="Enter final diagnosis..."
                                    value={formData.finalDiagnosis}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Treatment Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Treatment Summary <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="treatmentSummary"
                                    placeholder="Enter treatment summary..."
                                    value={formData.treatmentSummary}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Discharge Advice */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Discharge Advice <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="dischargeAdvice"
                                    placeholder="Enter discharge advice..."
                                    value={formData.dischargeAdvice}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Follow-up Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Follow-up Date
                                </label>
                                <DatePicker
                                    id="follow-up-date"
                                    placeholder="Select follow-up date"
                                    value={formData.followUpDate}
                                    onChange={(dates: any, currentDateString: string) => {
                                        handleDateChange(currentDateString);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/discharge/view")}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Creating..." : "Save"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}

export default AddDischarge