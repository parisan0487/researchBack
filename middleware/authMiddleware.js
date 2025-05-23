const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// Middleware محافظت از مسیرها
const protect = async (req, res, next) => {
  let token;

  // بررسی هدر Authorization برای دریافت توکن
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // جدا کردن مقدار توکن
      console.log("Received Token:", token); // لاگ گرفتن از مقدار توکن

      if (!token) {
        return res.status(401).json({ message: "توکن وجود ندارد" });
      }

      // بررسی و رمزگشایی توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // نمایش مقدار رمزگشایی شده

      // یافتن کاربر در دیتابیس (بدون فیلد پسورد)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      next(); // ادامه درخواست
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ message: "توکن معتبر نیست" });
    }
  } else {
    return res.status(401).json({ message: "توکن در هدر یافت نشد" });
  }
};

// Middleware بررسی سطح دسترسی ادمین
const adminProtect = (req, res, next) => {
  console.log("User Info:", req.user); // بررسی مقدار req.user
  if (req.user && req.user.role === "admin") {
    next(); // ادامه درخواست
  } else {
    res.status(403).json({ message: "دسترسی غیرمجاز" });
  }
};

module.exports = { protect, adminProtect };
