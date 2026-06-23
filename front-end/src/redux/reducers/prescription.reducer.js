// redux/reducers/prescription.reducer.js
import { prescriptionConstants } from "../actions/constants";

const initialState = {
    prescription: null,
    allPrescriptions: [],
    loading: false,
    error: null,
    success: false,
    message: '',
    creating: false,
    updating: false,
    fetching: false,
};

const prescriptionReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create
        case prescriptionConstants.CREATE_REQUEST:
            return {
                ...state,
                creating: true,
                loading: true,
                error: null,
                success: false,
                message: '',
            };
        case prescriptionConstants.CREATE_SUCCESS:
            return {
                ...state,
                creating: false,
                loading: false,
                success: true,
                message: 'Prescription created successfully',
                prescription: action.payload,
            };
        case prescriptionConstants.CREATE_FAILURE:
            return {
                ...state,
                creating: false,
                loading: false,
                error: action.payload,
                success: false,
                message: action.payload,
            };

        // Get Patient Prescriptions
        case prescriptionConstants.GET_PATIENT_REQUEST:
            return {
                ...state,
                fetching: true,
                loading: true,
                error: null,
                success: false,
                message: '',
            };
        case prescriptionConstants.GET_PATIENT_SUCCESS:
            return {
                ...state,
                fetching: false,
                loading: false,
                success: true,
                prescription: action.payload, // Latest prescription
            };
        case prescriptionConstants.GET_PATIENT_FAILURE:
            return {
                ...state,
                fetching: false,
                loading: false,
                error: action.payload,
                success: false,
                message: action.payload,
            };

        // Update
        case prescriptionConstants.UPDATE_REQUEST:
            return {
                ...state,
                updating: true,
                loading: true,
                error: null,
                success: false,
                message: '',
            };
        case prescriptionConstants.UPDATE_SUCCESS:
            return {
                ...state,
                updating: false,
                loading: false,
                success: true,
                message: 'Prescription updated successfully',
                prescription: action.payload,
            };
        case prescriptionConstants.UPDATE_FAILURE:
            return {
                ...state,
                updating: false,
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