import { procedureConstants } from "../actions/constants";

const initialState = {
  procedures: [],
  pagination:{},
  loading: false,
  error: null,
  message: '',
};

const procedureReducer = (state = initialState, action) => {
  switch (action.type) {
    // Create
    case procedureConstants.CREATE_PROCEDURE_REQUEST:
      return { ...state, loading: true, error: null };
    case procedureConstants.CREATE_PROCEDURE_SUCCESS:
      return {
        ...state,
        loading: false,
        procedures: [action.payload, ...state.procedures],
        message: 'Procedure created successfully',
      };
    case procedureConstants.CREATE_PROCEDURE_FAILURE:
      return { ...state, loading: true, error: action.payload.message };

    // Get All
    case procedureConstants.GET_ALL_PROCEDURES_REQUEST:
      return { ...state, loading: true, error: null };
    case procedureConstants.GET_ALL_PROCEDURES_SUCCESS:
      return { ...state, loading: false };
    case procedureConstants.GET_ALL_PROCEDURES_FAILURE:
      return { ...state, loading: true, error: action.payload.message };

    // Get By ID
    case procedureConstants.GET_PROCEDURE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case procedureConstants.GET_PROCEDURE_BY_ID_SUCCESS:
      return { ...state, loading: false };
    case procedureConstants.GET_PROCEDURE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload.message };

    // Get By Patient ID
    case procedureConstants.GET_PROCEDURES_BY_PATIENT_REQUEST:
      return { ...state, loading: true, error: null };
    case procedureConstants.GET_PROCEDURES_BY_PATIENT_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        procedures: action.payload.procedures,
        pagination: action.payload.pagination
       };
    case procedureConstants.GET_PROCEDURES_BY_PATIENT_FAILURE:
      return { ...state, loading: false, error: action.payload.message };


    default:
      return state;
  }
};

export default procedureReducer;