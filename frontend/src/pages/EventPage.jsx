// src/pages/EventPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UploadForm from "../components/UploadForm";
import EventGallery from "../components/EventGallery";
import API_BASE from "../config";

function EventPage() {
  const { eventId } = useParams(); // eventId from URL
  const [files, setFiles] = useState([]);
  const [eventName, setEventName] = useState(""); // new state for event name

  // Fetch uploaded files
  const fetchFiles = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${API_BASE}/api/uploads/${eventId}`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  // Fetch event info
  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}`);
      const data = await res.json();
      setEventName(data.name || "Event"); // fallback if no name
    } catch (err) {
      console.error("Error fetching event info:", err);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchFiles();
    fetchEvent(); // fetch event name
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (!eventId) return <p>Invalid event. Please scan the QR code.</p>;

  return (
    <div className="event-page">
      <h1>{eventName}'s Gallery</h1> {/* <-- modified title */}
      <UploadForm eventId={eventId} onUpload={fetchFiles} />
      <EventGallery files={files} eventId={eventId} onDelete={fetchFiles} />
    </div>
  );
}

export default EventPage;
