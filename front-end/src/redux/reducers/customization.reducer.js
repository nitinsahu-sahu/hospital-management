// reducers/customization.reducer.ts
import { customizeConstants } from "../actions/constants";

const initialState = {
    investigationsCustom: [],
    count: 0,
    loading: false,
    error: null,
    success: false
};

export const customizationInvestigationReducer = (state = initialState, action) => {
    switch (action.type) {
        case customizeConstants.ADD_INV_CUS_REQUEST:
        case customizeConstants.GET_INV_CUS_REQUEST:
        case customizeConstants.UPDATE_INV_CUS_REQUEST:
        case customizeConstants.DELETE_INV_CUS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case customizeConstants.ADD_INV_CUS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                error: null
            };

        case customizeConstants.GET_INV_CUS_SUCCESS:
            return {
                ...state,
                loading: false,
                investigationsCustom: action.payload.investigationsCustom,
                count: action.payload.count,
                error: null
            };

        case customizeConstants.UPDATE_INV_CUS_SUCCESS:
            return {
                ...state,
                loading: false,
                investigationsCustom: state.investigationsCustom.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                ),
                error: null
            };

        case customizeConstants.DELETE_INV_CUS_SUCCESS:
            return {
                ...state,
                loading: false,
                investigationsCustom: state.investigationsCustom.filter(
                    (item) => item._id !== action.payload
                ),
                error: null
            };

        case customizeConstants.ADD_INV_CUS_FAILURE:
        case customizeConstants.GET_INV_CUS_FAILURE:
        case customizeConstants.UPDATE_INV_CUS_FAILURE:
        case customizeConstants.DELETE_INV_CUS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false
            };

        case customizeConstants.CLEAR_INV_CUS_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};