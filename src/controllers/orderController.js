const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "سبد خرید خالی است" });
        }

        for (const item of items) {
            const product = await Product.findById(item.productId);
            const variant = product?.variants?.[0];

            if (!product || (variant && variant.stock < item.quantity)) {
                return res.status(400).json({ message: `موجودی ${product?.name || "محصول"} کافی نیست` });
            }
        }

        const order = await Order.create({ ...req.body, userId });

        // خالی کردن سبد خرید
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "خطا در ثبت سفارش", error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate("items.productId", "name price");

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name phone")
            .populate("items.productId", "name price");

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};
