import APIs from "../helper/api";
import { patientConstants } from "./constants";

export const createPatient = (data) => async (dispatch) => {

    dispatch({ type: patientConstants.CREATE_PATIENT_REQUEST });

    try {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        const response = await APIs.post("/patient/create", data, config);

        dispatch({
            type: patientConstants.CREATE_PATIENT_SUCCESS,
            payload: { message: response?.data?.message, data: response?.data?.data },
        });
        return {
            type: patientConstants.CREATE_PATIENT_SUCCESS,
            status: response.status,
            message: response?.data?.message,
            UH_ID: response?.data?.data?.UH_ID
        };

    } catch (error) {
        dispatch({
            type: patientConstants.CREATE_PATIENT_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error", error: error.status },
        });

        return {
            type: patientConstants.CREATE_PATIENT_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status
        };
    }
};

export const createRelative = (data) => async (dispatch) => {

    dispatch({ type: patientConstants.CREATE_RELATIVE_REQUEST });

    try {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        const response = await APIs.post("/patient/relative/create", data, config);

        dispatch({
            type: patientConstants.CREATE_RELATIVE_SUCCESS,
            payload: { message: response?.data?.message, data: response?.data?.data },
        });
        return {
            type: patientConstants.CREATE_RELATIVE_SUCCESS,
            status: response.status,
            message: response?.data?.message,
            UH_ID: response?.data?.data?.UH_ID
        };

    } catch (error) {
        dispatch({
            type: patientConstants.CREATE_RELATIVE_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error", error: error.status },
        });

        return {
            type: patientConstants.CREATE_RELATIVE_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status
        };
    }
};

export const patientsFetch = (page = 1, limit = 10, search = "") => async (dispatch) => {
    dispatch({ type: patientConstants.GET_REQUEST });

    try {
        const response = await APIs.get(`/patient?page=${page}&limit=${limit}&search=${search}`);

        dispatch({
            type: patientConstants.GET_SUCCESS,
            payload: {
                pagination: response?.data?.data.pagination,
                patients: response?.data?.data.patients,
                message: response?.data?.message,
            },

        });
    } catch (error) {
        dispatch({
            type: patientConstants.GET_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error", error: error.status },
        });
    }
};

export const searchPatientsFetch = (page = 1, limit = 10, search = "") => async (dispatch) => {
    dispatch({ type: patientConstants.GET_SEARCH_REQUEST });

    try {
        const response = await APIs.get(`/patient?page=${page}&limit=${limit}&search=${search}`);

        dispatch({
            type: patientConstants.GET_SEARCH_SUCCESS,
            payload: {
                searchPatients: response?.data?.data.patients,
                message: response?.data?.message,
            },

        });
    } catch (error) {
        dispatch({
            type: patientConstants.GET_SEARCH_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error", error: error.status },
        });
    }
};

/**
 * UPDATE PATIENT
 * Endpoint: PUT /api/patient/:id
 * Sends JSON data (not multipart/form-data unless uploading files)
 */
export const updatePatient = (id, data) => async (dispatch) => {
    dispatch({ type: patientConstants.UPDATE_PATIENT_REQUEST });

    try {
        const response = await APIs.put(`/patient/${id}`, data);

        dispatch({
            type: patientConstants.UPDATE_PATIENT_SUCCESS,
            payload: { 
                message: response?.data?.message, 
                data: response?.data?.data 
            },
        });

        return {
            type: patientConstants.UPDATE_PATIENT_SUCCESS,
            status: response.status,
            message: response?.data?.message,
            patient: response?.data?.data,
        };

    } catch (error) {
        dispatch({
            type: patientConstants.UPDATE_PATIENT_FAILURE,
            payload: { 
                message: error?.response?.data?.message || "Server error", 
                error: error.status 
            },
        });

        return {
            type: patientConstants.UPDATE_PATIENT_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status,
        };
    }
};

/**
 * DELETE PATIENT
 * Endpoint: DELETE /api/patient/:id
 */
export const deletePatient = (id) => async (dispatch) => {
    dispatch({ type: patientConstants.DELETE_PATIENT_REQUEST });

    try {
        const response = await APIs.delete(`/patient/${id}`);

        dispatch({
            type: patientConstants.DELETE_PATIENT_SUCCESS,
            payload: { 
                message: response?.data?.message,
                patientId: id,
            },
        });

        return {
            type: patientConstants.DELETE_PATIENT_SUCCESS,
            status: response.status,
            message: response?.data?.message,
        };

    } catch (error) {
        dispatch({
            type: patientConstants.DELETE_PATIENT_FAILURE,
            payload: { 
                message: error?.response?.data?.message || "Server error", 
                error: error.status 
            },
        });

        return {
            type: patientConstants.DELETE_PATIENT_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status,
        };
    }
};