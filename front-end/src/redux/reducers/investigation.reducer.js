import { investigationConstants } from "../actions/constants";


const initialState = {
  ultrasounds: [],
  pagination: {},
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
        success: true,
        error: null
      };

    case investigationConstants.GET_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        ultrasounds: action.payload.ultrasounds,
        pagination: action.payload.pagination,
        error: null
      };

    case investigationConstants.UPDATE_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
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