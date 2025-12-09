export interface TimeSeriesPoint {
    date: string;   // YYYY-MM-DD
    value: number;
}

export interface TimeSeriesDto {
    label: string;           // e.g., "New Users", "Registrations"
    data: TimeSeriesPoint[]; // e.g., last 30 days
}
