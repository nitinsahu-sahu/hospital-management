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

import Prescription from "./pages/Prescription/Prescription";

import Protected from "./redux/helper/HOC";
import { RootState } from "./redux/store/store";
//@ts-ignore
import { isUserLoggedIn } from "./redux/actions/auth.actions";
import PatientHistoryAdd from "./pages/PatientHistory/add";
import PatientHistoryView from "./pages/PatientHistory/view";
import Procedure from "./pages/Procedure/Procedure";
import ProcedureView from "./pages/Procedure/View";
import ProcedureAdd from "./pages/Procedure/Add";
import Discharge from "./pages/Discharge/Discharge";
import UltraSound from "./pages/Investigation/Ultrasound";
import RoutineBlood from "./pages/Investigation/RoutineBlood";
import GeneticBlood from "./pages/Investigation/GeneticBlood";
import PatientExamination from "./pages/ExaminationOfCouple/PatientExamination";
import RelativeExamination from "./pages/ExaminationOfCouple/RelativeExamination";

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

          <Route path="/examination-of-couple/patient" element={<PatientExamination />} />
          <Route path="/examination-of-couple/relative" element={<RelativeExamination />} />
          <Route path="/investigation/ultrasound" element={<UltraSound />} />
          <Route path="/investigation/routine-blood-test" element={<RoutineBlood />} />
          <Route path="/investigation/genetic-blood-test" element={<GeneticBlood />} />
          <Route path="/procedure" element={<Procedure />} />
          <Route path="/procedure/add" element={<ProcedureAdd />} />
          <Route path="/procedure/view" element={<ProcedureView />} />
          <Route path="/discharge" element={<Discharge />} />
          <Route path="/consultation/view" element={<ConsultationView />} />
          <Route path="/consultation/add" element={<ConsultationAdd />} />
          <Route path="/" element={<Patients />} />
          <Route path="/patient/view" element={<PatientsListing />} />
          <Route path="/prescription" element={<Prescription />} />
        </Route>
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}