import express from "express";
import customerBillController from "../../controllers/productCheckout/customerBillController";

const routes = express.Router();

routes.get("/all", customerBillController.index);
routes.get("/search", customerBillController.getCustomerBill);
routes.post("/add-to-reservation", customerBillController.addToReservation);
routes.post(
	"/remove-from-reservation",
	customerBillController.removeFromReservation
);
routes.post("/delete", customerBillController.destroy);
routes.put("/update", customerBillController.update);

export default routes;
