const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const os = require("os");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let events = {}; // In-memory storage

// Function to automatically get correct LAN IP
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const eventId = req.params.eventId;
    const dir = path.join(__dirname, "uploads", eventId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/ogg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});


// --- Routes ---
app.get("/api/uploads/:eventId/download", (req, res) => {
  const eventId = req.params.eventId;
  const dir = path.join(__dirname, "uploads", eventId);

  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "No files found for this event" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=event-${eventId}-files.zip`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(dir, false); // add files in the folder
  archive.finalize();
});

// Create event
app.post("/api/events/create", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Event name required" });

  const id = Date.now().toString();
 // server.js - inside app.post("/api/events/create")
const LOCAL_IP = getLocalIP(); // you already have this function
const FRONTEND_PORT = 5173; // default Vite dev server port

const url = `http://${LOCAL_IP}:${FRONTEND_PORT}/event/${id}`;

  try {
    const qrCodeURL = await QRCode.toDataURL(url);
    events[id] = { id, name, qrCodeURL, createdAt: new Date() };
    res.json({ id, qrCodeURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create QR code" });
  }
});

// Upload multiple files
app.post("/api/uploads/:eventId", upload.array("files", 20), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "No files uploaded" });

  const uploadedFiles = req.files.map((file) => ({
    url: `/uploads/${req.params.eventId}/${file.filename}`,
    name: file.originalname,
  }));

  res.json(uploadedFiles);
});

// Get files for event
// Get event info
app.get("/api/events/:eventId", (req, res) => {
  const eventId = req.params.eventId;

  if (!events[eventId]) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json(events[eventId]);
});


 

// Get files for event
app.get("/api/uploads/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  const dir = path.join(__dirname, "uploads", eventId);
  if (!fs.existsSync(dir)) return res.json([]);

  const files = fs.readdirSync(dir).map((file) => {
    const stats = fs.statSync(path.join(dir, file));
    return {
      url: `/uploads/${eventId}/${file}`,
      name: file,
      uploadedAt: stats.birthtime // <-- add this line
    };
  });

  res.json(files);
});



// Delete a file
app.delete("/api/uploads/:eventId/:filename", (req, res) => {
  const { eventId, filename } = req.params;
  const filePath = path.join(__dirname, "uploads", eventId, filename);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File not found" });

  fs.unlinkSync(filePath);
  res.json({ success: true });
});
// Delete event entirely
app.delete("/api/events/:eventId", (req, res) => {
  const eventId = req.params.eventId;

  // Remove from in-memory events
  if (events[eventId]) delete events[eventId];

  // Remove uploaded files folder
  const dir = path.join(__dirname, "uploads", eventId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  res.json({ message: "Event deleted successfully" });
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

