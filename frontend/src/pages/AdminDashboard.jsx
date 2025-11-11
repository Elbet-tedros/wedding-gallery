// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import API_BASE from "../config";
import "../App.css"; // Make sure this import exists to use the styles

function AdminDashboard() {
  const [eventName, setEventName] = useState("");
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [eventId, setEventId] = useState("");

  const handleCreateEvent = async () => {
    if (!eventName) {
      alert("Please enter event name");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/events/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eventName }),
      });
      const data = await res.json();
      setQrCodeURL(data.qrCodeURL);
      setEventId(data.id);
      setEventName("");
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="create-event">
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <button onClick={handleCreateEvent}>Create Event</button>
      </div>

      {qrCodeURL && (
        <div className="qr-card">
          <h3>QR Code for Event ID: {eventId}</h3>
          <img src={qrCodeURL} alt="QR Code" />
          <p>Guests can scan this QR code to access the event page.</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
