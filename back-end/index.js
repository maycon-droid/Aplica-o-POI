import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Poi from "./model/Poi.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port  = process.env.API_PORT || 3000;

import PoiRouter from "./router/PoiRouter.js";
app.use('/pois', PoiRouter);

try {
  await Poi.sync();

  app.listen(port, () => {
    console.log(`GeoAlerta rodando na porta ${port}`);
  });
} catch (error) {
  console.error("Erro ao inicializar o banco:", error);
  process.exit(1);
}