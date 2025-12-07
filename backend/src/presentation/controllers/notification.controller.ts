import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import {
    CreateNotificationDto,
    NotificationFilterDto,
} from "../../application/dtos/notification.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";

import { DomainError } from "../../domain/errors/domain.error";
import { notificationRepo } from "../../infrastructure/repositories/index";

import { Request, Response } from "express";

export class NotificationController {
    constructor(private readonly notificationRepository: INotificationRepository) {
        this.createNotification = this.createNotification.bind(this);
        this.getNotificationById = this.getNotificationById.bind(this);
        this.getNotificationsByUserId = this.getNotificationsByUserId.bind(this);
        this.maskAsRead = this.maskAsRead.bind(this);
        this.markAllAsRead = this.markAllAsRead.bind(this);
        this.deleteNotification = this.deleteNotification.bind(this);
    }
    //core
    async createNotification(req: Request, res: Response): Promise<void> {
        try {
            const notificationData: CreateNotificationDto = req.body;
            const newNotification = await this.notificationRepository.create(notificationData);
            res.status(201).json(newNotification);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getNotificationById(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.notificationId;
            const notification = await this.notificationRepository.findById(notificationId);
            res.status(200).json(notification);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getNotificationsByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const filter: NotificationFilterDto = req.query.filter
                ? JSON.parse(req.query.filter as string)
                : {};
            const pagination: Pagination = req.query.pagination
                ? JSON.parse(req.query.pagination as string)
                : {};
            const sort: SortOption = req.query.sort ? JSON.parse(req.query.sort as string) : {};
            const notifications: ListResult<any> = await this.notificationRepository.findByUserId(
                userId,
                filter,
                pagination,
                sort
            );
            res.status(200).json(notifications);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async maskAsRead(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.notificationId;
            if (!this.notificationRepository.markAsRead) {
                res.status(500).json({ message: "markAsRead method not available" });
                return;
            }
            await this.notificationRepository.markAsRead(notificationId);
            res.status(200).json({ message: "Notification marked as read" });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            if (!this.notificationRepository.markAllAsRead) {
                res.status(500).json({ message: "markAllAsRead method not available" });
                return;
            }
            await this.notificationRepository.markAllAsRead(userId);
            res.status(200).json({ message: "All notifications marked as read" });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: any): void {
        if (error instanceof DomainError) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}


export const notificationController = new NotificationController(notificationRepo);