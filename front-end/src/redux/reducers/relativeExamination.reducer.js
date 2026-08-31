import { examinationConstants } from "../actions/constants";


const initialState = {
  loading: false,
  error: null,
  pagination: {},
  relativeExaminations: [],
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
        success: true,
        error: null
      };

    case examinationConstants.GET_RELATIVE_EXAMINATION_SUCCESS:
      return {
        ...state,
        loading: false,
        relativeExaminations: action.payload.relativeExaminations,
        pagination: action.payload.pagination,
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