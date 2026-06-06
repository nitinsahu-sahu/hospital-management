import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
//@ts-ignore
import { getConsultationByPatientId } from '../../redux/actions/consultation.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
//@ts-ignore
import { getInvestigationByPatientId, updateInvestigation, createInvestigation } from '../../redux/actions/investigation.actions';
import CategorySelector from '../../components/Investigation/Ultrasound/CategorySelector';
import PNDTInvestigations from '../../components/Investigation/Ultrasound/PNDTInvestigations';
import GynaeInvestigations from '../../components/Investigation/Ultrasound/GynaeInvestigations';
import SelectedInvestigationsList from '../../components/Investigation/Ultrasound/SelectedInvestigationsList';
import { InvestigationItem, PNDTOption, GynaeOption, PelvicSubOption } from '../../types/investigation.types';
import { pndtOptions, gynaeOptions, pelvicSubOptions } from '../../utils/investigationOptions';

export default function UltraSound() {
  const dispatch = useDispatch();

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [isExistingInvestigation, setIsExistingInvestigation] = useState(false);
  const [existingInvestigationId, setExistingInvestigationId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [error, setError] = useState('');
  
  // State for investigations
  const [selectedMainCategory, setSelectedMainCategory] = useState<'pndt' | 'gynae' | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
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

  // Handle main category change
  const handleMainCategoryChange = (category: 'pndt' | 'gynae') => {
    setSelectedMainCategory(category);
    setSelectedSubCategory('');

    if (!isExistingInvestigation) {
      setSelectedInvestigations([]);
    }
  };

  // Handle PNDT selection
  const handlePNDTSelection = (option: PNDTOption) => {
    const existingIndex = selectedInvestigations.findIndex(
      item => item.id === option.id && item.category === 'pndt'
    );

    if (existingIndex !== -1) {
      setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedInvestigations(prev => [
        ...prev,
        {
          id: option.id,
          name: option.name,
          category: 'pndt',
          price: option.price,
          selected: true
        }
      ]);
    }
  };

  // Handle GYNAE sub-category selection
  const handleGynaeSubCategory = (option: GynaeOption) => {
    setSelectedSubCategory(option.id);

    if (option.id === 'fm') {
      const existingIndex = selectedInvestigations.findIndex(
        item => item.id === 'fm' && item.category === 'gynae'
      );

      if (existingIndex !== -1) {
        setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        const filteredInvestigations = selectedInvestigations.filter(
          item => item.category !== 'pelvic'
        );

        setSelectedInvestigations([
          ...filteredInvestigations,
          {
            id: 'fm',
            name: 'FM (FOLLICULAR MONITORING)',
            category: 'gynae',
            price: 0,
            selected: true
          }
        ]);
      }
    } else if (option.id === 'pelvic') {
      const filteredInvestigations = selectedInvestigations.filter(
        item => item.id !== 'fm'
      );
      setSelectedInvestigations(filteredInvestigations);
    }
  };

  // Handle Pelvic sub-option selection
  const handlePelvicSubSelection = (option: PelvicSubOption) => {
    const existingIndex = selectedInvestigations.findIndex(
      item => item.id === option.id && item.category === 'pelvic'
    );

    if (existingIndex !== -1) {
      setSelectedInvestigations(prev => prev.filter((_, index) => index !== existingIndex));
      if (selectedInvestigations.filter(item => item.category === 'pelvic').length === 1) {
        setSelectedSubCategory('');
      }
    } else {
      const filteredInvestigations = selectedInvestigations.filter(
        item => item.category !== 'pelvic'
      );

      setSelectedInvestigations([
        ...filteredInvestigations,
        {
          id: option.id,
          name: option.name,
          category: 'pelvic',
          price: option.price,
          selected: true
        }
      ]);

      setSelectedSubCategory('pelvic');
    }
  };

  // Check if a PNDT option is selected
  const isPNDTSelected = (optionId: string) => {
    return selectedInvestigations.some(item => item.id === optionId && item.category === 'pndt');
  };

  // Check if any pelvic option is selected
  const isPelvicSelected = () => {
    return selectedInvestigations.some(item => item.category === 'pelvic');
  };

  // Get selected pelvic option name
  const getSelectedPelvicName = () => {
    const pelvic = selectedInvestigations.find(item => item.category === 'pelvic');
    return pelvic ? pelvic.name : '';
  };

  // Handle remove investigation
  const removeInvestigation = (id: string) => {
    setSelectedInvestigations(prev => prev.filter(item => item.id !== id));

    const removedItem = selectedInvestigations.find(item => item.id === id);
    if (removedItem?.category === 'pelvic') {
      setSelectedSubCategory('');
    } else if (removedItem?.id === 'fm') {
      setSelectedSubCategory('');
    }
  };

  // Fetch existing investigation
  useEffect(() => {
    const fetchExistingInvestigation = async () => {
      if (selectedPatient) {
        setIsLoadingInvestigations(true);
        try {
          const result = await dispatch(getInvestigationByPatientId(selectedPatient._id));

          if (result?.type === 'GET_INVESTIGATION_SUCCESS' && result.payload) {
            setIsExistingInvestigation(true);
            setExistingInvestigationId(result.payload._id);
            setSelectedInvestigations(result.payload.investigations);
            setConsultationId(result.payload.consultationId);

            if (result.payload.category) {
              setSelectedMainCategory(result.payload.category);
            }

            if (result.payload.subCategory) {
              setSelectedSubCategory(result.payload.subCategory);
            }

            const hasPelvic = result.payload.investigations?.some((item: any) => item.category === 'pelvic');
            if (hasPelvic) {
              setSelectedSubCategory('pelvic');
            }

            const hasFM = result.payload.investigations?.some((item: any) => item.id === 'fm');
            if (hasFM) {
              setSelectedSubCategory('fm');
            }
          } else {
            setIsExistingInvestigation(false);
            setExistingInvestigationId(null);
            setSelectedInvestigations([]);
            setSelectedMainCategory('');
            setSelectedSubCategory('');
            setTotalAmount(0);
          }
        } catch (error) {
          console.error('Error fetching investigation:', error);
          setIsExistingInvestigation(false);
          setSelectedInvestigations([]);
          setSelectedMainCategory('');
          setSelectedSubCategory('');
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

    let mainCategory = '';
    let subCategory = '';

    const hasPelvic = selectedInvestigations.some(item => item.category === 'pelvic');
    const hasFM = selectedInvestigations.some(item => item.id === 'fm');
    
    if (hasPelvic) {
      mainCategory = 'gynae';
      subCategory = 'pelvic';
    } else if (hasFM) {
      mainCategory = 'gynae';
      subCategory = 'fm';
    } else if (selectedInvestigations.some(item => item.category === 'pndt')) {
      mainCategory = 'pndt';
      subCategory = 'pndt';
    }

    const investigationData = {
      patientId: selectedPatient._id,
      consultationId: consultationId,
      category: mainCategory,
      subCategory: subCategory,
      investigations: selectedInvestigations.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        selected: true
      })),
      totalAmount: totalAmount,
      status: 'pending',
    };

    setIsSubmitting(true);

    try {
      let result;

      if (isExistingInvestigation && existingInvestigationId) {
        result = await dispatch(updateInvestigation(existingInvestigationId, {
          category: investigationData.category,
          subCategory: investigationData.subCategory,
          investigations: investigationData.investigations,
          totalAmount: investigationData.totalAmount,
        }));

        if (result?.type === 'UPDATE_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Investigations updated successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        result = await dispatch(createInvestigation(investigationData));

        if (result?.type === 'CREATE_INVESTIGATION_SUCCESS') {
          setSuccessMessage('Investigations saved successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
          setIsExistingInvestigation(true);
          setExistingInvestigationId(result.payload._id);
        }
      }

      if (result?.type?.includes('FAIL')) {
        setError(result.payload || 'Failed to save investigations');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error: any) {
      console.error('Error saving investigations:', error);
      setError(error?.message || 'Error saving investigations');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Ultrasound" description="Patient Ultrasound data" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investigations</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select investigations for the patient
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6">
              <Alert variant="success" title="Success" message={successMessage} showLink={false} />
            </div>
          )}
          
          {error && (
            <div className="mb-6">
              <Alert variant="error" title="Error" message={error} showLink={false} />
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
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">Loading existing investigations...</p>
            </div>
          )}

          {/* Investigation Form */}
          {selectedPatient && !isLoadingInvestigations && (
            <div className="mt-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <CategorySelector
                  selectedMainCategory={selectedMainCategory}
                  onCategoryChange={handleMainCategoryChange}
                />

                {/* PNDT Options */}
                {selectedMainCategory === 'pndt' && (
                  <PNDTInvestigations
                    options={pndtOptions}
                    selectedInvestigations={selectedInvestigations}
                    onSelectionChange={handlePNDTSelection}
                    isSelected={isPNDTSelected}
                  />
                )}

                {/* GYNAE Options */}
                {selectedMainCategory === 'gynae' && (
                  <GynaeInvestigations
                    gynaeOptions={gynaeOptions}
                    pelvicSubOptions={pelvicSubOptions}
                    selectedSubCategory={selectedSubCategory}
                    selectedInvestigations={selectedInvestigations}
                    onGynaeSubCategoryChange={handleGynaeSubCategory}
                    onPelvicSubSelection={handlePelvicSubSelection}
                    isPelvicSelected={isPelvicSelected}
                    getSelectedPelvicName={getSelectedPelvicName}
                  />
                )}
              </div>

              {/* Selected Investigations Summary */}
              {selectedInvestigations.length > 0 && (
                <SelectedInvestigationsList
                  investigations={selectedInvestigations}
                  totalAmount={totalAmount}
                  onRemove={removeInvestigation}
                />
              )}

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
                      ? 'Update Investigation' 
                      : 'Save Investigation'
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