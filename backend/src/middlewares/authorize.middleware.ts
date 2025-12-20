import { Request, Response, NextFunction } from "express";
import logger from "../logger";
import { buildAuthContext, requireActiveStatus } from "../application/policies/helpers";
import { ForbiddenError } from "../domain/errors/user.error";

type PolicyFunction = (...args: any[]) => Promise<void> | void;

/**
 * Generic authorize middleware.
 *
 * @param policyFn - Policy function to execute for this endpoint (e.g., UserPolicy.updateProfile)
 * @param getParams - Optional callback to extract extra params from req
 */
export const authorize =
    (policyFn: PolicyFunction, getParams?: (req: Request) => any[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Build auth context from JWT
            const authUser = await buildAuthContext(req);

            // Active user is required for all actions
            requireActiveStatus(authUser.status);

            // Extract extra params (like targetUserId, postId, etc.)
            const params = getParams ? getParams(req) : [];

            // Call policy function
            await policyFn(authUser, ...params);

            next();
        } catch (err) {
            logger.warn(
                {
                    reason: "Unauthorized access",
                    policy: policyFn.name || "anonymous",
                    url: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                },
                "[Authorize] Access denied"
            );
            if (err instanceof ForbiddenError) {
                return res.status(403).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    };
