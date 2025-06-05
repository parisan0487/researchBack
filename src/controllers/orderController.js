const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
    try {
        const { items, address, paymentInfo } = req.body;
        const order = await orderService.createOrder(req.user._id, items, address, paymentInfo);
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user._id);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};
