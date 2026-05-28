import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { createPatientHistory, getPatientHistoryByPatientId, updatePatientHistory } from '../../redux/actions/patientHistory.action';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';

import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import Alert from '../../components/ui/alert/Alert';
import { complaintOptions, amenorrhoeaOptions, chiefComplaintsOptions } from '../../utils/patientHistory';
import { PatientHistoryForm } from '../../types/patientHistory';



export default function PatientHistory() {
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.consultation);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isExistingPatientHistory, setIsExistingPatientHistory] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultationId, setConsultationId] = useState("");
  const [patientHistoryId, setPatientHistoryId] = useState("");

  // Add a ref to track current patient ID
  const currentPatientIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<PatientHistoryForm>({
    chiefComplaints: '',
    amenorrhoea: '',
    complaint: '',
    onset: '',
    duration: '',
    associatedSymptoms: '',
    cycleLength: '',
    daysOfFlow: '',
    menstrualSymptoms: '',
    gravida: '',
    para: '',
    living: '',
    abortion: '',
    ectopic: '',
    diabetes: '',
    hypertension: '',
    asthma: '',
    thyroid: '',
    drugAllergy: '',
    drugAllergyDetails: '',
    geneticDiseaseSelf: '',
    geneticDiseaseFamily: '',
    downSyndrome: '',
    smoking: '',
    drugAddiction: '',
    husbandClinicalHistory: '',
  });

  // Helper function to format date for input fields
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Reset form to initial state
  const resetFormData = useCallback(() => {
    setFormData({
      chiefComplaints: '',
      amenorrhoea: '',
      complaint: '',
      onset: '',
      duration: '',
      associatedSymptoms: '',
      cycleLength: '',
      daysOfFlow: '',
      menstrualSymptoms: '',
      gravida: '',
      para: '',
      living: '',
      abortion: '',
      ectopic: '',
      diabetes: '',
      hypertension: '',
      asthma: '',
      thyroid: '',
      drugAllergy: '',
      drugAllergyDetails: '',
      geneticDiseaseSelf: '',
      geneticDiseaseFamily: '',
      downSyndrome: '',
      smoking: '',
      drugAddiction: '',
      husbandClinicalHistory: '',
    });
  }, []);

  const fetchPatientHistory = useCallback(async (patientId: string) => {
    setIsLoadingHistory(true);
    try {
      const result = await dispatch(getPatientHistoryByPatientId(patientId) as any);
      console.log("patient history result for patient:", patientId, result);

      // Check if we got a successful response with data
      if (result?.payload && result?.type === 'PATIENT_HISTORY_GET_SUCCESS') {
        const history = result.payload;
        console.log("history data to populate:", history);

        setIsExistingPatientHistory(true);
        setPatientHistoryId(history._id);

        // Populate form with existing data
        setFormData({
          chiefComplaints: history.chiefComplaints || '',
          amenorrhoea: history.amenorrhoea || '',
          complaint: history.complaint || '',
          onset: history.historyOfIllness?.onset ? formatDateForInput(history.historyOfIllness.onset) : '',
          duration: history.historyOfIllness?.duration ? formatDateForInput(history.historyOfIllness.duration) : '',
          associatedSymptoms: history.historyOfIllness?.associatedSymptoms || '',
          cycleLength: history.menstrualHistory?.cycleLength || '',
          daysOfFlow: history.menstrualHistory?.daysOfFlow || '',
          menstrualSymptoms: history.menstrualHistory?.associatedSymptoms || '',
          gravida: history.obstetricHistory?.gravida || '',
          para: history.obstetricHistory?.para || '',
          living: history.obstetricHistory?.living || '',
          abortion: history.obstetricHistory?.abortion || '',
          ectopic: history.obstetricHistory?.ectopic || '',
          diabetes: history.wifeMedicalHistory?.diabetes || '',
          hypertension: history.wifeMedicalHistory?.hypertension || '',
          asthma: history.wifeMedicalHistory?.asthma || '',
          thyroid: history.wifeMedicalHistory?.thyroid || '',
          drugAllergy: history.wifeMedicalHistory?.drugAllergy || '',
          drugAllergyDetails: history.wifeMedicalHistory?.drugAllergyDetails || '',
          geneticDiseaseSelf: history.wifeMedicalHistory?.geneticDiseaseSelf || '',
          geneticDiseaseFamily: history.wifeMedicalHistory?.geneticDiseaseFamily || '',
          downSyndrome: history.wifeMedicalHistory?.downSyndrome || '',
          smoking: history.wifeMedicalHistory?.smoking || '',
          drugAddiction: history.wifeMedicalHistory?.drugAddiction || '',
          husbandClinicalHistory: history.husbandHistory?.clinicalHistory || '',
        });
      } else {
        // No existing history found - make sure form is cleared
        console.log("No history found for patient:", patientId);
        setIsExistingPatientHistory(false);
        setPatientHistoryId("");
        resetFormData(); // Clear the form if no history found
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setIsExistingPatientHistory(false);
      resetFormData(); // Clear form on error
    } finally {
      setIsLoadingHistory(false);
    }
  }, [dispatch, resetFormData]);

  // Fetch consultation for patient
  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);
      console.log("consultation for patient:", patientId, result);

      if (result?.type === 'GET_CONSULTATION_BY_PATIENT_ID_SUCCESS') {
        setIsExistingConsultation(true);
        setConsultationId(result?.payload._id);
      } else {
        setIsExistingConsultation(false);
        setConsultationId("");
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setIsExistingConsultation(false);
      setConsultationId("");
    } finally {
      setIsLoadingConsultation(false);
    }
  }, [dispatch]);

  // Handle patient selection - improved version with ref
  useEffect(() => {
    const getPatientFromSession = () => {
      const patientId = sessionStorage.getItem('selectedPatientId');
      const patientUHID = sessionStorage.getItem('selectedPatientUHID');
      const patientData = sessionStorage.getItem('selectedPatient');

      if (patientId && patientUHID && patientData) {
        try {
          const patient = JSON.parse(patientData);

          // Check if patient has changed using ref
          if (currentPatientIdRef.current !== patient._id) {
            console.log("Patient changed from", currentPatientIdRef.current, "to", patient._id);

            // Update ref immediately
            currentPatientIdRef.current = patient._id;

            // Reset form immediately
            resetFormData();

            // Update states
            setSelectedPatient(patient);
            setIsExistingConsultation(false);
            setIsExistingPatientHistory(false);
            setConsultationId("");
            setPatientHistoryId("");

            // Fetch new patient data
            fetchConsultationForPatient(patient._id);
            fetchPatientHistory(patient._id);
          }
        } catch (error) {
          console.error('Error parsing patient data:', error);
          if (currentPatientIdRef.current !== null) {
            currentPatientIdRef.current = null;
            setSelectedPatient(null);
            resetFormData();
          }
        }
      } else {
        // No patient in session
        if (currentPatientIdRef.current !== null) {
          console.log("Clearing patient data");
          currentPatientIdRef.current = null;
          setSelectedPatient(null);
          resetFormData();
          setIsExistingConsultation(false);
          setIsExistingPatientHistory(false);
          setConsultationId("");
          setPatientHistoryId("");
        }
      }
    };

    // Run immediately
    getPatientFromSession();

    // Set up interval and storage listener
    const interval = setInterval(getPatientFromSession, 1000);
    window.addEventListener('storage', getPatientFromSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', getPatientFromSession);
    };
  }, [fetchConsultationForPatient, fetchPatientHistory, resetFormData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle radio button changes
  const handleRadioChange = (name: string, value: 'yes' | 'no') => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset drug allergy details if drug allergy is set to 'no'
      ...(name === 'drugAllergy' && value === 'no' ? { drugAllergyDetails: '' } : {})
    }));
  };

  // Handle form reset
  const handleReset = () => {
    if (isExistingPatientHistory && selectedPatient) {
      // If editing existing record, fetch and repopulate with saved data
      fetchPatientHistory(selectedPatient._id);
    } else {
      // If new record, clear all fields
      resetFormData();
    }
  };

  // Update the handleSubmit function in PatientHistory.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    // Transform form data to match backend structure
    const patientHistoryData = {
      patientId: selectedPatient._id,
      consultationId: consultationId, // if available
      chiefComplaints: formData.chiefComplaints,
      amenorrhoea: formData.amenorrhoea,
      complaint: formData.complaint,
      historyOfIllness: {
        onset: formData.onset,
        duration: formData.duration,
        associatedSymptoms: formData.associatedSymptoms
      },
      menstrualHistory: {
        cycleLength: formData.cycleLength,
        daysOfFlow: formData.daysOfFlow,
        associatedSymptoms: formData.menstrualSymptoms
      },
      obstetricHistory: {
        gravida: formData.gravida,
        para: formData.para,
        living: formData.living,
        abortion: formData.abortion,
        ectopic: formData.ectopic
      },
      wifeMedicalHistory: {
        diabetes: formData.diabetes,
        hypertension: formData.hypertension,
        asthma: formData.asthma,
        thyroid: formData.thyroid,
        drugAllergy: formData.drugAllergy,
        drugAllergyDetails: formData.drugAllergyDetails,
        geneticDiseaseSelf: formData.geneticDiseaseSelf,
        geneticDiseaseFamily: formData.geneticDiseaseFamily,
        downSyndrome: formData.downSyndrome,
        smoking: formData.smoking,
        drugAddiction: formData.drugAddiction
      },
      husbandHistory: {
        clinicalHistory: formData.husbandClinicalHistory
      }
    };

    // Log form data to console
    console.log('Patient History Form Data:', patientHistoryData);

    setIsSubmitting(true);

    try {
      if (isExistingPatientHistory) {
        // Update existing patient history
        const result = await dispatch(updatePatientHistory(selectedPatient._id, patientHistoryData) as any);
        console.log('Patient history updated successfully', result);
        alert('Patient history updated successfully!');
      } else {
        // Create new patient history
        const result = await dispatch(createPatientHistory(patientHistoryData) as any);
        console.log('Patient history created successfully', result);
        // After successful creation, update states
        if (result?.payload?._id) {
          setIsExistingPatientHistory(true);
          setPatientHistoryId(result.payload._id);
        }
        alert('Patient history saved successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || error.message || 'Error saving patient history');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Patient History" description="Patient Checkup History" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient History</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isExistingPatientHistory ? 'Update existing patient record' : 'Create new patient record'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className='mb-6'>
              <Alert
                variant="error"
                title="Error Message"
                message={error}
                showLink={false}
              />
            </div>
          )}

          {/* Loading Indicator for History */}
          {isLoadingHistory && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">Loading patient history...</p>
            </div>
          )}

          {/* Patient Info */}
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />

          {/* Patient History Form */}
          {selectedPatient && !isLoadingHistory && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Section 1: Chief Complaints */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Chief Complaints
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chief Complaints
                  </label>
                  <select
                    name="chiefComplaints"
                    value={formData.chiefComplaints}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Select Chief Complaint</option>
                    {chiefComplaintsOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 2: Amenorrhoea/Missed Periods */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Amenorrhoea/Missed Periods
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amenorrhoea Status
                  </label>
                  <select
                    name="amenorrhoea"
                    value={formData.amenorrhoea}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Select Amenorrhoea Status</option>
                    {amenorrhoeaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 3: Complaint */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Complaint
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Complaint
                  </label>
                  <select
                    name="complaint"
                    value={formData.complaint}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Select Complaint</option>
                    {complaintOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 4: History of Patient Illness */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  History of Patient Illness
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Onset
                    </label>
                    <input
                      type="date"
                      name="onset"
                      value={formData.onset}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="date"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Associated Symptoms
                    </label>
                    <textarea
                      name="associatedSymptoms"
                      value={formData.associatedSymptoms}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe associated symptoms..."
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Menstrual History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Menstrual History
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cycle Length (days)
                    </label>
                    <input
                      type="text"
                      name="cycleLength"
                      value={formData.cycleLength}
                      onChange={handleInputChange}
                      placeholder="Enter cycle length"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days of Flow
                    </label>
                    <input
                      type="text"
                      name="daysOfFlow"
                      value={formData.daysOfFlow}
                      onChange={handleInputChange}
                      placeholder="Enter days of flow"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Associated Symptoms
                    </label>
                    <input
                      type="text"
                      name="menstrualSymptoms"
                      value={formData.menstrualSymptoms}
                      onChange={handleInputChange}
                      placeholder="Enter associated symptoms"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Obstetric History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Obstetric History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gravida
                    </label>
                    <input
                      type="text"
                      name="gravida"
                      value={formData.gravida}
                      onChange={handleInputChange}
                      placeholder="Enter gravida"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Para
                    </label>
                    <input
                      type="text"
                      name="para"
                      value={formData.para}
                      onChange={handleInputChange}
                      placeholder="Enter para"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Living
                    </label>
                    <input
                      type="text"
                      name="living"
                      value={formData.living}
                      onChange={handleInputChange}
                      placeholder="Enter living"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Abortion
                    </label>
                    <input
                      type="text"
                      name="abortion"
                      value={formData.abortion}
                      onChange={handleInputChange}
                      placeholder="Enter abortion"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ectopic
                    </label>
                    <input
                      type="text"
                      name="ectopic"
                      value={formData.ectopic}
                      onChange={handleInputChange}
                      placeholder="Enter ectopic"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Wife Medical History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Wife Medical History
                </h2>
                <div className="space-y-4">
                  {/* Diabetes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Diabetes
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="diabetes"
                          value="yes"
                          checked={formData.diabetes === 'yes'}
                          onChange={(e) => handleRadioChange('diabetes', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="diabetes"
                          value="no"
                          checked={formData.diabetes === 'no'}
                          onChange={(e) => handleRadioChange('diabetes', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Hypertension */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hypertension
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hypertension"
                          value="yes"
                          checked={formData.hypertension === 'yes'}
                          onChange={(e) => handleRadioChange('hypertension', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hypertension"
                          value="no"
                          checked={formData.hypertension === 'no'}
                          onChange={(e) => handleRadioChange('hypertension', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Asthma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asthma
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="asthma"
                          value="yes"
                          checked={formData.asthma === 'yes'}
                          onChange={(e) => handleRadioChange('asthma', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="asthma"
                          value="no"
                          checked={formData.asthma === 'no'}
                          onChange={(e) => handleRadioChange('asthma', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Thyroid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thyroid
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="thyroid"
                          value="yes"
                          checked={formData.thyroid === 'yes'}
                          onChange={(e) => handleRadioChange('thyroid', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="thyroid"
                          value="no"
                          checked={formData.thyroid === 'no'}
                          onChange={(e) => handleRadioChange('thyroid', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Drug Allergy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Any History of Drug Allergy
                    </label>
                    <div className="flex gap-6 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="drugAllergy"
                          value="yes"
                          checked={formData.drugAllergy === 'yes'}
                          onChange={(e) => handleRadioChange('drugAllergy', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="drugAllergy"
                          value="no"
                          checked={formData.drugAllergy === 'no'}
                          onChange={(e) => handleRadioChange('drugAllergy', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                    {formData.drugAllergy === 'yes' && (
                      <input
                        type="text"
                        name="drugAllergyDetails"
                        value={formData.drugAllergyDetails}
                        onChange={handleInputChange}
                        placeholder="Please specify drug allergy details"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    )}
                  </div>

                  {/* Genetic Disease Self */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Any History of Genetic Disease (Self)
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="geneticDiseaseSelf"
                          value="yes"
                          checked={formData.geneticDiseaseSelf === 'yes'}
                          onChange={(e) => handleRadioChange('geneticDiseaseSelf', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="geneticDiseaseSelf"
                          value="no"
                          checked={formData.geneticDiseaseSelf === 'no'}
                          onChange={(e) => handleRadioChange('geneticDiseaseSelf', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Genetic Disease Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Any History of Genetic Disease in Family
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="geneticDiseaseFamily"
                          value="yes"
                          checked={formData.geneticDiseaseFamily === 'yes'}
                          onChange={(e) => handleRadioChange('geneticDiseaseFamily', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="geneticDiseaseFamily"
                          value="no"
                          checked={formData.geneticDiseaseFamily === 'no'}
                          onChange={(e) => handleRadioChange('geneticDiseaseFamily', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Down Syndrome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      H/O Down Syndrome
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="downSyndrome"
                          value="yes"
                          checked={formData.downSyndrome === 'yes'}
                          onChange={(e) => handleRadioChange('downSyndrome', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="downSyndrome"
                          value="no"
                          checked={formData.downSyndrome === 'no'}
                          onChange={(e) => handleRadioChange('downSyndrome', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Smoking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Smoking
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="smoking"
                          value="yes"
                          checked={formData.smoking === 'yes'}
                          onChange={(e) => handleRadioChange('smoking', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="smoking"
                          value="no"
                          checked={formData.smoking === 'no'}
                          onChange={(e) => handleRadioChange('smoking', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Drug Addiction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Drug Addiction
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="drugAddiction"
                          value="yes"
                          checked={formData.drugAddiction === 'yes'}
                          onChange={(e) => handleRadioChange('drugAddiction', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="drugAddiction"
                          value="no"
                          checked={formData.drugAddiction === 'no'}
                          onChange={(e) => handleRadioChange('drugAddiction', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 8: Husband History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Husband History
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clinical History
                  </label>
                  <textarea
                    name="husbandClinicalHistory"
                    value={formData.husbandClinicalHistory}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter husband's clinical history..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : isExistingPatientHistory ? 'Update Patient History' : 'Save Patient History'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </>
  );
}