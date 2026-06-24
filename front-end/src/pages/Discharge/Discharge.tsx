// pages/Discharge.tsx
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';
//@ts-ignore
import { getDischargeData, createDischarge, downloadDischargePDF, updateDischarge } from '../../redux/actions/discharge.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
import Button from '../../components/ui/button/Button';
import DatePicker from '../../components/form/date-picker';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function Discharge() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    finalDiagnosis: "",
    treatmentSummary: "",
    dischargeAdvice: "",
    followUpDate: ""
  });
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [consultationId, setConsultationId] = useState<string>('');
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [dischargeId, setDischargeId] = useState<string | null>(null); // Store discharge ID for updates

  // FIX: Destructure form data for easier use
  const { finalDiagnosis, treatmentSummary, dischargeAdvice, followUpDate } = formData;

  // FIX: Update form data handler
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = useCallback(() => {
    setFormData({
      finalDiagnosis: "",
      treatmentSummary: "",
      dischargeAdvice: "",
      followUpDate: ""
    });
    setConsultationId('');
    setIsExistingConsultation(false);
    setIsEditing(false);
    setDischargeId(null);
  }, []);

  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);

      if (result?.type === "GET_CONSULTATION_BY_PATIENT_ID_SUCCESS" && result.payload) {
        const consultationData = result.payload;
        setConsultationId(consultationData._id);
        setIsExistingConsultation(true);
        await fetchDischargeData(patientId);
      } else {
        resetForm();
        setIsExistingConsultation(false);
        setConsultationId('');
      }
    } catch (error) {
      resetForm();
    } finally {
      setIsLoadingConsultation(false);
    }
  }, [dispatch, resetForm]);

  const fetchDischargeData = useCallback(async (patientId: string) => {
    try {
      const result = await dispatch(getDischargeData(patientId) as any);
      if (result?.payload) {
        const record = result.payload;
        setFormData({
          finalDiagnosis: record.finalDiagnosis || '',
          treatmentSummary: record.treatmentSummary || '',
          dischargeAdvice: record.dischargeAdvice || '',
          followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : ''
        });
        // Store discharge ID for update operations
        if (record._id) {
          setDischargeId(record._id);
          setIsEditing(true); // Set to edit mode since data exists
        }
      } else {
        setIsEditing(false);
        setDischargeId(null);
      }
    } catch (error) {
      console.log('Error fetching discharge data:', error);
      setIsEditing(false);
      setDischargeId(null);
    }
  }, [dispatch]);

  useEffect(() => {
    const getPatientFromSession = () => {
      const patientId = sessionStorage.getItem('selectedPatientId');
      const patientUHID = sessionStorage.getItem('selectedPatientUHID');
      const patientData = sessionStorage.getItem('selectedPatient');

      if (patientId && patientUHID && patientData) {
        try {
          const patient = JSON.parse(patientData);
          if (!selectedPatient || selectedPatient._id !== patient._id) {
            setSelectedPatient(patient);
            fetchConsultationForPatient(patient._id);
          }
        } catch (error) {
          setSelectedPatient(null);
          resetForm();
        }
      } else {
        setSelectedPatient(null);
        resetForm();
      }
    };

    getPatientFromSession();
    const interval = setInterval(getPatientFromSession, 1000);
    window.addEventListener('storage', getPatientFromSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', getPatientFromSession);
    };
  }, [selectedPatient, fetchConsultationForPatient, resetForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !consultationId) {
      alert('Please select a patient and ensure consultation exists');
      return;
    }

    if (!finalDiagnosis.trim()) {
      alert('Please enter final diagnosis');
      return;
    }
    if (!treatmentSummary.trim()) {
      alert('Please enter treatment summary');
      return;
    }
    if (!dischargeAdvice.trim()) {
      alert('Please enter discharge advice');
      return;
    }

    setIsSaving(true);
    try {
      let result;

      if (isEditing && dischargeId) {
        // UPDATE: Existing discharge record
        result = await dispatch(updateDischarge(dischargeId, {
          patientId: selectedPatient._id,
          consultationId: consultationId,
          finalDiagnosis,
          treatmentSummary,
          dischargeAdvice,
          followUpDate: followUpDate || null
        }) as any);
      } else {
        // CREATE: New discharge record
        result = await dispatch(createDischarge({
          patientId: selectedPatient._id,
          consultationId: consultationId,
          finalDiagnosis,
          treatmentSummary,
          dischargeAdvice,
          followUpDate: followUpDate || null
        }) as any);
      }

      if (result?.status === 200 || result?.status === 201) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Refresh discharge data after saving
        await fetchDischargeData(selectedPatient._id);

        // If new record was created, set editing mode
        if (!isEditing && result?.payload?._id) {
          setDischargeId(result.payload._id);
          setIsEditing(true);
        }
      } else {
        setError(result?.message || 'Failed to save discharge summary');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error: any) {
      console.error('Error saving discharge:', error);
      setError(error?.message || 'Failed to save discharge summary. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!selectedPatient || !consultationId) {
      alert('No discharge data available to download');
      return;
    }

    try {
      await dispatch(downloadDischargePDF(selectedPatient._id) as any);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageMeta title="Discharge Summary" description="Create discharge summary for patient" />
      <PageBreadcrumb pageTitle="Discharge Summary" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-white dark:bg-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>

            <Button
              variant="primary"
              disabled={!isEditing}
              onClick={handleDownloadPDF}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </Button>
          </div>
        </div>

        {/* Messages */}
        {showSuccessMessage && (
          <div className='mb-6 no-print'>
            <Alert
              variant="success"
              title="Success"
              message={`Discharge summary ${isEditing ? 'updated' : 'saved'} successfully!`}
              showLink={false}
            />
          </div>
        )}

        {error && (
          <div className='mb-6 no-print'>
            <Alert
              variant="error"
              title="Error"
              message={error}
              showLink={false}
            />
          </div>
        )}

        {/* Patient Info */}
        <div className="no-print">
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />
        </div>

        {selectedPatient && !isLoadingConsultation && isExistingConsultation && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="no-print">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Discharge Summary Form
                  </h2>
                  {isEditing && (
                    <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                      Editing Existing Record
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Final Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="finalDiagnosis"
                      placeholder="Type your diagnosis..."
                      value={formData.finalDiagnosis}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Treatment Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="treatmentSummary"
                      placeholder="Type your treatment summary..."
                      value={formData.treatmentSummary}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discharge Advice <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="dischargeAdvice"
                      placeholder="Type your advice"
                      value={formData.dischargeAdvice}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discharge Date
                    </label>
                    <DatePicker
                      id="date-picker"
                      placeholder="Select a date"
                      value={followUpDate}
                      onChange={(dates, currentDateString) => {
                        handleFormChange('followUpDate', currentDateString)
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"

                  >
                    {isEditing ? 'Update Discharge Summary' : 'Save Discharge Summary'}

                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}