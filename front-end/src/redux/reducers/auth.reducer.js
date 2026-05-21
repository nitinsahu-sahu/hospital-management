import { authConstants } from "../actions/constants";

const initialState = {
    token: null,
    user: {
        _id: '',
        role: '',
        name: '',
        mobileNumber: '',
        registrationNumber: '',
        department: '',
        mobileNumber: '',
        email: '',
        address: "",
        experience: "",
        specialization: "",
        qualification: "",
    },
    authenticate: false,
    authenticating: false,
    error: null,
    message: '',
};

const authReducer = (state, action) => {
    if (state === undefined) {
        state = initialState;
    }
    switch (action.type) {
        case authConstants.LOGIN_REQUEST:
            return { ...state, authenticating: true };

        case authConstants.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                authenticate: true,
                authenticating: false,
                message: action.payload.message,
            };

        case authConstants.LOGIN_FAILURE:
            return {
                ...state,
                error: action.payload.error,
                message: action.payload.message,
                authenticate: false,
                authenticating: false,
            };

        case authConstants.LOGOUT_REQUEST:
            return {
                ...state,
            };

        case authConstants.LOGOUT_SUCCESS:
            return {
                ...initialState,
            };

        default:
            return state;
    }
};


export default authReducer;