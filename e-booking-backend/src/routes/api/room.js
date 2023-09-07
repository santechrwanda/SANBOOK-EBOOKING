import express from "express";
import roomController from "../../controllers/rooms/roomController";

const routes = express.Router();

routes.get("/all", roomController.getAllRoom);
routes.get("/occupied", roomController.getAllOccupiedRooms);
routes.post("/add", roomController.createRoom);
routes.put("/update", roomController.updateRoom);
routes.get("/:id", roomController.getRoom);
routes.delete("/:id", roomController.deleteRoom);

export default routes;
