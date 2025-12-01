import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { ListUserFilterSchema } from "../validators/user/list-user-filter.schema";
import { userController } from "../controllers/user.controller";

export const userRoutes = Router();

userRoutes.get("/", validate(ListUserFilterSchema), userController.listUsers);

