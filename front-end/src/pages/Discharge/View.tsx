import { useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard"
import Alert from '../../components/ui/alert/Alert';

export interface SelectedPatient {
    _id: string;
    name: string;
    UH_ID: string;
    pic?: {
        url: string;
    };
    mobileNumber?: string;
    relative?: {
        _id?: string
    }
}

const ViewDischarge = () => {
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);

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
    
                            setSelectedPatient(patient);
                        }
                    } catch (error) {
                        if (currentPatientIdRef.current !== null) {
                            currentPatientIdRef.current = null;
                            setSelectedPatient(null);
                        }
                    }
                } else {
                    // No patient in session
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
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
        }, []);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            {/* Messages */}
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
            {error && (
                <div className='mb-6'>
                    <Alert
                        variant="error"
                        title="Error"
                        message={error}
                        showLink={false}
                    />
                </div>
            )}

            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />
        </div>
    )
}

export default ViewDischarge