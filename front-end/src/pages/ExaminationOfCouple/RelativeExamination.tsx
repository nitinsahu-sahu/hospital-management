import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';
//@ts-ignore
import { createRelativeExamination, getRelativeExaminationByRelativeId,updateRelativeExamination } from '../../redux/actions/relativeExamination.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
import VitalsSection from '../../components/examination-of-couple/VitalsSection';
import SystemExaminationSection from '../../components/examination-of-couple/SystemExaminationSection';
import { ExaminationFormData } from '../../types/examination';

const getInitialVitals = () => ({
  pr: '',
  prUnit: 'bpm',
  bp: '',
  bpUnit: 'mmHg',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  bmi: '',
  bmiUnit: 'kg/m²',
  abdominalExamination: '',
  localExamination: {
    perVaginalExamination: '',
    perSpeculumExamination: '',
  },
});

const getInitialSystemExamination = () => ({
  status: '' as 'normal' | 'abnormal' | '',
  details: '',
});

const getInitialExaminationForm = (): ExaminationFormData => ({
  vitals: getInitialVitals(),
  cns: getInitialSystemExamination(),
  cvs: getInitialSystemExamination(),
  respiratorySystem: getInitialSystemExamination(),
  git: getInitialSystemExamination(),
});

export default function RelativeExamination() {
  const dispatch = useDispatch();
  const { loading, error: reduxError} = useSelector(
    (state: RootState) => state.relativeExamination
  );

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [isExistingExamination, setIsExistingExamination] = useState(false);
  const [relativeId, setRelativeId] = useState('');
console.log(selectedPatient);

  const [formData, setFormData] = useState<ExaminationFormData>(getInitialExaminationForm());

  // Fetch consultation for patient
  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);
      if (result?.payload) {
        setIsExistingConsultation(true);
      } else {
        setIsExistingConsultation(false);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
    } finally {
      setIsLoadingConsultation(false);
    }
  }, [dispatch]);


  // Fetch existing examination
  const fetchExistingExamination = useCallback(async (relId: string) => {
    console.log('fetchExistingExamination',relId);
    console.log('selectedPatient?.relative?._id',selectedPatient?.relative?._id);
    
    try {
      const result = await dispatch(getRelativeExaminationByRelativeId(relId||selectedPatient?.relative?._id) as any);
      console.log(result);
      
      if (result?.type === 'GET_RELATIVE_EXAMINATION_SUCCESS') {
        setIsExistingExamination(true);
        const exam = result.payload;
        
        setFormData({
          vitals: {
            pr: exam.vitals?.pr || '',
            prUnit: exam.vitals?.prUnit || 'bpm',
            bp: exam.vitals?.bp || '',
            bpUnit: exam.vitals?.bpUnit || 'mmHg',
            height: exam.vitals?.height || '',
            heightUnit: exam.vitals?.heightUnit || 'cm',
            weight: exam.vitals?.weight || '',
            weightUnit: exam.vitals?.weightUnit || 'kg',
            bmi: exam.vitals?.bmi || '',
            bmiUnit: exam.vitals?.bmiUnit || 'kg/m²',
            abdominalExamination: exam.vitals?.abdominalExamination || '',
            localExamination: {
              perVaginalExamination: '',
              perSpeculumExamination: '',
            },
          },
          cns: {
            status: exam.cns || '',
            details: exam.cnsDetails || '',
          },
          cvs: {
            status: exam.cvs || '',
            details: exam.cvsDetails || '',
          },
          respiratorySystem: {
            status: exam.respiratorySystem || '',
            details: exam.respiratorySystemDetails || '',
          },
          git: {
            status: exam.git || '',
            details: exam.gitDetails || '',
          },
        });
      } else {
        setIsExistingExamination(false);
        setFormData(getInitialExaminationForm());
      }
    } catch (error) {
      console.error('Error fetching relative examination:', error);
      setIsExistingExamination(false);
    }
  }, [dispatch]);

  // Handle patient selection
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
            const relId = patient?.relative?._id;
            if (relId) {
              setRelativeId(relId);
              fetchExistingExamination(relId);
            }
            setSuccessMessage('');
            setLocalError('');
          }
        } catch (error) {
          setSelectedPatient(null);
        }
      } else {
        setSelectedPatient(null);
      }
    };

    getPatientFromSession();
    const interval = setInterval(getPatientFromSession, 1000);
    window.addEventListener('storage', getPatientFromSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', getPatientFromSession);
    };
  }, [selectedPatient, fetchConsultationForPatient, fetchExistingExamination]);

  // Handle vitals input change
  const handleVitalsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [field]: value,
      },
    }));
  };

  // Handle system examination change
  const handleSystemExaminationChange = (
    system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
    field: 'status' | 'details',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [system]: {
        ...prev[system],
        [field]: value,
        ...(field === 'status' && value !== 'abnormal' ? { details: '' } : {}),
      },
    }));
  };

  // Transform form data to API format
  const transformFormDataForAPI = () => {
    return {
      patientId: selectedPatient?._id,
      relativeId: relativeId,
      vitals: formData.vitals,
      cns: formData.cns.status,
      cnsDetails: formData.cns.details,
      cvs: formData.cvs.status,
      cvsDetails: formData.cvs.details,
      respiratorySystem: formData.respiratorySystem.status,
      respiratorySystemDetails: formData.respiratorySystem.details,
      git: formData.git.status,
      gitDetails: formData.git.details,
    };
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      setLocalError('Please select a patient first');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setLocalError('');

    const apiData = transformFormDataForAPI();

    try {
      let result;
      if (isExistingExamination) {
        result = await dispatch(updateRelativeExamination(selectedPatient?.relative?._id, apiData) as any);
      } else {
        result = await dispatch(createRelativeExamination(selectedPatient._id, selectedPatient?.relative?._id, apiData) as any);
      }

      if (result?.type === 'CREATE_RELATIVE_EXAMINATION_SUCCESS' || 
          result?.type === 'UPDATE_RELATIVE_EXAMINATION_SUCCESS') {
        setSuccessMessage(isExistingExamination 
          ? 'Relative examination updated successfully!' 
          : 'Relative examination saved successfully!'
        );
        setTimeout(()=>{
          setSuccessMessage("")
        },5000)
        setIsExistingExamination(true);
      } else {
        setLocalError(result?.payload || 'Failed to save examination');
      }
    } catch (error: any) {
      console.error('Error saving examination:', error);
      setLocalError(error.message || 'Error saving examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (isExistingExamination && relativeId) {
      fetchExistingExamination(relativeId);
    } else {
      setFormData(getInitialExaminationForm());
    }
    setSuccessMessage('');
    setLocalError('');
  };

  const displayError = localError || reduxError;

  return (
    <>
      <PageMeta title="Husband Examination" description="Husband/Relative examination" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Husband/Relative Examination
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isExistingExamination ? 'Update existing examination' : 'Record new examination'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6">
              <Alert
                variant="success"
                title="Success"
                message={successMessage}
                showLink={false}
              />
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="mb-6">
              <Alert
                variant="error"
                title="Error"
                message={displayError}
                showLink={false}
              />
            </div>
          )}

          {/* Patient Info */}
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />

          {/* Examination Form */}
          {selectedPatient && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Vitals Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Vitals & Physical Examination
                </h2>

                <VitalsSection
                  vitals={formData.vitals}
                  onVitalsChange={handleVitalsChange}
                />
              </div>

              {/* System Examination Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  System Examination
                </h2>
                <SystemExaminationSection
                  cns={formData.cns}
                  cvs={formData.cvs}
                  respiratorySystem={formData.respiratorySystem}
                  git={formData.git}
                  onSystemExaminationChange={handleSystemExaminationChange}
                  person="husband"
                />
              </div>

              {/* Action Buttons */}
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
                  disabled={isSubmitting || loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || loading 
                    ? 'Saving...' 
                    : isExistingExamination 
                      ? 'Update Examination' 
                      : 'Save Examination'
                  }
                </button>
              </div>
            </form>
          )}

          {/* No Patient Selected */}
          {!selectedPatient && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Please select a patient from the patient list to record examination.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}