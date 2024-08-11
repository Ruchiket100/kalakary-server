import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers } from "../controllers/user";
import { adminOnly } from "../utils/utils";

const router = Router();


router.post("/new", createUser);
router.get("/all", getUsers);
router.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default router;