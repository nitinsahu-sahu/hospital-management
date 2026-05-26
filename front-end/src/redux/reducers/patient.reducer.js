import { patientConstants } from "../actions/constants";

const initialState = {
    pagination: {},
    patients: [],
    searchPatients: [],
    error: null,
    message: '',
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
        default:
            return state;
    }
};


export default patientReducer;