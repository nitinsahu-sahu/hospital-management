import { patientConstants } from "../actions/constants";

const initialState = {
    pagination: {},
    patients: [],
    searchPatients: [],
    error: null,
    message: '',
    loading: false,
    updateLoading: false,
    deleteLoading: false,
};

const patientReducer = (state, action) => {
    if (state === undefined) {
        state = initialState;
    }
    switch (action.type) {
        case patientConstants.GET_REQUEST:
            return { ...state };

        case patientConstants.GET_SUCCESS:
            return {
                ...state,
                patients: action.payload.patients,
                pagination: action.payload.pagination,
                message: action.payload.message,
            };

        case patientConstants.GET_FAILURE:
            return {
                ...state,
                error: action.payload.error,
                message: action.payload.message
            };

        case patientConstants.GET_SEARCH_FAILURE:
            return { ...state };

        case patientConstants.GET_SEARCH_SUCCESS:
            return {
                ...state,
                searchPatients: action.payload.searchPatients,
                message: action.payload.message,
            };

        case patientConstants.GET_SEARCH_FAILURE:
            return {
                ...state,
                error: action.payload.error,
                message: action.payload.message
            };

        // ==================== UPDATE PATIENT ====================
        case patientConstants.UPDATE_PATIENT_REQUEST:
            return {
                ...state,
                updateLoading: true,
                error: null,
            };

        case patientConstants.UPDATE_PATIENT_SUCCESS:
            return {
                ...state,
                updateLoading: false,
                // Update the specific patient in the list
                patients: state.patients.map((patient) =>
                    patient._id === action.payload.data?._id
                        ? { ...patient, ...action.payload.data }
                        : patient
                ),
                message: action.payload.message,
            };

        case patientConstants.UPDATE_PATIENT_FAILURE:
            return {
                ...state,
                updateLoading: false,
                error: action.payload.error,
                message: action.payload.message,
            };

        // ==================== DELETE PATIENT ====================
        case patientConstants.DELETE_PATIENT_REQUEST:
            return {
                ...state,
                deleteLoading: true,
                error: null,
            };

        case patientConstants.DELETE_PATIENT_SUCCESS:
            return {
                ...state,
                deleteLoading: false,
                // Remove the deleted patient from the list
                patients: state.patients.filter(
                    (patient) => patient._id !== action.payload.patientId
                ),
                // Update pagination total
                pagination: {
                    ...state.pagination,
                    totalRecords: state.pagination.totalRecords - 1,
                },
                message: action.payload.message,
            };

        case patientConstants.DELETE_PATIENT_FAILURE:
            return {
                ...state,
                deleteLoading: false,
                error: action.payload.error,
                message: action.payload.message,
            };
        default:
            return state;
    }
};


export default patientReducer;