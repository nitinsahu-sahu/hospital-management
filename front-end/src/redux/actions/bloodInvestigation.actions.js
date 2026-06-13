import APIs from "../helper/api";
import { investigationConstants } from "./constants";


// Create Blood Investigation
export const createBloodInvestigation = (investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.CREATE_BLOOD_INVESTIGATION_REQUEST });

        const { data } = await APIs.post(`/blood-investigations`, investigationData);

        dispatch({
            type: investigationConstants.CREATE_BLOOD_INVESTIGATION_SUCCESS,
            payload: data.data
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
            payload: data.data
        });

        return { type: investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        if (error.response?.status === 404) {
            dispatch({
                type: investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS,
                payload: null
            });
            return { type: investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS, payload: null };
        }

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