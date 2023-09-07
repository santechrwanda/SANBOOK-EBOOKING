import express from "express";
import stockReceiveVoucher from "../../controllers/stock/stockReceiveVoucher";

const routes = express.Router();

routes.post("/add", stockReceiveVoucher.create);
routes.get("/all", stockReceiveVoucher.index);
routes.put("/update", stockReceiveVoucher.updateReceiveVaucher);
routes.delete("/delete/:id", stockReceiveVoucher.destroy);
routes.delete("/deleteall", stockReceiveVoucher.deleteAll);
routes.get(
	"/track-item/:stockItemId",
	stockReceiveVoucher.trackItemTransaction
);

export default routes;
