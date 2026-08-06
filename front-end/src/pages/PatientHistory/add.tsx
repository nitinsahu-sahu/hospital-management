//new component - AddHistory.tsx
import { useEffect, useRef, useState } from "react";
import { useDispatch } from 'react-redux';
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
//@ts-ignore
import { createPatientHistory } from '../../redux/actions/patientHistory.action';
import Alert from '../../components/ui/alert/Alert';
import { chiefComplaintsOptions } from '../../utils/patientHistory';
import { PatientHistoryForm } from '../../types/patientHistory';
import OtherFieldGroup from '../../components/form/OtherFieldGroup';
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

const AddHistory = () => {
    const dispatch = useDispatch();
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentPatientIdRef = useRef<string | null>(null);

    // Initial form data with today's date
    const [formData, setFormData] = useState<PatientHistoryForm>({
        patientHistoryDate: new Date().toISOString().split('T')[0],
        chiefComplaints: '',
        chiefComplaintsDetails: '',
        lmp: '',
        sb_iod_dead: '',
        onset: '',
        duration: [{ number: '', unit: '' }],
        associatedSymptoms: '',
        cycleLength: '',
        daysOfFlow: '',
        menstrualSymptoms: '',
        gravida: '',
        para: '',
        living: '',
        abortion: '',
        ectopic: '',
        diabetes: '',
        hypertension: '',
        asthma: '',
        thyroid: '',
        drugAllergy: '',
        drugAllergyDetails: '',
        geneticDiseaseSelf: '',
        geneticDiseaseFamily: '',
        downSyndrome: '',
        smoking: '',
        drugAddiction: '',
        husbandDiabetes: '',
        husbandHypertension: '',
        husbandAsthma: '',
        husbandThyroid: '',
        husbandDrugAllergy: '',
        husbandDrugAllergyDetails: '',
        husbandGeneticDiseaseSelf: '',
        husbandGeneticDiseaseFamily: '',
        husbandDownSyndrome: '',
        husbandSmoking: '',
        husbandDrugAddiction: '',
    });

    // Handle patient selection from session storage
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


    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle radio button changes
    const handleRadioChange = (name: string, value: 'yes' | 'no') => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset drug allergy details if drug allergy is set to 'no'
            ...(name === 'drugAllergy' && value === 'no' ? { drugAllergyDetails: '' } : {}),
            ...(name === 'husbandDrugAllergy' && value === 'no' ? { husbandDrugAllergyDetails: '' } : {})
        }));
    };

    // Handle select change for chief complaints
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "chiefComplaints" && value !== "other") {
                newData.chiefComplaintsDetails = "";
            }
            return newData;
        });
    };

    // Handle form reset
    const handleReset = () => {
        setFormData({
            patientHistoryDate: new Date().toISOString().split('T')[0],
            chiefComplaints: '',
            chiefComplaintsDetails: '',
            lmp: '',
            sb_iod_dead: '',
            onset: '',
            duration: [{ number: '', unit: '' }],
            associatedSymptoms: '',
            cycleLength: '',
            daysOfFlow: '',
            menstrualSymptoms: '',
            gravida: '',
            para: '',
            living: '',
            abortion: '',
            ectopic: '',
            diabetes: '',
            hypertension: '',
            asthma: '',
            thyroid: '',
            drugAllergy: '',
            drugAllergyDetails: '',
            geneticDiseaseSelf: '',
            geneticDiseaseFamily: '',
            downSyndrome: '',
            smoking: '',
            drugAddiction: '',
            husbandDiabetes: '',
            husbandHypertension: '',
            husbandAsthma: '',
            husbandThyroid: '',
            husbandDrugAllergy: '',
            husbandDrugAllergyDetails: '',
            husbandGeneticDiseaseSelf: '',
            husbandGeneticDiseaseFamily: '',
            husbandDownSyndrome: '',
            husbandSmoking: '',
            husbandDrugAddiction: '',
        });
        setError('');
        setSuccessMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            setError('Please select a patient first');
            return;
        }

        // Transform form data to match backend structure
        const patientHistoryData = {
            patientId: selectedPatient._id,
            patientHistoryDate: formData.patientHistoryDate,
            chiefComplaints: formData.chiefComplaints,
            chiefComplaintsDetails: formData.chiefComplaintsDetails,
            historyOfIllness: {
                onset: formData.onset,
                duration: formData.duration,
                associatedSymptoms: formData.associatedSymptoms
            },
            menstrualHistory: {
                cycleLength: formData.cycleLength,
                daysOfFlow: formData.daysOfFlow,
                associatedSymptoms: formData.menstrualSymptoms,
                lmp: formData.lmp
            },
            obstetricHistory: {
                gravida: formData.gravida,
                para: formData.para,
                living: formData.living,
                abortion: formData.abortion,
                ectopic: formData.ectopic,
                sb_iod_dead: formData.sb_iod_dead
            },
            wifeMedicalHistory: {
                diabetes: formData.diabetes,
                hypertension: formData.hypertension,
                asthma: formData.asthma,
                thyroid: formData.thyroid,
                drugAllergy: formData.drugAllergy,
                drugAllergyDetails: formData.drugAllergyDetails,
                geneticDiseaseSelf: formData.geneticDiseaseSelf,
                geneticDiseaseFamily: formData.geneticDiseaseFamily,
                downSyndrome: formData.downSyndrome,
                smoking: formData.smoking,
                drugAddiction: formData.drugAddiction
            },
            husbandMedicalHistory: {
                diabetes: formData.husbandDiabetes,
                hypertension: formData.husbandHypertension,
                asthma: formData.husbandAsthma,
                thyroid: formData.husbandThyroid,
                drugAllergy: formData.husbandDrugAllergy,
                drugAllergyDetails: formData.husbandDrugAllergyDetails,
                geneticDiseaseSelf: formData.husbandGeneticDiseaseSelf,
                geneticDiseaseFamily: formData.husbandGeneticDiseaseFamily,
                downSyndrome: formData.husbandDownSyndrome,
                smoking: formData.husbandSmoking,
                drugAddiction: formData.husbandDrugAddiction
            },
        };

        setIsSubmitting(true);
        setError('');

        try {
            const result = await dispatch(createPatientHistory(patientHistoryData) as any);

            if (result?.type === 'PATIENT_HISTORY_CREATE_SUCCESS') {
                setSuccessMessage('Patient history saved successfully!');
                // Reset form after successful submission
                setTimeout(() => {
                    handleReset();
                }, 1000);
            } else {
                setError(result?.message || 'Failed to save patient history');
            }
        } catch (error: any) {
            setError(error.message || 'Error saving patient history');
        } finally {
            setIsSubmitting(false);
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

            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />

            {selectedPatient && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Consultation Date */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Patient History Details
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Patient History Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.patientHistoryDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, patientHistoryDate: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Section 1: Chief Complaints */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Chief Complaints <span className="text-red-500">*</span>
                        </h2>
                        <div>
                            <OtherFieldGroup
                                selectName="chiefComplaints"
                                selectOptions={chiefComplaintsOptions}
                                selectValue={formData.chiefComplaints}
                                selectPlaceholder="Select Chief Complaint"
                                onSelectChange={handleSelectChange}
                                otherInputName="chiefComplaintsDetails"
                                otherInputValue={formData.chiefComplaintsDetails || ""}
                                otherInputPlaceholder="Please specify chief complaint"
                                onOtherInputChange={handleInputChange}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Section 2: History of Patient Illness */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            History of Patient Illness
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <DatePicker
                                    id="onset"
                                    label="Onset"
                                    placeholder="Select onset date"
                                    // value={formData.onset}
                                    value={formData.onset}
                                    // onChange={(dates, currentDateString) => {
                                    //   setFormData((prev: any) => ({
                                    //     ...prev,
                                    //     onset: currentDateString
                                    //   }));
                                    // }}
                                    onChange={(currentDateString) => {
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            onset: currentDateString
                                        }));
                                    }}
                                />
                                {/* <input
                                       type="date"
                                       name="onset"
                                       value={formData.onset}
                                       onChange={handleInputChange}
                                       className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                     /> */}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration
                                </label>
                                {formData?.duration?.map((item, index) => (
                                    <div key={index} className="flex gap-3 mb-3 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Enter number"
                                                value={item.number}
                                                onChange={(e) => {
                                                    const newDuration = [...formData.duration];
                                                    newDuration[index].number = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        duration: newDuration
                                                    }));
                                                }}
                                                min="1"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={item.unit}
                                                onChange={(e) => {
                                                    const newDuration = [...formData.duration];
                                                    newDuration[index].unit = e.target.value as 'months' | 'weeks' | 'days' | 'years';
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        duration: newDuration
                                                    }));
                                                }}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            >
                                                <option value="">Select Unit</option>
                                                <option value="days">Days</option>
                                                <option value="weeks">Weeks</option>
                                                <option value="months">Months</option>
                                                <option value="years">Years</option>
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (index === formData.duration.length - 1) {
                                                    // Add new row only if clicking on the last item
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        duration: [...prev.duration, { number: '', unit: '' }]
                                                    }));
                                                } else {
                                                    // Remove this row
                                                    const newDuration = formData.duration.filter((_, i) => i !== index);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        duration: newDuration
                                                    }));
                                                }
                                            }}
                                            className="mt-1 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                            title={index === formData.duration.length - 1 ? "Add more duration" : "Remove this duration"}
                                        >
                                            {index === formData.duration.length - 1 ? (
                                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Associated Symptoms
                                </label>
                                <textarea
                                    name="associatedSymptoms"
                                    value={formData.associatedSymptoms}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe associated symptoms..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Menstrual History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Menstrual History
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cycle Length (days)
                                </label>
                                <input
                                    type="text"
                                    name="cycleLength"
                                    value={formData.cycleLength}
                                    onChange={handleInputChange}
                                    placeholder="Enter cycle length"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Days of Flow
                                </label>
                                <input
                                    type="text"
                                    name="daysOfFlow"
                                    value={formData.daysOfFlow}
                                    onChange={handleInputChange}
                                    placeholder="Enter days of flow"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Associated Symptoms
                                </label>
                                <input
                                    type="text"
                                    name="menstrualSymptoms"
                                    value={formData.menstrualSymptoms}
                                    onChange={handleInputChange}
                                    placeholder="Enter associated symptoms"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <DatePicker
                                    id="lmp"
                                    label="Last Menstrual Period (LMP)"
                                    placeholder="Select last menstrual period date"
                                    value={formData.lmp}
                                    onChange={(currentDateString) => {
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            lmp: currentDateString
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Obstetric History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Obstetric History
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gravida
                                </label>
                                <input
                                    type="text"
                                    name="gravida"
                                    value={formData.gravida}
                                    onChange={handleInputChange}
                                    placeholder="Enter gravida"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Para
                                </label>
                                <input
                                    type="text"
                                    name="para"
                                    value={formData.para}
                                    onChange={handleInputChange}
                                    placeholder="Enter para"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Living
                                </label>
                                <input
                                    type="text"
                                    name="living"
                                    value={formData.living}
                                    onChange={handleInputChange}
                                    placeholder="Enter living"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Abortion
                                </label>
                                <input
                                    type="text"
                                    name="abortion"
                                    value={formData.abortion}
                                    onChange={handleInputChange}
                                    placeholder="Enter abortion"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    SB / IUD / DEAD
                                </label>
                                <input
                                    type="text"
                                    name="sb_iod_dead"
                                    value={formData.sb_iod_dead}
                                    onChange={handleInputChange}
                                    placeholder="Enter SB / IUD / DEAD"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ectopic
                                </label>
                                <input
                                    type="text"
                                    name="ectopic"
                                    value={formData.ectopic}
                                    onChange={handleInputChange}
                                    placeholder="Enter ectopic"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Wife Medical History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Wife Medical History
                        </h2>
                        <div className="space-y-4">
                            {[
                                { key: 'diabetes', label: 'Diabetes' },
                                { key: 'hypertension', label: 'Hypertension' },
                                { key: 'asthma', label: 'Asthma' },
                                { key: 'thyroid', label: 'Thyroid' },
                                { key: 'geneticDiseaseSelf', label: 'Any History of Genetic Disease (Self)' },
                                { key: 'geneticDiseaseFamily', label: 'Any History of Genetic Disease in Family' },
                                { key: 'downSyndrome', label: 'H/O Down Syndrome' },
                                { key: 'smoking', label: 'Smoking' },
                                { key: 'drugAddiction', label: 'Drug Addiction' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {label}
                                    </label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={key}
                                                value="yes"
                                                checked={formData[key as keyof PatientHistoryForm] === 'yes'}
                                                onChange={(e) => handleRadioChange(key, e.target.value as 'yes')}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={key}
                                                value="no"
                                                checked={formData[key as keyof PatientHistoryForm] === 'no'}
                                                onChange={(e) => handleRadioChange(key, e.target.value as 'no')}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                                        </label>
                                    </div>
                                </div>
                            ))}

                            {/* Drug Allergy with details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Any History of Drug Allergy
                                </label>
                                <div className="flex gap-6 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="drugAllergy"
                                            value="yes"
                                            checked={formData.drugAllergy === 'yes'}
                                            onChange={(e) => handleRadioChange('drugAllergy', e.target.value as 'yes')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="drugAllergy"
                                            value="no"
                                            checked={formData.drugAllergy === 'no'}
                                            onChange={(e) => handleRadioChange('drugAllergy', e.target.value as 'no')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                                    </label>
                                </div>
                                {formData.drugAllergy === 'yes' && (
                                    <input
                                        type="text"
                                        name="drugAllergyDetails"
                                        value={formData.drugAllergyDetails}
                                        onChange={handleInputChange}
                                        placeholder="Please specify drug allergy details"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Husband Medical History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Husband Medical History
                        </h2>
                        <div className="space-y-4">
                            {[
                                { key: 'husbandDiabetes', label: 'Diabetes' },
                                { key: 'husbandHypertension', label: 'Hypertension' },
                                { key: 'husbandAsthma', label: 'Asthma' },
                                { key: 'husbandThyroid', label: 'Thyroid' },
                                { key: 'husbandGeneticDiseaseSelf', label: 'Any History of Genetic Disease (Self)' },
                                { key: 'husbandGeneticDiseaseFamily', label: 'Any History of Genetic Disease in Family' },
                                { key: 'husbandDownSyndrome', label: 'H/O Down Syndrome' },
                                { key: 'husbandSmoking', label: 'Smoking' },
                                { key: 'husbandDrugAddiction', label: 'Drug Addiction' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {label}
                                    </label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={key}
                                                value="yes"
                                                checked={formData[key as keyof PatientHistoryForm] === 'yes'}
                                                onChange={(e) => handleRadioChange(key, e.target.value as 'yes')}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={key}
                                                value="no"
                                                checked={formData[key as keyof PatientHistoryForm] === 'no'}
                                                onChange={(e) => handleRadioChange(key, e.target.value as 'no')}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                                        </label>
                                    </div>
                                </div>
                            ))}

                            {/* Husband Drug Allergy with details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Any History of Drug Allergy
                                </label>
                                <div className="flex gap-6 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="husbandDrugAllergy"
                                            value="yes"
                                            checked={formData.husbandDrugAllergy === 'yes'}
                                            onChange={(e) => handleRadioChange('husbandDrugAllergy', e.target.value as 'yes')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="husbandDrugAllergy"
                                            value="no"
                                            checked={formData.husbandDrugAllergy === 'no'}
                                            onChange={(e) => handleRadioChange('husbandDrugAllergy', e.target.value as 'no')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                                    </label>
                                </div>
                                {formData.husbandDrugAllergy === 'yes' && (
                                    <input
                                        type="text"
                                        name="husbandDrugAllergyDetails"
                                        value={formData.husbandDrugAllergyDetails}
                                        onChange={handleInputChange}
                                        placeholder="Please specify drug allergy details"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
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
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Patient History'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddHistory;