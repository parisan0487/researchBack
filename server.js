const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const verifyRoute = require("./src/routes/verifyRoute");
const ordersRouter = require("./src/routes/orderRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const upload = require("./src/routes/upload");


dotenv.config();
connectDB();
const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:3000", "https://research-pied.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Backend is Running!");
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", paymentRoutes);
app.use("/api", verifyRoute);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", upload);



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
