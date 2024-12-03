// eslint-disable-next-line no-unused-vars
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./views/pages/login/Login.jsx";
import Register from "./views/pages/register/Register.jsx";
import AppHome from "./layout/AppHome.jsx";

function App() {
    return (
      <Router>
          <Routes>
              <Route path="/" element={<AppHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          </Routes>
      </Router>
  )
}

export default App
