import { consultationConstants } from "../actions/constants";

const initialState = {
    consultations: [],
    consultation: null,
    loading: false,
    creating: false,
    updating: false,
    error: null,
    message: '',
};

const consultationReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create
        case consultationConstants.CREATE_CONSULTATION_REQUEST:
            return { ...state, creating: true, error: null };
        case consultationConstants.CREATE_CONSULTATION_SUCCESS:
            return {
                ...state,
                creating: false,
                consultations: [action.payload, ...state.consultations],
                message: 'Consultation created successfully',
            };
        case consultationConstants.CREATE_CONSULTATION_FAILURE:
            return { ...state, creating: false, error: action.payload.message };

        // Get All
        case consultationConstants.GET_ALL_CONSULTATIONS_REQUEST:
            return { ...state, loading: true, error: null };
        case consultationConstants.GET_ALL_CONSULTATIONS_SUCCESS:
            return { ...state, loading: false, consultations: action.payload };
        case consultationConstants.GET_ALL_CONSULTATIONS_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Get By ID
        case consultationConstants.GET_CONSULTATION_BY_ID_REQUEST:
            return { ...state, loading: true, error: null };
        case consultationConstants.GET_CONSULTATION_BY_ID_SUCCESS:
            return { ...state, loading: false, consultation: action.payload };
        case consultationConstants.GET_CONSULTATION_BY_ID_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Update
        case consultationConstants.UPDATE_CONSULTATION_REQUEST:
            return { ...state, updating: true, error: null };
        case consultationConstants.UPDATE_CONSULTATION_SUCCESS:
            return {
                ...state,
                updating: false,
                consultation: action.payload,
                message: 'Consultation updated successfully',
            };
        case consultationConstants.UPDATE_CONSULTATION_FAILURE:
            return { ...state, updating: false, error: action.payload.message };

        // Add Fee
        case consultationConstants.ADD_ADDITIONAL_FEE_REQUEST:
            return { ...state, updating: true, error: null };
        case consultationConstants.ADD_ADDITIONAL_FEE_SUCCESS:
            return {
                ...state,
                updating: false,
                consultation: action.payload,
                message: 'Additional fee added successfully',
            };
        case consultationConstants.ADD_ADDITIONAL_FEE_FAILURE:
            return { ...state, updating: false, error: action.payload.message };

        // Delete
        case consultationConstants.DELETE_CONSULTATION_REQUEST:
            return { ...state, error: null };
        case consultationConstants.DELETE_CONSULTATION_SUCCESS:
            return {
                ...state,
                consultations: state.consultations.filter(c => c._id !== action.payload),
                message: 'Consultation deleted successfully',
            };
        case consultationConstants.DELETE_CONSULTATION_FAILURE:
            return { ...state, error: action.payload.message };

        default:
            return state;
    }
};

export default consultationReducer;