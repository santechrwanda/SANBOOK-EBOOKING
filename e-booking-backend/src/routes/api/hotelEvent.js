import express from "express";
import eventsController from "../../controllers/eventsController";

const routes = express.Router();

routes.post("/add", eventsController.create);
routes.get("/all", eventsController.index);
routes.post("/confirm", eventsController.confirm);
routes.put("/update", eventsController.update);
routes.get("/:id", eventsController.show);
routes.post("/delete", eventsController.destroy);
routes.delete("/deleteall", eventsController.deleteAll);
routes.post("/event-sheet-add", eventsController.createEventSheet);
routes.put("/event-sheet-update", eventsController.updateEventSheet);
routes.post("/delete-sheet", eventsController.deleteEventSheet);

export default routes;
