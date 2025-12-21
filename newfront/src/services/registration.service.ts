import apiClient from "@/lib/api-client";
import type { EventStatus, RegistrationStatus } from "@/types/enum";

export const registrationService = {
    getMyJoinedEvents: async (): Promise<UserJoinedEvent[]> => {
        const response = await apiClient.get("/registrations/my-events");
        return response.data;
    },

    withdrawRegistration: async (registrationId: string): Promise<void> => {
        await apiClient.delete(`/registrations/${registrationId}`);
    },
};

export interface UserJoinedEvent {
    registrationId: string;
    eventId: string;
    eventName: string;
    eventStatus: EventStatus;
    imageUrl: string;
    startTime: Date;
    registrationStatus: RegistrationStatus;
}