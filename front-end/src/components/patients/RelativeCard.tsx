// components/patient/RelativeCard.tsx
import PatientImage from "./PatientImage";
import { useState } from "react";

interface RelativeCardProps {
  relative: {
    _id?: string;
    name: string;
    age?: number;
    sex?: string;
    mobileNumber?: string;
    maritalStatus?: string;
    idProofType?: string;
    idProofNumber?: string;
    email?: string;
    address?: string;
    role?: string;
    pic?: {
      url: string;
      public_id: string;
      alt: string;
    };
  };
}

export default function RelativeCard({ relative }: RelativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <PatientImage
            src={relative.pic?.url}
            alt={relative.pic?.alt || relative.name}
            name={relative.name}
            size="sm"
          />
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white">
              {relative.name}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {relative.role || "Relative"}
              </span>
              {relative.mobileNumber && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {relative.mobileNumber}
                </span>
              )}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <InfoItemMini label="Age" value={relative.age?.toString()} />
            <InfoItemMini label="Sex" value={relative.sex} capitalize />
            <InfoItemMini label="Mobile" value={relative.mobileNumber} />
            <InfoItemMini label="Marital Status" value={relative.maritalStatus} capitalize />
            <InfoItemMini label="ID Proof Type" value={relative.idProofType} capitalize />
            <InfoItemMini label="ID Proof Number" value={relative.idProofNumber} />
            {relative.email && <InfoItemMini label="Email" value={relative.email} />}
            {relative.address && (
              <div className="md:col-span-full">
                <InfoItemMini label="Address" value={relative.address} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const InfoItemMini = ({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) => (
  <div>
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
      {label}
    </label>
    <p
      className={`text-sm text-gray-800 dark:text-white ${
        capitalize ? "capitalize" : ""
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);