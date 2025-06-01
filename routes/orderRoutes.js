const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");


router.post("/", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { items, firstName, lastName, city, province, address, postalCode, phone, description, amount } = req.body;

        if (!items || !amount) {
            return res.status(400).json({ message: "آیتم‌ها و مبلغ سفارش الزامی است" });
        }

        const order = new Order({
            userId,
            items,
            firstName,
            lastName,
            city,
            province,
            address,
            postalCode,
            phone,
            description,
            amount,
        });

        await order.save();

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "خطا در ثبت سفارش", error: err.message });
    }
});

module.exports = router;
