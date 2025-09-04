import express from "express";
import {
  createUser,
  loginUser,
  activateAccount,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/users/activate", activateAccount);
router.post("/login", loginUser);

export default router;
