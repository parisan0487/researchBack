const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const registerUser = async (req, res) => {
  const { name, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "این شماره تلفن قبلا ثبت نام کرده است" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      password: hashedPassword,
      phone,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(400)
        .json({ message: "کاربری با این شماره تلفن پیدا نشد" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "رمز عبور اشتباه است" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const admin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "مشکلی پیش آمد" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  admin,
};
