const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.createOrder = async (userId, items, address, paymentInfo) => {
    if (!items || items.length === 0) {
        throw new Error("سبد خرید خالی است");
    }

    for (const item of items) {
        const product = await Product.findById(item.productId);
        const variant = product?.variants?.[0];

        if (!product || (variant && variant.stock < item.quantity)) {
            throw new Error(`موجودی ${product?.name || "محصول"} کافی نیست`);
        }

        // کاهش موجودی
        if (variant) {
            variant.stock -= item.quantity;
            await product.save();
        }
    }

    const order = await Order.create({
        userId,
        items,
        address,
        paymentInfo,
    });

    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    return order;
};

exports.getUserOrders = async (userId) => {
    return await Order.find({ userId })
        .sort({ createdAt: -1 })
        .populate("items.productId", "name price");
};

exports.getAllOrders = async () => {
    return await Order.find()
        .populate("userId", "name phone")
        .populate("items.productId", "name price");
};
