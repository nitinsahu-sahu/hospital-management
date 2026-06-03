import { useState,  useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationByPatientId, createConsultation, updateConsultation } from '../../redux/actions/consultation.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import {  SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';

export default function RoutineBlood() {
  const dispatch = useDispatch();
  const {  error } = useSelector((state: RootState) => state.consultation);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);

  // Fetch consultation for patient
  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);
      if (result?.payload) {
        setIsExistingConsultation(true);
      } else {
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
    } finally {
      setIsLoadingConsultation(false);
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
          }
        } catch (error) {
          console.error('Error parsing patient data:', error);
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
  }, [selectedPatient, fetchConsultationForPatient]);




  return (
    <>
      <PageMeta title="Routine Blood" description="Patient Routine Blood data" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Routine Blood</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Patient Routine Blood data</p>
          </div>

          {/* Messages */}
          {/* {successMessage && (
            <div className='mb-6'>
              <Alert
                variant="success"
                title="Success Message"
                message={successMessage}
                showLink={false}

              />
            </div>
          )} */}
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

          {/* Patient Info */}
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />

         
        </div>
      </div>
    </>
  );
}