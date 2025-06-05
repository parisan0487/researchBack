const axios = require("axios");

exports.verifyPayment = async (req, res) => {
    const { Authority, Amount } = req.body;

    try {
        const response = await axios.post(
            "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
            {
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                amount: Amount,
                authority: Authority,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};
