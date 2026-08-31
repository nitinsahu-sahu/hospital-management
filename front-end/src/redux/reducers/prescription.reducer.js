// redux/reducers/prescription.reducer.js
import { prescriptionConstants } from "../actions/constants";

const initialState = {
    prescriptions: [],
    pagination: {},
    loading: false,
    error: null,
    success: false,
    message: '',
};

const prescriptionReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create
        case prescriptionConstants.CREATE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                success: false,
                message: '',
            };
        case prescriptionConstants.CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: 'Prescription created successfully',
            };
        case prescriptionConstants.CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
                message: action.payload,
            };

        // Get Patient Prescriptions
        case prescriptionConstants.GET_PATIENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                success: false,
                message: '',
            };
        case prescriptionConstants.GET_PATIENT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                prescriptions: action.payload.prescriptions,
                pagination: action.payload.pagination,
            };
        case prescriptionConstants.GET_PATIENT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
                message: action.payload,
            };

        // Clear state
        case 'CLEAR_PRESCRIPTION_STATE':
            return {
                ...initialState,
            };

        default:
            return state;
    }
};

export default prescriptionReducer;