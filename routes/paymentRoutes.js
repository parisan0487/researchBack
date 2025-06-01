const express = require("express");
const axios = require("axios");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");


router.post("/", protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ message: "شناسه سفارش الزامی است" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "سفارش یافت نشد" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "این سفارش قبلا پرداخت شده یا وضعیت نامعتبر دارد" });
    }

    const isDev = process.env.NODE_ENV !== "production";
    const callback_url = isDev
      ? `http://localhost:3000/basket/success?orderId=${orderId}`
      : `https://your-production-url.com/basket/success?orderId=${orderId}`;

    const params = {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: order.amount,
      callback_url,
      description: "پرداخت سفارش فروشگاه",
    };

    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
      params,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;

    if (data.data.code === 100) {
      res.json({ url: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}` });
    } else {
      res.status(400).json({ error: "درخواست پرداخت ناموفق بود", detail: data.data });
    }
  } catch (err) {
    console.error("Zarinpal error:", err.response?.data || err.message);
    res.status(500).json({ error: "خطا در ارتباط با درگاه پرداخت", detail: err.message });
  }
});

module.exports = router;

