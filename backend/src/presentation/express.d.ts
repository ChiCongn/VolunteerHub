import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: import("../../utils/jwt").AccessTokenPayload;
  }
}