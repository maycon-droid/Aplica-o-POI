import express from "express";
import {
  getPois,
  createPoi,
  updatePoi,
  deletePoi,
  getPoisProximos,
} from "../controller/PoiController.js";

const PoiRouter = express.Router();

PoiRouter.get("/", getPois);
PoiRouter.post("/", createPoi);
PoiRouter.put("/:id", updatePoi);
PoiRouter.delete("/:id", deletePoi);
PoiRouter.get("/proximos", getPoisProximos);

export default PoiRouter;
