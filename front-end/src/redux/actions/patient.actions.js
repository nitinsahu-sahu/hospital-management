import APIs from "../helper/api";
import { patientConstants } from "./constants";

export const createPatient = (data) => async (dispatch) => {

    dispatch({ type: patientConstants.CREATE_PATIENT_REQUEST });

    try {
        const response = await APIs.post("/auth/patient/create", data);

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
        const response = await APIs.post("/auth/relative/create", data);

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