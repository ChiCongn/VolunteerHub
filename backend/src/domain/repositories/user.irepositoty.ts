import { CreateVolunteerDto } from "../../application/dtos/user.dto";
import { User } from "../entities/user.entity";
import { ListUserFilterDto } from "../../application/dtos/user.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { UpdateUserDto } from "../../application/dtos/user.dto";

export interface IUserRepository {

    create(user: CreateVolunteerDto): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByDisplayName(username: string): Promise<User[] | null>;
    
    listUsers(filter?: ListUserFilterDto, pagination?: Pagination, sort?: SortOption): Promise<ListResult<User>>;

    update(id: string, data: UpdateUserDto): Promise<User>;
    softDelete(id: string): Promise<void>;

    setUserLock(id: string, locked: boolean): Promise<void>;

    count(filter?: ListUserFilterDto): Promise<number>;

}