const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://research-pied.vercel.app"
      : "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  api: {
    externalResolver: true,
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Backend is Running!");
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
