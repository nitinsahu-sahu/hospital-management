import APIs from "../helper/api";
import { investigationConstants } from "./constants";


// Download Patient History PDF
export const downloadUltrasoundPDF = (ultrasoundId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/investigations/download/${ultrasoundId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ultrasound_summary_${ultrasoundId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Create Investigation
export const createInvestigation = (investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.CREATE_INVESTIGATION_REQUEST });

        const { data } = await APIs.post(`/investigations`, investigationData);

        dispatch({
            type: investigationConstants.CREATE_INVESTIGATION_SUCCESS,
            payload: data.data
        });

        return { type: investigationConstants.CREATE_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.CREATE_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.CREATE_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Get Investigation by Patient ID
export const getInvestigationByPatientId = (patientId) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.GET_INVESTIGATION_REQUEST });

        const { data } = await APIs.get(`/investigations/patient/${patientId}`);

        dispatch({
            type: investigationConstants.GET_INVESTIGATION_SUCCESS,
            payload: {
                ultrasounds:data.data,
                pagination:data.pagination
            },
        });

        return { type: investigationConstants.GET_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        if (error.response?.status === 404) {
            // No investigation found - this is not an error, just no data
            dispatch({
                type: investigationConstants.GET_INVESTIGATION_SUCCESS,
                payload: null
            });
            return { type: investigationConstants.GET_INVESTIGATION_SUCCESS, payload: null };
        }

        dispatch({
            type: investigationConstants.GET_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.GET_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Update Investigation
export const updateInvestigation = (id, investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.UPDATE_INVESTIGATION_REQUEST });

        const { data } = await APIs.put(`/investigations/${id}`, investigationData);

        dispatch({
            type: investigationConstants.UPDATE_INVESTIGATION_SUCCESS,
            payload: data.data
        });

        return { type: investigationConstants.UPDATE_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.UPDATE_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.UPDATE_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Clear Error
export const clearInvestigationError = () => (dispatch) => {
    dispatch({ type: investigationConstants.CLEAR_INVESTIGATION_ERROR });
};