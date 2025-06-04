const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudinary");

router.post("/image", upload.single("image"), (req, res) => {
  try {
    res.status(200).json({
      message: "عکس با موفقیت آپلود شد",
      imageUrl: req.file.path, // این URL رو در دیتابیس ذخیره کن
    });
  } catch (err) {
    res.status(500).json({ message: "آپلود با خطا مواجه شد" });
  }
});

module.exports = router;
