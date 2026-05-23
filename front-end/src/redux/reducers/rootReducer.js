import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import patientReducer from './patient.reducer'

const rootReducer = combineReducers({
    auth: authReducer,
    patients: patientReducer,
})

export default rootReducer