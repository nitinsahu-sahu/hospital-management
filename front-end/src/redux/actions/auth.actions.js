import APIs from "../helper/api";
import { authConstants } from "./constants";

export const login = (data) => async (dispatch) => {
    const { email, password } = data;

    dispatch({ type: authConstants.LOGIN_REQUEST });

    try {
        const response = await APIs.post("/auth/login", { email, password });

        const { token, user, message, expiresIn } = response.data.data;

        // Calculate expiration time (current time + expiresIn)
        const expirationTime = Date.now() + expiresIn;

        // Store token and expiration time in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("expiresAt", expirationTime.toString());

        // Set a timer to log the user out when the token expires
        const timeout = setTimeout(() => {
            dispatch(logout());
        }, expiresIn);

        localStorage.setItem("logoutTimer", timeout);

        // ✅ Dispatch success
        dispatch({
            type: authConstants.LOGIN_SUCCESS,
            payload: { token, user, message },
        });
        return {
            type: authConstants.LOGIN_SUCCESS,
            status: response.status,
            message: response?.data?.message
        };

    } catch (error) {
        dispatch({
            type: authConstants.LOGIN_FAILURE,
            payload: { message: error?.response?.data?.message || "Server error", error: error.status },
        });

        return {
            type: authConstants.LOGIN_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status
        };
    }
};

export const logout = () => async (dispatch) => {
    dispatch({ type: authConstants.LOGOUT_REQUEST });

    try {
        const response = await APIs.post("/auth/logout");

        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("expiresAt");

        // Clear the logout timer
        const timeout = localStorage.getItem("logoutTimer");
        if (timeout) {
            clearTimeout(Number(timeout));
            localStorage.removeItem("logoutTimer");
        }

        dispatch({ type: authConstants.LOGOUT_SUCCESS });

        return {
            type: authConstants.LOGOUT_SUCCESS,
            status: response.status,
            message: response?.data?.message
        };
    } catch (error) {
        dispatch({
            type: authConstants.LOGOUT_FAILURE,
            payload: {
                message: "logout failed",
                error: error.status
            },
        });

        return {
            type: authConstants.LOGOUT_FAILURE,
            message: error?.response?.data?.message || "Server error",
            status: error.status
        };
    }
};

export const isUserLoggedIn = () => async (dispatch) => {
    const token = localStorage.getItem("token");
    const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

    dispatch({
        type: token ? authConstants.LOGIN_SUCCESS : authConstants.LOGIN_FAILURE,
        payload: token ? { token, user } : { message: "Failed to login!!!" },
    });
};