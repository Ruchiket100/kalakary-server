import { Request, Response } from "express";
import { NewOrderType } from "../types/types";
import Order from "../models/order";
import { clearCache, reduceStock } from "../utils/utils";
import { redis, redisTTL } from "../app";

export async function createOrder(req: Request<NewOrderType>, res: Response) {
    const { shippingInfo, user, subtotal, tax, shippingCharges, discount, total, orderItems } = req.body;

    if (!shippingInfo || !user || !subtotal || !tax || !shippingCharges || !discount || !total || !orderItems) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the details"
        });
    }

    const order = await Order.create({
        shippingInfo,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
        orderItems
    });

    // reduce the stock of the products ordered
    reduceStock(orderItems);

    //remove previouse cache
    clearCache({ order: true, orderId: order._id, userId: user })

    return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order
    });
}

export async function getMyOrders(req: Request, res: Response) {
    const userId = req.query.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide user id"
        });
    }

    const key = `my-orders-${userId}`;

    let orders: any;
    orders = await redis.get(key);

    if (orders) orders = JSON.parse(orders);
    else {
        orders = await Order.find({ user: userId });
        await redis.setex(key, redisTTL, JSON.stringify(orders))
    }

    return res.status(200).json({
        success: true,
        data: orders
    });
}

export async function getAllOrders(req, res) {
    const key = `all-orders`;

    let orders;

    orders = await redis.get(key);

    if (orders) orders = JSON.parse(orders);
    else {
        orders = await Order.find();
        await redis.setex(key, redisTTL, JSON.stringify(orders))
    }

    return res.status(200).json({
        success: true,
        data: orders
    });
}

export async function getOrder(req: Request, res: Response) {
    const id = req.params.id;

    const key = `order-${id}`;

    let order;
    order = await redis.get(key);
    if (order) order = JSON.parse(order);
    else {
        order = await Order.findById(id);
        redis.setex(key, redisTTL, JSON.stringify(order))
    }

    return res.status(200).json({
        success: true,
        data: order
    })
}

export async function processOrder(req: Request, res: Response) {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Please provide order id"
        });
    }
    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }

    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();

    clearCache({
        admin: true,
        order: true,
        orderId: String(order._id),
        userId: order.user
    })

    return res.status(200).json({
        success: true,
        message: "Order Processed successfully",
        data: order
    });
}

export async function deleteOrder(req: Request, res: Response) {
    const id = req.params.id;

    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }
    await order.deleteOne();

    clearCache({
        admin: true,
        order: true,
        orderId: String(order._id),
        userId: order.user
    })

    return res.status(200).json({
        success: true,
        message: "Order deleted successfully"
    });
}