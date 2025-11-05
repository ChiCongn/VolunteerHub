export class Log {
    constructor(
        public readonly id: string,
        public readonly action: string,
        public readonly userId: string | null,
        public readonly details: Record<string, any> | null,
        public readonly ip: string | null,
        public readonly createdAt: Date
    ) {}
}
