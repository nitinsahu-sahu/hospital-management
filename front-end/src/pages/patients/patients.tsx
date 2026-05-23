// pages/Patients.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { createPatient, createRelative } from "../../redux/actions/patient.actions.js";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { genderOptions, howToFindClinicOptions, idProofTypeOptions, infertiliyTypeOptions, maritalStatusOptions, relativeRoleOptions, roleOptions } from "../../utils/patientSelection.js";



export default function Patients() {
  // const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [patientUHID, setPatientUHID] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Patient Form Data
  const [patientFormData, setPatientFormData] = useState<any>({
    name: "",
    age: "",
    sex: "",
    mobileNumber: "",
    address: "",
    maritalStatus: "",
    durationOfMarriage: "",
    howToFindClinic: "",
    referredByDoctorName: "",
    idProofType: "",
    idProofNumber: "",
    profilePic: null,
    infertiliyType: "",
  });

  // Relative Form Data
  const [relativeFormData, setRelativeFormData] = useState<any>({
    name: "",
    age: "",
    sex: "",
    mobileNumber: "",
    address: "",
    maritalStatus: "",
    idProofType: "",
    idProofNumber: "",
    profilePic: null,
    role: "",
    UH_ID: "",
  });

  // Handle Patient Input Changes
  const handlePatientInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientFormData({ ...patientFormData, [name]: value });
  };

  const handlePatientSelectChange = (name: string, value: string) => {
    setPatientFormData({ ...patientFormData, [name]: value });
  };

  // Handle Relative Input Changes
  const handleRelativeInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRelativeFormData({ ...relativeFormData, [name]: value });
  };

  const handleRelativeSelectChange = (name: string, value: string) => {
    setRelativeFormData({ ...relativeFormData, [name]: value });
  };

  // Validate Patient Form
  const validatePatientForm = (): boolean => {
    if (!patientFormData.name.trim()) {
      setError("Patient name is required");
      return false;
    }
    if (!patientFormData.age.trim()) {
      setError("Age is required");
      return false;
    }
    if (!patientFormData.sex) {
      setError("Gender is required");
      return false;
    }
    if (!patientFormData.mobileNumber.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!patientFormData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!patientFormData.idProofType) {
      setError("ID proof type is required");
      return false;
    }
    if (!patientFormData.idProofNumber.trim()) {
      setError("ID proof number is required");
      return false;
    }
    return true;
  };

  // Validate Relative Form
  const validateRelativeForm = (): boolean => {
    if (!relativeFormData.name.trim()) {
      setError("Relative name is required");
      return false;
    }
    if (!relativeFormData.age.trim()) {
      setError("Age is required");
      return false;
    }
    if (!relativeFormData.sex) {
      setError("Gender is required");
      return false;
    }
    if (!relativeFormData.mobileNumber.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!relativeFormData.role) {
      setError("Role is required");
      return false;
    }
    if (!relativeFormData.idProofType) {
      setError("ID proof type is required");
      return false;
    }
    if (!relativeFormData.idProofNumber.trim()) {
      setError("ID proof number is required");
      return false;
    }
    return true;
  };

  // Handle Patient Submit (Step 1)
  const handlePatientSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePatientForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await dispatch(createPatient(patientFormData));

      if (response?.type === "CREATE_PATIENT_SUCCESS") {
        setPatientUHID(response.UH_ID);
        setRelativeFormData((prev: any) => ({ ...prev, UH_ID: response.UH_ID }));

        setSuccess("Patient registered successfully! Please fill relative details.");
        setCurrentStep(2);

        // Store UH_ID in sessionStorage for page reload handling
        sessionStorage.setItem("currentPatientUHID", response.UH_ID);
        sessionStorage.setItem("registrationStep", "2");
      } else {
        alert(response?.message);
      }


    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  // Handle Relative Submit (Step 2)
  const handleRelativeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateRelativeForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await dispatch(createRelative({
        ...relativeFormData,
        UH_ID: patientUHID || relativeFormData.UH_ID,
      }));
      if (response?.type === "CREATE_RELATIVE_SUCCESS") {

        setSuccess(response.message || "Registration successfully");

        // Clear session storage
        sessionStorage.removeItem("currentPatientUHID");
        sessionStorage.removeItem("registrationStep");

        // Reset all forms
        setTimeout(() => {
          navigate("/patient/view");
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register relative");
    } finally {
      setLoading(false);
    }
  };

  // Check for existing registration on page load
  useState(() => {
    const savedUHID = sessionStorage.getItem("currentPatientUHID");
    const savedStep = sessionStorage.getItem("registrationStep");

    if (savedUHID && savedStep === "2") {
      setPatientUHID(savedUHID);
      setRelativeFormData((prev: any) => ({ ...prev, UH_ID: savedUHID }));
      setCurrentStep(2);
    }
  });

  return (
    <>
      <PageMeta title="Patients | Hospital" description="Patient Registration" />
      <PageBreadcrumb pageTitle="Patient Registration" />

      {/* Stepper UI */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium">Patient Details</span>
          </div>

          {/* Connector */}
          <div
            className={`mx-4 h-1 w-20 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
          />

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium">Relative Details</span>
          </div>
        </div>
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

      {/* Step 1: Patient Registration Form */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Step 1: Patient Registration
          </h3>

          <form onSubmit={handlePatientSubmit} className="space-y-6">
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
                  onChange={handlePatientInputChange}
                />
                <Input
                  type="text"
                  name="age"
                  placeholder="Age *"
                  value={patientFormData.age}
                  onChange={handlePatientInputChange}
                />
                <Select
                  options={genderOptions}
                  placeholder="Select Gender *"
                  value={patientFormData.sex}
                  onChange={(val) => handlePatientSelectChange("sex", val)}
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
                  onChange={handlePatientInputChange}
                />
                <Select
                  options={maritalStatusOptions}
                  placeholder="Marital Status *"
                  value={patientFormData.maritalStatus}
                  onChange={(val) => handlePatientSelectChange("maritalStatus", val)}
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
                  onChange={handlePatientInputChange}
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
                  onChange={handlePatientInputChange}
                />
                <Select
                  options={infertiliyTypeOptions}
                  placeholder="Infertility Type"
                  value={patientFormData.infertiliyType || ""}
                  onChange={(val) => handlePatientSelectChange("infertiliyType", val)}
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
                  onChange={(val) => handlePatientSelectChange("howToFindClinic", val)}
                />
                <Input
                  type="text"
                  name="referredByDoctorName"
                  placeholder="Referred By Doctor Name"
                  value={patientFormData.referredByDoctorName || ""}
                  onChange={handlePatientInputChange}
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
                  onChange={(val) => handlePatientSelectChange("idProofType", val)}
                />
                <Input
                  type="text"
                  name="idProofNumber"
                  placeholder="ID Proof Number *"
                  value={patientFormData.idProofNumber}
                  onChange={handlePatientInputChange}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
                Profile Picture
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPatientFormData({ ...patientFormData, profilePic: file });
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

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
      )}

      {/* Step 2: Relative Registration Form */}
      {currentStep === 2 && (
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

          <form onSubmit={handleRelativeSubmit} className="space-y-6">
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
                  onChange={handleRelativeInputChange}
                />
                <Input
                  type="text"
                  name="age"
                  placeholder="Age *"
                  value={relativeFormData.age}
                  onChange={handleRelativeInputChange}
                />
                <Select
                  options={genderOptions}
                  placeholder="Select Gender *"
                  value={relativeFormData.sex}
                  onChange={(val) => handleRelativeSelectChange("sex", val)}
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
                  value={relativeFormData.mobileNumber}
                  onChange={handleRelativeInputChange}
                />
                <Select
                  options={maritalStatusOptions}
                  placeholder="Marital Status"
                  value={relativeFormData.maritalStatus}
                  onChange={(val) => handleRelativeSelectChange("maritalStatus", val)}
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
                  onChange={handleRelativeInputChange}
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
                  onChange={(val) => handleRelativeSelectChange("role", val)}
                />
                <Input
                  type="text"
                  name="UH_ID"
                  placeholder="Patient UH ID"
                  value={patientUHID}
                  onChange={handleRelativeInputChange}
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
                  onChange={(val) => handleRelativeSelectChange("idProofType", val)}
                />
                <Input
                  type="text"
                  name="idProofNumber"
                  placeholder="ID Proof Number *"
                  value={relativeFormData.idProofNumber}
                  onChange={handleRelativeInputChange}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
                Profile Picture
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setRelativeFormData({ ...relativeFormData, profilePic: file });
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
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
      )}
    </>
  );
}