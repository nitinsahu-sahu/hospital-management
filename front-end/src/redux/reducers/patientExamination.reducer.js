import { examinationConstants } from "../actions/constants";


const initialState = {
  loading: false,
  error: null,
  patientExaminations: [],
  pagination:{},
  success: false
};

export const patientExaminationReducer = (state = initialState, action) => {
  switch (action.type) {
    case examinationConstants.CREATE_PATIENT_EXAMINATION_REQUEST:
    case examinationConstants.GET_PATIENT_EXAMINATION_REQUEST:
    case examinationConstants.UPDATE_PATIENT_EXAMINATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case examinationConstants.CREATE_PATIENT_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        examination: action.payload,
        success: true,
        error: null
      };

    case examinationConstants.GET_PATIENT_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        patientExaminations: action.payload.patientExaminations,
        pagination: action.payload.pagination,
        error: null
      };

    case examinationConstants.UPDATE_PATIENT_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        examination: action.payload,
        success: true,
        error: null
      };

    case examinationConstants.CREATE_PATIENT_EXAMINATION_FAILURE:
    case examinationConstants.GET_PATIENT_EXAMINATION_FAILURE:
    case examinationConstants.UPDATE_PATIENT_EXAMINATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case examinationConstants.CLEAR_EXAMINATION_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};