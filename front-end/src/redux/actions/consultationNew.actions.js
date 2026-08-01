import APIs from "../helper/api";
import { consultationNewConstants } from "./constants";

// Download Cousultation PDF
export const downloadConsultancyPDF = (consultationId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/consultation/new/download/${consultationId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `consultation_summary_${consultationId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Create consultation
export const createConsultation = (consultationData) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.CREATE_CONSULTATION_REQUEST });

    try {
        const response = await APIs.post("/consultation/new/create", consultationData);
        const { data } = response.data;

        dispatch({
            type: consultationNewConstants.CREATE_CONSULTATION_SUCCESS,
            payload: data,
        });

        return {
            status: response.status,
            message: response.data.message,
            payload: data
        };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.CREATE_CONSULTATION_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

// Get all consultations for a patient
export const getConsultationsByPatientId = (patientId, page = 1, limit = 10) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_REQUEST });

    try {
        const response = await APIs.get(`/consultation/new/patient/${patientId}?page=${page}&limit=${limit}`);
        const { data, pagination } = response.data;

        dispatch({
            type: consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_SUCCESS,
            payload: { consultations: data, pagination },
        });
        return {
            type: consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_SUCCESS,
            status: response.status,
            payload: { consultations: data, pagination },
        };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return {
            type: consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_FAILURE,
            message: error?.response?.data?.message || "Server error",
        };
    }
};

// Get single consultation by ID
export const getConsultationById = (id) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.GET_CONSULTATION_BY_ID_REQUEST });

    try {
        const response = await APIs.get(`/consultation/new/${id}`);
        const { data } = response.data;

        dispatch({
            type: consultationNewConstants.GET_CONSULTATION_BY_ID_SUCCESS,
            payload: data,
        });
        return {
            type: consultationNewConstants.GET_CONSULTATION_BY_ID_SUCCESS,
            status: response.status,
            payload: data,
        };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.GET_CONSULTATION_BY_ID_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return {
            type: consultationNewConstants.GET_CONSULTATION_BY_ID_FAILURE,
            message: error?.response?.data?.message || "Server error",
        };
    }
};

// Update consultation
export const updateConsultation = (id, updateData) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.UPDATE_CONSULTATION_REQUEST });

    try {
        const response = await APIs.put(`/consultation/new/${id}`, updateData);
        const { data } = response.data;

        dispatch({
            type: consultationNewConstants.UPDATE_CONSULTATION_SUCCESS,
            payload: data,
        });
        return { status: response.status, message: response.data.message, payload: data };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.UPDATE_CONSULTATION_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

// Add additional fee
export const addAdditionalFee = (id, feeData) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.ADD_ADDITIONAL_FEE_REQUEST });

    try {
        const response = await APIs.post(`/consultation/new/${id}/additional-fee`, feeData);
        const { data } = response.data;

        dispatch({
            type: consultationNewConstants.ADD_ADDITIONAL_FEE_SUCCESS,
            payload: data,
        });
        return { status: response.status, message: response.data.message, payload: data };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.ADD_ADDITIONAL_FEE_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

// Delete consultation
export const deleteConsultation = (id) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.DELETE_CONSULTATION_REQUEST });

    try {
        await APIs.delete(`/consultation/new/${id}`);

        dispatch({
            type: consultationNewConstants.DELETE_CONSULTATION_SUCCESS,
            payload: id,
        });
        return { status: 200, message: 'Consultation deleted successfully' };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.DELETE_CONSULTATION_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

// Get patient consultation statistics
export const getPatientConsultationStats = (patientId) => async (dispatch) => {
    dispatch({ type: consultationNewConstants.GET_CONSULTATION_STATS_REQUEST });

    try {
        const response = await APIs.get(`/consultation/new/patient/${patientId}/stats`);
        const { data } = response.data;

        dispatch({
            type: consultationNewConstants.GET_CONSULTATION_STATS_SUCCESS,
            payload: data,
        });
        return {
            type: consultationNewConstants.GET_CONSULTATION_STATS_SUCCESS,
            status: response.status,
            payload: data,
        };
    } catch (error) {
        dispatch({
            type: consultationNewConstants.GET_CONSULTATION_STATS_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return {
            type: consultationNewConstants.GET_CONSULTATION_STATS_FAILURE,
            message: error?.response?.data?.message || "Server error",
        };
    }
};