import React, { useState } from 'react'
import './App.css'
import {Paper, Typography} from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./views/pages/login/Login.jsx";
import Register from "./views/pages/register/Register.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <Router>
          <Routes>
              <Route path="/" element={<Paper elevation={3} sx={{padding: 3}}><Typography variant="h5">Admin Page</Typography> </Paper>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          </Routes>
      </Router>
  )
}

export default App
