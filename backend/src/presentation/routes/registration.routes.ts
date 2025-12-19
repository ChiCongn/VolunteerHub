import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { registrationController } from "../controllers/registration.controller";
import { WithdrawRegistrationSchema } from "../validators/registration/withdraw-registration.schema";
import { UpdateRegistrationApprovalSchema } from "../validators/registration/update-reg-approval.schema";

export const registrationRouter = Router();

registrationRouter.delete(
    "/:registrationId",
    //authenticate,
    validate(WithdrawRegistrationSchema),
    registrationController.withdraw
);

registrationRouter.patch(
    "/:registrationId",
    //authenticate,
    validate(UpdateRegistrationApprovalSchema),
    registrationController.updateRegistrationStatus
);
