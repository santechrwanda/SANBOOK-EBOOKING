import express from "express";
import serviceController from "../../controllers/serviceController";

const routes = express.Router();

routes.get("/all", serviceController.GetAllServices);
routes.post("/add", serviceController.CreateService);
routes.post("/sell", serviceController.sell);
routes.get("/sells", serviceController.allSells);
routes.get("/sells/search", serviceController.getServiceTransaction);
routes.post(
	"/vaucher/add-to-reservation",
	serviceController.addServiceTransToReservation
);
routes.post(
	"/vaucher/remove-from-reservation",
	serviceController.removeServiceTransToReservation
);
routes.put("/update", serviceController.UpdateService);
routes.delete("/delete/:id", serviceController.DeleteService);
routes.get("/:id", serviceController.GetServiceById);

export default routes;
