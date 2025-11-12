// src/components/UploadForm.jsx
import React, { useState } from "react";
import API_BASE from "../config";
import "../App.css"; // make sure your CSS file is imported

function UploadForm({ eventId, onUpload }) {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
  if (!files || files.length === 0) return alert("Please select file(s)");

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const res = await fetch(`${API_BASE}/api/uploads/${eventId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    await res.json();
    alert("Upload successful!");
    setFiles([]); // reset file input
    if (onUpload) onUpload(); // refresh gallery
  } catch (err) {
    console.error(err);
    alert("Only images or videos are allowed!");
  }
};


  return (
    <div className="upload-form">
      <input
  type="file"
  accept="image/*,video/*"
  multiple
  onChange={(e) => setFiles(Array.from(e.target.files))}
/>

      <button onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}

export default UploadForm;
