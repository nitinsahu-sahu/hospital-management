import { useState, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { createConsultation } from '../../redux/actions/consultationNew.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { ConsultationFeesForm } from '../../components/consultation/ConsultationFeesForm';
import { AdditionalFeesManager } from '../../components/consultation/AdditionalFeesManager';
import { TotalAmountCard } from '../../components/consultation/TotalAmountCard';
import { FormActions } from '../../components/consultation/FormActions';
import { ConsultationFees, FormData, NewFee, SelectedPatient } from '../../types/consultationNew';

export default function Add() {
  const dispatch = useDispatch();
  const { creating } = useSelector((state: RootState) => state.consultation);

  const [formData, setFormData] = useState<FormData>({
    fees: {
      freeOfCost: 0,
      emergencyConsultationFee: '',
      geneticConsultationFee: '',
      opdConsultationFee: '',
      additionalFees: []
    },
    totalAmount: 0,
    consultationDate: new Date().toISOString().split('T')[0],
    doctorNotes: '',
    diagnosis: ''
  });

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);

  // Calculate total
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

  // Handle patient selection from session storage
  useEffect(() => {
    const getPatientFromSession = () => {
      const patientData = sessionStorage.getItem('selectedPatient');
      if (patientData) {
        try {
          const patient = JSON.parse(patientData);
          setSelectedPatient(patient);
        } catch (error) {
          console.error('Error parsing patient data:', error);
        }
      }
    };

    getPatientFromSession();
    const interval = setInterval(getPatientFromSession, 1000);

    return () => clearInterval(interval);
  }, []);

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
      alert('Please select a patient first');
      return;
    }

    const consultationData = {
      patientId: selectedPatient._id,
      consultationDate: formData.consultationDate,
      doctorNotes: formData.doctorNotes,
      diagnosis: formData.diagnosis,
      fees: {
        freeOfCost: formData.fees.freeOfCost,
        emergencyConsultationFee: Number(formData.fees.emergencyConsultationFee) || 0,
        geneticConsultationFee: Number(formData.fees.geneticConsultationFee) || 0,
        opdConsultationFee: Number(formData.fees.opdConsultationFee) || 0,
        additionalFees: formData.fees.additionalFees
      },
      totalAmount
    };

    const result = await dispatch(createConsultation(consultationData) as any);
    
    if (result?.status === 201 || result?.status === 200) {
      // Reset form for new consultation
      setFormData({
        fees: {
          freeOfCost: 0,
          emergencyConsultationFee: '',
          geneticConsultationFee: '',
          opdConsultationFee: '',
          additionalFees: []
        },
        totalAmount: 0,
        consultationDate: new Date().toISOString().split('T')[0],
        doctorNotes: '',
        diagnosis: ''
      });
    }
  }, [selectedPatient, formData, totalAmount, dispatch]);

  return (
    <div>
      <PatientInfoCard
        selectedPatient={selectedPatient}
        isExistingConsultation={false}
        isLoading={false}
      />

      {selectedPatient && (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mt-6">
            {/* Consultation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consultation Date
              </label>
              <input
                type="date"
                value={formData.consultationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, consultationDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <ConsultationFeesForm
              fees={formData.fees}
              onChange={handleFeeChange}
              isExisting={false}
            />

            <AdditionalFeesManager
              fees={formData.fees.additionalFees}
              onAddFee={handleAddFee}
              onRemoveFee={handleRemoveFee}
            />

            {/* Doctor Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor Notes
              </label>
              <textarea
                value={formData.doctorNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                rows={3}
                placeholder="Enter any notes about the consultation..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diagnosis
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                rows={2}
                placeholder="Enter diagnosis..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <TotalAmountCard total={totalAmount} />

            <FormActions
              onSubmit={() => {}}
              isSubmitting={creating}
              isExisting={false}
            />
          </div>
        </form>
      )}
    </div>
  );
}