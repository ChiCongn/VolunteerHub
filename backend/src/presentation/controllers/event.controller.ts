import { Request, Response } from "express";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView,
} from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import {
    EventNotFoundError,
    EventCapacityInvalidError,
    EventTimeInvalidError,
    NotEventOwnerError,
} from "../../domain/errors/event.error";
import { DomainError } from "../../domain/errors/domain.error";
import { EventStatus, EventCategory } from "../../domain/entities/enums";

export class EventController {
    constructor(private readonly eventRepository: IEventRepository) {}

    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const {
                name,
                location,
                startTime,
                endTime,
                description,
                imageUrl,
                capacity,
                categories,
            } = req.body;

            // Validate required fields
            if (!name || !location || !startTime || !description || !imageUrl || !capacity) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Missing required fields",
                    details: [
                        "name",
                        "location",
                        "startTime",
                        "description",
                        "imageUrl",
                        "capacity are required",
                    ],
                });
                return;
            }

            const ownerId = (req as any).user?.id;

            if (!ownerId) {
                res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "Authentication required",
                });
                return;
            }

            // Parse dates
            const startTimeDate = new Date(startTime);
            const endTimeDate = endTime ? new Date(endTime) : null;

            // Validate dates
            if (isNaN(startTimeDate.getTime())) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid startTime format",
                });
                return;
            }

            if (endTimeDate && isNaN(endTimeDate.getTime())) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid endTime format",
                });
                return;
            }

            // Validate capacity
            if (capacity <= 0) {
                res.status(400).json({
                    error: "EVENT_CAPACITY_INVALID",
                    message: "Capacity must be greater than 0",
                });
                return;
            }

            // Validate categories
            const eventCategories: EventCategory[] = categories || [];
            if (!Array.isArray(eventCategories)) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Categories must be an array",
                });
                return;
            }

            const createEventDto: CreateEventDto = {
                name,
                location,
                startTime: startTimeDate,
                endTime: endTimeDate,
                description,
                imageUrl,
                capacity: parseInt(capacity, 10),
                categories: eventCategories,
                ownerId,
            };

            const event = await this.eventRepository.create(createEventDto);

            // Convert Event entity to PublicEventView for response
            const eventView: PublicEventView = {
                id: event.id,
                name: event.name,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                description: event.description,
                imageUrl: event.imageUrl,
                ownerId: event._ownerId,
                categories: event.categories,
                registerCount: event.registerCount,
                capacity: event.capacity,
            };

            res.status(201).json(eventView);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            // Parse query parameters
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 20;
            const sortField = (req.query.sortBy as string) || "start_time";
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

            // Build filters
            const filters: EventFilterDto = {};
            if (req.query.status) {
                filters.status = req.query.status as EventStatus;
            }
            if (req.query.name) {
                filters.name = req.query.name as string;
            }
            if (req.query.location) {
                filters.location = req.query.location as string;
            }
            if (req.query.categories) {
                const categories = Array.isArray(req.query.categories)
                    ? (req.query.categories as string[])
                    : [req.query.categories as string];
                filters.categories = categories as EventCategory[];
            }
            if (req.query.start && req.query.end) {
                filters.dateRange = [
                    new Date(req.query.start as string),
                    new Date(req.query.end as string),
                ];
            }
            if (req.query.ownerId) {
                filters.ownerId = req.query.ownerId as string;
            }

            // Build pagination
            const pagination: Pagination = {
                page: Math.max(1, page),
                limit: Math.min(100, Math.max(1, limit)), // Limit between 1 and 100
            };

            // Build sort option
            const sort: SortOption = {
                field: sortField,
                order: sortOrder,
            };

            // Search events
            const result = await this.eventRepository.searchEvent(filters, pagination, sort);

            res.status(200).json({
                data: result.items,
                total: result.total,
                page: result.page,
                limit: result.limit,
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Event ID is required",
                });
                return;
            }

            const event = await this.eventRepository.fetchPublicView(id);

            if (!event) {
                res.status(404).json({
                    error: "EVENT_NOT_FOUND",
                    message: `Event with ID ${id} not found`,
                });
                return;
            }

            res.status(200).json(event);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Update an event
     * PUT /events/:id
     */
    async updateEvent(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {
                name,
                location,
                startTime,
                endTime,
                description,
                imageUrl,
                categories,
                capacity,
            } = req.body;

            if (!id) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Event ID is required",
                });
                return;
            }

            // Get current user ID
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "Authentication required",
                });
                return;
            }

            // Check if event exists and user is owner
            const existingEvent = await this.eventRepository.findById(id);
            if (!existingEvent) {
                res.status(404).json({
                    error: "EVENT_NOT_FOUND",
                    message: `Event with ID ${id} not found`,
                });
                return;
            }

            // Check ownership (assuming user role check is done in middleware)
            // For now, we'll allow if user is owner or admin
            const isOwner = existingEvent._ownerId === userId;
            const isAdmin = (req as any).user?.role === "admin";
            const isManager = (req as any).user?.role === "manager";

            if (!isOwner && !isAdmin && !isManager) {
                res.status(403).json({
                    error: "FORBIDDEN",
                    message: "You do not have permission to update this event",
                });
                return;
            }

            // Build update DTO
            const updateDto: UpdateEventDto = {};

            if (name !== undefined) updateDto.name = name;
            if (location !== undefined) updateDto.location = location;
            if (startTime !== undefined) {
                const startTimeDate = new Date(startTime);
                if (isNaN(startTimeDate.getTime())) {
                    res.status(400).json({
                        error: "VALIDATION_ERROR",
                        message: "Invalid startTime format",
                    });
                    return;
                }
                updateDto.startTime = startTimeDate;
            }
            if (endTime !== undefined) {
                if (endTime === null) {
                    updateDto.endTime = null;
                } else {
                    const endTimeDate = new Date(endTime);
                    if (isNaN(endTimeDate.getTime())) {
                        res.status(400).json({
                            error: "VALIDATION_ERROR",
                            message: "Invalid endTime format",
                        });
                        return;
                    }
                    updateDto.endTime = endTimeDate;
                }
            }
            if (description !== undefined) updateDto.description = description;
            if (imageUrl !== undefined) updateDto.imageUrl = imageUrl;
            if (categories !== undefined) {
                if (!Array.isArray(categories)) {
                    res.status(400).json({
                        error: "VALIDATION_ERROR",
                        message: "Categories must be an array",
                    });
                    return;
                }
                updateDto.categories = categories as EventCategory[];
            }
            if (capacity !== undefined) {
                const capacityNum = parseInt(capacity, 10);
                if (isNaN(capacityNum) || capacityNum <= 0) {
                    res.status(400).json({
                        error: "EVENT_CAPACITY_INVALID",
                        message: "Capacity must be a positive number",
                    });
                    return;
                }
                updateDto.capacity = capacityNum;
            }

            // Update event
            const updatedEvent = await this.eventRepository.update(id, updateDto);

            // Convert to PublicEventView
            const eventView: PublicEventView = {
                id: updatedEvent.id,
                name: updatedEvent.name,
                location: updatedEvent.location,
                startTime: updatedEvent.startTime,
                endTime: updatedEvent.endTime,
                description: updatedEvent.description,
                imageUrl: updatedEvent.imageUrl,
                ownerId: updatedEvent._ownerId,
                categories: updatedEvent.categories,
                registerCount: updatedEvent.registerCount,
                capacity: updatedEvent.capacity,
            };

            res.status(200).json(eventView);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Event ID is required",
                });
                return;
            }

            // Get current user info
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;

            if (!userId) {
                res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "Authentication required",
                });
                return;
            }

            // Volunteer cannot delete
            if (userRole === "volunteer") {
                res.status(403).json({
                    error: "FORBIDDEN",
                    message: "Volunteers cannot delete events",
                });
                return;
            }

            // Get event to check ownership
            const existingEvent = await this.eventRepository.findById(id);
            if (!existingEvent) {
                res.status(404).json({
                    error: "EVENT_NOT_FOUND",
                    message: `Event with ID ${id} not found`,
                });
                return;
            }

            // Check permission based on role
            const isAdmin = userRole === "admin";
            const isManager = userRole === "manager";
            const isOwner = existingEvent._ownerId === userId;

            // Manager can only delete own events
            if (isManager && !isOwner) {
                res.status(403).json({
                    error: "FORBIDDEN",
                    message: "Event managers can only delete their own events",
                });
                return;
            }

            // Admin can delete any, Manager can delete own events
            if (!isAdmin && !isManager) {
                res.status(403).json({
                    error: "FORBIDDEN",
                    message: "You do not have permission to delete this event",
                });
                return;
            }

            // Soft delete
            await this.eventRepository.softDelete(id);

            res.status(200).json({
                message: "Event deleted successfully",
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response): void {
        if (error instanceof DomainError) {
            // Map domain errors to HTTP status codes
            let statusCode = 500;

            if (error instanceof EventNotFoundError) {
                statusCode = 404;
            } else if (
                error instanceof EventCapacityInvalidError ||
                error instanceof EventTimeInvalidError
            ) {
                statusCode = 400;
            } else if (error instanceof NotEventOwnerError) {
                statusCode = 403;
            }

            res.status(statusCode).json(error.toResponse());
        } else if (error instanceof Error) {
            // Handle unexpected errors
            console.error("Unexpected error in EventController:", error);
            res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            });
        } else {
            // Handle unknown error types
            console.error("Unknown error type in EventController:", error);
            res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            });
        }
    }
}
