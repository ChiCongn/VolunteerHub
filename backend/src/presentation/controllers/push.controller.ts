import { Request, Response } from "express";
import { NotificationService } from "../../application/services/notification.service";
import logger from "../../logger";
import { SavePushSubscriptionDto } from "../../application/dtos/notification.dto";

export class PushSubcriptionController {
    constructor(private notificationService: NotificationService) {}

    
}
