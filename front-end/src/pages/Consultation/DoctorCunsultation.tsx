import PageMeta from "../../components/common/PageMeta";
import { useState, FormEvent } from "react";
import { PlusIcon, Save, TrashBinIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
//@ts-ignore
import { createConsultation } from "../../redux/actions/consultation.actions";

// Types
interface AdditionalFee {
  name: string;
  amount: number;
}

interface ConsultationFees {
  freeOfCost: number;
  emergencyConsultationFee: number | string;
  geneticConsultationFee: number | string;
  opdConsultationFee: number | string;
  additionalFees: AdditionalFee[];
}

interface FormData {
  patientId: string;
  fees: ConsultationFees;
  totalAmount: number;
}

interface NewFee {
  name: string;
  amount: number | string;
}

export default function DoctorConsultation() {
  const dispatch = useDispatch();
  const { creating, error } = useSelector((state: any) => state.consultation);

  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    fees: {
      freeOfCost: 0,
      emergencyConsultationFee: "",
      geneticConsultationFee: "",
      opdConsultationFee: "",
      additionalFees: []
    },
    totalAmount: 0
  });

  const [newFee, setNewFee] = useState<NewFee>({ name: "", amount: "" });
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle input change for main fees
  const handleFeeChange = (field: keyof ConsultationFees, value: string) => {
    setFormData({
      ...formData,
      fees: {
        ...formData.fees,
        [field]: value
      }
    });
  };

  // Add new additional fee
  const handleAddFee = (): void => {
    if (newFee.name && newFee.amount) {
      setFormData({
        ...formData,
        fees: {
          ...formData.fees,
          additionalFees: [
            ...formData.fees.additionalFees,
            { name: newFee.name, amount: Number(newFee.amount) }
          ]
        }
      });
      setNewFee({ name: "", amount: "" });
    }
  };

  // Remove additional fee
  const handleRemoveFee = (index: number): void => {
    const updatedFees = formData.fees.additionalFees.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fees: {
        ...formData.fees,
        additionalFees: updatedFees
      }
    });
  };

  // Calculate total
  const calculateTotal = (): number => {
    let total = 0;
    total += formData.fees.freeOfCost || 0;
    total += Number(formData.fees.emergencyConsultationFee) || 0;
    total += Number(formData.fees.geneticConsultationFee) || 0;
    total += Number(formData.fees.opdConsultationFee) || 0;

    formData.fees.additionalFees.forEach((fee: AdditionalFee) => {
      total += fee.amount || 0;
    });
    return total;
  };

  // Reset form after successful submission
  const resetForm = (): void => {
    setFormData({
      patientId: "",
      fees: {
        freeOfCost: 0,
        emergencyConsultationFee: "",
        geneticConsultationFee: "",
        opdConsultationFee: "",
        additionalFees: []
      },
      totalAmount: 0
    });
    setNewFee({ name: "", amount: "" });
    setSuccessMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.patientId) {
      alert("Please select a patient");
      return;
    }

    // Prepare data for API
    const consultationData = {
      patientId: formData.patientId,
      fees: {
        freeOfCost: formData.fees.freeOfCost,
        emergencyConsultationFee: Number(formData.fees.emergencyConsultationFee) || 0,
        geneticConsultationFee: Number(formData.fees.geneticConsultationFee) || 0,
        opdConsultationFee: Number(formData.fees.opdConsultationFee) || 0,
        additionalFees: formData.fees.additionalFees
      },
      totalAmount: calculateTotal()
    };

    const result = await dispatch(createConsultation(consultationData) as any);

    if (result?.status === 201 || result?.status === 200) {
      setSuccessMessage("Consultation created successfully!");
      resetForm();
    }
  };

  return (
    <>
      <PageMeta title="Consultation" description="Doctor Consultation" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Consultation</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage consultation fees and charges</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Patient Selection Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Patient <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  >
                    <option value="">Choose a patient</option>
                    <option value="patient1">John Doe</option>
                    <option value="patient2">Jane Smith</option>
                    <option value="patient3">Robert Johnson</option>
                  </select>
                </div>
              </div>

              {/* Consultation Fees Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Consultation Fees</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free of Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Free of Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        value={formData.fees.freeOfCost}
                        readOnly
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Always Free (₹0)</p>
                  </div>

                  {/* Emergency Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency Consultation Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.fees.emergencyConsultationFee}
                        onChange={(e) => handleFeeChange("emergencyConsultationFee", e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Genetic Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Genetic Consultation Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.fees.geneticConsultationFee}
                        onChange={(e) => handleFeeChange("geneticConsultationFee", e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* OPD Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      OPD Consultation Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.fees.opdConsultationFee}
                        onChange={(e) => handleFeeChange("opdConsultationFee", e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Fees Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Fees</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.fees.additionalFees.length} fees added
                  </span>
                </div>

                {/* Add New Fee Section */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4 transition-colors duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fee Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Doctor Fee, Lab Charges"
                        value={newFee.name}
                        onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (₹)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={newFee.amount}
                          onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddFee}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center gap-2"
                        >
                          <PlusIcon />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Fees List */}
                {formData.fees.additionalFees.length > 0 ? (
                  <div className="space-y-3">
                    {formData.fees.additionalFees.map((fee: AdditionalFee, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-sm transition-all"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{fee.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">₹{fee.amount.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFee(index)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No additional fees added yet</p>
                    <p className="text-sm mt-1">Click the add button to include extra charges</p>
                  </div>
                )}
              </div>

              {/* Total Amount Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-indigo-800 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Total Amount</h3>
                    <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">Including all fees and charges</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">₹{calculateTotal().toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save />
                  {creating ? "Saving..." : "Save Consultation"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}