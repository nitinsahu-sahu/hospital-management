import APIs from "../helper/api";
import { procedureConstants } from "./constants";

export const createProcedure = (procedureData) => async (dispatch) => {
  dispatch({ type: procedureConstants.CREATE_PROCEDURE_REQUEST });

  try {
    const response = await APIs.post("/procedure/create", procedureData);
    const { data } = response.data;

    dispatch({
      type: procedureConstants.CREATE_PROCEDURE_SUCCESS,
      payload: data,
    });
    return { 
      status: response.status, 
      message: response.data.message,
      data: data 
    };
  } catch (error) {
    dispatch({
      type: procedureConstants.CREATE_PROCEDURE_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
    return { 
      status: error.response?.status, 
      message: error?.response?.data?.message || "Server error" 
    };
  }
};

export const getAllProcedures = (filters = {}) => async (dispatch) => {
  dispatch({ type: procedureConstants.GET_ALL_PROCEDURES_REQUEST });

  try {
    const queryParams = new URLSearchParams();
    if (filters.patientId) queryParams.append('patientId', filters.patientId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await APIs.get(`/procedure/all?${queryParams.toString()}`);
    const { data } = response.data;

    dispatch({
      type: procedureConstants.GET_ALL_PROCEDURES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: procedureConstants.GET_ALL_PROCEDURES_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
  }
};

export const getProcedureById = (id) => async (dispatch) => {
  dispatch({ type: procedureConstants.GET_PROCEDURE_BY_ID_REQUEST });

  try {
    const response = await APIs.get(`/procedure/${id}`);
    const { data } = response.data;

    dispatch({
      type: procedureConstants.GET_PROCEDURE_BY_ID_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: procedureConstants.GET_PROCEDURE_BY_ID_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
  }
};

export const getProceduresByPatientId = (patientId) => async (dispatch) => {
  dispatch({ type: procedureConstants.GET_PROCEDURES_BY_PATIENT_REQUEST });

  try {
    const response = await APIs.get(`/procedure/patient/${patientId}`);
    const { data } = response.data;

    dispatch({
      type: procedureConstants.GET_PROCEDURES_BY_PATIENT_SUCCESS,
      payload: { 
        patientId, 
        procedures: data
      },
    });
    return { status: response.status, data: data };
  } catch (error) {
    dispatch({
      type: procedureConstants.GET_PROCEDURES_BY_PATIENT_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
    return { status: error.response?.status, message: error?.response?.data?.message };
  }
};

export const updateProcedure = (id, updateData) => async (dispatch) => {
  dispatch({ type: procedureConstants.UPDATE_PROCEDURE_REQUEST });

  try {
    const response = await APIs.put(`/procedure/${id}`, updateData);
    const { data } = response.data;

    dispatch({
      type: procedureConstants.UPDATE_PROCEDURE_SUCCESS,
      payload: data,
    });
    return { status: response.status, message: response.data.message };
  } catch (error) {
    dispatch({
      type: procedureConstants.UPDATE_PROCEDURE_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
    return { status: error.response?.status, message: error?.response?.data?.message };
  }
};

export const deleteProcedure = (id) => async (dispatch) => {
  dispatch({ type: procedureConstants.DELETE_PROCEDURE_REQUEST });

  try {
    const response = await APIs.delete(`/procedure/${id}`);
    dispatch({
      type: procedureConstants.DELETE_PROCEDURE_SUCCESS,
      payload: id,
    });
    return { status: response.status, message: response.data.message };
  } catch (error) {
    dispatch({
      type: procedureConstants.DELETE_PROCEDURE_FAILURE,
      payload: { message: error?.response?.data?.message || "Server error" },
    });
    return { status: error.response?.status, message: error?.response?.data?.message };
  }
};