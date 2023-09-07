import express from "express";
import cashFlowController from "../../controllers/sales/cashFlowController";
const routes = express.Router();

routes.post("/debit", cashFlowController.debit);
routes.post("/credit", cashFlowController.credit);
routes.post("/update", cashFlowController.updateTransaction);
routes.get("/all", cashFlowController.cashFlows);
routes.get("/zero", cashFlowController.setCashToZero);
routes.delete("/deleteAll", cashFlowController.deleteAll);

export default routes;
