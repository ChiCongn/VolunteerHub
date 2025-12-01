import { ZodSchema, ZodError, ZodIssue } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

type Schemas<P = any, B = any, Q = any> = {
    params?: ZodSchema<P>;
    body?: ZodSchema<B>;
    query?: ZodSchema<Q>;
};

export const validate = <P = {}, B = {}, Q = {}>(
    schemas: Schemas<P, B, Q>
): RequestHandler<P, any, B, Q> => {
    return (req, res, next) => {
        try {
            if (schemas.params) {
                const parsed = schemas.params.safeParse(req.params);
                if (!parsed.success) throw parsed.error;
                req.params = parsed.data as P;
            }

            if (schemas.body) {
                const parsed = schemas.body.safeParse(req.body);
                if (!parsed.success) throw parsed.error;
                req.body = parsed.data as B;
            }

            if (schemas.query) {
                const parsed = schemas.query.safeParse(req.query);
                if (!parsed.success) throw parsed.error;
                req.query = parsed.data as Q;
            }

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    message: "Bad Request",
                    errors: err.issues.map((e) => ({
                        path: e.path.join("."),
                        message: e.message,
                    })),
                });
            }
            next(err);
        }
    };
};
