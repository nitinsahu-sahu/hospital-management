// redux/actions/prescription.action.js
import APIs from "../helper/api";
import { prescriptionConstants } from "./constants";

// Download Patient History PDF
export const downloadPrescriptionPDF = (prescriptionId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/prescription/download/${prescriptionId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `prescription_summary_${prescriptionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};

// Get Prescriptions by Patient
export const getPrescriptionsByPatient = (patientId) => async (dispatch) => {
    try {
        dispatch({ type: prescriptionConstants.GET_PATIENT_REQUEST });

        const {data} = await APIs.get(`prescription/${patientId}`);

        dispatch({
            type: prescriptionConstants.GET_PATIENT_SUCCESS,
            payload: {
                prescriptions: data.data,
                pagination: data.pagination
            },
        });

        return {
            status: response.status,
            message: response.data.message,
            payload: data,
            type: prescriptionConstants.GET_PATIENT_SUCCESS,
        };
    } catch (error) {
        dispatch({
            type: prescriptionConstants.GET_PATIENT_FAILURE,
            payload: error.response?.data?.message || 'Error fetching prescriptions',
        });
        return {
            status: error.response?.status,
            message: error?.response?.data?.message
        };
    }
};

// Create Prescription
export const createPrescription = (prescriptionData) => async (dispatch) => {
    try {
        dispatch({ type: prescriptionConstants.CREATE_REQUEST });
        const response = await APIs.post("prescription", prescriptionData);
        const { data } = response.data;

        dispatch({
            type: prescriptionConstants.CREATE_SUCCESS,
            payload: data,
        });

        return {
            status: response.status,
            message: response.data.message,
            payload: data,
            type: prescriptionConstants.CREATE_SUCCESS,
        };
    } catch (error) {
        dispatch({
            type: prescriptionConstants.CREATE_FAILURE,
            payload: error.response?.data?.message || 'Error creating prescription',
        });
        return {
            status: error.response?.status,
            message: error?.response?.data?.message
        };
    }
};

// Update Prescription
export const updatePrescription = (id, prescriptionData) => async (dispatch) => {

    try {
        dispatch({ type: prescriptionConstants.UPDATE_REQUEST });
        const response = await APIs.put(`prescription/${id}`, prescriptionData);
        const { data } = response.data;

        dispatch({
            type: prescriptionConstants.UPDATE_SUCCESS,
            payload: data,
        });

        return {
            status: response.status,
            message: response.data.message,
            payload: data,
            type: prescriptionConstants.UPDATE_SUCCESS,
        };
    } catch (error) {
        dispatch({
            type: prescriptionConstants.UPDATE_FAILURE,
            payload: error.response?.data?.message || 'Error updating prescription',
        });
        return {
            status: error.response?.status,
            message: error?.response?.data?.message
        };
    }
};