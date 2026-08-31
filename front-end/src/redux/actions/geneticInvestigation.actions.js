import APIs from "../helper/api";
import { investigationConstants } from "./constants";


export const downloadGeneticPDF = (geneticId) => async (dispatch) => {
    try {
        const config = {
            responseType: 'blob'
        };
        const response = await APIs.get(`/genetic-investigations/download/${geneticId}`, config);
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `genetic_summary_${geneticId}.pdf`);
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
export const createGeneticInvestigation = (investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.CREATE_GENETIC_INVESTIGATION_REQUEST });

        const { data } = await APIs.post(`/genetic-investigations`, investigationData);

        dispatch({
            type: investigationConstants.CREATE_GENETIC_INVESTIGATION_SUCCESS,
             payload: {
                genetics:data.data,
                pagination:data.pagination
            },
        });

        return { type: investigationConstants.CREATE_GENETIC_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.CREATE_GENETIC_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.CREATE_GENETIC_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Get Genetic Investigation by Patient ID
export const getGeneticInvestigationByPatientId = (patientId, category) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.GET_GENETIC_INVESTIGATION_REQUEST });

        const url = category
            ? `/genetic-investigations/patient/${patientId}?category=${category}`
            : `/genetic-investigations/patient/${patientId}`;

        const { data } = await APIs.get(url);

        dispatch({
            type: investigationConstants.GET_GENETIC_INVESTIGATION_SUCCESS,
             payload: {
                geneticsBlood:data.data,
                pagination:data.pagination
            },
        });

        return { type: investigationConstants.GET_GENETIC_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        if (error.response?.status === 404) {
            dispatch({
                type: investigationConstants.GET_GENETIC_INVESTIGATION_SUCCESS,
                payload: null
            });
            return { type: investigationConstants.GET_GENETIC_INVESTIGATION_SUCCESS, payload: null };
        }

        dispatch({
            type: investigationConstants.GET_GENETIC_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.GET_GENETIC_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Update Genetic Investigation
export const updateGeneticInvestigation = (id, investigationData) => async (dispatch) => {
    try {
        dispatch({ type: investigationConstants.UPDATE_GENETIC_INVESTIGATION_REQUEST });

        const { data } = await APIs.put(`/genetic-investigations/${id}`, investigationData);

        dispatch({
            type: investigationConstants.UPDATE_GENETIC_INVESTIGATION_SUCCESS,
            payload: data.data
        });

        return { type: investigationConstants.UPDATE_GENETIC_INVESTIGATION_SUCCESS, payload: data.data };
    } catch (error) {
        dispatch({
            type: investigationConstants.UPDATE_GENETIC_INVESTIGATION_FAILURE,
            payload: error.response?.data?.message || error.message
        });
        return { type: investigationConstants.UPDATE_GENETIC_INVESTIGATION_FAILURE, payload: error.response?.data?.message || error.message };
    }
};

// Clear Error
export const clearGeneticInvestigationError = () => (dispatch) => {
    dispatch({ type: investigationConstants.CLEAR_GENETIC_INVESTIGATION_ERROR });
};