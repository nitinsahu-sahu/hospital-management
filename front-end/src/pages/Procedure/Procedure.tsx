import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../../components/common/PageMeta';
import { RootState } from '../../redux/store/store';
//@ts-ignore
import { getProceduresByPatientId, createProcedure, updateProcedure } from '../../redux/actions/procedure.actions';
import { PatientInfoCard } from '../../components/consultation/PatientInfoCard';
import { SelectedPatient } from '../../types/consultation';
import Alert from '../../components/ui/alert/Alert';
import { PROCEDURES } from '../../utils/procedure';

// Procedure Types
interface Procedure {
  id: string;
  name: string;
  category: 'iui' | 'cvs' | 'prp' | 'lbc' | 'amniocentesis';
  subType?: string;
  price?: number;
  description?: string;
}

interface SelectedProcedureDetails {
  id: string;
  name: string;
  price: number;
  type?: string;
}

interface ExistingProcedure {
  _id: string;
  procedures: Array<{
    procedureId: string;
    name: string;
    price: number;
    category: string;
    subType?: string | null;
    description?: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Procedure() {
  const dispatch = useDispatch();
  const { creating, updating } = useSelector((state: RootState) => state.procedure);

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('iui');
  const [selectedIuiType, setSelectedIuiType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [existingProcedure, setExistingProcedure] = useState<ExistingProcedure | null>(null);
  const [isLoadingProcedure, setIsLoadingProcedure] = useState(false);
  const [isExistingProcedure, setIsExistingProcedure] = useState(false);
  
 const fetchPatientProcedures = useCallback(async (patientId: string) => {
  setIsLoadingProcedure(true);
  try {
    const result = await dispatch(getProceduresByPatientId(patientId) as any);

    if (result?.status === 200 && result.data) {
      const latestProcedure = result.data.procedures;

      setExistingProcedure(latestProcedure);
      setIsExistingProcedure(true);
      
      // Extract procedure IDs from the procedures array inside the object
      const procedureIds = latestProcedure.procedures.map((proc: any) => proc.procedureId);
      setSelectedProcedures(procedureIds);

      // Set IUI type if exists
      const iuiProcedure = latestProcedure.procedures.find((proc: any) =>
        proc.procedureId === 'iui-self' || proc.procedureId === 'iui-donor'
      );
      if (iuiProcedure) {
        setSelectedIuiType(iuiProcedure.procedureId);
      } else {
        setSelectedIuiType(null);
      }
    } else {
      // No existing procedure found
      setExistingProcedure(null);
      setIsExistingProcedure(false);
      setSelectedProcedures([]);
      setSelectedIuiType(null);
    }
  } catch (error) {
    console.error('Error fetching procedures:', error);
    setExistingProcedure(null);
    setIsExistingProcedure(false);
    setSelectedProcedures([]);
    setSelectedIuiType(null);
  } finally {
    setIsLoadingProcedure(false);
  }
}, [dispatch]);

  // Handle patient selection from session
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
            // Reset states for new patient
            setExistingProcedure(null);
            setIsExistingProcedure(false);
            setSelectedProcedures([]);
            setSelectedIuiType(null);
            setSuccessMessage('');
            // Fetch procedures for this patient
            fetchPatientProcedures(patient._id);
          }
        } catch (error) {
          setSelectedPatient(null);
          resetAllStates();
        }
      } else {
        setSelectedPatient(null);
        resetAllStates();
      }
    };

    getPatientFromSession();
    const interval = setInterval(getPatientFromSession, 1000);
    window.addEventListener('storage', getPatientFromSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', getPatientFromSession);
    };
  }, [selectedPatient, fetchPatientProcedures]);

  // Reset all states
  const resetAllStates = () => {
    setExistingProcedure(null);
    setIsExistingProcedure(false);
    setSelectedProcedures([]);
    setSelectedIuiType(null);
    setSuccessMessage('');
  };

  const handleProcedureToggle = (procedureId: string) => {
    setSelectedProcedures(prev =>
      prev.includes(procedureId)
        ? prev.filter(id => id !== procedureId)
        : [...prev, procedureId]
    );
  };

  const handleIuiTypeSelect = (type: string) => {
    setSelectedIuiType(type);
    setSelectedProcedures(prev => prev.filter(id => !id.startsWith('iui')));
    setSelectedProcedures(prev => [...prev, type]);
  };

  const getSelectedProceduresDetails = (): SelectedProcedureDetails[] => {
    const details: SelectedProcedureDetails[] = [];

    selectedProcedures.forEach(procId => {
      switch (procId) {
        case 'iui-self':
          details.push({
            id: procId,
            name: 'IUI (Self - Husband)',
            price: 3500,
            type: 'self'
          });
          break;
        case 'iui-donor':
          details.push({
            id: procId,
            name: 'IUI (Donor Sperm)',
            price: 5500,
            type: 'donor'
          });
          break;
        case 'cvs':
          details.push({
            id: procId,
            name: 'CVS (Chorionic Villus Sampling)',
            price: 12000
          });
          break;
        case 'prp':
          details.push({
            id: procId,
            name: 'PRP (Platelet-Rich Plasma)',
            price: 8000
          });
          break;
        case 'lbc':
          details.push({
            id: procId,
            name: 'LBC (Liquid Based Cytology)',
            price: 2500
          });
          break;
        case 'lbc-hpv':
          details.push({
            id: procId,
            name: 'LBC + HPV DNA',
            price: 4500
          });
          break;
        case 'amniocentesis':
          details.push({
            id: procId,
            name: 'Amniocentesis',
            price: 15000
          });
          break;
        case 'iui-h':
          details.push({
            id: procId,
            name: 'IUI-H (IUI with Husband)',
            price: 3500
          });
          break;
        case 'iui-d':
          details.push({
            id: procId,
            name: 'IUI-D (IUI with Donor)',
            price: 5500
          });
          break;
      }
    });

    return details;
  };

  const getTotalPrice = () => {
    let total = 0;
    selectedProcedures.forEach(procId => {
      if (procId === 'iui-self' && PROCEDURES.iui.subTypes) {
        total += PROCEDURES.iui.subTypes[0].price;
      } else if (procId === 'iui-donor' && PROCEDURES.iui.subTypes) {
        total += PROCEDURES.iui.subTypes[1].price;
      } else if (procId === 'cvs') {
        total += PROCEDURES.cvs.price;
      } else if (procId === 'prp') {
        total += PROCEDURES.prp.price;
      } else if (procId === 'lbc') {
        total += PROCEDURES.lbc.price;
      } else if (procId === 'lbc-hpv') {
        total += PROCEDURES.lbcHpv.price;
      } else if (procId === 'amniocentesis') {
        total += PROCEDURES.amniocentesis.price;
      } else if (procId === 'iui-h') {
        total += PROCEDURES.iuiH.price;
      } else if (procId === 'iui-d') {
        total += PROCEDURES.iuiD.price;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    if (selectedProcedures.length === 0) {
      alert('Please select at least one procedure');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    // Prepare data for API
    const procedureData = {
      patientId: selectedPatient._id,
      consultationId: null,
      procedures: getSelectedProceduresDetails().map(proc => ({
        procedureId: proc.id,
        name: proc.name,
        price: proc.price,
        subType: proc.type || null,
        description: ''
      })),
      notes: ''
    };

    try {
      let result;

      if (isExistingProcedure && existingProcedure?._id) {
        // Update existing procedure
        result = await dispatch(updateProcedure(existingProcedure._id, procedureData) as any);
        if (result?.status === 200) {
          setSuccessMessage('Procedures updated successfully!');
        }
      } else {
        // Create new procedure
        result = await dispatch(createProcedure(procedureData) as any);
        if (result?.status === 201 || result?.status === 200) {
          setSuccessMessage('Procedures saved successfully!');
          // After creating, set as existing
          setIsExistingProcedure(true);
        }
      }

      if (result?.status === 200 || result?.status === 201) {
        // Refresh the data
        if (selectedPatient) {
          await fetchPatientProcedures(selectedPatient._id);
        }

        // Hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(result?.message || 'Error submitting procedures. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting procedures. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Procedure | Dr. Yogita Verma" description="Patient Procedure Data" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Procedure Management
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Select and manage patient procedures
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className='mb-6'>
              <Alert
                variant="success"
                title="Success"
                message={successMessage}
                showLink={false}
              />
            </div>
          )}

          {/* Error Alert */}
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
            isExistingConsultation={isExistingProcedure}
            isLoading={isLoadingProcedure}
          />

          {/* Loading State */}
          {isLoadingProcedure && selectedPatient && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading procedures...</span>
            </div>
          )}

          {/* Procedures Selection */}
          {selectedPatient && !isLoadingProcedure && (
            <div className="mt-6 sm:mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Select Procedures
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Choose from the available procedures below
                      </p>
                    </div>
                    {isExistingProcedure && existingProcedure && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Editing Existing
                      </span>
                    )}
                  </div>
                  {existingProcedure && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <p>Last updated: {new Date(existingProcedure.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Procedures List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* IUI Section */}
                  <div className="p-4 sm:p-6">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === 'iui' ? null : 'iui')}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🔬</span>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          IUI (Intrauterine Insemination)
                        </h3>
                      </div>
                      <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {expandedCategory === 'iui' ? '▼' : '▶'}
                      </span>
                    </button>

                    {expandedCategory === 'iui' && (
                      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {/* Self (Husband) */}
                          <label className={`flex flex-col p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedIuiType === 'iui-self'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}>
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="iui-type"
                                checked={selectedIuiType === 'iui-self'}
                                onChange={() => handleIuiTypeSelect('iui-self')}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    Self (Husband)
                                  </span>
                                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    ₹3,500/-
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Using husband's sperm sample
                                </p>
                              </div>
                            </div>
                          </label>

                          {/* Donor Sperm */}
                          <label className={`flex flex-col p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedIuiType === 'iui-donor'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}>
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="iui-type"
                                checked={selectedIuiType === 'iui-donor'}
                                onChange={() => handleIuiTypeSelect('iui-donor')}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    Donor Sperm
                                  </span>
                                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    ₹5,500/-
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Using donor sperm sample
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CVS */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('cvs')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('cvs')}
                          onChange={() => handleProcedureToggle('cvs')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">🧬</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              CVS (Chorionic Villus Sampling)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Prenatal test for genetic disorders
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹12,000/-
                      </span>
                    </label>
                  </div>

                  {/* PRP */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('prp')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('prp')}
                          onChange={() => handleProcedureToggle('prp')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">💉</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              PRP (Platelet-Rich Plasma)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Therapy for ovarian rejuvenation
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹8,000/-
                      </span>
                    </label>
                  </div>

                  {/* LBC */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('lbc')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('lbc')}
                          onChange={() => handleProcedureToggle('lbc')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">🔍</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              LBC (Liquid Based Cytology)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Advanced pap smear test
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹2,500/-
                      </span>
                    </label>
                  </div>

                  {/* LBC + HPV DNA */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('lbc-hpv')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('lbc-hpv')}
                          onChange={() => handleProcedureToggle('lbc-hpv')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">🧪</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              LBC + HPV DNA
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Combined cervical cancer screening
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹4,500/-
                      </span>
                    </label>
                  </div>

                  {/* Amniocentesis */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('amniocentesis')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('amniocentesis')}
                          onChange={() => handleProcedureToggle('amniocentesis')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">💊</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Amniocentesis
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Prenatal diagnostic test
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹15,000/-
                      </span>
                    </label>
                  </div>

                  {/* IUI-H */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('iui-h')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('iui-h')}
                          onChange={() => handleProcedureToggle('iui-h')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">👨‍👩‍👧</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              IUI-H (IUI with Husband)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            IUI procedure using husband's sperm
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹3,500/-
                      </span>
                    </label>
                  </div>

                  {/* IUI-D */}
                  <div className="p-4 sm:p-6">
                    <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProcedures.includes('iui-d')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProcedures.includes('iui-d')}
                          onChange={() => handleProcedureToggle('iui-d')}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">🤝</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              IUI-D (IUI with Donor)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            IUI procedure using donor sperm
                          </p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 sm:mt-0 sm:ml-4">
                        ₹5,500/-
                      </span>
                    </label>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected Procedures
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProcedures.length > 0 ? (
                          selectedProcedures.map(proc => (
                            <span key={proc} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {proc === 'iui-self' && 'IUI (Self)'}
                              {proc === 'iui-donor' && 'IUI (Donor)'}
                              {proc === 'cvs' && 'CVS'}
                              {proc === 'prp' && 'PRP'}
                              {proc === 'lbc' && 'LBC'}
                              {proc === 'lbc-hpv' && 'LBC + HPV DNA'}
                              {proc === 'amniocentesis' && 'Amniocentesis'}
                              {proc === 'iui-h' && 'IUI-H'}
                              {proc === 'iui-d' && 'IUI-D'}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No procedures selected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        ₹{getTotalPrice()}/-
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || creating || updating || selectedProcedures.length === 0}
                    className={`w-full mt-4 px-4 py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 ${isSubmitting || creating || updating || selectedProcedures.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-700'
                      }`}
                  >
                    {isSubmitting || creating || updating
                      ? (isExistingProcedure ? 'Updating...' : 'Saving...')
                      : (isExistingProcedure ? 'Update Procedures' : 'Save Procedures')
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}