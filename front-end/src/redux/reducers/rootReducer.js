import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import patientReducer from './patient.reducer'
import consultationReducer from './consultation.reducer'
import patientHistoryReducer from './patientHistory.reducer'

const rootReducer = combineReducers({
    auth: authReducer,
    patients: patientReducer,
    consultation: consultationReducer,
    patientHistory: patientHistoryReducer,
})

export default rootReducer