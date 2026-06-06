import { investigationConstants } from "../actions/constants";


const initialState = {
  investigation: null,
  investigations: [],
  loading: false,
  error: null,
  success: false
};

export const investigationReducer = (state = initialState, action) => {
  switch (action.type) {
    case investigationConstants.CREATE_INVESTIGATION_REQUEST:
    case investigationConstants.GET_INVESTIGATION_REQUEST:
    case investigationConstants.UPDATE_INVESTIGATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case investigationConstants.CREATE_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        investigation: action.payload,
        success: true,
        error: null
      };

    case investigationConstants.GET_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        investigation: action.payload,
        error: null
      };

    case investigationConstants.UPDATE_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        investigation: action.payload,
        success: true,
        error: null
      };

    case investigationConstants.CREATE_INVESTIGATION_FAILURE:
    case investigationConstants.GET_INVESTIGATION_FAILURE:
    case investigationConstants.UPDATE_INVESTIGATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case investigationConstants.CLEAR_INVESTIGATION_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};