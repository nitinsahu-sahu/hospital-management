import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
//@ts-ignore
import { createPatientHistory, getPatientHistoryByPatientId, updatePatientHistory } from '../../redux/actions/patientHistory.action';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';

import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import Alert from '../../components/ui/alert/Alert';
import { chiefComplaintsOptions } from '../../utils/patientHistory';
import { PatientHistoryForm } from '../../types/patientHistory';
import OtherFieldGroup from '../../components/form/OtherFieldGroup';
import DatePicker from '../../components/form/date-picker';



export default function PatientHistory() {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isExistingPatientHistory, setIsExistingPatientHistory] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultationId, setConsultationId] = useState("");
  const [error, setError] = useState("");
  const currentPatientIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<PatientHistoryForm>({
    chiefComplaints: '',
    chiefComplaintsDetails: '',
    lmp: '',
    sb_iod_dead: '',
    // amenorrhoea: '',
    // complaint: '',
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

    husbandDiabetes: '',
    husbandHypertension: '',
    husbandAsthma: '',
    husbandThyroid: '',
    husbandDrugAllergy: '',
    husbandDrugAllergyDetails: '',
    husbandGeneticDiseaseSelf: '',
    husbandGeneticDiseaseFamily: '',
    husbandDownSyndrome: '',
    husbandSmoking: '',
    husbandDrugAddiction: '',
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
      chiefComplaintsDetails: '',
      lmp: '',
      sb_iod_dead: '',
      // amenorrhoea: '',
      // complaint: '',
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
      husbandDiabetes: '',
      husbandHypertension: '',
      husbandAsthma: '',
      husbandThyroid: '',
      husbandDrugAllergy: '',
      husbandDrugAllergyDetails: '',
      husbandGeneticDiseaseSelf: '',
      husbandGeneticDiseaseFamily: '',
      husbandDownSyndrome: '',
      husbandSmoking: '',
      husbandDrugAddiction: '',
    });
  }, []);

  const fetchPatientHistory = useCallback(async (patientId: string) => {
    setIsLoadingHistory(true);
    try {
      const result = await dispatch(getPatientHistoryByPatientId(patientId) as any);
      if (result?.payload && result?.type === 'PATIENT_HISTORY_GET_SUCCESS') {
        const history = result.payload;
        setIsExistingPatientHistory(true);
        setFormData({
          chiefComplaints: history.chiefComplaints || '',
          chiefComplaintsDetails: history.chiefComplaintsDetails || '',
          lmp: history.lmp || '',
          sb_iod_dead: history.sb_iod_dead || '',
          // amenorrhoea: history.amenorrhoea || '',
          // complaint: history.complaint || '',
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

          husbandDiabetes: history.husbandMedicalHistory?.diabetes || '',
          husbandHypertension: history.husbandMedicalHistory?.hypertension || '',
          husbandAsthma: history.husbandMedicalHistory?.asthma || '',
          husbandThyroid: history.husbandMedicalHistory?.thyroid || '',
          husbandDrugAllergy: history.husbandMedicalHistory?.drugAllergy || '',
          husbandDrugAllergyDetails: history.husbandMedicalHistory?.drugAllergyDetails || '',
          husbandGeneticDiseaseSelf: history.husbandMedicalHistory?.geneticDiseaseSelf || '',
          husbandGeneticDiseaseFamily: history.husbandMedicalHistory?.geneticDiseaseFamily || '',
          husbandDownSyndrome: history.husbandMedicalHistory?.downSyndrome || '',
          husbandSmoking: history.husbandMedicalHistory?.smoking || '',
          husbandDrugAddiction: history.husbandMedicalHistory?.drugAddiction || '',
        });
      } else {
        // No existing history found - make sure form is cleared
        console.log("No history found for patient:", patientId);
        setIsExistingPatientHistory(false);
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
            // Update ref immediately
            currentPatientIdRef.current = patient._id;

            // Reset form immediately
            resetFormData();

            // Update states
            setSelectedPatient(patient);
            setIsExistingConsultation(false);
            setIsExistingPatientHistory(false);
            setConsultationId("");
            fetchConsultationForPatient(patient._id);
            fetchPatientHistory(patient._id);
          }
        } catch (error) {
          if (currentPatientIdRef.current !== null) {
            currentPatientIdRef.current = null;
            setSelectedPatient(null);
            resetFormData();
          }
        }
      } else {
        // No patient in session
        if (currentPatientIdRef.current !== null) {
          currentPatientIdRef.current = null;
          setSelectedPatient(null);
          resetFormData();
          setIsExistingConsultation(false);
          setIsExistingPatientHistory(false);
          setConsultationId("");
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
      ...(name === 'drugAllergy' && value === 'no' ? { drugAllergyDetails: '' } : {}),
      ...(name === 'husbandDrugAllergy' && value === 'no' ? { husbandDrugAllergyDetails: '' } : {})
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


  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === "chiefComplaints" && value !== "other") {
        newData.chiefComplaintsDetails = "";
      }

      return newData;
    });
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
      chiefComplaintsDetails: formData.chiefComplaintsDetails,
      // amenorrhoea: formData.amenorrhoea,
      // complaint: formData.complaint,
      historyOfIllness: {
        onset: formData.onset,
        duration: formData.duration,
        associatedSymptoms: formData.associatedSymptoms
      },
      menstrualHistory: {
        cycleLength: formData.cycleLength,
        daysOfFlow: formData.daysOfFlow,
        associatedSymptoms: formData.menstrualSymptoms,
        lmp: formData.lmp
      },
      obstetricHistory: {
        gravida: formData.gravida,
        para: formData.para,
        living: formData.living,
        abortion: formData.abortion,
        ectopic: formData.ectopic,
        sb_iod_dead: formData.sb_iod_dead
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
      husbandMedicalHistory: {
        diabetes: formData.husbandDiabetes,
        hypertension: formData.husbandHypertension,
        asthma: formData.husbandAsthma,
        thyroid: formData.husbandThyroid,
        drugAllergy: formData.husbandDrugAllergy,
        drugAllergyDetails: formData.husbandDrugAllergyDetails,
        geneticDiseaseSelf: formData.husbandGeneticDiseaseSelf,
        geneticDiseaseFamily: formData.husbandGeneticDiseaseFamily,
        downSyndrome: formData.husbandDownSyndrome,
        smoking: formData.husbandSmoking,
        drugAddiction: formData.husbandDrugAddiction
      },
    };

    setIsSubmitting(true);
    try {
      let result;

      if (isExistingPatientHistory) {
        result = await dispatch(updatePatientHistory(selectedPatient._id, patientHistoryData) as any);

      } else {
        result = await dispatch(createPatientHistory(patientHistoryData) as any);

      }

      if (result?.type === 'PATIENT_HISTORY_CREATE_SUCCESS' ||
        result?.type === 'PATIENT_HISTORY_UPDATE_SUCCESS') {
        setSuccessMessage(isExistingPatientHistory
          ? 'Patient examination updated successfully!'
          : 'Patient examination saved successfully!'
        );

        setTimeout(() => {
          setSuccessMessage("")
        }, 5000)
        setIsExistingPatientHistory(true);
      } else {
        setError(result?.payload || 'Failed to save examination')
      }
    } catch (error: any) {
      setError(error.message || 'Error saving examination');
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
          {/* Messages */}
          {successMessage && (
            <div className='mb-6'>
              <Alert
                variant="success"
                title="Success Message"
                message={successMessage}
                showLink={false}

              />
            </div>
          )}
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
                  <OtherFieldGroup
                    selectName="chiefComplaints"
                    selectOptions={chiefComplaintsOptions}
                    selectValue={formData.chiefComplaints}
                    selectPlaceholder="Select Chief Complaint"
                    onSelectChange={handleSelectChange}
                    otherInputName="chiefComplaintsDetails"
                    otherInputValue={formData.chiefComplaintsDetails || ""}
                    otherInputPlaceholder="Please specify chief complaint"
                    onOtherInputChange={handleInputChange}
                    required={true}
                  />
                </div>
              </div>

              {/* Section 2: Amenorrhoea/Missed Periods */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
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
              </div> */}

              {/* Section 3: Complaint */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
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
              </div> */}

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <DatePicker
                      id="lmp"
                      label="Last Menstrual Period (LMP)"
                      placeholder="Select last menstrual period date"
                      value={formData.lmp}
                      onChange={(dates, currentDateString) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          lmp: currentDateString
                        }));
                      }}
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

                  <div >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SB / IUD / DEAD
                    </label>
                    <input
                      type="text"
                      name="sb_iod_dead"
                      value={formData.sb_iod_dead}
                      onChange={handleInputChange}
                      placeholder="Enter SB / IUD / DEAD"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div >
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
                  Husband Medical History
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
                          name="husbandDiabetes"
                          value="yes"
                          checked={formData.husbandDiabetes === 'yes'}
                          onChange={(e) => handleRadioChange('husbandDiabetes', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandDiabetes"
                          value="no"
                          checked={formData.husbandDiabetes === 'no'}
                          onChange={(e) => handleRadioChange('husbandDiabetes', e.target.value as 'no')}
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
                          name="husbandHypertension"
                          value="yes"
                          checked={formData.husbandHypertension === 'yes'}
                          onChange={(e) => handleRadioChange('husbandHypertension', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandHypertension"
                          value="no"
                          checked={formData.husbandHypertension === 'no'}
                          onChange={(e) => handleRadioChange('husbandHypertension', e.target.value as 'no')}
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
                          name="husbandAsthma"
                          value="yes"
                          checked={formData.husbandAsthma === 'yes'}
                          onChange={(e) => handleRadioChange('husbandAsthma', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandAsthma"
                          value="no"
                          checked={formData.husbandAsthma === 'no'}
                          onChange={(e) => handleRadioChange('husbandAsthma', e.target.value as 'no')}
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
                          name="husbandThyroid"
                          value="yes"
                          checked={formData.husbandThyroid === 'yes'}
                          onChange={(e) => handleRadioChange('husbandThyroid', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandThyroid"
                          value="no"
                          checked={formData.husbandThyroid === 'no'}
                          onChange={(e) => handleRadioChange('husbandThyroid', e.target.value as 'no')}
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
                          name="husbandDrugAllergy"
                          value="yes"
                          checked={formData.husbandDrugAllergy === 'yes'}
                          onChange={(e) => handleRadioChange('husbandDrugAllergy', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandDrugAllergy"
                          value="no"
                          checked={formData.husbandDrugAllergy === 'no'}
                          onChange={(e) => handleRadioChange('husbandDrugAllergy', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                    {formData.husbandDrugAllergy === 'yes' && (
                      <input
                        type="text"
                        name="husbandDrugAllergyDetails"
                        value={formData.husbandDrugAllergyDetails}
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
                          name="husbandGeneticDiseaseSelf"
                          value="yes"
                          checked={formData.husbandGeneticDiseaseSelf === 'yes'}
                          onChange={(e) => handleRadioChange('husbandGeneticDiseaseSelf', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandGeneticDiseaseSelf"
                          value="no"
                          checked={formData.husbandGeneticDiseaseSelf === 'no'}
                          onChange={(e) => handleRadioChange('husbandGeneticDiseaseSelf', e.target.value as 'no')}
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
                          name="husbandGeneticDiseaseFamily"
                          value="yes"
                          checked={formData.husbandGeneticDiseaseFamily === 'yes'}
                          onChange={(e) => handleRadioChange('husbandGeneticDiseaseFamily', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandGeneticDiseaseFamily"
                          value="no"
                          checked={formData.husbandGeneticDiseaseFamily === 'no'}
                          onChange={(e) => handleRadioChange('husbandGeneticDiseaseFamily', e.target.value as 'no')}
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
                          name="husbandDownSyndrome"
                          value="yes"
                          checked={formData.husbandDownSyndrome === 'yes'}
                          onChange={(e) => handleRadioChange('husbandDownSyndrome', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandDownSyndrome"
                          value="no"
                          checked={formData.husbandDownSyndrome === 'no'}
                          onChange={(e) => handleRadioChange('husbandDownSyndrome', e.target.value as 'no')}
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
                          name="husbandSmoking"
                          value="yes"
                          checked={formData.husbandSmoking === 'yes'}
                          onChange={(e) => handleRadioChange('husbandSmoking', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandSmoking"
                          value="no"
                          checked={formData.husbandSmoking === 'no'}
                          onChange={(e) => handleRadioChange('husbandSmoking', e.target.value as 'no')}
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
                          name="husbandDrugAddiction"
                          value="yes"
                          checked={formData.husbandDrugAddiction === 'yes'}
                          onChange={(e) => handleRadioChange('husbandDrugAddiction', e.target.value as 'yes')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandDrugAddiction"
                          value="no"
                          checked={formData.husbandDrugAddiction === 'no'}
                          onChange={(e) => handleRadioChange('husbandDrugAddiction', e.target.value as 'no')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                  </div>
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
                  // disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExistingPatientHistory ? 'Update Patient History' : 'Save Patient History'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </>
  );
}