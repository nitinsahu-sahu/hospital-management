// components/patient/RelativeRegistration.tsx
import { ChangeEvent, FormEvent, useState } from "react";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import {
  genderOptions,
  idProofTypeOptions,
  maritalStatusOptions,
  relativeRoleOptions,
} from "../../utils/patientSelection";
import ImageUpload from "../../pages/Forms/ImageUpload";

interface RelativeFormProps {
  relativeFormData: any;
  setRelativeFormData: (data: any) => void;
  patientUHID: string;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  error?: string;
  success?: string;
}

export default function RelativeRegistration({
  relativeFormData,
  setRelativeFormData,
  patientUHID,
  loading,
  onSubmit,
  error,
  success,
}: RelativeFormProps) {
  const [showOtherGenderInput, setShowOtherGenderInput] = useState(
    relativeFormData.sex === "other" || false
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRelativeFormData({ ...relativeFormData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setRelativeFormData({ ...relativeFormData, [name]: value });

    // Show other gender input when "other" is selected
    if (name === "sex") {
      setShowOtherGenderInput(value === "other");
      // Clear sexDetails when changing from "other" to something else
      if (value !== "other") {
        setRelativeFormData((prev: any) => ({ ...prev, sexDetails: "" }));
      }
    }
  };

  const handleImageChange = (file: File | null, preview: string) => {
    setRelativeFormData({
      ...relativeFormData,
      pic: file,
      profilePicPreview: preview
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
        Step 2: Relative Registration
      </h3>

      {/* Show Patient UH_ID */}
      <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Patient UH ID: <span className="font-bold">{patientUHID}</span>
        </p>
      </div>

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
              value={relativeFormData.name}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              name="age"
              placeholder="Age *"
              value={relativeFormData.age}
              onChange={handleInputChange}
            />
            <Select
              options={genderOptions}
              placeholder="Select Gender *"
              value={relativeFormData.sex}
              onChange={(val) => handleSelectChange("sex", val)}
            />
          </div>
        </div>
        {showOtherGenderInput && (
          <div className="mt-3">
            <Input
              type="text"
              name="sexDetails"
              placeholder="Please specify your gender *"
              value={relativeFormData.sexDetails || ""}
              onChange={handleInputChange}
            />
          </div>
        )}
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
              value={relativeFormData.mobileNumber}
              onChange={handleInputChange}
            />
            <Select
              options={maritalStatusOptions}
              placeholder="Marital Status"
              value={relativeFormData.maritalStatus}
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
              placeholder="Full Address"
              value={relativeFormData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Role & UH_ID */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
            Role Details
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              options={relativeRoleOptions}
              placeholder="Select Role *"
              value={relativeFormData.role}
              onChange={(val) => handleSelectChange("role", val)}
            />
            <Input
              type="text"
              name="UH_ID"
              placeholder="Patient UH ID"
              value={patientUHID}
              disabled={true}
              className="bg-gray-100"
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
              value={relativeFormData.idProofType}
              onChange={(val) => handleSelectChange("idProofType", val)}
            />
            <Input
              type="text"
              name="idProofNumber"
              placeholder="ID Proof Number *"
              value={relativeFormData.idProofNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Profile Picture */}
        <ImageUpload
          title="Profile Picture"
          preview={relativeFormData.profilePicPreview}
          onChange={handleImageChange}
          accept="image/*"
        />

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering Relative..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}