// pages/PrescriptionView.tsx
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { getPrescriptions, deletePrescription, updatePrescription, getPrescriptionById } from "../../services/prescriptionService";
import { getPatients } from "../../services/patientService";

interface Medication {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  prescriptionId: string;
  patientId: {
    _id: string;
    name: string;
    patientId: string;
  };
  doctorId: {
    _id: string;
    name: string;
    patientId: string;
  };
  diagnosis: string;
  symptoms: string;
  medications: Medication[];
  specialInstructions: string;
  status: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  name: string;
  patientId: string;
}

const frequencyOptions = [
  { value: "Once Daily", label: "Once Daily" },
  { value: "Twice Daily", label: "Twice Daily" },
  { value: "Thrice Daily", label: "Thrice Daily" },
  { value: "Four Times Daily", label: "Four Times Daily" },
  { value: "Every 4 Hours", label: "Every 4 Hours" },
  { value: "Every 6 Hours", label: "Every 6 Hours" },
  { value: "Every 8 Hours", label: "Every 8 Hours" },
  { value: "Every 12 Hours", label: "Every 12 Hours" },
  { value: "Once Weekly", label: "Once Weekly" },
  { value: "As Needed", label: "As Needed" },
];

const routeOptions = [
  { value: "Oral", label: "Oral" },
  { value: "Intravenous (IV)", label: "Intravenous (IV)" },
  { value: "Intramuscular (IM)", label: "Intramuscular (IM)" },
  { value: "Subcutaneous (SC)", label: "Subcutaneous (SC)" },
  { value: "Topical", label: "Topical" },
  { value: "Sublingual", label: "Sublingual" },
  { value: "Rectal", label: "Rectal" },
  { value: "Inhalation", label: "Inhalation" },
  { value: "Ophthalmic", label: "Ophthalmic" },
  { value: "Otic", label: "Otic" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function PrescriptionView() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // View Modal
  const [viewModal, setViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editFormData, setEditFormData] = useState({
    patientId: "",
    doctorId: "",
    diagnosis: "",
    symptoms: "",
    medications: [] as Medication[],
    specialInstructions: "",
    followUpDate: "",
    status: "active",
    notes: "",
  });

  const limit = 10;

  const fetchPrescriptions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getPrescriptions(page, limit);
      setPrescriptions(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalRecords(response.pagination.totalRecords);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await getPatients(1, 100);
      setPatients(response.data);
    } catch (err) {
      console.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchPrescriptions(1);
    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await deletePrescription(id);
      setSuccess("Prescription deleted successfully");
      fetchPrescriptions(currentPage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prescription");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleView = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewModal(true);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setEditFormData({
      patientId: prescription.patientId?._id || "",
      doctorId: prescription.doctorId?._id || "",
      diagnosis: prescription.diagnosis || "",
      symptoms: prescription.symptoms || "",
      medications: prescription.medications || [],
      specialInstructions: prescription.specialInstructions || "",
      followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString().split('T')[0] : "",
      status: prescription.status || "active",
      notes: prescription.notes || "",
    });
    setEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...editFormData.medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setEditFormData({ ...editFormData, medications: updatedMedications });
  };

  const addMedication = () => {
    setEditFormData({
      ...editFormData,
      medications: [
        ...editFormData.medications,
        { drugName: "", dosage: "", frequency: "", duration: "", route: "", instructions: "" },
      ],
    });
  };

  const removeMedication = (index: number) => {
    if (editFormData.medications.length > 1) {
      setEditFormData({
        ...editFormData,
        medications: editFormData.medications.filter((_, i) => i !== index),
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    setEditLoading(true);
    try {
      await updatePrescription(selectedPrescription._id, editFormData);
      setSuccess("Prescription updated successfully");
      setEditModal(false);
      fetchPrescriptions(currentPage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update prescription");
      setTimeout(() => setError(""), 3000);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPrescriptions(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const patientOptions = patients.map((p) => ({
    value: p._id,
    label: `${p.name} - ${p.patientId}`,
  }));

  const doctorOptions = patients.map((p) => ({
    value: p._id,
    label: `${p.name} - ${p.patientId}`,
  }));

  return (
    <>
      <PageMeta title="Prescription View | Hospital" description="Prescriptions Listing" />
      <PageBreadcrumb pageTitle="Prescription Listing" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Prescriptions ({totalRecords})
          </h3>
          <a href="/prescription/add" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Create Prescription
          </a>
        </div>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">{success}</div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium">{prescription.prescriptionId}</td>
                    <td className="px-4 py-3 text-sm">
                      {prescription.patientId?.name || "N/A"}
                      <br />
                      <span className="text-xs text-gray-500">{prescription.patientId?.patientId}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{prescription.doctorId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm"><span className="line-clamp-1">{prescription.diagnosis}</span></td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {prescription.medications?.slice(0, 2).map((med, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {med.drugName} {med.dosage}
                          </span>
                        ))}
                        {prescription.medications?.length > 2 && (
                          <span className="text-xs text-gray-500">+{prescription.medications.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(prescription)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">View</button>
                        <button onClick={() => handleEdit(prescription)} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                        <button onClick={() => handleDelete(prescription._id)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {prescriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">No prescriptions found</div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Showing page {currentPage} of {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Previous</button>
                {[...Array(totalPages)].map((_, index) => (
                  <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 text-sm border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : ""}`}>{index + 1}</button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Prescription Details</h3>
              <button onClick={() => setViewModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div><label className="text-xs text-gray-500">Prescription ID</label><p className="font-medium">{selectedPrescription.prescriptionId}</p></div>
                <div><label className="text-xs text-gray-500">Status</label><p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPrescription.status)}`}>{selectedPrescription.status}</span></p></div>
                <div><label className="text-xs text-gray-500">Date</label><p className="font-medium">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border dark:border-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-blue-600">Patient Details</h4>
                  <p><span className="text-xs text-gray-500">Name:</span> <span className="font-medium">{selectedPrescription.patientId?.name}</span></p>
                  <p><span className="text-xs text-gray-500">ID:</span> <span className="font-medium">{selectedPrescription.patientId?.patientId}</span></p>
                </div>
                <div className="border dark:border-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-green-600">Doctor Details</h4>
                  <p><span className="text-xs text-gray-500">Name:</span> <span className="font-medium">{selectedPrescription.doctorId?.name}</span></p>
                  <p><span className="text-xs text-gray-500">ID:</span> <span className="font-medium">{selectedPrescription.doctorId?.patientId}</span></p>
                </div>
              </div>
              <div className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Diagnosis</h4>
                <p className="font-medium">{selectedPrescription.diagnosis}</p>
              </div>
              <div className="border dark:border-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Medications ({selectedPrescription.medications?.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-2 text-left">Drug</th><th className="p-2 text-left">Dosage</th><th className="p-2 text-left">Frequency</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Route</th><th className="p-2 text-left">Instructions</th></tr></thead>
                    <tbody>{selectedPrescription.medications?.map((med, idx) => (<tr key={idx} className="border-t dark:border-gray-700"><td className="p-2 font-medium">{med.drugName}</td><td className="p-2">{med.dosage}</td><td className="p-2">{med.frequency}</td><td className="p-2">{med.duration}</td><td className="p-2">{med.route}</td><td className="p-2">{med.instructions || "-"}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
              {selectedPrescription.followUpDate && (
                <div className="border dark:border-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Follow-up Date</h4>
                  <p>{new Date(selectedPrescription.followUpDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Prescription</h3>
              <button onClick={() => setEditModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select options={patientOptions} placeholder="Select Patient" value={editFormData.patientId} onChange={(val) => setEditFormData({ ...editFormData, patientId: val })} />
                <Select options={doctorOptions} placeholder="Select Doctor" value={editFormData.doctorId} onChange={(val) => setEditFormData({ ...editFormData, doctorId: val })} />
                <Input type="text" name="diagnosis" placeholder="Diagnosis *" value={editFormData.diagnosis} onChange={handleEditInputChange} />
                <Select options={statusOptions} placeholder="Status" value={editFormData.status} onChange={(val) => setEditFormData({ ...editFormData, status: val })} />
              </div>
              <textarea name="symptoms" placeholder="Symptoms" value={editFormData.symptoms} onChange={handleEditInputChange} rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />

              {/* Medications */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">Medications</h4>
                  <button type="button" onClick={addMedication} className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">+ Add</button>
                </div>
                {editFormData.medications.map((med, index) => (
                  <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium">Medication #{index + 1}</span>
                      {editFormData.medications.length > 1 && (
                        <button type="button" onClick={() => removeMedication(index)} className="text-red-500 text-xs">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input type="text" placeholder="Drug Name" value={med.drugName} onChange={(e) => handleEditMedicationChange(index, "drugName", e.target.value)} />
                      <Input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => handleEditMedicationChange(index, "dosage", e.target.value)} />
                      <Select options={frequencyOptions} placeholder="Frequency" value={med.frequency} onChange={(val) => handleEditMedicationChange(index, "frequency", val)} />
                      <Input type="text" placeholder="Duration" value={med.duration} onChange={(e) => handleEditMedicationChange(index, "duration", e.target.value)} />
                      <Select options={routeOptions} placeholder="Route" value={med.route} onChange={(val) => handleEditMedicationChange(index, "route", val)} />
                      <Input type="text" placeholder="Instructions" value={med.instructions} onChange={(e) => handleEditMedicationChange(index, "instructions", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" name="followUpDate" placeholder="Follow-up Date" value={editFormData.followUpDate} onChange={handleEditInputChange} />
                <Input type="text" name="notes" placeholder="Notes" value={editFormData.notes} onChange={handleEditInputChange} />
              </div>
              <textarea name="specialInstructions" placeholder="Special Instructions" value={editFormData.specialInstructions} onChange={handleEditInputChange} rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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