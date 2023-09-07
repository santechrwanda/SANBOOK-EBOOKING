import express from "express";
import purchaseOrderAccontantController from "../../controllers/accountant/purchaseOrderAccontantController";

const routes = express.Router();

routes.get("/all", purchaseOrderAccontantController.index);
routes.post("/add", purchaseOrderAccontantController.create);
routes.put("/update", purchaseOrderAccontantController.update);
routes.post("/delete", purchaseOrderAccontantController.destroy);
routes.get("/deleteall", purchaseOrderAccontantController.deleteAll);

export default routes;
