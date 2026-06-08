import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
//@ts-ignore
import { getBloodInvestigationByPatientId, updateBloodInvestigation, createBloodInvestigation, clearBloodInvestigationError } from '../../redux/actions/bloodInvestigation.actions';
import { InvestigationItem, InvestigationData } from '../../types/investigation.types';
import { routineOptions } from '../../utils/investigationOptions';
import SelectedInvestigationsSummary from '../../components/Investigation/Ultrasound/SelectedInvestigationsSummary';
import BloodInvestigationsList from '../../components/Investigation/Ultrasound/BloodInvestigationsList';

export default function RoutineBlood() {
  const dispatch = useDispatch();
  const { error: consultationError } = useSelector((state: RootState) => state.consultation);
  const { loading: bloodInvestigationLoading, error: bloodInvestigationError, success } = useSelector(
    (state: RootState) => state.bloodInvestigation
  );

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isExistingInvestigation, setIsExistingInvestigation] = useState(false);
  const [existingInvestigationId, setExistingInvestigationId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // State for investigations
  const [selectedInvestigations, setSelectedInvestigations] = useState<InvestigationItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoadingInvestigations, setIsLoadingInvestigations] = useState(false);

  const fetchConsultationForPatient = useCallback(async (patientId: string) => {
    setIsLoadingConsultation(true);
    try {
      const result = await dispatch(getConsultationByPatientId(patientId) as any);
      if (result?.payload) {
        setIsExistingConsultation(true);
        setConsultationId(result.payload._id);
      } else {
        setIsExistingConsultation(false);
        setConsultationId("");
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

  // Calculate total whenever selectedInvestigations changes
  useEffect(() => {
    const total = selectedInvestigations.reduce((sum, item) => sum + item.price, 0);
    setTotalAmount(total);
  }, [selectedInvestigations]);

  // Handle selection change
  const handleSelectionChange = (option: any, category: string) => {
    const existingIndex = selectedInvestigations.findIndex(
      item => item.id === option.id
    );

    if (existingIndex !== -1) {
      setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedInvestigations(prev => [
        ...prev,
        {
          id: option.id,
          code: option.code,
          name: option.name,
          category: category,
          price: option.price,
          selected: true
        }
      ]);
    }
  };

  // Check if an option is selected
  const isSelected = (optionId: string) => {
    return selectedInvestigations.some(item => item.id === optionId);
  };

  // Handle remove investigation
  const removeInvestigation = (id: string) => {
    setSelectedInvestigations(prev => prev.filter(item => item.id !== id));
  };

  // Fetch existing investigation
  useEffect(() => {
    const fetchExistingInvestigation = async () => {
      if (selectedPatient) {
        setIsLoadingInvestigations(true);
        try {
          const result = await dispatch(getBloodInvestigationByPatientId(selectedPatient._id, 'routine') as any);
          console.log(result);

          // Check for success with payload
          if (result?.type === 'GET_BLOOD_INVESTIGATION_SUCCESS' && result.payload) {
            const routineInvestigations = result.payload.investigations?.filter(
              (item: any) => item.category === 'routine'
            ) || [];

            if (routineInvestigations.length > 0) {
              setIsExistingInvestigation(true);
              setExistingInvestigationId(result.payload._id);
              setSelectedInvestigations(routineInvestigations);
              setConsultationId(result.payload.consultationId);
            } else {
              setIsExistingInvestigation(false);
              setSelectedInvestigations([]);
            }
          } else {
            setIsExistingInvestigation(false);
            setSelectedInvestigations([]);
          }
        } catch (error) {
          console.error('Error fetching investigation:', error);
          setIsExistingInvestigation(false);
          setSelectedInvestigations([]);
        } finally {
          setIsLoadingInvestigations(false);
        }
      }
    };

    fetchExistingInvestigation();
  }, [selectedPatient, dispatch]);

  // Handle success message from Redux
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearBloodInvestigationError());
      }, 5000);
    }
  }, [success, dispatch]);

  // Handle errors from Redux
  useEffect(() => {
    if (bloodInvestigationError) {
      setError(bloodInvestigationError);
      setTimeout(() => {
        setError('');
        dispatch(clearBloodInvestigationError());
      }, 5000);
    }
  }, [bloodInvestigationError, dispatch]);

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    if (!consultationId) {
      alert('No consultation found for this patient. Please create a consultation first.');
      return;
    }

    const investigationData: InvestigationData = {
      patientId: selectedPatient._id,
      consultationId: consultationId,
      category: 'routine',
      investigations: selectedInvestigations.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        price: item.price,
        selected: true
      })),
      totalAmount: totalAmount,
    };

    console.log('Routine Blood Investigation Data:', investigationData);

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      let result;

      if (isExistingInvestigation && existingInvestigationId) {
        result = await dispatch(updateBloodInvestigation(existingInvestigationId, {
          investigations: investigationData.investigations,
          totalAmount: investigationData.totalAmount,
        }) as any);

        if (result?.type === 'UPDATE_BLOOD_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Routine blood investigations updated successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        } else if (result?.type === 'UPDATE_BLOOD_INVESTIGATION_FAILURE') {
          setError(result.payload || 'Failed to update routine blood investigations');
          setTimeout(() => setError(''), 5000);
        }
      } else {
        result = await dispatch(createBloodInvestigation(investigationData) as any);
        console.log(result);

        if (result?.type === 'CREATE_BLOOD_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Routine blood investigations saved successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
          setIsExistingInvestigation(true);
          setExistingInvestigationId(result.payload._id);
        } else if (result?.type === 'CREATE_BLOOD_INVESTIGATION_FAILURE') {
          setError(result.payload || 'Failed to save routine blood investigations');
          setTimeout(() => setError(''), 5000);
        }
      }
    } catch (error: any) {
      console.error('Error saving routine blood investigations:', error);
      setError(error?.message || 'Error saving routine blood investigations');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Routine Blood" description="Patient Routine Blood data" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Routine Blood Investigations</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select routine blood tests for the patient
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6">
              <Alert variant="success" title="Success" message={successMessage} showLink={false} />
            </div>
          )}

          {(error || consultationError) && (
            <div className="mb-6">
              <Alert variant="error" title="Error" message={error || consultationError} showLink={false} />
            </div>
          )}

          {/* Patient Info */}
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />

          {/* Loading Indicator */}
          {(isLoadingInvestigations || bloodInvestigationLoading) && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">Loading existing investigations...</p>
            </div>
          )}

          {/* Investigation Form */}
          {selectedPatient && !isLoadingInvestigations && !bloodInvestigationLoading && (
            <div className="mt-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <BloodInvestigationsList
                  title="Routine Blood Tests"
                  options={routineOptions}
                  selectedInvestigations={selectedInvestigations}
                  category="routine"
                  onSelectionChange={handleSelectionChange}
                  isSelected={isSelected}
                />
              </div>

              {/* Selected Investigations Summary */}
              <SelectedInvestigationsSummary
                investigations={selectedInvestigations}
                totalAmount={totalAmount}
                onRemove={removeInvestigation}
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={selectedInvestigations.length === 0 || isSubmitting || bloodInvestigationLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || bloodInvestigationLoading
                    ? 'Saving...'
                    : isExistingInvestigation
                      ? 'Update Routine Investigations'
                      : 'Save Routine Investigations'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}