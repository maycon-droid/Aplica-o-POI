import express from "express";
import {
  getPois,
  createPoi,
  updatePoi,
  deletePoi,
} from "../controller/PoiController.js";

const PoiRouter = express.Router();

PoiRouter.get("/", getPois);
PoiRouter.post("/", createPoi);
PoiRouter.put("/:id", updatePoi);
PoiRouter.delete("/:id", deletePoi);

export default PoiRouter;
