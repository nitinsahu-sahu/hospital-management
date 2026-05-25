// components/patient/PatientRegistration.tsx
import { ChangeEvent, FormEvent } from "react";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import ImageUpload from "../../pages/Forms/ImageUpload";

import {
  genderOptions,
  howToFindClinicOptions,
  idProofTypeOptions,
  infertiliyTypeOptions,
  maritalStatusOptions,
} from "../../utils/patientSelection";

interface PatientFormProps {
  patientFormData: any;
  setPatientFormData: (data: any) => void;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
  error?: string;
  success?: string;
}

export default function PatientRegistration({
  patientFormData,
  setPatientFormData,
  loading,
  onSubmit,
  error,
  success,
}: PatientFormProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientFormData({ ...patientFormData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setPatientFormData({ ...patientFormData, [name]: value });
  };

  const handleImageChange = (file: File | null, preview: string) => {
    setPatientFormData({ 
      ...patientFormData, 
      pic: file,
      profilePicPreview: preview 
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
        Step 1: Patient Registration
      </h3>

      {/* Success/Error Messages */}
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

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={patientFormData.name}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              name="age"
              placeholder="Age *"
              value={patientFormData.age}
              onChange={handleInputChange}
            />
            <Select
              options={genderOptions}
              placeholder="Select Gender *"
              value={patientFormData.sex}
              onChange={(val) => handleSelectChange("sex", val)}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number *"
              value={patientFormData.mobileNumber}
              onChange={handleInputChange}
            />
            <Select
              options={maritalStatusOptions}
              placeholder="Marital Status *"
              value={patientFormData.maritalStatus}
              onChange={(val) => handleSelectChange("maritalStatus", val)}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Address
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <textarea
              name="address"
              placeholder="Full Address *"
              value={patientFormData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Marriage Details */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Marriage Details
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="text"
              name="durationOfMarriage"
              placeholder="Duration of Marriage (years)"
              value={patientFormData.durationOfMarriage || ""}
              onChange={handleInputChange}
            />
            <Select
              options={infertiliyTypeOptions}
              placeholder="Infertility Type"
              value={patientFormData.infertiliyType || ""}
              onChange={(val) => handleSelectChange("infertiliyType", val)}
            />
          </div>
        </div>

        {/* Referral Info */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Referral Information
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              options={howToFindClinicOptions}
              placeholder="How did you find the clinic?"
              value={patientFormData.howToFindClinic || ""}
              onChange={(val) => handleSelectChange("howToFindClinic", val)}
            />
            <Input
              type="text"
              name="referredByDoctorName"
              placeholder="Referred By Doctor Name"
              value={patientFormData.referredByDoctorName || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* ID Proof */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            ID Proof Details
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              options={idProofTypeOptions}
              placeholder="ID Proof Type *"
              value={patientFormData.idProofType}
              onChange={(val) => handleSelectChange("idProofType", val)}
            />
            <Input
              type="text"
              name="idProofNumber"
              placeholder="ID Proof Number *"
              value={patientFormData.idProofNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Profile Picture */}
        <ImageUpload
          title="Profile Picture"
          preview={patientFormData.profilePicPreview}
          onChange={handleImageChange}
          accept="image/*"
        />

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering Patient..." : "Next: Add Relative Details"}
          </button>
        </div>
      </form>
    </div>
  );
}