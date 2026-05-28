// pages/Patients.tsx
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PatientRegistration from "../../components/patients/PatientRegistration.js";
import RelativeRegistration from "../../components/patients/RelativeRegistration";
//@ts-ignore
import { createPatient, createRelative } from "../../redux/actions/patient.actions.js";

import RegistrationStepper from "../../components/patients/RegistrationStepper.js";
import { REGISTRATION_STEPS } from "../../utils/patientSelection.js";


export default function Patients() {
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
    pic: null, 
    profilePicPreview: "", 
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
    pic: null, // For file
    profilePicPreview: "", // For preview
    role: "",
    UH_ID: "",
  });

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

  // Handle Patient Submit
  const handlePatientSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePatientForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all patient data to FormData
      Object.keys(patientFormData).forEach((key) => {
        if (key === "pic" && patientFormData[key]) {
          // Append image file with field name "pic"
          formData.append("pic", patientFormData[key]);
        } else if (key !== "profilePicPreview" && patientFormData[key] !== null && patientFormData[key] !== "") {
          formData.append(key, patientFormData[key]);
        }
      });

      const response = await dispatch(createPatient(formData));

      if (response?.type === "CREATE_PATIENT_SUCCESS") {
        setPatientUHID(response.UH_ID);
        setRelativeFormData((prev: any) => ({ ...prev, UH_ID: response.UH_ID }));
        setSuccess("Patient registered successfully! Please fill relative details.");
        setCurrentStep(2);

        sessionStorage.setItem("currentPatientUHID", response.UH_ID);
        sessionStorage.setItem("registrationStep", "2");
      } else {
        setError(response?.message || "Failed to register patient");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  // Handle Relative Submit
  const handleRelativeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateRelativeForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all relative data to FormData
      Object.keys(relativeFormData).forEach((key) => {
        if (key === "UH_ID") {
        return; // Skip this iteration
      }
        if (key === "pic" && relativeFormData[key]) {
          formData.append("pic", relativeFormData[key]);
        } else if (key !== "profilePicPreview" && relativeFormData[key] !== null && relativeFormData[key] !== "") {
          formData.append(key, relativeFormData[key]);
        }
      });

      const uhId = patientUHID || relativeFormData.UH_ID;
    formData.append("UH_ID", uhId);

      const response = await dispatch(createRelative(formData));

      if (response?.type === "CREATE_RELATIVE_SUCCESS") {
        setSuccess(response.message || "Registration successfully");
        sessionStorage.removeItem("currentPatientUHID");
        sessionStorage.removeItem("registrationStep");

        setTimeout(() => {
          navigate("/patient/view");
        }, 3000);
      } else {
        setError(response?.message || "Failed to register relative");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register relative");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Patients | Hospital" description="Patient Registration" />
      <PageBreadcrumb pageTitle="Patient Registration" />

      <RegistrationStepper currentStep={currentStep} steps={REGISTRATION_STEPS} />

      {currentStep === 1 && (
        <PatientRegistration
          patientFormData={patientFormData}
          setPatientFormData={setPatientFormData}
          loading={loading}
          onSubmit={handlePatientSubmit}
          error={error}
          success={success}
        />
      )}

      {currentStep === 2 && (
        <RelativeRegistration
          relativeFormData={relativeFormData}
          setRelativeFormData={setRelativeFormData}
          patientUHID={patientUHID}
          loading={loading}
          onSubmit={handleRelativeSubmit}
          onBack={() => setCurrentStep(1)}
          error={error}
          success={success}
        />
      )}
    </>
  );
}