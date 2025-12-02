import express from "express";
import { PrismaClient } from "../../infrastructure/prisma/generated/client";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { EventRepository } from "../../infrastructure/repositories/event.repository";
import { EventController } from "../controllers/event.controller";

export const eventRouter = express.Router();

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma, userRepo);
const eventController = new EventController(eventRepo);

eventRouter.get("/", (req, res) => eventController.getAllEvents(req, res));
eventRouter.get("/:id", (req, res) => eventController.getEventById(req, res));

eventRouter.post("/", (req, res) => eventController.createEvent(req, res));
eventRouter.put("/:id", (req, res) => eventController.updateEvent(req, res));
eventRouter.delete("/:id", (req, res) => eventController.deleteEvent(req, res));
