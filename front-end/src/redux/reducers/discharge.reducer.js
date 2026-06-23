import { dischargeConstants } from "../actions/constants";


const initialState = {
  dischargeRecord: null,
  dischargeData: null,
  dischargeList: [],
  loading: false,
  error: null,
  success: false,
  pagination: null
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
        dischargeRecord: action.payload.data,
        error: null
      };

    case dischargeConstants.DISCHARGE_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        dischargeData: action.payload.data,
        error: null
      };

    case dischargeConstants.DISCHARGE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        dischargeList: action.payload.data,
        pagination: action.payload.pagination,
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
