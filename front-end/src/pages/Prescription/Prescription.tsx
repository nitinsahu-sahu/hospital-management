// pages/Prescription.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
// @ts-ignore
import { createPrescription, getPrescriptionsByPatient, updatePrescription } from "../../redux/actions/prescription.action";
import { useNavigate } from "react-router";
import Alert from "../../components/ui/alert/Alert";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import { useDispatch } from "react-redux";
//@ts-ignore
// import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';
import { routeOptions,frequencyOptions,medicineOptions } from "../../utils/prescription";
routeOptions
interface Medication {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

// Searchable Select Component for Medicine
const SearchableMedicineSelect = ({
  value,
  onChange,
  placeholder = "Search medicine..."
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(medicineOptions);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter medicines based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(medicineOptions);
    } else {
      const filtered = medicineOptions.filter(med =>
        med.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial search term when value changes
  useEffect(() => {
    if (value) {
      const selectedMedicine = medicineOptions.find(med => med.value === value);
      setSearchTerm(selectedMedicine?.label || value);
    } else {
      setSearchTerm("");
    }
  }, [value]);

  const handleSelect = (medicine: { value: string; label: string }) => {
    onChange(medicine.value);
    setSearchTerm(medicine.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);

    // If user clears the input, clear the selection
    if (inputValue === "") {
      onChange("");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (searchTerm === "" || !value) {
      setFilteredOptions(medicineOptions);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        {/* Search Icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        {/* Dropdown Arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((medicine) => (
              <div
                key={medicine.value}
                onClick={() => handleSelect(medicine)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center justify-between ${value === medicine.value
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                <span>{medicine.label}</span>
                {value === medicine.value && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No medicine found
            </div>
          )}

          {/* Add custom medicine option */}
          {searchTerm.trim() !== "" && !medicineOptions.some(med => med.value === searchTerm.trim()) && (
            <div
              onClick={() => {
                onChange(searchTerm.trim());
                setSearchTerm(searchTerm.trim());
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add "{searchTerm.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Prescription() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
  const [hasExistingPrescription, setHasExistingPrescription] = useState(false);
  const [existingPrescriptionId, setExistingPrescriptionId] = useState<string | null>(null);
  const currentPatientIdRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    medications: [
      {
        drugName: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "",
        instructions: "",
      },
    ],
    specialInstructions: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      medications: [
        {
          drugName: "",
          dosage: "",
          frequency: "",
          duration: "",
          route: "",
          instructions: "",
        },
      ],
      specialInstructions: "",
    });
    setHasExistingPrescription(false);
    setExistingPrescriptionId(null);
  };

  // Fetch prescription when patient is selected
  const fetchPatientPrescription = async (patientId: string) => {
    setIsLoadingPrescription(true);
    try {
      const result = await dispatch(getPrescriptionsByPatient(patientId) as any);

      if (result.status === 200 && result.payload) {
        // Existing prescription found
        const prescription = result.payload;
        setHasExistingPrescription(true);
        setExistingPrescriptionId(prescription._id);

        // Populate form with existing prescription data
        setFormData({
          medications: prescription.medications.map((med: Medication) => ({
            drugName: med.drugName || "",
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "",
            instructions: med.instructions || "",
          })),
          specialInstructions: prescription.specialInstructions || "",
        });
      } else {
        // No prescription found
        resetForm();
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      resetForm();
    } finally {
      setIsLoadingPrescription(false);
    }
  };

  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);

      if (result?.type === 'GET_CONSULTATION_BY_PATIENT_ID_SUCCESS') {
        setIsExistingConsultation(true);
      } else {
        setIsExistingConsultation(false);
      }
    } catch (error) {
      setIsExistingConsultation(false);
    } finally {
      setIsLoadingConsultation(false);
    }
  }, [dispatch]);

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
            setIsExistingConsultation(false);
            fetchConsultationForPatient(patient._id);
            fetchPatientPrescription(patient._id);
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
          setIsExistingConsultation(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setFormData({ ...formData, medications: updatedMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          drugName: "",
          dosage: "",
          frequency: "",
          duration: "",
          route: "",
          instructions: "",
        },
      ],
    });
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_: any, i: number) => i !== index);
      setFormData({ ...formData, medications: updatedMedications });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    const hasEmptyMedication = formData.medications.some(
      (med: Medication) => !med.drugName || !med.dosage || !med.frequency || !med.duration || !med.route
    );

    if (hasEmptyMedication) {
      setError('Please fill all required fields in medications');
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const prescriptionData = {
        ...formData,
        patientId: selectedPatient._id,
      };

      let result;

      if (hasExistingPrescription && existingPrescriptionId) {
        result = await dispatch(updatePrescription(existingPrescriptionId, prescriptionData) as any);
      } else {
        result = await dispatch(createPrescription(prescriptionData) as any);
      }

      if (result.status === 200 || result.status === 201) {
        setSuccess(
          hasExistingPrescription
            ? "Prescription updated successfully!"
            : "Prescription created successfully!"
        );
        setTimeout(() => {
          setSuccess("");
        }, 5000);
        if (selectedPatient?._id) {
          setTimeout(() => {
            fetchPatientPrescription(selectedPatient._id);
          }, 500);
        }
      } else {
        setError(result.message || "Operation failed");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to process prescription");
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (loading) {
      return hasExistingPrescription ? "Updating..." : "Creating...";
    }
    return hasExistingPrescription ? "Update Prescription" : "Create Prescription";
  };

  const getPageTitle = () => {
    if (hasExistingPrescription) {
      return "Update Prescription";
    }
    return "Create Prescription";
  };

  return (
    <>
      <PageMeta title="Prescription | Hospital" description="Prescription Management" />
      <PageBreadcrumb pageTitle={getPageTitle()} />

      {success && (
        <div className='mb-6'>
          <Alert
            variant="success"
            title="Success"
            message={success}
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

      {isLoadingPrescription && (
        <div className="mb-6 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading prescription...</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <PatientInfoCard
          selectedPatient={selectedPatient}
          isExistingConsultation={isExistingConsultation}
          isLoading={isLoadingConsultation}
        />

        {selectedPatient && !isLoadingPrescription && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medications */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700 dark:text-white">
                  Medications
                </h4>
                <button
                  type="button"
                  onClick={addMedication}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  + Add Medication
                </button>
              </div>

              {formData.medications.map((med: Medication, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medication #{index + 1}
                    </h5>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Searchable Medicine Select - REPLACED INPUT WITH SEARCHABLE SELECT */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Drug Name *
                      </label>
                      <SearchableMedicineSelect
                        value={med.drugName}
                        onChange={(val) => handleMedicationChange(index, "drugName", val)}
                        placeholder="Search medicine..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Dosage *
                      </label>
                      <Input
                        type="text"
                        placeholder="Dosage (e.g., 500mg) *"
                        value={med.dosage}
                        onChange={(e) =>
                          handleMedicationChange(index, "dosage", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Frequency *
                      </label>
                      <Select
                        options={frequencyOptions}
                        placeholder="Frequency *"
                        value={med.frequency}
                        onChange={(val) =>
                          handleMedicationChange(index, "frequency", val)
                        }
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Duration (e.g., 5 days) *"
                      value={med.duration}
                      onChange={(e) =>
                        handleMedicationChange(index, "duration", e.target.value)
                      }
                    />
                    <Select
                      options={routeOptions}
                      placeholder="Route *"
                      value={med.route}
                      onChange={(val) =>
                        handleMedicationChange(index, "route", val)
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) =>
                        handleMedicationChange(index, "instructions", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div>
              <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
                Additional Information
              </h4>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  placeholder="Special Instructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => navigate("/prescription/view")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPatient}
                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${hasExistingPrescription
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {getSubmitButtonText()}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}