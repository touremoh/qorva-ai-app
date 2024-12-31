// eslint-disable-next-line no-unused-vars
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./views/pages/login/Login.jsx";
import Register from "./views/pages/register/Register.jsx";
import AppHome from "./layout/AppHome.jsx";
import SecureHomePage from "./services/SecureHomePage.jsx";
import ErrorPage from "./views/pages/errors/ErrorPage.jsx";
import RegistrationSuccessful from "./views/pages/success/RegistrationSuccessful.jsx";
import SecureLoginPage from "./services/SecureLoginPage.jsx";

function App() {
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
              <Route path="/login" element={
                  <SecureLoginPage>
                      <Login />
                  </SecureLoginPage>
              } />
              <Route path="/register" element={<Register />} />
              <Route path="/success" element={<RegistrationSuccessful />} />
              <Route path="/error" element={<ErrorPage />} />
          </Routes>
      </Router>
  )
}

export default App
