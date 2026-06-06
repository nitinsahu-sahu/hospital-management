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
import { getInvestigationByPatientId, updateInvestigation, createInvestigation } from '../../redux/actions/investigation.actions';
// import BloodInvestigationsList from '../../components/BloodInvestigationsList';
import { InvestigationItem, InvestigationData } from '../../types/investigation.types';
import { geneticOptions } from '../../utils/investigationOptions';
import SelectedInvestigationsSummary from '../../components/Investigation/Ultrasound/SelectedInvestigationsSummary';
import BloodInvestigationsList from '../../components/Investigation/Ultrasound/BloodInvestigationsList';

export default function GeneticBlood() {
  const dispatch = useDispatch();
  const { error: consultationError } = useSelector((state: RootState) => state.consultation);
  
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isExistingInvestigation, setIsExistingInvestigation] = useState(false);
  const [existingInvestigationId, setExistingInvestigationId] = useState(null);
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
          const result = await dispatch(getInvestigationByPatientId(selectedPatient._id) as any);

          if (result?.type === 'GET_INVESTIGATION_SUCCESS' && result.payload) {
            // Filter only genetic investigations
            const geneticInvestigations = result.payload.investigations?.filter(
              (item: any) => item.category === 'genetic'
            ) || [];
            
            if (geneticInvestigations.length > 0) {
              setIsExistingInvestigation(true);
              setExistingInvestigationId(result.payload._id);
              setSelectedInvestigations(geneticInvestigations);
              setConsultationId(result.payload.consultationId);
            }
          }
        } catch (error) {
          console.error('Error fetching investigation:', error);
        } finally {
          setIsLoadingInvestigations(false);
        }
      }
    };

    fetchExistingInvestigation();
  }, [selectedPatient, dispatch]);

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
      category: 'genetic',
      investigations: selectedInvestigations.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        price: item.price,
        selected: true
      })),
      totalAmount: totalAmount,
      status: 'pending',
    };

    console.log('Genetic Blood Investigation Data:', investigationData);

    setIsSubmitting(true);

    try {
      let result;

      if (isExistingInvestigation && existingInvestigationId) {
        result = await dispatch(updateInvestigation(existingInvestigationId, {
          category: investigationData.category,
          investigations: investigationData.investigations,
          totalAmount: investigationData.totalAmount,
        }));

        if (result?.type === 'UPDATE_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Genetic investigations updated successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        result = await dispatch(createInvestigation(investigationData));

        if (result?.type === 'CREATE_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Genetic investigations saved successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
          setIsExistingInvestigation(true);
          setExistingInvestigationId(result.payload._id);
        }
      }

      if (result?.type?.includes('FAIL')) {
        setError(result.payload || 'Failed to save genetic investigations');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error: any) {
      console.error('Error saving genetic investigations:', error);
      setError(error?.message || 'Error saving genetic investigations');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Genetic Blood" description="Genetic Blood data" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genetic Blood Investigations</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select genetic blood tests for the patient
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
          {isLoadingInvestigations && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">Loading existing investigations...</p>
            </div>
          )}

          {/* Investigation Form */}
          {selectedPatient && !isLoadingInvestigations && (
            <div className="mt-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <BloodInvestigationsList
                  title="Genetic Blood Tests"
                  options={geneticOptions}
                  selectedInvestigations={selectedInvestigations}
                  category="genetic"
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
                  disabled={selectedInvestigations.length === 0 || isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? 'Saving...' 
                    : isExistingInvestigation 
                      ? 'Update Genetic Investigations' 
                      : 'Save Genetic Investigations'
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