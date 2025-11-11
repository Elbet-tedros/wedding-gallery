// src/components/EventGallery.jsx
import React from "react";
import API_BASE from "../config";
import "../App.css"; // make sure your global CSS is imported

function EventGallery({ files, eventId, onDelete }) {
  if (!files || files.length === 0) {
    return <p className="page-message">No files uploaded yet.</p>;
  }

  const handleDelete = async (filename) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(`${API_BASE}/api/uploads/${eventId}/${filename}`, { method: "DELETE" });
      if (onDelete) onDelete(); // refresh gallery
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  return (
    <div className="gallery">
      {files.map((file, index) => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
        const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);

        const fullURL = file.url.startsWith("http")
          ? file.url
          : `${API_BASE}${file.url}`;

        return (
          <div key={index} className="gallery-item">
            {isImage && <img src={fullURL} alt={file.name} />}
            {isVideo && <video src={fullURL} controls />}
            
            <a href={fullURL} download>
              Download
            </a>

            <button
              onClick={() => handleDelete(file.name)}
              className="delete-btn"
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default EventGallery;
