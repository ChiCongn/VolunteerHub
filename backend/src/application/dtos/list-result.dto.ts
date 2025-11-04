export interface ListResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}
