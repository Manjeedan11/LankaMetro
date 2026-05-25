import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userRepository from "../infrastructure/repository/User.js";
import ValidationError from "../domain/errors/validation-error.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationError("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new ValidationError("Account is disabled. Contact admin.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
        depotId: user.depot_id || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
