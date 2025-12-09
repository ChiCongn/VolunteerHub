import { User } from "../entities/user.entity";
import { 
    CreateVolunteerDto, 
    UpdateUserDto, 
    ListUserFilterDto, 
    Credentials,
    PublicUserProfile,
    AdminUserView,
    AuthUser
} from "../../application/dtos/user.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { AuthContext } from "../../application/policies/helpers";

export interface IUserRepository {
    // Core CRUD
    create(user: CreateVolunteerDto): Promise<AuthUser>;
    findById(id: string): Promise<User | null>;
    update(id: string, changes: UpdateUserDto): Promise<User>;
    softDelete(id: string): Promise<void>;

    // Auth-related
    findAuthUserByCredentials(credentials: Credentials): Promise<AuthUser | null>;
    updatePassword(userId: string, newPasswordHash: string): Promise<void>;
    updateLastLogin(userId: string, at?: Date): Promise<void>;

    // Public View
    fetchPublicProfile(userId: string): Promise<PublicUserProfile | null>;
    searchPublicProfilesByDisplayName(username: string): Promise<PublicUserProfile[] | null>;

    // Admin view
    fetchAdminUserView(userId: string): Promise<AdminUserView | null>;
    listUsers(
        filter?: ListUserFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<AdminUserView>>;
    count(filter?: ListUserFilterDto): Promise<number>;
    setUserLock(id: string, locked: boolean): Promise<void>;
    exists(userId: string): Promise<boolean>;
    getAuthContext(id: string): Promise<AuthContext>;
}
