import { PrismaClient, Prisma } from "../../../infrastructure/prisma/generated/client";
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { UserStatus, UserRole } from '../../../domain/entities/enums';
import { User } from '../../../domain/entities/user.entity';
import {
    UserNotFoundError,
    CannotDeleteAlreadyDeletedUserError,
    CannotDeleteLockedUserError,
    CannotModifyRootAdminError,
} from "../../../domain/errors/user.error";
import {
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AccountLockedError,
    AccountPendingError,
} from "../../../domain/errors/auth.error";
import logger from "../../../logger";
import { restoreSnapshot } from "../../setup/test-db";
import "dotenv/config";
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

const prisma = new PrismaClient();
const repo = new UserRepository(prisma);
const ROOT_ADMIN_ID = process.env.ROOT_ADMIN_ID;
if (!ROOT_ADMIN_ID) {
    throw new Error("ROOT_ADMIN_ID is not set in environment");
}

beforeAll(() => {
    restoreSnapshot();
})

beforeEach(() => {
    restoreSnapshot();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createVolunteer(overrides = {}) {
    return await repo.create({
        email: `vol-${Date.now()}@test.com`,
        username: `vol${Date.now()}`,
        passwordHash: 'ValidPass123!',
        ...overrides,
    });
}

describe('IUserRepository - 100% REAL DATABASE TESTS', () => {
    // 1. create()
    describe('create()', () => {
        it('create_01 - Create new volunteer successfully', async () => {
            const user = await repo.create({
                username: 'alice_wonder',
                email: 'alicealcie@wonder.com',
                passwordHash: 'MyPass123!',
            });

            console.log(user);

            expect(user.id).toBeDefined();
            expect(user.email).toBe('alicealcie@wonder.com');
            expect(user.role).toBe(UserRole.Volunteer);
            expect(user.status).toBe(UserStatus.Active);

            const db = await prisma.users.findUnique({ where: { id: user.id } });
            expect(db?.username).toBe('alice_wonder');
        });

        it('create_02 - Fail when email already exists', async () => {
            console.log('create user 1');
            await repo.create({
                username: 'user1',
                email: 'dup@test.com',
                passwordHash: 'Pass123!',
            });

            console.log('create user 2');
            await expect(
                repo.create({
                    username: 'user2',
                    email: 'dup@test.com',
                    passwordHash: 'Pass123!',
                })
            ).rejects.toThrow(EmailAlreadyExistsError);
        });
    });

    // 2. findById()
    describe('findById()', () => {
        it('findById_01 - Found user successfully', async () => {
            const created = await createVolunteer();
            const user = await repo.findById(created.id);
            expect(user?.id).toBe(created.id);
            expect(user?.email).toBe(created.email);
        });

        it('findById_02 - User not found', async () => {
            await expect(repo.findById('ghost-999')).rejects.toThrow(
                new UserNotFoundError('ghost-999')
            );
        });

        it('findById_03 - DB query fails', async () => {
            await prisma.$disconnect();
            await expect(repo.findById('any')).rejects.toThrow();
            await prisma.$connect();
        });
    });

    // 3. update()
    describe('update()', () => {
        it('update_01 - Update username successfully', async () => {
            const user = await createVolunteer();
            const updated = await repo.update(user.id, { username: 'new_username' });
            expect(updated.username).toBe('new_username');
        });

        it('update_02 - Update avatar successfully', async () => {
            const user = await createVolunteer();
            const updated = await repo.update(user.id, { avatarUrl: 'https://avatar.com/me.jpg' });
            expect(updated.avatarUrl).toBe('https://avatar.com/me.jpg');
        });

        it('update_03 - Root admin update attempt', async () => {
            await expect(repo.update(ROOT_ADMIN_ID, { username: 'hacked' })).rejects.toThrow(
                CannotModifyRootAdminError
            );
        });

        it('update_04 - User not found', async () => {
            await expect(repo.update('ghost', { username: 'x' })).rejects.toThrow(
                new UserNotFoundError('ghost')
            );
        });
    });

    // 4. softDelete()
    describe('softDelete()', () => {
        it('softDelete_01 - Soft delete active user', async () => {
            const user = await createVolunteer();
            await repo.softDelete(user.id);

            expect(repo.fetchPublicProfile(user.id)).rejects.toThrow(
                new UserNotFoundError(user.id)
            );
            const raw = await prisma.users.findUnique({ where: { id: user.id } });
            expect(raw?.status).toBe(UserStatus.Deleted);
        });

        it('softDelete_02 - Attempt delete root admin', async () => {
            await expect(repo.softDelete(ROOT_ADMIN_ID)).rejects.toThrow(
                CannotModifyRootAdminError
            );
        });

        it('softDelete_03 - User not found', async () => {
            await expect(repo.softDelete('ghost')).rejects.toThrow(
                new UserNotFoundError('ghost')
            );
        });
    });

    // 5. findAuthUserByCredentials()
    describe('findAuthUserByCredentials()', () => {
        it('auth_01 - Valid credentials', async () => {
            await createVolunteer({ email: 'login@test.com', username: 'loginuser' });
            const auth = await repo.findAuthUserByCredentials({
                email: 'login@test.com',
                passwordHash: 'ValidPass123!',
            });
            expect(auth?.email).toBe('login@test.com');
        });

        it('auth_02 - Wrong password', async () => {
            await createVolunteer({ email: 'wrong@test.com' });
            await expect(
                repo.findAuthUserByCredentials({
                    email: 'wrong@test.com',
                    passwordHash: 'WrongPass!',
                })
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it('auth_03 - Non-existing email', async () => {
            await expect(
                repo.findAuthUserByCredentials({
                    email: 'ghost@none.com',
                    passwordHash: 'any',
                })
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it('auth_04 - Locked account', async () => {
            const user = await createVolunteer({ email: 'locked@test.com' });
            await prisma.users.update({
                where: { id: user.id },
                data: { status: UserStatus.Locked },
            });
            await expect(
                repo.findAuthUserByCredentials({
                    email: 'locked@test.com',
                    passwordHash: 'ValidPass123!',
                })
            ).rejects.toThrow(AccountLockedError);
        });

        it('auth_05 - Pending account', async () => {
            await prisma.users.create({
                data: {
                    email: 'pending@test.com',
                    username: 'pending',
                    password_hash: 'Pass123!',
                    role: UserRole.Volunteer,
                    status: UserStatus.Pending,
                },
            });
            await expect(
                repo.findAuthUserByCredentials({
                    email: 'pending@test.com',
                    passwordHash: 'Pass123!',
                })
            ).rejects.toThrow(AccountPendingError);
        });
    });

    // 6. updatePassword()
    describe('updatePassword()', () => {
        it('pwd_01 - Change password successfully', async () => {
            const user = await createVolunteer({ email: 'pwd@test.com' });
            const newHash = await 'SuperNew123!';
            await repo.updatePassword(user.id, newHash);
            const auth = await repo.findAuthUserByCredentials({
                email: user.email,
                passwordHash: 'SuperNew123!',
            });
            expect(auth?.id).toBe(user.id);
        });

        it('pwd_02 - Root admin attempt', async () => {
            await expect(repo.updatePassword(ROOT_ADMIN_ID, 'hack')).rejects.toThrow(
                CannotModifyRootAdminError
            );
        });

        it('pwd_03 - User not found', async () => {
            await expect(repo.updatePassword('ghost', 'x')).rejects.toThrow(
                new UserNotFoundError('ghost')
            );
        });
    });

    // 7. updateLastLogin()
    describe('updateLastLogin()', () => {
        it('login_01 - Update last login with provided date', async () => {
            const user = await createVolunteer();
            const date = new Date('2025-12-25T10:00:00Z');
            await repo.updateLastLogin(user.id, date);
            const db = await prisma.users.findUnique({ where: { id: user.id } });
            expect(db?.last_login).toEqual(date);
        });

        it('login_02 - Update last login with default date', async () => {
            const user = await createVolunteer();
            await repo.updateLastLogin(user.id);
            const db = await prisma.users.findUnique({ where: { id: user.id } });
            expect(db?.last_login).toBeDefined();
        });

        it('login_03 - Root admin attempt', async () => {
            await expect(repo.updateLastLogin(ROOT_ADMIN_ID)).rejects.toThrow(
                CannotModifyRootAdminError
            );
        });
    });

    // 8. fetchPublicProfile()
    describe('fetchPublicProfile()', () => {
        it('public_01 - Found user → minimal profile', async () => {
            const user = await createVolunteer({ username: 'Public Man' });
            const profile = await repo.fetchPublicProfile(user.id);
            expect(profile?.username).toBe('Public Man');
            expect(profile).not.toHaveProperty('email');
            expect(profile).not.toHaveProperty('password_hash');
        });

        it('public_02 - Not found → null', async () => {
            expect(repo.fetchPublicProfile('ghost')).rejects.toThrow(
                new UserNotFoundError('ghost')
            );
        });
    });

    // 9. searchPublicProfilesByDisplayName()
    describe('searchPublicProfilesByDisplayName()', () => {
        it('search_01 - Case-insensitive match', async () => {
            await createVolunteer({ username: 'johnny' });
            await createVolunteer({ username: 'JOHNDOE' });
            const results = await repo.searchPublicProfilesByDisplayName('john');
            expect(results?.length).toBe(2);
        });

        it('search_02 - No results → []', async () => {
            const results = await repo.searchPublicProfilesByDisplayName('xyz999');
            expect(results).toEqual([]);
        });

        it('search_03 - Exclude deleted/locked users', async () => {
            const locked = await createVolunteer({ username: 'hiddenuser' });
            await prisma.users.update({
                where: { id: locked.id },
                data: { status: UserStatus.Locked },
            });
            const results = await repo.searchPublicProfilesByDisplayName('hiddenuser');
            expect(results?.length).toBe(0);
        });
    });

    // 10. fetchAdminUserView()
    describe('fetchAdminUserView()', () => {
        it('admin_01 - Found user → all fields', async () => {
            const user = await createVolunteer();
            const view = await repo.fetchAdminUserView(user.id);
            expect(view?.email).toBe(user.email);
            expect(view?.status).toBe(UserStatus.Active);
        });

        it('admin_02 - Not found', async () => {
            expect(repo.fetchAdminUserView('ghost')).rejects.toThrow(
                new UserNotFoundError('ghost')
            );
        });
    });

    // 11. listUsers()
    describe('listUsers()', () => {
        it('list_01 - Filter by role', async () => {
            await createVolunteer({ role: UserRole.EventManager });
            const result = await repo.listUsers({ role: UserRole.EventManager });
            expect(result.items.every(u => u.role === UserRole.EventManager)).toBe(true);
        });

        it('list_02 - Filter by status', async () => {
            const result = await repo.listUsers({ status: UserStatus.Active });
            expect(result.items.every(u => u.status === UserStatus.Active)).toBe(true);
        });

        it('list_03 - Search by keyword', async () => {
            await createVolunteer({ username: 'searchme123' });
            const result = await repo.listUsers({ search: 'searchme' });
            expect(result.items[0].username).toContain('searchme');
        });

        it('list_04 - Pagination works', async () => {
            //await Promise.all(Array(25).fill(null).map(() => createVolunteer()));
            const result = await repo.listUsers({}, { page: 2, limit: 3 });
            expect(result.items.length).toBe(3);
        });
    });

    // 12. setUserLock()
    describe('setUserLock()', () => {
        it('lock_01 - Lock user', async () => {
            const user = await createVolunteer();
            await repo.setUserLock(user.id, true);
            const db = await prisma.users.findUnique({ where: { id: user.id } });
            expect(db?.status).toBe(UserStatus.Locked);
        });

        it('lock_02 - Unlock user', async () => {
            const user = await createVolunteer();
            await repo.setUserLock(user.id, true);
            await repo.setUserLock(user.id, false);
            const db = await prisma.users.findUnique({ where: { id: user.id } });
            expect(db?.status).toBe(UserStatus.Active);
        });

        it('lock_03 - Root admin → throw', async () => {
            await expect(repo.setUserLock(ROOT_ADMIN_ID, true)).rejects.toThrow(
                CannotModifyRootAdminError
            );
        });
    });

    // 13. count()
    describe('count()', () => {
        it('count_01 - Count all users', async () => {
            await createVolunteer();
            await createVolunteer();
            const total = await repo.count();
            expect(total).toBe(8);
        });

        it('count_02 - Count by role', async () => {
            await createVolunteer({ role: UserRole.EventManager });
            await createVolunteer({ role: UserRole.EventManager });
            const count = await repo.count({ role: UserRole.EventManager });
            expect(count).toBe(2);
        });

        it('count_03 - Count with keyword search', async () => {
            await createVolunteer({ username: 'johnny' });
            const count = await repo.count({ search: 'johnny'});
            expect(count).toBe(1);
        });
    });
});