import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import flowerRouter from "./routes/flowerRoutes.js"
import packingRouter from "./routes/packingRoutes.js";

dotenv.config();
console.log("mpngo db url" + process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((error) => {
    console.log(error.message);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Get PayPal client ID
// Отримати клієнтський ідентифікатор PayPal
app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "AUqN6CU9Fb7d-Cr5lZplqXPFwCE_xCJFQmPiThF4T995zOZmmMCTAaQ1RwqHnT1USeKg4Hss89QTBzOE");
});

// Routes for handling uploads
// Маршрути для обробки завантажень
app.use("/api/upload", uploadRouter);
// Routes for seeding initial data
// Маршрути для початкового заповнення даними
app.use("/api/seed", seedRouter);
// Routes for products
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/flowers", flowerRouter);
app.use("/api/packings", packingRouter);

// Error handler middleware
// Middleware для обробки помилок
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "/frontend/build")));

// Serve static files in production
// Служити статичні файли в режимі продукції
app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "/frontend/build/index.html"));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});



