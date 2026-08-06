import { dischargeConstants } from "../actions/constants";


const initialState = {
  pagination: {},
  dischargesRecord: [],
  loading: false,
  error: null,
  success: false,
};

const dischargeReducer = (state = initialState, action) => {
  switch (action.type) {
    case dischargeConstants.DISCHARGE_CREATE_REQUEST:
    case dischargeConstants.DISCHARGE_DATA_REQUEST:
    case dischargeConstants.DISCHARGE_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case dischargeConstants.DISCHARGE_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case dischargeConstants.DISCHARGE_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        dischargesRecord: action.payload.discharesRecord,
        pagination: action.payload.pagination,
        error: null
      };

    case dischargeConstants.DISCHARGE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case dischargeConstants.DISCHARGE_CREATE_FAILURE:
    case dischargeConstants.DISCHARGE_DATA_FAILURE:
    case dischargeConstants.DISCHARGE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case dischargeConstants.DISCHARGE_CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default dischargeReducer;
