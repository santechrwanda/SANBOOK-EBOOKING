import express from "express";
import reservationController from "../../controllers/reservationController";
import customerController from "../../controllers/customerController";
const routes = express.Router();

routes.get("/all", reservationController.AllReservations);
routes.get("/availableRooms", reservationController.getAvalibleRooms);
routes.post("/add", reservationController.CreateReservation);
routes.post(
	"/add-immediate",
	customerController.CreateCustomer,
	reservationController.CreateReservation
);
routes.post(
	"/reservationcompany",
	reservationController.CreateCompanyReservation
);
routes.post("/pay", reservationController.PayReservation);
routes.post(
	"/checkin",
	reservationController.CreateReservation,
	reservationController.CheckIn
);
routes.post("/checkout", reservationController.Checkout);
routes.put("/update", reservationController.UpdateReservation);
routes.post("/updatedates", reservationController.updateReservationDates);
routes.get("/:id", reservationController.GetReservation);
routes.delete("/delete/:id", reservationController.DeleteReservation);
routes.get("/check/:id", reservationController.ChechOutReservation);
routes.delete("/deleteall", reservationController.deleteAllReservations);

export default routes;
