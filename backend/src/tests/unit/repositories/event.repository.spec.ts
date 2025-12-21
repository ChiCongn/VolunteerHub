import { PrismaClient, Prisma } from "../../../infrastructure/prisma/generated/client";
import { PublicUserProfile } from '../../../application/dtos/user.dto';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { EventRepository } from '../../../infrastructure/repositories/event.repository';
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView
} from '../../../application/dtos/event.dto';
import {
    EventNotFoundError,
    EventAlreadyApprovedError,
    EventCannotBeCancelledError,
    EventCapacityInvalidError,
    EventTimeInvalidError,
} from '../../../domain/errors/event.error';
import { restoreSnapshot } from "../../setup/test-db";
import "dotenv/config";
import { EventStatus, EventCategory } from '../../../domain/entities/enums';
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { Pagination } from "../../../application/dtos/pagination.dto";
import { SortOption } from "../../../application/dtos/sort-option.dto";

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const repo = new EventRepository(prisma, userRepo);

beforeAll(async () => {
    await restoreSnapshot();
});
beforeEach(async () => {
    await restoreSnapshot();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createEvent(overrides = {}) {
    return await repo.create({
        name: 'Sample Event',
        location: 'Sample Location',
        startTime: new Date(Date.now() + 3600000), // 1 hour from now
        endTime: new Date(Date.now() + 7200000), // 2 hours from now
        description: 'Sample Description',
        imageUrl: 'http://example.com/image.jpg',
        capacity: 100,
        categories: [EventCategory.HealthWellness],
        ownerId: '070af172-fd68-480b-895a-72b801ccb2b3',
        ...overrides,
    });
}

describe('IEventRepository Implementation', () => {
    // 01: create
    describe('create', () => {
        it('should create a new event successfully', async () => {
            const createdEvent = await createEvent();
            expect(createdEvent).toHaveProperty('id');
            expect(createdEvent.name).toBe('Sample Event');
            expect(createdEvent.capacity).toBe(100);
            expect(createdEvent.status).toBe(EventStatus.Pending);
            expect(createdEvent.categories).toContain(EventCategory.HealthWellness);
            expect(createdEvent.registerCount).toBe(0);
            expect(createdEvent._ownerId).toBe('070af172-fd68-480b-895a-72b801ccb2b3');
            expect(createdEvent.startTime).toBeInstanceOf(Date);
            expect(createdEvent.endTime).toBeInstanceOf(Date);
            expect(createdEvent.capacity).toBe(100);
        });

        // Assuming no specific error situations for create beyond validation, which is handled upstream
    });

    //02: findById
    describe('findById', () => {
        it('should find an event by ID', async () => {
            const createdEvent = await createEvent();
            const foundEvent = await repo.findById(createdEvent.id);
            expect(foundEvent).toEqual(createdEvent);
        });

        it('should throw error if event not found', async () => {
            expect(repo.findById('nonexistent')).rejects.toThrow(EventNotFoundError);
        });

        it('should throw EventNotFoundError for invalid ID', async () => {
            expect(repo.findById('invalid-id')).rejects.toThrow(EventNotFoundError);
        });
    });

    // 03: update
    describe('update', () => {
        it('should update an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // Approve to change status from Pending to Approved
            const updatedEvent = await repo.update(createdEvent.id, {
                name: 'Updated Event Name',
                capacity: 150,
            });
            expect(updatedEvent.name).toBe('Updated Event Name');
            expect(updatedEvent.capacity).toBe(150);
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.update('nonexistent', { name: 'Name' })).rejects.toThrow(EventNotFoundError);
        });

        it('should throw EventTimeInvalidError if endTime is before startTime', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // Approve to change status from Pending to Approved
            await expect(repo.update(createdEvent.id, {
                startTime: new Date(Date.now() + 7200000), // 2 hours from now
                endTime: new Date(Date.now() + 3600000), // 1 hour from now
            })).rejects.toThrow(EventTimeInvalidError);
        });

        it('should throw EventCapacityInvalidError if capacity is less than or equal to 0', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // Approve to change status from Pending to Approved
            await expect(repo.update(createdEvent.id, {
                capacity: 0,
            })).rejects.toThrow(EventCapacityInvalidError);
        });
    });

    // 04: softDelete
    describe('softDelete', () => {
        it('should soft delete an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // Approve to change status from Pending to Approved
            await repo.softDelete(createdEvent.id);
            const foundEvent = await repo.findById(createdEvent.id);
            expect(foundEvent.status).toBe('cancelled');
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.softDelete('nonexistent')).rejects.toThrow(EventNotFoundError);
        });
    });

    // 05: fetchPublicView
    describe('fetchPublicView', () => {
        it('should fetch public view of an event', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // Make it public by approving
            const publicView = await repo.fetchPublicView(createdEvent.id);
            expect(publicView).not.toBeNull();
            expect(publicView.id).toBe(createdEvent.id);
            expect(publicView.name).toBe(createdEvent.name);
            expect(publicView.capacity).toBe(createdEvent.capacity);
            expect(publicView.categories).toContain(EventCategory.HealthWellness);
            expect(publicView.registerCount).toBe(0);
            expect(publicView.ownerId).toBe('070af172-fd68-480b-895a-72b801ccb2b3');
            expect(publicView.startTime).toBeInstanceOf(Date);
            expect(publicView.endTime).toBeInstanceOf(Date);
            expect(publicView.description).toBe(createdEvent.description);
        });

        it('should throw error if event not found', async () => {
            expect(repo.fetchPublicView('nonexistent')).rejects.toThrow(EventNotFoundError);
        });

        it('should throw EventNotFoundError for invalid ID', async () => {
            await expect(repo.fetchPublicView('invalid-id')).rejects.toThrow(EventNotFoundError);
        });
    });

    // 06: searchEvent
    describe('searchEvent', () => {
        it('should search events with filters', async () => {
            const event1 = await createEvent({ name: 'Health Fair', location: 'Community Center', capacity: 50 });
            await repo.approveEvent(event1.id);
            const event2 = await createEvent({ name: 'Tech Workshop', location: 'Library', capacity: 30 });
            await repo.approveEvent(event2.id);
            const event3 = await createEvent({ name: 'Health Seminar', location: 'Hospital', capacity: 70 });
            await repo.approveEvent(event3.id);

            const filter: EventFilterDto = { name: 'Health' };
            const pagination: Pagination = { page: 1, limit: 10 };
            const sort: SortOption = { field: 'name', order: 'asc' };

            const result = await repo.searchEvent(filter, pagination, sort);
            console.log(result);
            expect(result.items.length).toBe(2);
            expect(result.items[0].name).toBe('Health Fair');
            expect(result.items[1].name).toBe('Health Seminar');
        });

        it('should return empty array if no matches', async () => {
            const filter: EventFilterDto = { name: 'Nonexistent Event' };
            const result = await repo.searchEvent(filter);
            expect(result.items).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    // 07: approveEvent
    describe('approveEvent', () => {
        it('should approve an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id);
            const updatedEvent = await repo.findById(createdEvent.id);
            expect(updatedEvent?.status).toBe(EventStatus.Approved);
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.approveEvent('nonexistent')).rejects.toThrow(EventNotFoundError);

        });

        it('should throw EventAlreadyApprovedError if already approved', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id);
            await expect(repo.approveEvent(createdEvent.id)).rejects.toThrow(EventAlreadyApprovedError);
        });
    });

    // 08: rejectEvent
    describe('rejectEvent', () => {
        it('should reject an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.rejectEvent(createdEvent.id, 'Inappropriate content');
            const updatedEvent = await repo.findById(createdEvent.id);
            expect(updatedEvent?.status).toBe(EventStatus.Rejected);
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.rejectEvent('nonexistent', 'Reason')).rejects.toThrow(EventNotFoundError);
        });
    });

    // 09: completeEvent
    describe('completeEvent', () => {
        it('should complete an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // First approve
            await repo.completeEvent(createdEvent.id);
            const updatedEvent = await repo.findById(createdEvent.id);
            expect(updatedEvent?.status).toBe(EventStatus.Completed);
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.completeEvent('nonexistent')).rejects.toThrow(EventNotFoundError);
        });
    });

    // 10: cancelEvent
    describe('cancelEvent', () => {
        it('should cancel an event successfully', async () => {
            const createdEvent = await createEvent();
            await repo.approveEvent(createdEvent.id); // First approve
            await repo.cancelEvent(createdEvent.id);
            const updatedEvent = await repo.findById(createdEvent.id);
            expect(updatedEvent?.status).toBe(EventStatus.Cancelled);
        });

        it('should throw EventNotFoundError if event not found', async () => {
            await expect(repo.cancelEvent('464a8fff-b892-45c5-bf44-e653fe4253cb')).rejects.toThrow(EventNotFoundError);
        });

        it('should throw EventCannotBeCancelledError if in invalid status', async () => {
            const createdEvent = await createEvent();
            await expect(repo.cancelEvent(createdEvent.id)).rejects.toThrow(EventCannotBeCancelledError);
        });
    });

    // 11: getparticipantsByEventId
    describe('getParticipantsByEventId', () => {
        // it('should get participants for an event', async () => {
        //     const users = [{ id: 'user1' }] as PublicUserProfile[];
        //     // Mocking the aggregate function to return users
        //     jest.spyOn(prisma.event_participants, 'findMany').mockResolvedValue(users as any);

        //     const result = await repo.getParticipantsByEventId('event123');
        //     expect(result).toEqual(users);
        // });

        it('should return empty array if no participants or event not found', async () => {
            const event = await createEvent();
            await repo.approveEvent(event.id);
            const result = await repo.getParticipantsByEventId(event.id);
            expect(result).toEqual([]);
        });
    });

    // 12: getRegisteredUsersByEventId
    describe('getRegisteredUsersByEventId', () => {
        // it('should get registered users for an event', async () => {
        //     const users = [{ id: 'user1' }] as PublicUserProfile[];
        //     mockEventModel.aggregate.mockResolvedValue(users);

        //     const result = await repo.getRegisteredUsersByEventId('event123');
        //     expect(result).toEqual(users);
        // });

        it('should return empty array if none or event not found', async () => {
            const event = await createEvent();
            await repo.approveEvent(event.id);
            const result = await repo.getRegisteredUsersByEventId(event.id);
            expect(result).toEqual([]);
        });
    });

    // 13: getEventManagersByEventId
    describe('getEventManagersByEventId', () => {
        // it('should get event managers for an event', async () => {

        // });

        it('should return empty array if none or event not found', async () => {
            const event = await createEvent();
            await repo.approveEvent(event.id);
            const result = await repo.getEventManagersByEventId(event.id);
            expect(result).toEqual([]);
        });
    });

    // 14: listEvents
    describe('listEvents', () => {
        it('should list events with filters, pagination, and sort', async () => {
            await createEvent({ name: 'Event A', capacity: 50 });
            await createEvent({ name: 'Event B', capacity: 30 });
            await createEvent({ name: 'Event C', capacity: 70 });

            const filter: EventFilterDto = { name: 'Event' };
            const pagination: Pagination = { page: 1, limit: 2 };
            const sort: SortOption = { field: 'name', order: 'asc' };

            const result = await repo.listEvents(filter, pagination, sort);
            expect(result.items.length).toBe(2);
            expect(result.total).toBe(3);
            expect(result.items[0].name).toBe('Event A');
            expect(result.items[1].name).toBe('Event B');
        });

        it('should return empty list if no matches', async () => {
            const filter: EventFilterDto = { name: 'Nonexistent Event' };
            const result = await repo.listEvents(filter);
            expect(result.items).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    // 15: findByOwnerId
    describe('findByOwnerId', () => {
        it('should find events by owner ID', async () => {
            await createEvent({ name: 'Owner Event 1', ownerId: '9a3bfd8e-8962-426e-a878-2ed19ded8ea7' });
            await createEvent({ name: 'Owner Event 2', ownerId: '9a3bfd8e-8962-426e-a878-2ed19ded8ea7' });
            await createEvent({ name: 'Other Event', ownerId: '44d9da63-6118-4441-b1b0-c09681a3886f' });

            const result = await repo.findByOwnerId('9a3bfd8e-8962-426e-a878-2ed19ded8ea7');
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Owner Event 1');
            expect(result[1].name).toBe('Owner Event 2');
        });

        it('should return empty array if none found', async () => {
            const result = await repo.findByOwnerId('9a3bfd8e-8962-426e-a878-2ed19ded8ea7');
            expect(result).toEqual([]);
        });
    });

    // 16: count
    describe('count', () => {
        it('should count events with filters', async () => {
            await createEvent({ name: 'Count Event 1', location: 'Location A', capacity: 50 });
            await createEvent({ name: 'Count Event 2', location: 'Location B', capacity: 30 });
            await createEvent({ name: 'Other Event', location: 'Location C', capacity: 70 });

            const result = await repo.count({ name: 'Count' });
            expect(result).toBe(2);
        });

        it('should return 0 if no matches', async () => {
            const result = await repo.count({ name: 'Nonexistent Event' });
            expect(result).toBe(0);
        });
    });
});