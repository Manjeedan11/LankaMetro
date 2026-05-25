import express from "express";
import { login } from "../application/auth.js";

export const authRouter = express.Router();

authRouter.post("/login", login);
