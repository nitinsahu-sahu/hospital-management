import { investigationConstants } from "../actions/constants";

const initialState = {
  routinesBlood: [],
  pagination: {},
  loading: false,
  error: null,
  success: false
};

export const bloodInvestigationReducer = (state = initialState, action) => {
  switch (action.type) {
    case investigationConstants.CREATE_BLOOD_INVESTIGATION_REQUEST:
    case investigationConstants.GET_BLOOD_INVESTIGATION_REQUEST:
    case investigationConstants.UPDATE_BLOOD_INVESTIGATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case investigationConstants.CREATE_BLOOD_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case investigationConstants.GET_BLOOD_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
         routinesBlood: action.payload.routinesBlood,
        pagination: action.payload.pagination,
        error: null
      };

    case investigationConstants.UPDATE_BLOOD_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case investigationConstants.CREATE_BLOOD_INVESTIGATION_FAILURE:
    case investigationConstants.GET_BLOOD_INVESTIGATION_FAILURE:
    case investigationConstants.UPDATE_BLOOD_INVESTIGATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case investigationConstants.CLEAR_BLOOD_INVESTIGATION_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};