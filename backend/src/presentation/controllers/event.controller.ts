import { IEventRepository } from "../../domain/repositories/event.irepository";
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView,
} from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

import { DomainError } from "../../domain/errors/domain.error";

import { eventRepo } from "../../infrastructure/repositories/index";

import { Request, Response } from "express";
import { EventFilterSchema } from "../validators/event/filetr-event.schema";

export class EventController {
    constructor(private readonly eventRepository: IEventRepository) {
        this.createEvent = this.createEvent.bind(this);
        this.getEventById = this.getEventById.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.fetchPublicEventView = this.fetchPublicEventView.bind(this);
        this.searchEvents = this.searchEvents.bind(this);
        this.approveEvent = this.approveEvent.bind(this);
        this.rejectEvent = this.rejectEvent.bind(this);
        this.completeEvent = this.completeEvent.bind(this);
        this.cancelEvent = this.cancelEvent.bind(this);
        this.getParticipantsByEventId = this.getParticipantsByEventId.bind(this);
        this.getRegisteredUsersByEventId = this.getRegisteredUsersByEventId.bind(this);
        this.getEventManagersByEventId = this.getEventManagersByEventId.bind(this);
        this.listEvents = this.listEvents.bind(this);
    }

    //core
    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventData: CreateEventDto = req.body;
            const newEvent = await this.eventRepository.create(eventData);
            res.status(201).json(newEvent);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const event = await this.eventRepository.findById(eventId);
            res.status(200).json(event);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async updateEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const updateData: UpdateEventDto = req.body;
            const updatedEvent = await this.eventRepository.update(eventId, updateData);
            res.status(200).json(updatedEvent);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            await this.eventRepository.softDelete(eventId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    }

    //view
    async fetchPublicEventView(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const eventView = await this.eventRepository.fetchPublicView(eventId);
            if (!eventView) {
                res.status(404).json({ error: "Event not found." });
                return;
            }
            res.status(200).json(eventView);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async searchEvents(req: Request, res: Response): Promise<void> {
        try {
            const validated = EventFilterSchema.safeParse(req.query);
            if (!validated.success) {
                res.status(400).json({
                    error: "Invalid filter parameters",
                    details: validated.error.issues,
                });
                return;
            }

            const filters: EventFilterDto = validated.data;
            const pagination: Pagination = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
            };
            const sort: SortOption = {
                field: (req.query.sortField as string) || "createdAt",
                order: (req.query.sortOrder as "asc" | "desc") || "asc",
            };
            const result = await this.eventRepository.searchEvent(filters, pagination, sort);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    //event manager
    async approveEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            await this.eventRepository.approveEvent(eventId);
            res.status(200).json({ message: "Event approved successfully." });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async rejectEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            // Provide default reason if not supplied
            const { reason = "thich thi tu choi thoi" } = req.body;
            await this.eventRepository.rejectEvent(eventId, reason);
            res.status(200).json({ message: "Event rejected successfully." });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async completeEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            await this.eventRepository.completeEvent(eventId);
            res.status(200).json({ message: "Event completed successfully." });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async cancelEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            await this.eventRepository.cancelEvent(eventId);
            res.status(200).json({ message: "Event canceled successfully." });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getParticipantsByEventId(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const participants = await this.eventRepository.getParticipantsByEventId(eventId);
            res.status(200).json(participants);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getRegisteredUsersByEventId(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const registeredUsers = await this.eventRepository.getRegisteredUsersByEventId(eventId);
            res.status(200).json(registeredUsers);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getEventManagersByEventId(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const managers = await this.eventRepository.getEventManagersByEventId(eventId);
            res.status(200).json(managers);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    //admin
    async listEvents(req: Request, res: Response): Promise<void> {
        try {
            const filters: EventFilterDto = req.query;
            const pagination: Pagination = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
            };
            const sort: SortOption = {
                field: (req.query.sortField as string) || "createdAt",
                order: (req.query.sortOrder as "asc" | "desc") || "asc",
            };
            const result = await this.eventRepository.listEvents(filters, pagination, sort);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: unknown): void {
        if (error instanceof DomainError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export const eventController = new EventController(eventRepo);
