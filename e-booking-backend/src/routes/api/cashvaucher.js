import express from "express";
import cashierVaucherController from "../../controllers/cashierVaucherController";

const routes = express.Router();

routes.post("/debit", cashierVaucherController.debit);
routes.post("/credit", cashierVaucherController.credit);
routes.get("/all", cashierVaucherController.index);

export default routes;
