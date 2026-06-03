// pages/PatientView.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Patient } from "../../types/patient";
// @ts-ignore
import { patientsFetch,updatePatient,deletePatient } from "../../redux/actions/patient.actions";
import { RootState } from "../../redux/store/store";
import PatientTable from "../../components/tables/patientTable/PatientTable";
import PatientViewModal from "../../components/models/PatientViewModal";
import PatientEditModal from "../../components/models/PatientEditModal";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

export default function PatientView() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dispatch = useDispatch<any>();
  
  // View Modal state
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Edit Modal state
  const [editModal, setEditModal] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
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
  }, []);

  const handlePageChange = (page: number): void => {
    fetchPatients(page);
  };

  // Handle View Patient
  const handleView = (patient: Patient): void => {
    setSelectedPatient(patient);
    setViewModal(true);
  };

  // Handle Edit Patient
  const handleEdit = (patient: Patient): void => {
    setEditingPatient(patient);
    setEditModal(true);
  };

  // Handle Edit Submit - NOW WITH API CALL
  const handleEditSubmit = async (patientData: Partial<Patient>): Promise<void> => {
    
    try {
      // Dispatch the update action
      const result = await dispatch(updatePatient(editingPatient?._id, patientData));
      
      if (result?.type === "UPDATE_PATIENT_SUCCESS") {
        // Success - refresh the list
        console.log("Patient updated successfully:", result.message);
        // Optional: Show success toast/notification
      }
    } catch (error) {
      console.error("Failed to update patient:", error);
      // Optional: Show error toast/notification
    }
    
    // Close the modal
    setEditModal(false);
    setEditingPatient(null);
  };

   // Handle Delete Patient - NOW WITH API CALL
  const handleDelete = async (patient: Patient): Promise<void> => {
    // Confirm before deleting
    const confirmDelete = window.confirm(
      `Are you sure you want to delete patient "${patient.name}" (UH ID: ${patient.UH_ID})?`
    );
    
    if (!confirmDelete) return;
    
    try {
      const result = await dispatch(deletePatient(patient._id));
      
      if (result?.type === "DELETE_PATIENT_SUCCESS") {
        console.log("Patient deleted successfully:", result.message);
        // Optional: Show success toast/notification
      }
    } catch (error) {
      console.error("Failed to delete patient:", error);
      // Optional: Show error toast/notification
    }
  };


  // Close View Modal
  const closeViewModal = (): void => {
    setViewModal(false);
    setSelectedPatient(null);
  };

  // Close Edit Modal
  const closeEditModal = (): void => {
    setEditModal(false);
    setEditingPatient(null);
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
        {loading && <LoadingState message="Loading patients..." />}

        {/* Error State */}
        {!loading && error && (
          <ErrorState 
            message={error} 
            onRetry={() => fetchPatients(1)} 
          />
        )}

        {/* Empty State */}
        {!loading && !error && (!patients || patients.length === 0) && (
          <EmptyState 
            title="No Patients Found"
            message="Get started by adding your first patient. Click the button below to create a new patient record."
            actionLink="/patient/add"
            actionText="Add Your First Patient"
          />
        )}

        {/* Data Table */}
        {!loading && !error && patients && patients.length > 0 && (
          <PatientTable
            patients={patients}
            pagination={pagination}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* View Patient Modal */}
      {viewModal && selectedPatient && (
        <PatientViewModal
          patient={selectedPatient}
          onClose={closeViewModal}
        />
      )}

      {/* Edit Patient Modal */}
      {editModal && editingPatient && (
        <PatientEditModal
          patient={editingPatient}
          onClose={closeEditModal}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}