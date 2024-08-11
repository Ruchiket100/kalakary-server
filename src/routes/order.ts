import express from "express";
import { createOrder, getMyOrders, getAllOrders, getOrder, processOrder, deleteOrder } from "../controllers/order";
import { adminOnly } from "../utils/utils";

const router = express.Router();

router.post("/new", createOrder);

router.get("/me", getMyOrders);

router.get("/all", adminOnly, getAllOrders);

router.route("/:id").get(getOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);

export default router;