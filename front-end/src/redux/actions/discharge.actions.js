import APIs from "../helper/api";
import { dischargeConstants } from "./constants";

// Create or update discharge summary
export const createDischarge = (dischargeData) => async (dispatch) => {
    try {
        dispatch({ type: dischargeConstants.DISCHARGE_CREATE_REQUEST });

        const {data} = await APIs.post("/discharge/create", dischargeData);
        dispatch({
            type: dischargeConstants.DISCHARGE_CREATE_SUCCESS,
            payload: data
        });

        return {
            type: dischargeConstants.DISCHARGE_CREATE_SUCCESS,
            status: 200
        };
    } catch (error) {
        dispatch({
            type: dischargeConstants.DISCHARGE_CREATE_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        throw error;
    }
};

// Get full discharge data
export const getDischargeData = (patientId) => async (dispatch) => {
    try {
        dispatch({ type: dischargeConstants.DISCHARGE_DATA_REQUEST });

        const response = await APIs.get(`/discharge/patient/${patientId}`);
        const { data } = response.data;

        dispatch({
            type: dischargeConstants.DISCHARGE_DATA_SUCCESS,
            payload: data
        });
        return ({
            type: dischargeConstants.DISCHARGE_DATA_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: dischargeConstants.DISCHARGE_DATA_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        throw error;
    }
};

// Download discharge PDF
export const downloadDischargePDF = (patientId, consultationId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/discharge/download/${patientId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `discharge_summary_${patientId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Get discharge list
export const getDischargeList = (page = 1, limit = 20, status) => async (dispatch) => {
    try {
        dispatch({ type: dischargeConstants.DISCHARGE_LIST_REQUEST });


        let url = `${API_URL}/discharge/list?page=${page}&limit=${limit}`;

        const response = await APIs.get(url);
        const { data } = response.data;
        dispatch({
            type: dischargeConstants.DISCHARGE_LIST_SUCCESS,
            payload: data
        });

        return data;
    } catch (error) {
        dispatch({
            type: dischargeConstants.DISCHARGE_LIST_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        throw error;
    }
};

// Clear errors
export const clearErrors = () => async (dispatch) => {
    dispatch({ type: dischargeConstants.DISCHARGE_CLEAR_ERRORS });
};

export const updateDischarge = (id, updateData) => async (dispatch) => {

    dispatch({ type: dischargeConstants.UPDATE_DISCHARGE_REQUEST });

    try {
        const response = await APIs.put(`/discharge/${id}`, updateData);
        const { data } = response.data;

        dispatch({
            type: dischargeConstants.UPDATE_DISCHARGE_SUCCESS,
            payload: data,
        });
        return { status: response.status, message: response.data.message };
    } catch (error) {
        dispatch({
            type: dischargeConstants.UPDATE_DISCHARGE_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};