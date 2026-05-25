import express from "express";
import {
  getUsers,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
} from "../application/user.js";

export const userRouter = express.Router();

userRouter.route("/").get(getUsers).post(createUser);
userRouter.route("/:id").get(getUserById).delete(deleteUser).patch(updateUser);
