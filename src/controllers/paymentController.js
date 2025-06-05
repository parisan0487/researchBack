const axios = require("axios");

exports.createPayment = async (req, res) => {
    const { amount, description } = req.body;

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
            "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
            params,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const { data } = response;

        if (data.data.code === 100) {
            res.json({
                url: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`,
            });
        } else {
            res.status(400).json({
                error: "درخواست ناموفق",
                status: data.data.code,
                message: data.data.message,
            });
        }
    } catch (err) {
        console.error("❌ Zarinpal Error:", err.response?.data || err.message);
        res.status(500).json({
            error: "خطا در ارتباط با زرین‌پال",
            detail: err.response?.data || err.message,
        });
    }
};
