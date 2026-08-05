import { investigationConstants } from "../actions/constants";

const initialState = {
  geneticsBlood: [],
  pagination: {},
  loading: false,
  error: null,
  success: false
};

export const geneticInvestigationReducer = (state = initialState, action) => {
  switch (action.type) {
    case investigationConstants.CREATE_GENETIC_INVESTIGATION_REQUEST:
    case investigationConstants.GET_GENETIC_INVESTIGATION_REQUEST:
    case investigationConstants.UPDATE_GENETIC_INVESTIGATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case investigationConstants.CREATE_GENETIC_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case investigationConstants.GET_GENETIC_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
         geneticsBlood: action.payload.geneticsBlood,
        pagination: action.payload.pagination,
        error: null
      };

    case investigationConstants.UPDATE_GENETIC_INVESTIGATION_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case investigationConstants.CREATE_GENETIC_INVESTIGATION_FAILURE:
    case investigationConstants.GET_GENETIC_INVESTIGATION_FAILURE:
    case investigationConstants.UPDATE_GENETIC_INVESTIGATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case investigationConstants.CLEAR_GENETIC_INVESTIGATION_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};