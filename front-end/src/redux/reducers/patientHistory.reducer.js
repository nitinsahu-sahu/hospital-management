import { patientHistoryConstants } from "../actions/constants";


const initialState = {
  loading: false,
  error: null,
  patientHistory: null,
  patientHistories: [],
  totalPages: 0,
  currentPage: 1,
  creating: false,
    updating: false,
  success: false,
};

const patientHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // Create
    case patientHistoryConstants.PATIENT_HISTORY_CREATE_REQUEST:
      return {
        ...state,
        creating: true,
        loading: true,
        error: null,
        success: false,
      };
    case patientHistoryConstants.PATIENT_HISTORY_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        creating: false,
        success: true,
        patientHistory: action.payload,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        creating: false
      };
    case patientHistoryConstants.PATIENT_HISTORY_CREATE_RESET:
      return {
        ...state,
        loading: false,
        error: null,
        success: false,
      };

    // Get Single
    case patientHistoryConstants.PATIENT_HISTORY_GET_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        patientHistory: action.payload,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_GET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update
    case patientHistoryConstants.PATIENT_HISTORY_UPDATE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case patientHistoryConstants.PATIENT_HISTORY_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        patientHistory: action.payload,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };
    case patientHistoryConstants.PATIENT_HISTORY_UPDATE_RESET:
      return {
        ...state,
        loading: false,
        error: null,
        success: false,
      };

    // Delete
    case patientHistoryConstants.PATIENT_HISTORY_DELETE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        patientHistory: null,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_DELETE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // List
    case patientHistoryConstants.PATIENT_HISTORY_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        patientHistories: action.payload.docs || action.payload,
        totalPages: action.payload.totalPages || 0,
        currentPage: action.payload.page || 1,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default patientHistoryReducer;
