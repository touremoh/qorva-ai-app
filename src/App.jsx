// eslint-disable-next-line no-unused-vars
import React, {useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from "./features/auth/components/Login.jsx";
import Register from "./features/auth/components/Register.jsx";
import AppHome from "./layout/AppHome.jsx";
import SecureHomePage from "./services/SecureHomePage.jsx";
import ErrorPage from "./views/pages/errors/ErrorPage.jsx";
import RegistrationSuccessful from "./features/auth/components/RegistrationSuccessful.jsx";
import CheckLoginPage from "./services/CheckLoginPage.jsx";
import CheckoutSuccessPage from "./features/billing/components/CheckoutSuccessPage.jsx";
import CheckoutCancelPage from "./features/billing/components/CheckoutCancelPage.jsx";
import SetPassword from "./features/auth/components/SetPassword.jsx";
import EmailLinkRequest from "./features/auth/components/EmailLinkRequest.jsx";
import CandidateUpdatePage from "./features/candidate-update/components/CandidateUpdatePage.jsx";
import {initGA} from "./utils/analytics.js";

function App() {

    useEffect(() => {
        initGA();
    }, []);

    return (
      <Router>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
              <Route
                  path="/"
                  element={
                      <SecureHomePage>
                          <AppHome />
                      </SecureHomePage>
                  }
              />
              <Route
                  path="/app/:tab"
                  element={
                      <SecureHomePage>
                          <AppHome />
                      </SecureHomePage>
                  }
              />
              <Route
                  path="/login"
                  element={
                      <CheckLoginPage>
                          <Login />
                      </CheckLoginPage>
                  }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/success" element={<RegistrationSuccessful />} />
              <Route path="/resend-activation" element={<EmailLinkRequest variant="activation" />} />
              <Route path="/forgot-password" element={<EmailLinkRequest variant="forgot" />} />
              <Route path="/:lang/set-password" element={<SetPassword />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/:lang/reset-password" element={<SetPassword mode="reset" />} />
              <Route path="/reset-password" element={<SetPassword mode="reset" />} />
              <Route path="/billing/success" element={<CheckoutSuccessPage />} />
              <Route path="/billing/cancel" element={<CheckoutCancelPage />} />
              <Route path="/candidate-update/:token" element={<CandidateUpdatePage />} />
              <Route path="/error" element={<ErrorPage />} />
          </Routes>
      </Router>
  )
}

export default App
