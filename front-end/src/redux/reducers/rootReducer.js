import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import patientReducer from './patient.reducer'
import consultationReducer from './consultation.reducer'

const rootReducer = combineReducers({
    auth: authReducer,
    patients: patientReducer,
    consultation: consultationReducer,
})

export default rootReducer