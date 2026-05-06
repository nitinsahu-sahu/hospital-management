// pages/Patients.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { createPatient } from "../../services/patientService";
import { PatientFormData } from "../../types/patient";
import { useNavigate } from "react-router";

interface Option {
  value: string;
  label: string;
}

export default function Patients() {
  const genderOptions: Option[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const typeOptions: Option[] = [
    { value: "OPD", label: "OPD" },
    { value: "IPD", label: "IPD" },
  ];

  const paymentModeOptions: Option[] = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "Card", label: "Card" },
  ];

  const paymentStatusOptions: Option[] = [
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
  ];

  const maritalStatusOptions: Option[] = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
    { value: "Other", label: "Other" },
  ];

  const bloodGroupOptions: Option[] = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    bloodGroup: "",
    mobile: "",
    city: "",
    department: "",
    doctor: "",
    type: "OPD",
    referredBy: "",
    emergencyName: "",
    emergencyMobile: "",
    symptoms: "",
    fee: "",
    paymentMode: "Cash",
    paymentStatus: "Paid",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, dateOfBirth: date });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      bloodGroup: "",
      mobile: "",
      city: "",
      department: "",
      doctor: "",
      type: "OPD",
      referredBy: "",
      emergencyName: "",
      emergencyMobile: "",
      symptoms: "",
      fee: "",
      paymentMode: "Cash",
      paymentStatus: "Paid",
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return false;
    }
    if (!formData.mobile.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!formData.department.trim()) {
      setError("Department is required");
      return false;
    }
    if (!formData.doctor.trim()) {
      setError("Doctor name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert fee to number before sending
      const submitData: PatientFormData = {
        ...formData,
        fee: formData.fee ? Number(formData.fee) : 0,
      };

      const response = await createPatient(submitData);

      setSuccess(response.message || "Patient registered successfully");

      // Reset form after successful submission
      resetForm();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
        navigate("/patient/view");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Patients | Hospital" description="Patient Registration" />
      <PageBreadcrumb pageTitle="Patients" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
          Patient Registration
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🧾 Basic Info */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Basic Info
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInputChange}
              />

              <Input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleInputChange}
              />

              <Select
                options={genderOptions}
                placeholder="Select Gender *"
                value={formData.gender}
                onChange={(val) => handleSelectChange("gender", val)}
              />
            </div>
          </div>

          {/* 📅 Personal Details */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DatePicker
                id="date-picker"
                placeholder="Date of Birth"
                onChange={handleDateChange}
              />

              <Select
                options={maritalStatusOptions}
                placeholder="Marital Status"
                value={formData.maritalStatus}
                onChange={(val) => handleSelectChange("maritalStatus", val)}
              />

              <Select
                options={bloodGroupOptions}
                placeholder="Blood Group"
                value={formData.bloodGroup}
                onChange={(val) => handleSelectChange("bloodGroup", val)}
              />
            </div>
          </div>

          {/* 📞 Contact */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Contact
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                type="text"
                name="mobile"
                placeholder="Mobile Number *"
                value={formData.mobile}
                onChange={handleInputChange}
              />

              <Input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 🏥 Visit Info */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Visit Info
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                type="text"
                name="department"
                placeholder="Department *"
                value={formData.department}
                onChange={handleInputChange}
              />

              <Input
                type="text"
                name="doctor"
                placeholder="Doctor Name *"
                value={formData.doctor}
                onChange={handleInputChange}
              />

              <Select
                options={typeOptions}
                placeholder="OPD/IPD"
                value={formData.type}
                onChange={(val) => handleSelectChange("type", val)}
              />
            </div>
          </div>

          {/* 🔗 Referral */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Referral
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                type="text"
                name="referredBy"
                placeholder="Referred By (Doctor/Hospital/Other)"
                value={formData.referredBy}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 🚨 Emergency */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                type="text"
                name="emergencyName"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={handleInputChange}
              />

              <Input
                type="text"
                name="emergencyMobile"
                placeholder="Contact Number"
                value={formData.emergencyMobile}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 🧬 Medical */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Medical
            </h4>
            <textarea
              name="symptoms"
              placeholder="Symptoms / Problem"
              value={formData.symptoms}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* 💰 Payment */}
          <div>
            <h4 className="mb-3 font-medium text-gray-700 dark:text-white">
              Payment
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                type="number"
                name="fee"
                placeholder="Consultation Fee"
                value={formData.fee}
                onChange={handleInputChange}
              />

              <Select
                options={paymentModeOptions}
                placeholder="Payment Mode"
                value={formData.paymentMode}
                onChange={(val) => handleSelectChange("paymentMode", val)}
              />

              <Select
                options={paymentStatusOptions}
                placeholder="Payment Status"
                value={formData.paymentStatus}
                onChange={(val) => handleSelectChange("paymentStatus", val)}
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
              {loading ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}