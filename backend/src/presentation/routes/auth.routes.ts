import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { LoginCredentialsSchema } from "../validators/auth/login.schema";
import { RegisterSchema } from "../validators/auth/register.schema";
import { authController } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", validate(LoginCredentialsSchema), authController.login);

authRoutes.post("/register", validate(RegisterSchema), authController.register);

authRoutes.post("/refresh", authController.refresh);
