import express from "express";
import { PrismaClient } from "../../infrastructure/prisma/generated/client";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { EventRepository } from "../../infrastructure/repositories/event.repository";
import { EventController } from "../controllers/event.controller";

const router = express.Router();

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma, userRepo);
const eventController = new EventController(eventRepo);

router.get("/", (req, res) => eventController.getAllEvents(req, res));
router.get("/:id", (req, res) => eventController.getEventById(req, res));

router.post("/", (req, res) => eventController.createEvent(req, res));
router.put("/:id", (req, res) => eventController.updateEvent(req, res));
router.delete("/:id", (req, res) => eventController.deleteEvent(req, res));

export default router;
