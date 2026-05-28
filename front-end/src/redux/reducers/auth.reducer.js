// redux/reducers/auth.reducer.js

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
        email: '',
        address: "",
        experience: "",
        specialization: "",
        qualification: "",
        pic: null,
    },
    authenticate: false,
    authenticating: false,
    error: null,
    message: '',
    picUploading: false,
};

const authReducer = (state = initialState, action) => {
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
            return { ...state };

        case authConstants.LOGOUT_SUCCESS:
            return { ...initialState };

        // Profile Picture Update
        case authConstants.UPDATE_PROFILE_PIC_REQUEST:
            return {
                ...state,
                picUploading: true,
                error: null,
            };

        case authConstants.UPDATE_PROFILE_PIC_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                picUploading: false,
                message: action.payload.message,
            };

        case authConstants.UPDATE_PROFILE_PIC_FAILURE:
            return {
                ...state,
                picUploading: false,
                error: action.payload.error,
                message: action.payload.message,
            };

        default:
            return state;
    }
};

export default authReducer;