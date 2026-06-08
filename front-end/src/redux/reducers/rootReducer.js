import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import patientReducer from './patient.reducer'
import consultationReducer from './consultation.reducer'
import patientHistoryReducer from './patientHistory.reducer'
import { patientExaminationReducer } from './patientExamination.reducer';
import { relativeExaminationReducer } from './relativeExamination.reducer';
import { investigationReducer } from '../reducers/investigation.reducer';
import { bloodInvestigationReducer } from '../reducers/bloodInvestigation.reducer';


const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  consultation: consultationReducer,
  patientHistory: patientHistoryReducer,
  patientExamination: patientExaminationReducer,
  relativeExamination: relativeExaminationReducer,
  investigation: investigationReducer,
  bloodInvestigation: bloodInvestigationReducer
})

export default rootReducer