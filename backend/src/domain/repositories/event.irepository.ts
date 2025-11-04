import { Event } from "../entities/event.entity";
import { CreateEventDto } from "../../application/dtos/event.dto";
import { UpdateEventDto } from "../../application/dtos/event.dto";
import { EventFilterDto } from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { User } from "../entities/user.entity";

export interface IEventRepository {
    create(data: CreateEventDto): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    update(id: string, data: UpdateEventDto): Promise<Event>;
    softDelete(id: string): Promise<void>;

    approveEvent(id: string): Promise<Event>;
    rejectEvent(id: string, reason: string): Promise<Event>;
    completeEvent(id: string): Promise<Event>;
    cancelEvent(id: string): Promise<Event>;

    listEvents(
        filters?: EventFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Event>>;
    
    findByOwnerId(ownerId: string): Promise<Event[]>;
    findParticipantsByEventId(eventId: string): Promise<User[]>;
    findRegisteredUsersByEventId(eventId: string): Promise<User[]>;
    findEventManagersByEventId(eventId: string): Promise<User[]>;
    count(filters?: EventFilterDto): Promise<number>;
}
