// components/patient/PatientTable.tsx
import { EditIcon,  TrashBinIcon, ViewIcon } from "../../../icons";
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
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => onView(patient)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group relative"
                    title="View Details"
                  >
                    <ViewIcon />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      View
                    </span>
                  </button>
                  <button
                    onClick={() => onEdit(patient)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group relative"
                    title="Edit Patient"
                  >
                    <EditIcon />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(patient)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative"
                    title="Delete Patient"
                  >
                    <TrashBinIcon />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Delete
                    </span>
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