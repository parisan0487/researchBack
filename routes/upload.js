const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudinary");

router.post("/image", upload.single("image"), (req, res) => {
    try {
        console.log("فایل آپلود شده:", req.file);

        const imageUrl = req.file?.path || req.file?.secure_url;

        if (!imageUrl) {
            return res.status(500).json({ message: "URL تصویر یافت نشد" });
        }

        res.status(200).json({
            message: "عکس با موفقیت آپلود شد",
            imageUrl,
        });
    } catch (err) {
        console.error("خطا در آپلود:", err);
        res.status(500).json({ message: "آپلود با خطا مواجه شد" });
    }
});


module.exports = router;
