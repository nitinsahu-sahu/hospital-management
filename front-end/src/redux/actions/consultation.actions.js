import APIs from "../helper/api";
import { consultationConstants } from "./constants";

export const getConsultationByPatientId = (patientId) => async (dispatch) => {
    dispatch({ type: consultationConstants.GET_CONSULTATION_BY_PATIENT_ID_REQUEST });

    try {
        const response = await APIs.get(`/consultation/patient/${patientId}`);
        const { data } = response.data;

        dispatch({
            type: consultationConstants.GET_CONSULTATION_BY_PATIENT_ID_SUCCESS,
            payload: data,
        });
        return {
            type: consultationConstants.GET_CONSULTATION_BY_PATIENT_ID_SUCCESS,
            status: response.status,
            message: response?.data?.message,
            payload: data,
        };
    } catch (error) {
        dispatch({
            type: consultationConstants.GET_CONSULTATION_BY_PATIENT_ID_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return {
            type: consultationConstants.GET_CONSULTATION_BY_PATIENT_ID_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status,
        };
    }
};

export const updateConsultation = (id, updateData) => async (dispatch) => {

    dispatch({ type: consultationConstants.UPDATE_CONSULTATION_REQUEST });

    try {
        const response = await APIs.put(`/consultation/${id}`, updateData);
        const { data } = response.data;

        dispatch({
            type: consultationConstants.UPDATE_CONSULTATION_SUCCESS,
            payload: data,
        });
        return { status: response.status, message: response.data.message };
    } catch (error) {
        dispatch({
            type: consultationConstants.UPDATE_CONSULTATION_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

export const createConsultation = (consultationData) => async (dispatch) => {
    dispatch({ type: consultationConstants.CREATE_CONSULTATION_REQUEST });

    try {
        const response = await APIs.post("/consultation/create", consultationData);
        const { data } = response.data;

        dispatch({
            type: consultationConstants.CREATE_CONSULTATION_SUCCESS,
            payload: data,
        });
        dispatch(getConsultationByPatientId(data?.patientId))

        return {
            status: response.status,
            message: response.data.message,
            payload: data
        };
    } catch (error) {
        dispatch({
            type: consultationConstants.CREATE_CONSULTATION_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error" },
        });
        return { status: error.response?.status, message: error?.response?.data?.message };
    }
};

// export const getAllConsultations = () => async (dispatch) => {
//     dispatch({ type: consultationConstants.GET_ALL_CONSULTATIONS_REQUEST });

//     try {
//         const response = await APIs.get("/consultation/all");
//         const { data } = response.data;

//         dispatch({
//             type: consultationConstants.GET_ALL_CONSULTATIONS_SUCCESS,
//             payload: data,
//         });
//     } catch (error) {
//         dispatch({
//             type: consultationConstants.GET_ALL_CONSULTATIONS_FAILURE,
//             payload: { message: error?.response?.data?.message || "Server error" },
//         });
//     }
// };

// export const getConsultationById = (id) => async (dispatch) => {
//     dispatch({ type: consultationConstants.GET_CONSULTATION_BY_ID_REQUEST });

//     try {
//         const response = await APIs.get(`/consultation/${id}`);
//         const { data } = response.data;

//         dispatch({
//             type: consultationConstants.GET_CONSULTATION_BY_ID_SUCCESS,
//             payload: data,
//         });
//     } catch (error) {
//         dispatch({
//             type: consultationConstants.GET_CONSULTATION_BY_ID_FAILURE,
//             payload: { message: error?.response?.data?.message || "Server error" },
//         });
//     }
// };

// export const addAdditionalFee = (id, feeData) => async (dispatch) => {
//     dispatch({ type: consultationConstants.ADD_ADDITIONAL_FEE_REQUEST });

//     try {
//         const response = await APIs.put(`/consultation/${id}/add-fee`, feeData);
//         const { data } = response.data;

//         dispatch({
//             type: consultationConstants.ADD_ADDITIONAL_FEE_SUCCESS,
//             payload: data,
//         });
//         return { status: response.status, message: response.data.message };
//     } catch (error) {
//         dispatch({
//             type: consultationConstants.ADD_ADDITIONAL_FEE_FAILURE,
//             payload: { message: error?.response?.data?.message || "Server error" },
//         });
//         return { status: error.response?.status, message: error?.response?.data?.message };
//     }
// };

// export const deleteConsultation = (id) => async (dispatch) => {
//     dispatch({ type: consultationConstants.DELETE_CONSULTATION_REQUEST });

//     try {
//         const response = await APIs.delete(`/consultation/${id}`);
//         dispatch({
//             type: consultationConstants.DELETE_CONSULTATION_SUCCESS,
//             payload: id, // Delete karne ke baad state se hatane ke liye id bhejna kaafi hai
//         });
//         return { status: response.status, message: response.data.message };
//     } catch (error) {
//         dispatch({
//             type: consultationConstants.DELETE_CONSULTATION_FAILURE,
//             payload: { message: error?.response?.data?.message || "Server error" },
//         });
//         return { status: error.response?.status, message: error?.response?.data?.message };
//     }
// };