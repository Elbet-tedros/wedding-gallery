const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const os = require("os");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const upload = multer({ storage });

// --- Routes ---

// Create event
app.post("/api/events/create", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Event name required" });

  const id = Date.now().toString();
  const localIP = getLocalIP();
  const url = `http://${localIP}:5173/#/event/${id}`;

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
app.get("/api/uploads/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  const dir = path.join(__dirname, "uploads", eventId);
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).map((file) => ({
    url: `/uploads/${eventId}/${file}`,
    name: file,
  }));
  res.json(files);
});
// Get event info by ID
app.get("/api/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  const event = events[eventId]; // from in-memory storage
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ id: event.id, name: event.name });
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

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
