import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import EventPage from "./pages/EventPage";
import "./App.css";
function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/event/:eventId" element={<EventPage />} />
    </Routes>
  );
}

export default App;
