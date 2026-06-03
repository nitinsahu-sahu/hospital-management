import { useState, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getConsultationByPatientId, createConsultation, updateConsultation } from '../../redux/actions/consultation.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { ConsultationFeesForm } from '../../components/consultation/ConsultationFeesForm';
import { AdditionalFeesManager } from '../../components/consultation/AdditionalFeesManager';
import { TotalAmountCard } from '../../components/consultation/TotalAmountCard';
import { FormActions } from '../../components/consultation/FormActions';
import { AdditionalFee, ConsultationFees, FormData, NewFee, SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';

export default function DoctorConsultation() {
  const dispatch = useDispatch();
  const { creating, updating, error } = useSelector((state: RootState) => state.consultation);
  const isSubmitting = creating || updating;

  const [formData, setFormData] = useState<FormData>({
    fees: {
      freeOfCost: 0,
      emergencyConsultationFee: '',
      geneticConsultationFee: '',
      opdConsultationFee: '',
      additionalFees: []
    },
    totalAmount: 0
  });

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [existingConsultationId, setExistingConsultationId] = useState<string | null>(null);
  const [isExistingConsultation, setIsExistingConsultation] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);

  // Calculate total using useMemo for optimization
  const totalAmount = useMemo(() => {
    let total = 0;
    total += formData.fees.freeOfCost || 0;
    total += Number(formData.fees.emergencyConsultationFee) || 0;
    total += Number(formData.fees.geneticConsultationFee) || 0;
    total += Number(formData.fees.opdConsultationFee) || 0;
    formData.fees.additionalFees.forEach((fee: any) => {
      total += fee.amount || 0;
    });
    return total;
  }, [formData.fees]);

  const resetForm = useCallback(() => {
  setExistingConsultationId(null);
  setIsExistingConsultation(false);
  setFormData({
    fees: {
      freeOfCost: 0,
      emergencyConsultationFee: '',
      geneticConsultationFee: '',
      opdConsultationFee: '',
      additionalFees: []
    },
    totalAmount: 0
  });
}, []);
  // Fetch consultation for patient
 const fetchConsultationForPatient = useCallback(async (patientId: string) => {
  setIsLoadingConsultation(true);
  resetForm(); // Reset before fetching new patient data
  
  try {
    const result = await dispatch(getConsultationByPatientId(patientId) as any);
    
    if (result?.type === "GET_CONSULTATION_BY_PATIENT_ID_SUCCESS" && result.payload) {
      const consultationData = result.payload;
      setExistingConsultationId(consultationData._id);
      setIsExistingConsultation(true);
      setFormData({
        fees: {
          freeOfCost: consultationData.fees?.freeOfCost || 0,
          emergencyConsultationFee: consultationData.fees?.emergencyConsultationFee || '',
          geneticConsultationFee: consultationData.fees?.geneticConsultationFee || '',
          opdConsultationFee: consultationData.fees?.opdConsultationFee || '',
          additionalFees: consultationData.fees?.additionalFees || []
        },
        totalAmount: consultationData.totalAmount || 0
      });
    }
    // If failure, form is already reset by resetForm()
  } catch (error) {
    console.error('Error fetching consultation:', error);
    // resetForm already called, so no need to do anything
  } finally {
    setIsLoadingConsultation(false);
  }
}, [dispatch, resetForm]);

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

  // Handlers
  const handleFeeChange = useCallback((field: keyof ConsultationFees, value: string) => {
    setFormData(prev => ({
      ...prev,
      fees: { ...prev.fees, [field]: value }
    }));
  }, []);

  const handleAddFee = useCallback((fee: NewFee) => {
    setFormData(prev => ({
      ...prev,
      fees: {
        ...prev.fees,
        additionalFees: [...prev.fees.additionalFees, { name: fee.name, amount: Number(fee.amount) }]
      }
    }));
  }, []);

  const handleRemoveFee = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      fees: {
        ...prev.fees,
        additionalFees: prev.fees.additionalFees.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient?._id) {
      alert('Please select a patient from the header search first');
      return;
    }

    const consultationData = {
      patientId: selectedPatient._id,
      fees: {
        freeOfCost: formData.fees.freeOfCost,
        emergencyConsultationFee: Number(formData.fees.emergencyConsultationFee) || 0,
        geneticConsultationFee: Number(formData.fees.geneticConsultationFee) || 0,
        opdConsultationFee: Number(formData.fees.opdConsultationFee) || 0,
        additionalFees: formData.fees.additionalFees
      },
      totalAmount
    };

    let result;
    if (isExistingConsultation && existingConsultationId) {
      result = await dispatch(updateConsultation(existingConsultationId, consultationData) as any);
      if (result?.status === 200) {
        setSuccessMessage('Consultation updated successfully!');
         setTimeout(()=>{
        setSuccessMessage('');

        },5000)
        fetchConsultationForPatient(selectedPatient._id);
      }
    } else {
      result = await dispatch(createConsultation(consultationData) as any);
      if (result?.status === 201 || result?.status === 200) {
        setSuccessMessage('Consultation created successfully!');
        setTimeout(()=>{
        setSuccessMessage('');

        },5000)
        if (result?.payload?._id) {
          setExistingConsultationId(result.payload._id);
          setIsExistingConsultation(true);
        }
      }
    }
  }, [selectedPatient, formData.fees, totalAmount, isExistingConsultation, existingConsultationId, dispatch, fetchConsultationForPatient]);

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

          {/* Patient Info */}
          <PatientInfoCard
            selectedPatient={selectedPatient}
            isExistingConsultation={isExistingConsultation}
            isLoading={isLoadingConsultation}
          />

          {/* Form */}
          {selectedPatient && !isLoadingConsultation && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <ConsultationFeesForm
                  fees={formData.fees}
                  onChange={handleFeeChange}
                  isExisting={isExistingConsultation}
                />
                <AdditionalFeesManager
                  fees={formData.fees.additionalFees}
                  onAddFee={handleAddFee}
                  onRemoveFee={handleRemoveFee}
                />
                <TotalAmountCard total={totalAmount} />
                <FormActions
                  onSubmit={() => { }}
                  isSubmitting={isSubmitting}
                  isExisting={isExistingConsultation}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}