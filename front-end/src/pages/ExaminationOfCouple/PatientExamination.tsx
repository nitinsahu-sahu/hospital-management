// pages/PatientExamination.tsx
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';

import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
import { ExaminationFormData } from '../../types/examination';
import VitalsSection from '../../components/examination-of-couple/VitalsSection';
import LocalExaminationSection from '../../components/examination-of-couple/LocalExaminationSection';
import SystemExaminationSection from '../../components/examination-of-couple/SystemExaminationSection';
//@ts-ignore
import { createPatientExamination, getPatientExaminationByPatientId, updatePatientExamination } from '../../redux/actions/patientExamination.actions';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';


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

export default function PatientExamination() {
  const dispatch = useDispatch();
  const { loading } = useSelector(
    (state: RootState) => state.patientExamination
  );

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isExistingExamination, setIsExistingExamination] = useState(false);

  // Form data for wife/patient
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
  const fetchExistingExamination = useCallback(async (patientId: string) => {
    try {
      const result = await dispatch(getPatientExaminationByPatientId(patientId) as any);
      if (result?.type === 'GET_PATIENT_EXAMINATION_SUCCESS') {
        setIsExistingExamination(true);
        const exam = result.payload;

        // Populate form with existing data
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
              perVaginalExamination: exam.vitals?.localExamination?.perVaginalExamination || '',
              perSpeculumExamination: exam.vitals?.localExamination?.perSpeculumExamination || '',
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
            fetchExistingExamination(patient._id);
            setSuccessMessage('');
            setError('');
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

  // Handle local examination change
  const handleLocalExaminationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        localExamination: {
          ...prev.vitals.localExamination,
          [field]: value,
        },
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
      setError('Please select a patient first');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setError('');

    const apiData = transformFormDataForAPI();

    try {
      let result;
      if (isExistingExamination) {
        result = await dispatch(updatePatientExamination(selectedPatient._id, apiData) as any);
      } else {
        result = await dispatch(createPatientExamination(apiData) as any);
      }

      if (result?.type === 'CREATE_PATIENT_EXAMINATION_SUCCESS' ||
        result?.type === 'UPDATE_PATIENT_EXAMINATION_SUCCESS') {
        setSuccessMessage(isExistingExamination
          ? 'Patient examination updated successfully!'
          : 'Patient examination saved successfully!'
        );

        setTimeout(() => {
          setSuccessMessage("")
        }, 5000)
        setIsExistingExamination(true);
      } else {
        setError(result?.payload || 'Failed to save examination')
      }
    } catch (error: any) {
      setError(error.message || 'Error saving examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (isExistingExamination && selectedPatient) {
      fetchExistingExamination(selectedPatient._id);
    } else {
      setFormData(getInitialExaminationForm());
    }
    setSuccessMessage('');
    setError('');
  };

  return (
    <>
      <PageMeta title="Patient Examination" description="Patient examination" />
      <PageBreadcrumb pageTitle="Patient / Wife Examination" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

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
        {error && (
          <div className="mb-6">
            <Alert
              variant="error"
              title="Error"
              message={error}
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

              {/* Local Examination - Only for Wife */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                  Local Examination
                </h3>
                <LocalExaminationSection
                  localExamination={formData.vitals.localExamination}
                  onLocalExaminationChange={handleLocalExaminationChange}
                />
              </div>
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
                person="wife"
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
      </div>
    </>
  );
}