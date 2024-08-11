import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { connectDB, connectRedis } from "./utils/utils";

//Routes
import userRoutes from "./routes/user";
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";


const app = express();

const env = config({
  path: "./.env"
});

const mongoURI = process.env.MONGO_URI || "";
const redisUri = process.env.REDIS_URI || "";
const redisPort = process.env.REDIS_PORT || 6379;
const redisUsername = process.env.REDIS_USERNAME || "";
const redisPassword = process.env.REDIS_PASSWORD || "";

connectDB(mongoURI);
export const redis = connectRedis({ port: Number(redisPort), redisUri, username: redisUsername, password: redisPassword });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

//Routes
/*
  1. /api/v1/user
  2. /api/v1/product
  3. /api/v1/order
  4. /api/v1/payment
  5. /api/v1/dashboard
*/

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);


app.listen(5000, () => {
  console.log("Server is running on port 5000");
});