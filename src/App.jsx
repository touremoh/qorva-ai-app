// eslint-disable-next-line no-unused-vars
import React, {useEffect} from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./views/pages/login/Login.jsx";
import Register from "./views/pages/register/Register.jsx";
import AppHome from "./layout/AppHome.jsx";
import SecureHomePage from "./services/SecureHomePage.jsx";
import ErrorPage from "./views/pages/errors/ErrorPage.jsx";
import RegistrationSuccessful from "./views/pages/success/RegistrationSuccessful.jsx";
import CheckLoginPage from "./services/CheckLoginPage.jsx";
import CheckoutSuccessPage from "./views/pages/checkout/CheckoutSuccessPage.jsx";
import CheckoutCancelPage from "./views/pages/checkout/CheckoutCancelPage.jsx";
import {initGA} from "./utils/analytics.js";

function App() {

    useEffect(() => {
        initGA();
    }, []);

    return (
      <Router>
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
                  path="/login"
                  element={
                      <CheckLoginPage>
                          <Login />
                      </CheckLoginPage>
                  }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/success" element={<RegistrationSuccessful />} />
              <Route path="/billing/success" element={<CheckoutSuccessPage />} />
              <Route path="/billing/cancel" element={<CheckoutCancelPage />} />
              <Route path="/error" element={<ErrorPage />} />
          </Routes>
      </Router>
  )
}

export default App
