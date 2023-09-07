import express from "express";
import proformaController from "../../controllers/accountant/proformaController";

const routes = express.Router();

routes.get("/all", proformaController.index);
routes.get("/:id", proformaController.show);
routes.post("/add", proformaController.create);
routes.post("/approve", proformaController.approve);
routes.put("/update", proformaController.update);
routes.post("/delete", proformaController.destroy);
routes.delete("/deleteall", proformaController.deleteAll);

export default routes;
