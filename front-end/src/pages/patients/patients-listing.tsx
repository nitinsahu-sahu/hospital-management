// pages/PatientView.tsx
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getPatients, deletePatient, updatePatient } from "../../services/patientService";
import { Patient, PatientFormData } from "../../types/patient";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

export default function PatientView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState<PatientFormData>({
    name: "", email: "", gender: "", dateOfBirth: "", maritalStatus: "",
    bloodGroup: "", mobile: "", city: "", department: "", doctor: "",
    type: "OPD", referredBy: "", emergencyName: "", emergencyMobile: "",
    symptoms: "", fee: "", paymentMode: "Cash", paymentStatus: "Paid"
  });
  const [editLoading, setEditLoading] = useState(false);

  const limit = 10;

  const fetchPatients = async (page: number) => {
    setLoading(true);
    try {
      const response = await getPatients(page, limit);
      setPatients(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalRecords(response.pagination.totalRecords);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatient(id);
      setSuccess("Patient deleted successfully");
      fetchPatients(currentPage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewModal(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name,
      email: patient.email,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      maritalStatus: patient.maritalStatus,
      bloodGroup: patient.bloodGroup,
      mobile: patient.mobile,
      city: patient.city,
      department: patient.department,
      doctor: patient.doctor,
      type: patient.type,
      referredBy: patient.referredBy,
      emergencyName: patient.emergencyName,
      emergencyMobile: patient.emergencyMobile,
      symptoms: patient.symptoms,
      fee: patient.fee,
      paymentMode: patient.paymentMode,
      paymentStatus: patient.paymentStatus,
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setEditLoading(true);
    try {
      const submitData = {
        ...editFormData,
        fee: editFormData.fee ? Number(editFormData.fee) : 0,
      };
      await updatePatient(selectedPatient._id, submitData);
      setSuccess("Patient updated successfully");
      setEditModal(false);
      fetchPatients(currentPage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update patient");
      setTimeout(() => setError(""), 3000);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPatients(page);
  };

  const typeOptions = [
    { value: "OPD", label: "OPD" },
    { value: "IPD", label: "IPD" },
  ];

  const paymentModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "Card", label: "Card" },
  ];

  const paymentStatusOptions = [
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
  ];

  return (
    <>
      <PageMeta title="Patients View | Hospital" description="Patients Listing" />
      <PageBreadcrumb pageTitle="View Patients" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
       
 <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
           All Patients ({totalRecords})
          </h3>
          <a href="/patient/add" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Create Patient
          </a>
        </div>
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

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm">{patient.patientId}</td>
                    <td className="px-4 py-3 text-sm">{patient.name}</td>
                    <td className="px-4 py-3 text-sm">{patient.mobile}</td>
                    <td className="px-4 py-3 text-sm">{patient.department}</td>
                    <td className="px-4 py-3 text-sm">{patient.doctor}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.type === "IPD" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {patient.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {patient.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(patient)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                          View
                        </button>
                        <button onClick={() => handleEdit(patient)} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(patient._id)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 text-sm border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : ""}`}>
                    {index + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Patient Details</h3>
              <button onClick={() => setViewModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500">Patient ID</label><p className="font-medium">{selectedPatient.patientId}</p></div>
              <div><label className="text-xs text-gray-500">Name</label><p className="font-medium">{selectedPatient.name}</p></div>
              <div><label className="text-xs text-gray-500">Email</label><p className="font-medium">{selectedPatient.email}</p></div>
              <div><label className="text-xs text-gray-500">Gender</label><p className="font-medium">{selectedPatient.gender}</p></div>
              <div><label className="text-xs text-gray-500">Blood Group</label><p className="font-medium">{selectedPatient.bloodGroup}</p></div>
              <div><label className="text-xs text-gray-500">Marital Status</label><p className="font-medium">{selectedPatient.maritalStatus}</p></div>
              <div><label className="text-xs text-gray-500">Mobile</label><p className="font-medium">{selectedPatient.mobile}</p></div>
              <div><label className="text-xs text-gray-500">City</label><p className="font-medium">{selectedPatient.city}</p></div>
              <div><label className="text-xs text-gray-500">Department</label><p className="font-medium">{selectedPatient.department}</p></div>
              <div><label className="text-xs text-gray-500">Doctor</label><p className="font-medium">{selectedPatient.doctor}</p></div>
              <div><label className="text-xs text-gray-500">Type</label><p className="font-medium">{selectedPatient.type}</p></div>
              <div><label className="text-xs text-gray-500">Payment Status</label><p className="font-medium">{selectedPatient.paymentStatus}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Patient</h3>
              <button onClick={() => setEditModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" name="name" placeholder="Name" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                <Input type="email" name="email" placeholder="Email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} />
                <Input type="text" name="mobile" placeholder="Mobile" value={editFormData.mobile} onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})} />
                <Input type="text" name="city" placeholder="City" value={editFormData.city} onChange={(e) => setEditFormData({...editFormData, city: e.target.value})} />
                <Input type="text" name="department" placeholder="Department" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                <Input type="text" name="doctor" placeholder="Doctor" value={editFormData.doctor} onChange={(e) => setEditFormData({...editFormData, doctor: e.target.value})} />
                <Select options={typeOptions} placeholder="Type" value={editFormData.type} onChange={(val) => setEditFormData({...editFormData, type: val as "OPD" | "IPD"})} />
                <Select options={paymentModeOptions} placeholder="Payment Mode" value={editFormData.paymentMode} onChange={(val) => setEditFormData({...editFormData, paymentMode: val as "Cash" | "UPI" | "Card"})} />
                <Select options={paymentStatusOptions} placeholder="Payment Status" value={editFormData.paymentStatus} onChange={(val) => setEditFormData({...editFormData, paymentStatus: val as "Paid" | "Pending"})} />
                <Input type="number" name="fee" placeholder="Fee" value={editFormData.fee} onChange={(e) => setEditFormData({...editFormData, fee: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}