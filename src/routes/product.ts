import express from "express";
import { getProduct, getProducts, newProduct, updateProduct, deleteProduct } from "../controllers/product";
import { mutliUpload } from "../middlewares/multer.js";
import { adminOnly } from "../utils/utils.js";

const router = express.Router();

router.post("/new", adminOnly, mutliUpload, newProduct);
router.get("/all", getProducts);
router.route("/:id").get(getProduct)
    .put(adminOnly, mutliUpload, updateProduct).delete(adminOnly, deleteProduct);

export default router;