import express from "express";
import deliveryNoteController from "../../controllers/accountant/deliveryNoteController";

const routes = express.Router();

routes.post("/add", deliveryNoteController.create);
routes.get("/all", deliveryNoteController.index);
routes.put("/update", deliveryNoteController.update);
routes.post("/approve", deliveryNoteController.approve);
routes.get("/:id", deliveryNoteController.show);
routes.post("/delete", deliveryNoteController.destroy);
routes.delete("/deleteall", deliveryNoteController.deleteAll);

export default routes;
