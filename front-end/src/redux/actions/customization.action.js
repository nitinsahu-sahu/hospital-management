import APIs from "../helper/api";
import { customizeConstants } from "./constants";

// Add Customization Investigation
export const addCustomizationInvestigation = (investigationData) => async (dispatch) => {

    try {
        dispatch({ type: customizeConstants.ADD_INV_CUS_REQUEST });
        const { data } = await APIs.post(`/investigation-category`, investigationData);

        dispatch({
            type: customizeConstants.ADD_INV_CUS_SUCCESS,
            payload: data.data,
        });

        return {
            type: customizeConstants.ADD_INV_CUS_SUCCESS,
            payload: data.data,
            status: data.success
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch({
            type: customizeConstants.ADD_INV_CUS_FAILURE,
            payload: errorMessage
        });
        return {
            type: customizeConstants.ADD_INV_CUS_FAILURE,
            payload: errorMessage,
            status: false
        };
    }
};

// Get full discharge data
export const getCustomizationInv = ({ category, search = "", isActive = "" }) => async (dispatch) => {

    try {
        dispatch({ type: customizeConstants.GET_INV_CUS_REQUEST });

        const { data } = await APIs.get(`/investigation-category?category=${category}&search=${search}&isActive=${isActive}`);

        dispatch({
            type: customizeConstants.GET_INV_CUS_SUCCESS,
            payload: {
                investigationsCustom: data.data,
                count: data.count
            },
        });

        return { type: customizeConstants.GET_INV_CUS_SUCCESS, payload: data.data };

    } catch (error) {
        dispatch({
            type: customizeConstants.GET_INV_CUS_FAILURE,
            payload: error.response?.data?.message || error.message
        });
    }
};

// / Delete investigation
export const deleteCustomizationInv = (id) => async (dispatch) => {
    try {
        dispatch({ type: customizeConstants.DELETE_INV_CUS_REQUEST });

        const response = await APIs.delete(`/investigation-category/${id}/hard`);

        dispatch({
            type: customizeConstants.DELETE_INV_CUS_SUCCESS,
            payload: id
        });

        return { type: customizeConstants.DELETE_INV_CUS_SUCCESS, payload: id };
    } catch (error) {
        dispatch({
            type: customizeConstants.DELETE_INV_CUS_FAILURE,
            payload: error.response?.data?.message || 'Failed to delete investigation'
        });
        return { type: customizeConstants.DELETE_INV_CUS_FAILURE, payload: error.response?.data?.message };
    }
};

// Update investigation
export const updateCustomizationInv = (id, data) => async (dispatch) => {
    try {
        dispatch({ type: customizeConstants.UPDATE_INV_CUS_REQUEST });

        const response = await APIs.put(`/investigation-category/${id}`, data);

        dispatch({
            type: customizeConstants.UPDATE_INV_CUS_SUCCESS,
            payload: response.data.investigation
        });

        return { type: customizeConstants.UPDATE_INV_CUS_SUCCESS, payload: response.data.investigation };
    } catch (error) {

        dispatch({
            type: customizeConstants.UPDATE_INV_CUS_FAILURE,
            payload: error.response?.data?.message || 'Failed to update investigation'
        });
        return { type: customizeConstants.UPDATE_INV_CUS_FAILURE, payload: error.response?.data?.message };
    }
};
