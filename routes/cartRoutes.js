const mongoose = require("mongoose");
const express = require("express");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const Product = require("../models/Product");

router.post("/add", protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "شناسه محصول معتبر نیست" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }


    const variant = product.variants?.[0];

    if (variant && variant.stock < quantity) {
      return res.status(400).json({ message: "موجودی کافی نیست" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (!item.variant || !variant || (
          item.variant.color === variant.color && item.variant.size === variant.size
        ))
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variant: variant
          ? { color: variant.color, size: variant.size, stock: variant.stock }
          : undefined,
        quantity,
      });
    }

    await cart.save();
    res.status(200).json({ message: "محصول با موفقیت به سبد خرید اضافه شد" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "خطایی رخ داد", error: error.message });
  }
});


router.get("/", protect, async (req, res) => {
  console.log("req of front", req.user._id);
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    console.error("خطا در دریافت سبد خرید:", error);
    res.status(500).json({ message: "خطایی رخ داد" });
  }
});

router.delete("/remove/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "سبد خرید شما خالی است" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ message: "محصول از سبد خرید حذف شد", cart });
  } catch (error) {
    console.error("🔥 خطا در حذف محصول:", error);
    res.status(500).json({ message: "خطایی رخ داد", error: error.message });
  }
});


module.exports = router;
