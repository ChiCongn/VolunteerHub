export interface ListResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface Pagination {
    page: number;
    limit: number;
}

export interface SortOption {
    field: string;
    order: "asc" | "desc";
}
