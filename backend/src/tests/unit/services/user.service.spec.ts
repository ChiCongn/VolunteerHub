import { beforeAll, vi, it, expect } from "vitest";
import * as jwtUtils from "../../../utils/jwt";
import { describe } from "node:test";
import { app } from "../../../server";
import request from "supertest";
import { CannotModifyRootAdminError, UserNotFoundError } from "../../../domain/errors/user.error";
import { UserService } from "../../../application/services/user.service";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { User } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/entities/enums";
import { UpdateUserDto } from "../../../application/dtos/user.dto";

const rootId = "root";
const existed = "test001";

let mockVolunteer = new User({
    id: existed,
    username: "example",
    email: "example@gmail.com",
    passwordHash: "hehehehe",
    avatarUrl: "", // or leave undefined to use default
    role: UserRole.Volunteer,
    status: UserStatus.Active,
    notificationIds: [],
    postIds: [],
    participatedEventIds: [],
    registeredEventIds: [],
    lastLogin: null,
    updatedAt: new Date(),
});

const mockUserRepo: Partial<UserRepository> = {
    softDelete: vi.fn().mockImplementation((userId) => {
        if (userId === rootId) {
            throw new CannotModifyRootAdminError();
        }
        if (userId !== existed) {
            throw new UserNotFoundError(userId);
        }
    }),
    update: vi
        .fn()
        .mockImplementation(
            async (
                userId: string,
                dto: { username?: string; passwordHash?: string; avatarUrl?: string }
            ) => {
                if (userId === rootId) {
                    throw new CannotModifyRootAdminError();
                }

                if (userId !== existed) {
                    throw new UserNotFoundError(userId);
                }

                mockVolunteer.updateProfile(dto);
                //console.log(mockVolunteer);

                return mockVolunteer;
            }
        ),
};

const userService = new UserService(mockUserRepo as UserRepository);

describe("UserService.updateProfile", () => {
    it("should update profile successfully", async () => {
        const result = await userService.updateProfile(existed, {
            username: "newname",
            avatarUrl: "new-avatar.png",
        });

        expect(result.username).toBe("newname");
        expect(result.avatarUrl).toBe("new-avatar.png");
    });

    it("should throw CannotModifyRootAdminError for root user", async () => {
        await expect(userService.updateProfile(rootId, { username: "hacker" })).rejects.toThrow(
            CannotModifyRootAdminError
        );
    });

    it("should throw UserNotFoundError for non-existent user", async () => {
        await expect(
            userService.updateProfile("nonexistent", { username: "ghost" })
        ).rejects.toThrow(UserNotFoundError);
    });
});

describe("DELETE delete", () => {
    it("should delete successfully", async () => {
        await expect(userService.softDelete(existed)).resolves.not.toThrow();

        expect(mockUserRepo.softDelete).toHaveBeenCalledTimes(1);
        expect(mockUserRepo.softDelete).toHaveBeenCalledWith(existed);
    });

    it("should throw error when trying to delete root account", async () => {
        await expect(userService.softDelete(rootId)).rejects.toThrow(CannotModifyRootAdminError);

        expect(mockUserRepo.softDelete).toHaveBeenCalledWith(rootId);
    });

    it("should throw user not found", async () => {
        const invalidId = "userXYZ";

        await expect(userService.softDelete(invalidId)).rejects.toThrow(UserNotFoundError);

        expect(mockUserRepo.softDelete).toHaveBeenCalledWith(invalidId);
    });
});
