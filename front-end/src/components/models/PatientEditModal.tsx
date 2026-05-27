// components/patient/PatientEditModal.tsx
import { useState, useEffect } from "react";
import { Patient } from "../../types/patient";
import { genderOptions, howToFindClinicOptions, idProofTypeOptions, infertiliyTypeOptions, maritalStatusOptions } from "../../utils/patientSelection";

interface Relative {
  _id?: string;
  role?: string;
  name: string;
  age: number;
  sex: string;
  mobileNumber: string;
  address: string;
  maritalStatus: string;
  idProofType: string;
  idProofNumber: string;
}

interface PatientEditModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (patientData: any) => void;
}

export default function PatientEditModal({ patient, onClose, onSubmit }: PatientEditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [relative, setRelative] = useState<Relative>({
    role: "",
    name: "",
    age: 0,
    sex: "",
    mobileNumber: "",
    address: "",
    maritalStatus: "",
    idProofType: "",
    idProofNumber: "",
  });
  const [hasRelative, setHasRelative] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  console.log("==edit patient data", patient);

  // Initialize form data when patient prop changes
  useEffect(() => {
    setFormData({
      name: patient.name || "",
      UH_ID: patient.UH_ID || "",
      mobileNumber: patient.mobileNumber || "",
      email: patient.email || "",
      age: patient.age || undefined,
      sex: patient.sex || "",
      maritalStatus: patient.maritalStatus || "",
      durationOfMarriage: patient.durationOfMarriage || undefined,
      address: patient.address || "",
      infertiliyType: patient.infertiliyType || "",
      idProofType: patient.idProofType || "",
      idProofNumber: patient.idProofNumber || "",
      howToFindClinic: patient.howToFindClinic || "",
      referredByDoctorName: patient.referredByDoctorName || "",
      isActive: patient.isActive !== undefined ? patient.isActive : true,
    });
    
    // Initialize single relative from patient.relative (object, not array)
    if (patient.relative) {
      setRelative({
        _id: patient.relative._id,
        role: patient.relative.role || "",
        name: patient.relative.name || "",
        age: patient.relative.age || 0,
        sex: patient.relative.sex || "",
        mobileNumber: patient.relative.mobileNumber || "",
        address: patient.relative.address || "",
        maritalStatus: patient.relative.maritalStatus || "",
        idProofType: patient.relative.idProofType || "",
        idProofNumber: patient.relative.idProofNumber || "",
      });
      setHasRelative(true);
    } else {
      setRelative({
        role: "",
        name: "",
        age: 0,
        sex: "",
        mobileNumber: "",
        address: "",
        maritalStatus: "",
        idProofType: "",
        idProofNumber: "",
      });
      setHasRelative(false);
    }
  }, [patient]);

  // Handle input change for main patient form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    // Handle different input types
    if (type === "number") {
      processedValue = value === "" ? undefined : Number(value);
    }
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: processedValue
    }));
    setIsDirty(true);
  };

  // Handle relative input change (single object, no array)
  const handleRelativeChange = (field: string, value: any, type: string = "text") => {
    let processedValue: any = value;
    
    // Handle number type
    if (type === "number") {
      processedValue = value === "" ? 0 : Number(value);
    }
    
    setRelative((prev:any) => ({
      ...prev,
      [field]: processedValue
    }));
    setIsDirty(true);
  };

  // Toggle relative section
  const handleToggleRelative = (checked: boolean) => {
    setHasRelative(checked);
    if (!checked) {
      // Reset relative data when toggling off
      setRelative({
        role: "",
        name: "",
        age: 0,
        sex: "",
        mobileNumber: "",
        address: "",
        maritalStatus: "",
        idProofType: "",
        idProofNumber: "",
      });
    }
    setIsDirty(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the complete data object with single relative object
    const completeData = {
      ...formData,
      relative: hasRelative ? {
        _id: relative._id,
        role: relative.role,
        name: relative.name,
        age: relative.age,
        sex: relative.sex,
        mobileNumber: relative.mobileNumber,
        address: relative.address,
        maritalStatus: relative.maritalStatus,
        idProofType: relative.idProofType,
        idProofNumber: relative.idProofNumber,
        UH_ID: patient.UH_ID,
        isActive: true,
      } : null
    };
    
    // Console log the edited data for now
    console.log("=== EDIT SUBMISSION ===");
    console.log("Original Patient Data:", patient);
    console.log("Edited Patient Data:", formData);
    console.log("Relative Data:", hasRelative ? relative : null);
    console.log("Complete Data to Submit:", completeData);
    console.log("Changed Fields:", getChangedFields());
    console.log("======================");
    
    // Pass the complete form data to parent
    onSubmit(completeData);
  };

  // Get fields that were actually changed
  const getChangedFields = () => {
    const changedFields: Record<string, { old: any; new: any }> = {};
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== patient[key as keyof Patient]) {
        changedFields[key] = {
          old: patient[key as keyof Patient],
          new: formData[key]
        };
      }
    });
    
    // Check if relative changed
    const originalRelative = patient.relative || null;
    const currentRelative = hasRelative ? relative : null;
    if (JSON.stringify(originalRelative) !== JSON.stringify(currentRelative)) {
      changedFields.relative = {
        old: originalRelative,
        new: currentRelative
      };
    }
    
    return changedFields;
  };

  // Handle modal close
  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Edit Patient
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Editing: {patient.name} (UH ID: {patient.UH_ID})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <section>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Full Name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age?.toString() || ""}
                  onChange={handleChange}
                />
                <FormField
                  label="Sex"
                  name="sex"
                  type="select"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  options={genderOptions}
                />
                <FormField
                  label="Marital Status"
                  name="maritalStatus"
                  type="select"
                  value={formData.maritalStatus || ""}
                  onChange={handleChange}
                  options={maritalStatusOptions}
                />
                <FormField
                  label="Duration of Marriage (years)"
                  name="durationOfMarriage"
                  type="number"
                  value={formData.durationOfMarriage?.toString() || ""}
                  onChange={handleChange}
                />
                <FormField
                  label="Infertility Type"
                  name="infertiliyType"
                  type="select"
                  value={formData.infertiliyType || ""}
                  onChange={handleChange}
                  options={infertiliyTypeOptions}
                />
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber || ""}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
                <div className="md:col-span-full">
                  <FormField
                    label="Address"
                    name="address"
                    type="textarea"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* ID Proof Details */}
            <section>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID Proof Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="ID Proof Type"
                  name="idProofType"
                  type="select"
                  value={formData.idProofType || ""}
                  onChange={handleChange}
                  options={idProofTypeOptions}
                />
                <FormField
                  label="ID Proof Number"
                  name="idProofNumber"
                  value={formData.idProofNumber || ""}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Referral Information */}
            <section>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Referral Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="How Found Clinic"
                  name="howToFindClinic"
                  type="select"
                  value={formData.howToFindClinic || ""}
                  onChange={handleChange}
                  options={howToFindClinicOptions}
                />
                <FormField
                  label="Referred By Doctor"
                  name="referredByDoctorName"
                  value={formData.referredByDoctorName || ""}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Relative Section - Single Object */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Relative Information
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRelative}
                    onChange={(e) => handleToggleRelative(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hasRelative ? "Has Relative" : "No Relative"}
                  </span>
                </label>
              </div>

              {hasRelative && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Relative Details
                    {relative.role && (
                      <span className="ml-2 text-sm text-gray-500 capitalize">
                        ({relative.role})
                      </span>
                    )}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={relative.role}
                        onChange={(e) => handleRelativeChange("role", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="husband">Husband</option>
                        <option value="wife">Wife</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="son">Son</option>
                        <option value="daughter">Daughter</option>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={relative.name}
                        onChange={(e) => handleRelativeChange("name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={relative.age || ""}
                        onChange={(e) => handleRelativeChange("age", e.target.value, "number")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter age"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Sex
                      </label>
                      <select
                        value={relative.sex}
                        onChange={(e) => handleRelativeChange("sex", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={relative.mobileNumber}
                        onChange={(e) => handleRelativeChange("mobileNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter mobile number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Marital Status
                      </label>
                      <select
                        value={relative.maritalStatus}
                        onChange={(e) => handleRelativeChange("maritalStatus", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        ID Proof Type
                      </label>
                      <select
                        value={relative.idProofType}
                        onChange={(e) => handleRelativeChange("idProofType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhaar">Aadhar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="voter">Voter ID</option>
                        <option value="driving">Driving License</option>
                        <option value="passport">Passport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        ID Proof Number
                      </label>
                      <input
                        type="text"
                        value={relative.idProofNumber}
                        onChange={(e) => handleRelativeChange("idProofNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter ID number"
                      />
                    </div>
                    <div className="md:col-span-full">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Address
                      </label>
                      <textarea
                        value={relative.address}
                        onChange={(e) => handleRelativeChange("address", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Status */}
            <section>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Status
              </h4>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        isActive: e.target.checked
                      }));
                      setIsDirty(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("=== DEBUG ===");
                console.log("Current Form Data:", formData);
                console.log("Current Relative:", hasRelative ? relative : null);
                console.log("Complete Data:", { 
                  ...formData, 
                  relative: hasRelative ? relative : null 
                });
              }}
              className="px-4 py-2 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Debug Console
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "email" | "select" | "textarea";
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
}

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  options,
  required = false,
  placeholder,
}: FormFieldProps) => {
  const baseInputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
  
  const baseLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div>
      <label className={baseLabelClass}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === "select" && options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={baseInputClass}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={baseInputClass}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={baseInputClass}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          required={required}
          min={type === "number" ? 0 : undefined}
        />
      )}
    </div>
  );
};