// pages/Prescription.tsx
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { getRoleWise } from "../../services/patientService";
import { createPrescription } from "../../services/prescriptionService";
import { Patient } from "../../types/patient";
import { useNavigate } from "react-router";

interface Medication {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface PrescriptionFormData {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string;
  medications: Medication[];
  specialInstructions: string;
  followUpDate: string;
  notes: string;
}

// Options
const frequencyOptions = [
  { value: "Once Daily", label: "Once Daily" },
  { value: "Twice Daily", label: "Twice Daily" },
  { value: "Thrice Daily", label: "Thrice Daily" },
  { value: "Four Times Daily", label: "Four Times Daily" },
  { value: "Every 4 Hours", label: "Every 4 Hours" },
  { value: "Every 6 Hours", label: "Every 6 Hours" },
  { value: "Every 8 Hours", label: "Every 8 Hours" },
  { value: "Every 12 Hours", label: "Every 12 Hours" },
  { value: "Once Weekly", label: "Once Weekly" },
  { value: "As Needed", label: "As Needed" },
];

const routeOptions = [
  { value: "Oral", label: "Oral" },
  { value: "Intravenous (IV)", label: "Intravenous (IV)" },
  { value: "Intramuscular (IM)", label: "Intramuscular (IM)" },
  { value: "Subcutaneous (SC)", label: "Subcutaneous (SC)" },
  { value: "Topical", label: "Topical" },
  { value: "Sublingual", label: "Sublingual" },
  { value: "Rectal", label: "Rectal" },
  { value: "Inhalation", label: "Inhalation" },
  { value: "Ophthalmic", label: "Ophthalmic" },
  { value: "Otic", label: "Otic" },
];

export default function Prescription() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientId: "",
    doctorId: "",
    diagnosis: "",
    symptoms: "",
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
    followUpDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      const response = await getRoleWise();
      
      let patientData = response.data?.patient || response.patient || [];
      let doctorData = response.data?.doctor || response.doctor || [];
      
      // Agar single object hai toh array mein convert karo
      if (patientData && !Array.isArray(patientData)) {
        patientData = [patientData];
      }
      if (doctorData && !Array.isArray(doctorData)) {
        doctorData = [doctorData];
      }
      
      setPatients(patientData);
      setDoctors(doctorData);
    } catch (err) {
      console.error("Failed to fetch patients/doctors:", err);
      setError("Failed to load patients and doctors data");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({ ...formData, medications: updatedMedications });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorId || !formData.diagnosis) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createPrescription(formData);
      setSuccess("Prescription created successfully!");
      setTimeout(() => navigate("/prescription/view"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  // Options for selects
  const patientOptions = patients.map((p) => ({
    value: p._id,
    label: `${p.name} - ${p.patientId || p._id}`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d._id,
    label: `${d.name} - ${d.patientId || d._id} (${d.specialization || 'Doctor'})`,
  }));

  return (
    <>
      <PageMeta title="Prescription | Hospital" description="Create Prescription" />
      <PageBreadcrumb pageTitle="Create Prescription" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          New Prescription
        </h3>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Doctor Info */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Patient & Doctor Info
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Patient Select */}
              <Select
                options={patientOptions}
                placeholder="Select Patient *"
                value={formData.patientId}
                onChange={(val) => handleSelectChange("patientId", val)}
              />
              
              {/* Doctor Select - Changed from Input to Select */}
              <Select
                options={doctorOptions}
                placeholder="Select Doctor *"
                value={formData.doctorId}
                onChange={(val) => handleSelectChange("doctorId", val)}
              />
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Diagnosis
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <Input
                type="text"
                name="diagnosis"
                placeholder="Diagnosis *"
                value={formData.diagnosis}
                onChange={handleInputChange}
              />
              <textarea
                name="symptoms"
                placeholder="Symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700 dark:text-white">
                Medications
              </h4>
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Medication
              </button>
            </div>

            {formData.medications.map((med, index) => (
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
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    type="text"
                    placeholder="Drug Name *"
                    value={med.drugName}
                    onChange={(e) =>
                      handleMedicationChange(index, "drugName", e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Dosage (e.g., 500mg) *"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicationChange(index, "dosage", e.target.value)
                    }
                  />
                  <Select
                    options={frequencyOptions}
                    placeholder="Frequency *"
                    value={med.frequency}
                    onChange={(val) =>
                      handleMedicationChange(index, "frequency", val)
                    }
                  />
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <DatePicker
                  id="follow-up"
                  placeholder="Select follow-up date"
                  onChange={(date) =>
                    setFormData({ ...formData, followUpDate: date })
                  }
                />
              </div>
              <Input
                type="text"
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
            <div className="mt-4">
              <textarea
                name="specialInstructions"
                placeholder="Special Instructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/prescription/view")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}