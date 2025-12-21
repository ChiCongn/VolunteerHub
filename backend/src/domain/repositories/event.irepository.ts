import { Event, IEvent } from "../entities/event.entity";
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView,
    EventAuthInfo,
} from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { PublicUserProfile } from "../../application/dtos/user.dto";
import { RegistrationStatus } from "../entities/enums";
import {
    DailyParticipantDto,
    DailyPostDto,
    EventRegistrationStatusCountDto,
} from "../../application/dtos/stats";

export interface IEventRepository {
    // Core CRUD
    create(data: CreateEventDto): Promise<IEvent>;
    findById(id: string): Promise<IEvent>;
    update(id: string, data: UpdateEventDto): Promise<IEvent>;
    incrementRegisterCount(eventId: string): Promise<void>;
    decrementRegisterCount(eventId: string): Promise<void>
    softDelete(id: string): Promise<void>;

    // Public view
    fetchPublicView(id: string): Promise<PublicEventView | null>;
    searchEvent(
        filters?: EventFilterDto,
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
    getTrendingCandidates(limit: number): Promise<IEvent[]>;

    checkExistedAndApprovedEvent(eventId: string): Promise<void>;

    findByOwnerId(ownerId: string): Promise<PublicEventView[]>;
    count(filters?: EventFilterDto): Promise<number>;
    exists(eventId: string): Promise<boolean>;
    canRegisterForEvent(eventId: string): Promise<boolean>;
    getEventStartTime(eventId: string): Promise<Date>;

    findOwner(eventId: string): Promise<string>;
    findManagers(eventId: string): Promise<string[]>;
    getEventAuthInfo(eventId: string): Promise<EventAuthInfo>;
    getRegistrationStatus(userId: string, eventId: string): Promise<RegistrationStatus>;

    // ============ stats ================
    getEventParticipationStats(eventId: string): Promise<EventRegistrationStatusCountDto>;
    getApprovedRegistrations(eventId: string, days: number): Promise<DailyParticipantDto[]>;
    getPostsDays(eventId: string, days: number): Promise<DailyPostDto[]>;
}
