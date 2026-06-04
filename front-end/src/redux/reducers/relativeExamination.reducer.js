import { examinationConstants } from "../actions/constants";


const initialState = {
  loading: false,
  error: null,
  examination: null,
  examinations: [],
  success: false
};

export const relativeExaminationReducer = (state = initialState, action) => {
  switch (action.type) {
    case examinationConstants.CREATE_RELATIVE_EXAMINATION_REQUEST:
    case examinationConstants.GET_RELATIVE_EXAMINATION_REQUEST:
    case examinationConstants.UPDATE_RELATIVE_EXAMINATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case examinationConstants.CREATE_RELATIVE_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        examination: action.payload,
        examinations: [...state.examinations, action.payload],
        success: true,
        error: null
      };

    case examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        examination: Array.isArray(action.payload) ? null : action.payload,
        examinations: Array.isArray(action.payload) ? action.payload : [action.payload],
        error: null
      };

    case examinationConstants.UPDATE_RELATIVE_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        examination: action.payload,
        examinations: state.examinations.map(exam => 
          exam._id === action.payload._id ? action.payload : exam
        ),
        success: true,
        error: null
      };

    case examinationConstants.CREATE_RELATIVE_EXAMINATION_FAILURE:
    case examinationConstants.GET_RELATIVE_EXAMINATION_FAILURE:
    case examinationConstants.UPDATE_RELATIVE_EXAMINATION_FAILURE:
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