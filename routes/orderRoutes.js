const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");


router.post("/", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({ message: "سبد خرید خالی است" });
        }
        
        const order = await Order.create({ ...req.body, userId });
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "خطا در ثبت سفارش", error: err.message });
    }
});

module.exports = router;