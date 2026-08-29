import { BrowserRouter as Router, Routes, Route,  redirect } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import UserProfiles from "./pages/UserProfiles";

import AppLayout from "./layout/AppLayout";

import { ScrollToTop } from "./components/common/ScrollToTop";

// import Home from "./pages/Dashboard/Home";

import Patients from "./pages/patients/patients";
import PatientsListing from "./pages/patients/patients-listing";
import ConsultationView from "./pages/Consultation/view";
import ConsultationAdd from "./pages/Consultation/add";

import PrescriptionAdd from "./pages/Prescription/Add";
import PrescriptionView from "./pages/Prescription/View";

import Protected from "./redux/helper/HOC";
import { RootState } from "./redux/store/store";
//@ts-ignore
import { isUserLoggedIn } from "./redux/actions/auth.actions";
import PatientHistoryAdd from "./pages/PatientHistory/add";
import PatientHistoryView from "./pages/PatientHistory/view";
import ProcedureView from "./pages/Procedure/View";
import ProcedureAdd from "./pages/Procedure/Add";

import DischargeAdd from "./pages/Discharge/Add";
import DischargeView from "./pages/Discharge/View";

import UltraSoundAdd from "./pages/Investigation/UltrasoundAdd";
import UltraSoundView from "./pages/Investigation/UltrasoundView";
import RoutineBloodAdd from "./pages/Investigation/RoutineBloodAdd";
import RoutineBloodView from "./pages/Investigation/RoutineBloodView";
import GeneticBloodAdd from "./pages/Investigation/GeneticBloodAdd";
import GeneticBloodView from "./pages/Investigation/GeneticBloodView";

import PatientExaminationAdd from "./pages/ExaminationOfCouple/PatientExaminationAdd";
import PatientExaminationView from "./pages/ExaminationOfCouple/PatientExaminationView";
import RelativeExaminationAdd from "./pages/ExaminationOfCouple/RelativeExaminationAdd";
import RelativeExaminationView from "./pages/ExaminationOfCouple/RelativeExaminationView";

//Customiztion
import InvestigationCustomizeAdd from "./pages/Customize/investigation-customize-add";
import InvestigationCustomizeView from "./pages/Customize/investigation-customize-view";

export default function App() {
  
  const { authenticate } = useSelector(
      (state: RootState) => state.auth
    );
  const dispatch = useDispatch()

  useEffect(() => {
    if (!authenticate) {
      dispatch(isUserLoggedIn());
      redirect('/')
    }
  }, [])

  return (
    <Router>
      <ScrollToTop />

      <Routes>

        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          {/* <Route index path="/" element={<Home />} /> */}

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/patient-history/add" element={<PatientHistoryAdd />} />
          <Route path="/patient-history/view" element={<PatientHistoryView />} />

          <Route path="/examination-of-couple/patient/add" element={<PatientExaminationAdd />} />
          <Route path="/examination-of-couple/patient/view" element={<PatientExaminationView />} />
          <Route path="/examination-of-couple/relative/add" element={<RelativeExaminationAdd />} />
          <Route path="/examination-of-couple/relative/view" element={<RelativeExaminationView />} />

          <Route path="/investigation/ultrasound-add" element={<UltraSoundAdd />} />
          <Route path="/investigation/ultrasound-view" element={<UltraSoundView />} />
          <Route path="/investigation/routine-blood-add" element={<RoutineBloodAdd />} />
          <Route path="/investigation/routine-blood-view" element={<RoutineBloodView />} />
          <Route path="/investigation/genetic-blood-add" element={<GeneticBloodAdd />} />
          <Route path="/investigation/genetic-blood-view" element={<GeneticBloodView />} />

          <Route path="/procedure/add" element={<ProcedureAdd />} />
          <Route path="/procedure/view" element={<ProcedureView />} />

          <Route path="/discharge/view" element={<DischargeView />} />
          <Route path="/discharge/add" element={<DischargeAdd />} />

          <Route path="/consultation/view" element={<ConsultationView />} />
          <Route path="/consultation/add" element={<ConsultationAdd />} />
          <Route path="/" element={<Patients />} />
          <Route path="/patient/view" element={<PatientsListing />} />
          <Route path="/prescription/add" element={<PrescriptionAdd />} />
          <Route path="/prescription/view" element={<PrescriptionView />} />

<Route path="/investigation-customizations/add" element={<InvestigationCustomizeAdd />} />
          <Route path="/investigation-customizations" element={<InvestigationCustomizeView />} />

        </Route>
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}