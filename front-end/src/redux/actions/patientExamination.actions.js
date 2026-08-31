import APIs from "../helper/api";
import { examinationConstants } from "./constants";

// Download Patient History PDF
export const downloadPatientExaminationPDF = (patientExaminationId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/patient-examination/download/${patientExaminationId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `patient_examination_summary_${patientExaminationId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Create Patient Examination
export const createPatientExamination = (examinationData) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.CREATE_PATIENT_EXAMINATION_REQUEST });

        const { data } = await APIs.post(`/patient-examination/create`, examinationData)

        dispatch({
            type: examinationConstants.CREATE_PATIENT_EXAMINATION_SUCCESS,
            payload: data.data
        });

        return {
            type: examinationConstants.CREATE_PATIENT_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.CREATE_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error creating patient examination'
        });

        return {
            type: examinationConstants.CREATE_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error creating patient examination'
        };
    }
};

// Get Patient Examination by Patient ID
export const getPatientExaminationByPatientId = (patientId) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.GET_PATIENT_EXAMINATION_REQUEST });

        const { data } = await APIs.get(`/patient-examination/patient/${patientId}`)

        dispatch({
            type: examinationConstants.GET_PATIENT_EXAMINATION_SUCCESS,
            payload: {
                patientExaminations: data.data,
                pagination: data.pagination
            },
        });

        return {
            type: examinationConstants.GET_PATIENT_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.GET_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching patient examination'
        });

        return {
            type: examinationConstants.GET_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching patient examination'
        };
    }
};

// Update Patient Examination
export const updatePatientExamination = (patientId, examinationData) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.UPDATE_PATIENT_EXAMINATION_REQUEST });
        const { data } = await APIs.put(`/patient-examination/update/${patientId}`, examinationData)

        dispatch({
            type: examinationConstants.UPDATE_PATIENT_EXAMINATION_SUCCESS,
            payload: data.data
        });

        return {
            type: examinationConstants.UPDATE_PATIENT_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.UPDATE_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error updating patient examination'
        });

        return {
            type: examinationConstants.UPDATE_PATIENT_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error updating patient examination'
        };
    }
};

// Clear Errors
export const clearExaminationErrors = () => (dispatch) => {
    dispatch({ type: examinationConstants.CLEAR_EXAMINATION_ERRORS });
};