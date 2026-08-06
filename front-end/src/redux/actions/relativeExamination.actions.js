import APIs from "../helper/api";
import { examinationConstants } from "./constants";

// Download Patient History PDF
export const downloadRelativeExaminationPDF = (relativeExaminationId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/relative-examination/download/${relativeExaminationId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relative_examination_summary_${relativeExaminationId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Create Relative Examination
export const createRelativeExamination = (patientId, relativeId, examinationData) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.CREATE_RELATIVE_EXAMINATION_REQUEST });


        const { data } = await APIs.post(`/relative-examination/create/${patientId}/${relativeId}`, examinationData)

        dispatch({
            type: examinationConstants.CREATE_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        });

        return {
            type: examinationConstants.CREATE_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        console.log(error);
        
        dispatch({
            type: examinationConstants.CREATE_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error creating relative examination'
        });

        return {
            type: examinationConstants.CREATE_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error creating relative examination'
        };
    }
};

// Get Relative Examination by Patient ID
export const getRelativeExaminationByPatientId = (patientId) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.GET_RELATIVE_EXAMINATION_REQUEST });

        const { data } = await APIs.get(`/relative-examination/patient/${patientId}`)

        dispatch({
            type: examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS,
             payload: {
                relativeExaminations: data.data,
                pagination: data.pagination
            },
        });

        return {
            type: examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.GET_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching relative examinations'
        });

        return {
            type: examinationConstants.GET_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching relative examinations'
        };
    }
};

// Get Relative Examination by Relative ID
export const getRelativeExaminationByRelativeId = (relativeId) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.GET_RELATIVE_EXAMINATION_REQUEST });
        const { data } = await APIs.get(`/relative-examination/relative/${relativeId}`)

        dispatch({
            type: examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        });

        return {
            type: examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.GET_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching relative examination'
        });

        return {
            type: examinationConstants.GET_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error fetching relative examination'
        };
    }
};

// Update Relative Examination
export const updateRelativeExamination = (relativeId, examinationData) => async (dispatch) => {
    try {
        dispatch({ type: examinationConstants.UPDATE_RELATIVE_EXAMINATION_REQUEST });

        const { data } = await APIs.put(`/relative-examination/update/${relativeId}`,examinationData)

        dispatch({
            type: examinationConstants.UPDATE_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        });

        return {
            type: examinationConstants.UPDATE_RELATIVE_EXAMINATION_SUCCESS,
            payload: data.data
        };
    } catch (error) {
        dispatch({
            type: examinationConstants.UPDATE_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error updating relative examination'
        });

        return {
            type: examinationConstants.UPDATE_RELATIVE_EXAMINATION_FAILURE,
            payload: error.response?.data?.message || 'Error updating relative examination'
        };
    }
};

// Clear Errors
export const clearExaminationErrors = () => (dispatch) => {
    dispatch({ type: examinationConstants.CLEAR_EXAMINATION_ERRORS });
};