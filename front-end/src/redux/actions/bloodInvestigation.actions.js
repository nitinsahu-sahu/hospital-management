import APIs from "../helper/api";
import { investigationConstants } from "./constants";


export const downloadRoutinePDF = (routineId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/blood-investigations/download/${routineId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `routine_summary_${routineId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Create Blood Investigation
export const createBloodInvestigation = (investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.CREATE_BLOOD_INVESTIGATION_REQUEST });

        const { data } = await APIs.post(`/blood-investigations`, investigationData);

        dispatch({
            type: investigationConstants.CREATE_BLOOD_INVESTIGATION_SUCCESS,
             payload: {
                routines:data.data,
                pagination:data.pagination
            },
        });

        return { type: investigationConstants.CREATE_BLOOD_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.CREATE_BLOOD_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.CREATE_BLOOD_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Get Blood Investigation by Patient ID
export const getBloodInvestigationByPatientId = (patientId, category) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.GET_BLOOD_INVESTIGATION_REQUEST });

        const url = category
            ? `/blood-investigations/patient/${patientId}?category=${category}`
            : `/blood-investigations/patient/${patientId}`;

        const { data } = await APIs.get(url);

        dispatch({
            type: investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS,
             payload: {
                routinesBlood:data.data,
                pagination:data.pagination
            },
        });

        return { type: investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.GET_BLOOD_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.GET_BLOOD_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Update Blood Investigation
export const updateBloodInvestigation = (id, investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.UPDATE_BLOOD_INVESTIGATION_REQUEST });

        const { data } = await APIs.put(`/blood-investigations/${id}`, investigationData);

        dispatch({
            type: investigationConstants.UPDATE_BLOOD_INVESTIGATION_SUCCESS,
            payload: data.data
        });

        return { type: investigationConstants.UPDATE_BLOOD_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.UPDATE_BLOOD_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.UPDATE_BLOOD_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Clear Error
export const clearBloodInvestigationError = () => (dispatch) => {
    dispatch({ type: investigationConstants.CLEAR_BLOOD_INVESTIGATION_ERROR });
};