import { Router, Request, Response } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { ListUserFilterSchema } from "../validators/user/list-user-filter.schema";
import { userController } from "../controllers/user.controller";
import { GetUserSchema } from "../validators/user/get-user.schema";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { LockUserSchema } from "../validators/user/lock-user.schema";
import { UpdateUserSchema } from "../validators/user/update-user.schema";
import { SearchUserSchema } from "../validators/user/search-user.schema";
import { authorize } from "../../middlewares/authorize.middleware";
import { UserPolicy } from "../../application/policies/user.policy";

export const userRouter = Router();

userRouter.get("/", validate(ListUserFilterSchema), userController.listUsers);
//userRouter.get("/", authenticate, validate(ListUserFilterSchema), authorize(UserPolicy.list), userController.listUsers);
userRouter.get("/me", authenticate, authorize(UserPolicy.getCurrentUserProfile), userController.getCurrentUserProfile);
userRouter.patch("/me", authenticate, validate(UpdateUserSchema), userController.updateProfile);
userRouter.delete("/me", authenticate, authorize(UserPolicy.softDelete), userController.softDelete);
userRouter.get(
    "/search",
    authenticate,
    validate(SearchUserSchema),
    authorize(UserPolicy.searchByUsername),
    userController.searchUserByUsername
);
userRouter.get(
    "/:userId",
    authenticate,
    validate(GetUserSchema),
    authorize(UserPolicy.fetchPublicProfile),
    userController.fetchUserPublicProfile
);
userRouter.patch(
    "/:userId/lock",
    //authenticate,
    validate(LockUserSchema),
    //authorize(UserPolicy.setUserLock),
    userController.setUserLock
);
