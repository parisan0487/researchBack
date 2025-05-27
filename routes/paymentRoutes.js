const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/payment", async (req, res) => {
  const { amount, description } = req.body;

  console.log("BODY:", req.body);
  console.log("MERCHANT:", process.env.ZARINPAL_MERCHANT_ID);

  const isDev = process.env.NODE_ENV !== "production";
  const callback_url = isDev
    ? "http://localhost:3000/basket/success"
    : "https://research-pied.vercel.app/basket/success";

  const params = {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount,
    callback_url,
    description,
  };

  try {
    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
      params,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data.Status === 100) {
      res.json({
        url: `https://sandbox.zarinpal.com/pg/StartPay/${data.Authority}`,
      });
    } else {
      res.status(400).json({ error: "درخواست ناموفق", status: data.Status });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "خطا در ارتباط با زرین‌پال", detail: err.message });
    console.error("Zarinpal Error:", err.response?.data || err.message);
  }
});

module.exports = router;
