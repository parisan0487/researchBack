const express = require("express");
const axios = require("axios");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

router.get("/verify", protect, async (req, res) => {
  try {
    const { Authority, Status, orderId } = req.query;

    if (!orderId) return res.status(400).json({ message: "شناسه سفارش الزامی است" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "سفارش یافت نشد" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    if (Status === "OK") {
      const params = {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: order.amount,
        authority: Authority,
      };

      const response = await axios.post(
        "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
        params,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (data.data.code === 100) {
        // پرداخت موفق بود - وضعیت سفارش رو آپدیت کن
        order.status = "paid";
        order.paidAt = new Date();
        order.transactionId = Authority; // یا شناسه تراکنش واقعی
        await order.save();

        return res.json({ message: "پرداخت موفق بود", order });
      } else {
        return res.status(400).json({ message: "پرداخت تایید نشد", detail: data.data });
      }
    } else {
      return res.status(400).json({ message: "پرداخت ناموفق بود یا لغو شد" });
    }
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "خطا در تایید پرداخت", error: err.message });
  }
});

module.exports = router;
