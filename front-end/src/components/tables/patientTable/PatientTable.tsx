// components/patient/PatientTable.tsx
import { Patient } from "../../../types/patient";
import Pagination from "../../common/Pagination";


interface PatientTableProps {
  patients: Patient[];
  pagination: any;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onPageChange: (page: number) => void;
}

export default function PatientTable({
  patients,
  pagination,
  onView,
  onEdit,
  onDelete,
  onPageChange,
}: PatientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              UH ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Mobile
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Age
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sex
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Marital Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Infertility Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {patients.map((patient: Patient) => (
            <tr
              key={patient._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-blue-600">
                {patient.UH_ID || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm dark:text-white/90">
                <div className="flex items-center gap-2">
                  {patient.pic?.url ? (
                    <img
                      src={patient.pic.url}
                      alt={patient.pic.alt || patient.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {patient.name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    </div>
                  )}
                  {patient.name}
                </div>
              </td>
              <td className="px-4 py-3 text-sm dark:text-white/90">
                {patient.mobileNumber}
              </td>
              <td className="px-4 py-3 text-sm dark:text-white/90">
                {patient.age || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm dark:text-white/90 capitalize">
                {patient.sex || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm dark:text-white/90 capitalize">
                {patient.maritalStatus || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {patient.infertiliyType || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(patient)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="View Details"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(patient)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    title="Edit Patient"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(patient)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Delete Patient"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}