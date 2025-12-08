import express from "express";
import { signup, verifySignupOtp, login, refreshToken, logout, getProfile, requestPasswordReset, resetPasswordWithOtp } from "../controllers/authController.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signup/verify", verifySignupOtp);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset", resetPasswordWithOtp);
router.get("/profile", getProfile);

export default router;
