// src/components/UploadForm.jsx
import React, { useState } from "react";
import API_BASE from "../config";
import "../App.css"; // make sure your CSS file is imported

function UploadForm({ eventId, onUpload }) {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    if (!files || files.length === 0) return alert("Please select files");

    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

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
      alert("Error uploading files");
    }
  };

  return (
    <div className="upload-form">
      <input
        type="file"
        multiple
        onChange={(e) => setFiles([...e.target.files])}
      />
      <button onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}

export default UploadForm;
