import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { LoginCredentialsSchema } from "../validators/auth/login.schema";
import { RegisterSchema } from "../validators/auth/register.schema";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/login", validate(LoginCredentialsSchema), authController.login);

authRouter.post("/register", validate(RegisterSchema), authController.register);

authRouter.post("/refresh", authController.refresh);
