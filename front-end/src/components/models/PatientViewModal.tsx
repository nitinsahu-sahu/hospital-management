// components/patient/PatientViewModal.tsx
import { Patient } from "../../types/patient";
import PatientImage from "../patients/PatientImage";
import PatientInfoSection from "../patients/PatientInfoSection";
import RelativeCard from "../patients/RelativeCard";

interface PatientViewModalProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientViewModal({ patient, onClose }: PatientViewModalProps) {
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <PatientImage
              src={patient.pic?.url}
              alt={patient.pic?.alt || patient.name}
              name={patient.name}
              size="lg"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                UH ID: {patient.UH_ID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <PatientInfoSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="Full Name" value={patient.name} />
              <InfoItem label="Age" value={patient.age?.toString()} />
              <InfoItem label="Sex" value={patient.sex} capitalize />
              <InfoItem label="Marital Status" value={patient.maritalStatus} capitalize />
              <InfoItem
                label="Duration of Marriage"
                value={patient.durationOfMarriage ? `${patient.durationOfMarriage} years` : "N/A"}
              />
              <InfoItem label="Infertility Type" value={patient.infertiliyType} capitalize />
            </div>
          </PatientInfoSection>

          {/* Contact Information */}
          <PatientInfoSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Mobile Number" value={patient.mobileNumber} />
              <InfoItem label="Email" value={patient.email || "N/A"} />
              <InfoItem label="Address" value={patient.address} fullWidth />
            </div>
          </PatientInfoSection>

          {/* ID Proof Details */}
          <PatientInfoSection title="ID Proof Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="ID Proof Type" value={patient.idProofType} capitalize />
              <InfoItem label="ID Proof Number" value={patient.idProofNumber} />
            </div>
          </PatientInfoSection>

          {/* Referral Information */}
          <PatientInfoSection title="Referral Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="How Found Clinic" value={patient.howToFindClinic} capitalize />
              <InfoItem label="Referred By Doctor" value={patient.referredByDoctorName || "N/A"} />
            </div>
          </PatientInfoSection>

          {/* Relatives Information */}
          <PatientInfoSection title="Relatives">
            {patient.relative ? (
              <div className="space-y-4">
                  <RelativeCard relativedata={patient?.relative} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p>No relatives found for this patient</p>
              </div>
            )}
          </PatientInfoSection>

          {/* Additional Information */}
          <PatientInfoSection title="Additional Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Status"
                value={patient.isActive ? "Active" : "Inactive"}
                badge={patient.isActive ? "success" : "error"}
              />
              <InfoItem
                label="Created At"
                value={
                  patient.createdAt
                    ? new Date(patient.createdAt).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"
                }
              />
            </div>
          </PatientInfoSection>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Info Item Component
const InfoItem = ({
  label,
  value,
  capitalize = false,
  fullWidth = false,
  badge = null,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
  fullWidth?: boolean;
  badge?: "success" | "error" | null;
}) => (
  <div className={fullWidth ? "md:col-span-full" : ""}>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </label>
    {badge ? (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          badge === "success"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {value || "N/A"}
      </span>
    ) : (
      <p
        className={`text-sm font-medium text-gray-800 dark:text-white ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "N/A"}
      </p>
    )}
  </div>
);