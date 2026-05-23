// pages/PatientView.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Patient } from "../../types/patient";
import { patientsFetch } from "../../redux/actions/patient.actions";
import { RootState } from "../../redux/store/store";

export default function PatientView() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dispatch = useDispatch<any>();
  
  // Get data directly from Redux store
  const { pagination, patients } = useSelector(
    (state: RootState) => state.patients
  );

  const limit: number = 10;

  const fetchPatients = async (page: number): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      await dispatch(patientsFetch(page, limit));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number): void => {
    fetchPatients(page);
  };

  return (
    <>
      <PageMeta title="Patients View | Hospital" description="Patients Listing" />
      <PageBreadcrumb pageTitle="View Patients" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Patients {pagination?.totalRecords > 0 && `(${pagination.totalRecords})`}
          </h3>
          <Link
            to="/patient/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Create Patient
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading patients...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
              Failed to Load Patients
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchPatients(1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : !patients || patients.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            </div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
              No Patients Found
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
              Get started by adding your first patient. Click the button below to
              create a new patient record.
            </p>
            <Link
              to="/patient/add"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Your First Patient
            </Link>
          </div>
        ) : (
          /* Data Table */
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {patient.UH_ID || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">{patient.name}</td>
                    <td className="px-4 py-3 text-sm">{patient.mobileNumber}</td>
                    <td className="px-4 py-3 text-sm">{patient.age || "N/A"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{patient.sex || "N/A"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{patient.maritalStatus || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {patient.infertiliyType || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          // onClick={() => handleView(patient)}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          View
                        </button>
                        <button
                          // onClick={() => handleEdit(patient)}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          // onClick={() => handleDelete(patient._id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
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
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, index: number) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 text-sm border rounded dark:border-gray-700 ${
                        pagination.currentPage === index + 1
                          ? "bg-blue-500 text-white border-blue-500"
                          : "hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}