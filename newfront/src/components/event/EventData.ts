import type { Event as EventData } from "@/types/event.type";
import { EventCategory, EventStatus } from "@/types/enum";

export type Event = {
    id: string;
    ownerId: string;

    name: string;
    location: string;
    startTime: Date;
    endTime: Date | null;
    description: string;
    imageUrl: string;
    categories: EventCategory[];
    status: EventStatus;

    capacity: number;
    registerCount: number;
    updatedAt: Date;
};

export const mockEvents: EventData[] = [
    {
        id: "evt-001",
        ownerId: "user-001",
        name: "Community Clean-Up Day",
        location: "Hoan Kiem Lake, Hanoi",
        startTime: new Date("2025-01-15T07:30:00"),
        endTime: new Date("2025-01-15T11:30:00"),
        description:
            "Join volunteers to clean up the area around Hoan Kiem Lake and raise awareness about environmental protection.",
        imageUrl:
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
        categories: [EventCategory.CommunityService],
        status: EventStatus.Approved,
        capacity: 100,
        registerCount: 68,
        updatedAt: new Date("2025-01-01T10:00:00"),
    },

    {
        id: "evt-003",
        ownerId: "user-003",
        name: "Mental Health Awareness Talk",
        location: "Youth Cultural Center, HCMC",
        startTime: new Date("2025-02-10T18:00:00"),
        endTime: null,
        description:
            "An open discussion session with psychologists focusing on stress management and mental well-being.",
        imageUrl:
            "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca",
        categories: [EventCategory.HealthWellness],
        status: EventStatus.Pending,
        capacity: 200,
        registerCount: 95,
        updatedAt: new Date("2025-01-10T14:00:00"),
    },

    {
        id: "evt-004",
        ownerId: "user-004",
        name: "Volunteer Social Meetup",
        location: "District 1, Ho Chi Minh City",
        startTime: new Date("2025-01-20T19:00:00"),
        endTime: new Date("2025-01-20T21:30:00"),
        description:
            "A casual social meetup for volunteers to connect, share experiences, and plan future activities.",
        imageUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
        categories: [EventCategory.Social],
        status: EventStatus.Approved,
        capacity: 80,
        registerCount: 57,
        updatedAt: new Date("2025-01-08T08:00:00"),
    },

    {
        id: "evt-005",
        ownerId: "user-005",
        name: "Charity Fundraising Workshop",
        location: "Da Nang City",
        startTime: new Date("2025-03-05T09:00:00"),
        endTime: new Date("2025-03-05T12:00:00"),
        description:
            "Learn effective fundraising strategies to support charity and non-profit projects.",
        imageUrl:
            "https://images.unsplash.com/photo-1497493292307-31c376b6e479",
        categories: [EventCategory.Other, EventCategory.Education],
        status: EventStatus.Approved,
        capacity: 50,
        registerCount: 23,
        updatedAt: new Date("2025-01-12T16:45:00"),
    },

    {
        id: "evt-006",
        ownerId: "user-001",
        name: "Community Clean-Up Day",
        location: "Hoan Kiem Lake, Hanoi",
        startTime: new Date("2025-01-15T07:30:00"),
        endTime: new Date("2025-01-15T11:30:00"),
        description:
            "Join volunteers to clean up the area around Hoan Kiem Lake and raise awareness about environmental protection.",
        imageUrl:
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
        categories: [EventCategory.CommunityService],
        status: EventStatus.Approved,
        capacity: 100,
        registerCount: 68,
        updatedAt: new Date("2025-01-01T10:00:00"),
    },

    {
        id: "evt-007",
        ownerId: "user-003",
        name: "Mental Health Awareness Talk",
        location: "Youth Cultural Center, HCMC",
        startTime: new Date("2025-02-10T18:00:00"),
        endTime: null,
        description:
            "An open discussion session with psychologists focusing on stress management and mental well-being.",
        imageUrl:
            "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca",
        categories: [EventCategory.HealthWellness],
        status: EventStatus.Pending,
        capacity: 200,
        registerCount: 95,
        updatedAt: new Date("2025-01-10T14:00:00"),
    },

    {
        id: "evt-008",
        ownerId: "user-004",
        name: "Volunteer Social Meetup",
        location: "District 1, Ho Chi Minh City",
        startTime: new Date("2025-01-20T19:00:00"),
        endTime: new Date("2025-01-20T21:30:00"),
        description:
            "A casual social meetup for volunteers to connect, share experiences, and plan future activities.",
        imageUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
        categories: [EventCategory.Social],
        status: EventStatus.Approved,
        capacity: 80,
        registerCount: 57,
        updatedAt: new Date("2025-01-08T08:00:00"),
    },

    {
        id: "evt-009",
        ownerId: "user-005",
        name: "Charity Fundraising Workshop",
        location: "Da Nang City",
        startTime: new Date("2025-03-05T09:00:00"),
        endTime: new Date("2025-03-05T12:00:00"),
        description:
            "Learn effective fundraising strategies to support charity and non-profit projects.",
        imageUrl:
            "https://images.unsplash.com/photo-1497493292307-31c376b6e479",
        categories: [EventCategory.Other, EventCategory.Education],
        status: EventStatus.Approved,
        capacity: 50,
        registerCount: 23,
        updatedAt: new Date("2025-01-12T16:45:00"),
    },

    {
        id: "evt-0010",
        ownerId: "user-004",
        name: "Volunteer Social Meetup",
        location: "District 1, Ho Chi Minh City",
        startTime: new Date("2025-01-20T19:00:00"),
        endTime: new Date("2025-01-20T21:30:00"),
        description:
            "A casual social meetup for volunteers to connect, share experiences, and plan future activities.",
        imageUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
        categories: [EventCategory.Social],
        status: EventStatus.Approved,
        capacity: 80,
        registerCount: 57,
        updatedAt: new Date("2025-01-08T08:00:00"),
    },
];
