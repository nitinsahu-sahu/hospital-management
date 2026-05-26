import { BrowserRouter as Router, Routes, Route,  redirect } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";

import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";

import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";

import { ScrollToTop } from "./components/common/ScrollToTop";

import Home from "./pages/Dashboard/Home";

import Patients from "./pages/patients/patients";
import PatientsListing from "./pages/patients/patients-listing";
import DoctorConsultation from "./pages/Consultation/DoctorCunsultation";

import Prescription from "./pages/Prescription/Prescription";
import PrescriptionView from "./pages/Prescription/Prescription-listing";

import Protected from "./redux/helper/HOC";
import { RootState } from "./redux/store/store";
//@ts-ignore
import { isUserLoggedIn } from "./redux/actions/auth.actions";
import ExaminationOfCouple from "./pages/ExaminationOfCouple/ExaminationOfCouple";
import PatientHistory from "./pages/PatientHistory/PatientHistory";

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
          <Route index path="/" element={<Home />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/patient-history" element={<PatientHistory />} />
          <Route path="/examination-of-couple" element={<ExaminationOfCouple />} />
          <Route path="/consultation" element={<DoctorConsultation />} />
          <Route path="/patient/add" element={<Patients />} />
          <Route path="/patient/view" element={<PatientsListing />} />
          <Route path="/prescription/add" element={<Prescription />} />
          <Route path="/prescription/view" element={<PrescriptionView />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* UI Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}