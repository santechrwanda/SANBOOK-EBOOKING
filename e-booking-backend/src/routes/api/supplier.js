import express from "express";
import supplierController from "../../controllers/stock/supplierController";
const routes = express.Router();

routes.get("/all-lists", supplierController.GetAllSupplierLists);
routes.get("/all-suppliers", supplierController.GetAllSuppliers);
routes.post("/create/supplier", supplierController.createSupplier);
routes.post("/supplier/lists", supplierController.GetSupplyListsBySupplier);
routes.post("/receive", supplierController.receiveItemsFromSupplier);
routes.put("/update-list", supplierController.updateSupplyList);
routes.post("/list", supplierController.deleteSupplyList);
routes.delete("/all-suppliers", supplierController.deleteAllSuppliers);

export default routes;
