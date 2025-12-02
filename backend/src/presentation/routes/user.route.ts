import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { ListUserFilterSchema } from "../validators/user/list-user-filter.schema";
import { userController } from "../controllers/user.controller";
import { GetUserSchema } from "../validators/user/get-user.schema";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { LockUserSchema } from "../validators/user/lock-user.schema";
import { UpdateUserSchema } from "../validators/user/update-user.schema";
import { SearchUserSchema } from "../validators/user/search-user.schema";

export const userRoutes = Router();

userRoutes.get("/", validate(ListUserFilterSchema), userController.listUsers);
userRoutes.get("/me", authenticate, userController.getCurrentUserProfile);
userRoutes.patch("/me", authenticate, validate(UpdateUserSchema), userController.updateProfile);
userRoutes.delete("/me", authenticate, userController.softDelete);
userRoutes.get("/search", authenticate, validate(SearchUserSchema), userController.searchUserByUsername);
userRoutes.get("/:userId", authenticate, validate(GetUserSchema), userController.fetchUserPublicProfile);
userRoutes.patch("/:userId/lock", authenticate, validate(LockUserSchema), userController.setUserLock);
