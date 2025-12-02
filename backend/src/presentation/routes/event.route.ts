import { Router, Request, Response } from "express";
import { eventController } from "../controllers/event.controller";

export const eventRouter = Router();

eventRouter.get("/", (req, res) => eventController.getAllEvents(req, res));
eventRouter.get("/:id", (req, res) => eventController.getEventById(req, res));

eventRouter.post("/", (req, res) => eventController.createEvent(req, res));
eventRouter.put("/:id", (req, res) => eventController.updateEvent(req, res));
eventRouter.delete("/:id", (req, res) => eventController.deleteEvent(req, res));
