import APIs from "../helper/api";
import { patientHistoryConstants } from "./constants";

// Create Patient History
export const createPatientHistory = (patientHistoryData) => async (dispatch, getState) => {
    try {
        dispatch({ type: patientHistoryConstants.PATIENT_HISTORY_CREATE_REQUEST });

        const { data } = await APIs.post("/patient-history",patientHistoryData);

        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_CREATE_SUCCESS,
            payload: data.data,
        });

        return data;
    } catch (error) {
        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_CREATE_FAILURE,
            payload: error.response?.data?.message || 'Error creating patient history',
        });
        throw error;
    }
};

// Get Patient History by Patient ID
export const getPatientHistoryByPatientId = (patientId) => async (dispatch, getState) => {
    try {
        dispatch({ type: patientHistoryConstants.PATIENT_HISTORY_GET_REQUEST });

        const { data } = await APIs.get(
            `/patient-history/patient/${patientId}`,
        );

        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_GET_SUCCESS,
            payload: data.data,
        });

        return {
            type: patientHistoryConstants.PATIENT_HISTORY_GET_SUCCESS,
            payload: data.data,
        };
    } catch (error) {
        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_GET_FAILURE,
            payload: error.response?.data?.message || 'Error fetching patient history',
        });
        throw error;
    }
};

// Update Patient History
export const updatePatientHistory = (patientId, patientHistoryData) => async (dispatch, getState) => {
    try {
        dispatch({ type: patientHistoryConstants.PATIENT_HISTORY_UPDATE_REQUEST });

        const { data } = await APIs.put(
            `/patient-history/patient/${patientId}`,
            patientHistoryData,
        );

        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_UPDATE_SUCCESS,
            payload: data.data,
        });

        return data;
    } catch (error) {
        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_UPDATE_FAILURE,
            payload: error.response?.data?.message || 'Error updating patient history',
        });
        throw error;
    }
};

// Delete Patient History
export const deletePatientHistory = (patientId) => async (dispatch, getState) => {
    try {
        dispatch({ type: patientHistoryConstants.PATIENT_HISTORY_DELETE_REQUEST });


        const { data } = await APIs.delete(
            `/patient-history/patient/${patientId}`,
        );

        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_DELETE_SUCCESS,
            payload: data,
        });

        return data;
    } catch (error) {
        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_DELETE_FAILURE,
            payload: error.response?.data?.message || 'Error deleting patient history',
        });
        throw error;
    }
};

// Get All Patient Histories
export const getAllPatientHistories = (params) => async (dispatch, getState) => {
    try {
        dispatch({ type: patientHistoryConstants.PATIENT_HISTORY_LIST_REQUEST });


        const { data } = await APIs.get(
            `${API_URL}/patient-history`,
        );

        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_LIST_SUCCESS,
            payload: data.data,
        });

        return data;
    } catch (error) {
        dispatch({
            type: patientHistoryConstants.PATIENT_HISTORY_LIST_FAILURE,
            payload: error.response?.data?.message || 'Error fetching patient histories',
        });
        throw error;
    }
};