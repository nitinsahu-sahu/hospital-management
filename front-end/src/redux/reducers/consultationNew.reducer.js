import { consultationNewConstants } from "../actions/constants";

const initialState = {
    consultations: [],
    patientConsultations: [],
    consultation: null,
    consultationStats: null,
    pagination: {
        total: 0,
        page: 1,
        pages: 1
    },
    loading: false,
    creating: false,
    updating: false,
    error: null,
    message: '',
};

const consultationReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create
        case consultationNewConstants.CREATE_CONSULTATION_REQUEST:
            return { ...state, creating: true, error: null };
        case consultationNewConstants.CREATE_CONSULTATION_SUCCESS:
            return {
                ...state,
                creating: false,
                patientConsultations: [action.payload, ...state.patientConsultations],
                consultations: [action.payload, ...state.consultations],
                message: 'Consultation created successfully',
            };
        case consultationNewConstants.CREATE_CONSULTATION_FAILURE:
            return { ...state, creating: false, error: action.payload.message };

        // Get All
        case consultationNewConstants.GET_ALL_CONSULTATIONS_REQUEST:
            return { ...state, loading: true, error: null };
        case consultationNewConstants.GET_ALL_CONSULTATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                consultations: action.payload.consultations,
                pagination: action.payload.pagination
            };
        case consultationNewConstants.GET_ALL_CONSULTATIONS_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Get By ID
        case consultationNewConstants.GET_CONSULTATION_BY_ID_REQUEST:
            return { ...state, loading: true, error: null };
        case consultationNewConstants.GET_CONSULTATION_BY_ID_SUCCESS:
            return { ...state, loading: false, consultation: action.payload };
        case consultationNewConstants.GET_CONSULTATION_BY_ID_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Get Consultations By Patient ID
        case consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_REQUEST:
            return { ...state, loading: true, error: null };
        case consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                patientConsultations: action.payload.consultations,
                pagination: action.payload.pagination
            };
        case consultationNewConstants.GET_CONSULTATIONS_BY_PATIENT_ID_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Get Consultation Stats
        case consultationNewConstants.GET_CONSULTATION_STATS_REQUEST:
            return { ...state, loading: true };
        case consultationNewConstants.GET_CONSULTATION_STATS_SUCCESS:
            return {
                ...state,
                loading: false,
                consultationStats: action.payload
            };
        case consultationNewConstants.GET_CONSULTATION_STATS_FAILURE:
            return { ...state, loading: false, error: action.payload.message };

        // Update
        case consultationNewConstants.UPDATE_CONSULTATION_REQUEST:
            return { ...state, updating: true, error: null };
        case consultationNewConstants.UPDATE_CONSULTATION_SUCCESS:
            return {
                ...state,
                updating: false,
                consultation: action.payload,
                patientConsultations: state.patientConsultations.map(c =>
                    c._id === action.payload._id ? action.payload : c
                ),
                message: 'Consultation updated successfully',
            };
        case consultationNewConstants.UPDATE_CONSULTATION_FAILURE:
            return { ...state, updating: false, error: action.payload.message };

        // Add Fee
        case consultationNewConstants.ADD_ADDITIONAL_FEE_REQUEST:
            return { ...state, updating: true, error: null };
        case consultationNewConstants.ADD_ADDITIONAL_FEE_SUCCESS:
            return {
                ...state,
                updating: false,
                consultation: action.payload,
                message: 'Additional fee added successfully',
            };
        case consultationNewConstants.ADD_ADDITIONAL_FEE_FAILURE:
            return { ...state, updating: false, error: action.payload.message };

        // Delete
        case consultationNewConstants.DELETE_CONSULTATION_REQUEST:
            return { ...state, error: null };
        case consultationNewConstants.DELETE_CONSULTATION_SUCCESS:
            return {
                ...state,
                consultations: state.consultations.filter(c => c._id !== action.payload),
                patientConsultations: state.patientConsultations.filter(c => c._id !== action.payload),
                message: 'Consultation deleted successfully',
            };
        case consultationNewConstants.DELETE_CONSULTATION_FAILURE:
            return { ...state, error: action.payload.message };

        // Clear Error
        case consultationNewConstants.CLEAR_CONSULTATION_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

export default consultationReducer;