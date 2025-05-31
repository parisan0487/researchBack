const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  admin,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.get("/admin", protect, adminProtect, admin);
router.get("/users", protect, adminProtect, getAllUsers);
router.put("/users/:id", protect, adminProtect, updateUserRole);
router.delete("/users/:id", protect, adminProtect, deleteUser);

module.exports = router;
