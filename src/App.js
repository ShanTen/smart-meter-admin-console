import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import { Routes ,Route } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';

//Pages that we've written
import CheckLogs from "./Pages/MeterLogs/MeterLogsForm"
import Login from "./Pages/Login/Login";
import OptionsGrid from "./Pages/OptionsGrid/OptionsPage";
import Billing from "./Pages/Billing";
import MeterManagement from "./Pages/MeterCRUD";
import MaxDemandPage from "./Pages/MaxDemandPage";

//More boiler plate
import "react-datepicker/dist/react-datepicker.css";
import "./App.css"; // Assuming you have an App.css for your styles


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<OptionsGrid  />}/>        
        <Route path="/check-meter-logs" element={<CheckLogs  />}/>        
        <Route path="/billing" element={<Billing  />}/>        
        <Route path="/meter-management" element={<MeterManagement  />}/>        
        <Route path="/check-max-demand" element={<MaxDemandPage  />}/>        
      </Routes>
    </Router>
  );
}

export default App;