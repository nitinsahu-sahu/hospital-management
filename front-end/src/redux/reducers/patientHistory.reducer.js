import { patientHistoryConstants } from "../actions/constants";


const initialState = {
  loading: false,
  error: null,
  patientHistory: null,
  patientHistories: [],
  pagination:{},
  creating: false,
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
        patientHistories: action.payload.patientHistories,
        pagination: action.payload.pagination,
        error: null,
      };
    case patientHistoryConstants.PATIENT_HISTORY_GET_FAILURE:
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
