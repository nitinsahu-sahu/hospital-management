import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import patientReducer from './patient.reducer'
import consultationNewReducer from './consultationNew.reducer'
import patientHistoryReducer from './patientHistory.reducer'
import { patientExaminationReducer } from './patientExamination.reducer';
import { relativeExaminationReducer } from './relativeExamination.reducer';
import { investigationReducer } from '../reducers/investigation.reducer';
import { bloodInvestigationReducer } from '../reducers/bloodInvestigation.reducer';
import procedureReducer from '../reducers/procedure.reducer';
import prescriptionReducer from '../reducers/prescription.reducer';
import dischargeReducer from '../reducers/discharge.reducer';


const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  consultation: consultationNewReducer,
  patientHistory: patientHistoryReducer,
  patientExamination: patientExaminationReducer,
  relativeExamination: relativeExaminationReducer,
  investigation: investigationReducer,
  bloodInvestigation: bloodInvestigationReducer,
  procedure: procedureReducer,
  prescriptions: prescriptionReducer,
  discharge: dischargeReducer,
})

export default rootReducer