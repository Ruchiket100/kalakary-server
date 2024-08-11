import mongoose from "mongoose";
import Redis from "ioredis";
import { User } from "../models/user";
import { OrderItemType } from "../types/types";
import { Product } from "../models/product";
import { redis } from "../app";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";


export const connectDB = (uri: string) => {
    mongoose
        .connect(uri, {
            dbName: "Kalakary",
        })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};

export const adminOnly = async (req, res, next) => {
    const id = req.query.id;

    if (!id) {
        return res.status(401).json({
            success: false,
            message: "No id provided",
        });
    }
    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    if (user.role !== "admin") {
        return res.status(401).json({
            success: false,
            message: "You are not authorized to access this route"
        });
    }
    return next();
}

export function connectRedis(data: { port: number; redisUri: string; username: string; password: string }) {
    const redis = new Redis({
        port: data.port,
        host: data.redisUri,
        username: data.username,
        password: data.password,
    });

    redis.on("connect", () => console.log("Redis connected successfully"));
    redis.on("error", (e) => console.error(e));

    return redis;
}

export async function reduceStock(orderItems: OrderItemType[]) {
    orderItems.forEach(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error("Product not found");
        product.stock -= item.quantity;
        await product.save();
    });
}

interface clearCacheProps {
    order?: boolean;
    orderId?: string | Object;
    userId?: string;
    admin?: boolean;
}

export async function clearCache({ order, orderId, userId }: clearCacheProps) {
    if (order) {
        const ordersKeys: string[] = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        ordersKeys.forEach((key) => {
            redis.del(key);
        });
    }
}

const getBase64 = (file: Express.Multer.File) =>
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
    const promises = files.map(async (file) => {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload(getBase64(file), (error, result) => {
                if (error) return reject(error);
                resolve(result!);
            });
        });
    });

    const result = await Promise.all(promises);

    return result.map((i) => ({
        public_id: i.public_id,
        url: i.secure_url,
    }));
};