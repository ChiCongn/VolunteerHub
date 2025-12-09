import { DomainError } from "../../domain/errors/domain.error";

export const mockController = (fn: Function) => {
    return async (req: any, res: any, next: any) => {
        try {
            await fn(req, res, next);
        } catch (err: any) {
            if (err instanceof DomainError) {
                const status = err.code === "EMAIL_EXISTS" ? 409 : 400;
                return res.status(status).json(err.toResponse());
            }
            console.error(err);
            res.status(500).json({ code: "SERVER_ERROR", message: "Lỗi server" });
        }
    };
};
