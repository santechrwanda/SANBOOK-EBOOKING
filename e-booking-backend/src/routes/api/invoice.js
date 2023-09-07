import express from "express";
import invoiceController from "../../controllers/accountant/invoiceController";

const routes = express.Router();

routes.post("/add", invoiceController.create);
routes.get("/all", invoiceController.index);
routes.get("/payments", invoiceController.index);
routes.get("/company/payments", invoiceController.index);
routes.post("/approve", invoiceController.approve);
routes.put("/update", invoiceController.update);
routes.post("/payment", invoiceController.payment);
routes.get("/:id", invoiceController.show);
routes.post("/delete", invoiceController.destroy);
routes.delete("/delete", invoiceController.deleteAll);

export default routes;
