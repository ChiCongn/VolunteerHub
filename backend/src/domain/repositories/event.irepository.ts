import { Event } from "../entities/event.entity";
import { 
    CreateEventDto, 
    UpdateEventDto,
    EventFilterDto,
    PublicEventView 
} from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { User } from "../entities/user.entity";
import { PublicUserProfile } from "../../application/dtos/user.dto";

export interface IEventRepository {
    // Core CRUD
    create(data: CreateEventDto): Promise<Event>;
    findById(id: string): Promise<Event>;
    update(id: string, data: UpdateEventDto): Promise<Event>;
    softDelete(id: string): Promise<void>;

    // Public view
    fetchPublicView(id: string): Promise<PublicEventView | null>;
    searchEvent(filters?: EventFilterDto, 
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PublicEventView>>;

    // Event manager
    approveEvent(id: string): Promise<void>;
    rejectEvent(id: string, reason: string): Promise<void>;
    completeEvent(id: string): Promise<void>;
    cancelEvent(id: string): Promise<void>;

    getParticipantsByEventId(eventId: string): Promise<PublicUserProfile[]>;
    getRegisteredUsersByEventId(eventId: string): Promise<PublicUserProfile[]>;
    getEventManagersByEventId(eventId: string): Promise<PublicUserProfile[]>;

    // Admin view
    listEvents(
        filters?: EventFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PublicEventView>>;
    
    findByOwnerId(ownerId: string): Promise<PublicEventView[]>;
    count(filters?: EventFilterDto): Promise<number>;
}
