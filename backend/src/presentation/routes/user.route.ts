import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { ListUserFilterSchema } from "../validators/user/list-user-filter.schema";
import { userController } from "../controllers/user.controller";
import { GetUserSchema } from "../validators/user/get-user.schema";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { LockUserSchema } from "../validators/user/lock-user.schema";
import { UpdateUserSchema } from "../validators/user/update-user.schema";
import { SearchUserSchema } from "../validators/user/search-user.schema";

export const userRouter = Router();

userRouter.get("/", validate(ListUserFilterSchema), userController.listUsers);
userRouter.get("/me", authenticate, userController.getCurrentUserProfile);
userRouter.patch("/me", authenticate, validate(UpdateUserSchema), userController.updateProfile);
userRouter.delete("/me", authenticate, userController.softDelete);
userRouter.get(
    "/search",
    authenticate,
    validate(SearchUserSchema),
    userController.searchUserByUsername
);
userRouter.get(
    "/:userId",
    authenticate,
    validate(GetUserSchema),
    userController.fetchUserPublicProfile
);
userRouter.patch(
    "/:userId/lock",
    authenticate,
    validate(LockUserSchema),
    userController.setUserLock
);
