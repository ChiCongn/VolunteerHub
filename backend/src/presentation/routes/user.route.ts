import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { ListUserFilterSchema } from "../validators/user/list-user-filter.schema";
import { userController } from "../controllers/user.controller";
import { GetUserSchema } from "../validators/user/get-user.schema";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const userRoutes = Router();

userRoutes.get("/", validate(ListUserFilterSchema), userController.listUsers);
userRoutes.get("/:userId", authenticate, validate(GetUserSchema), userController.fetchUserPublicProfile);
