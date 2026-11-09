import Poi from "../model/Poi.js";
import { Op, fn, col, where } from "sequelize";

export async function getPois(req, res) {
  try {
    const { north, south, east, west } = req.query;

    const limites = [north, south, east, west].map(Number);

    if (
      [north, south, east, west].some(
        (valor) => valor === undefined || valor === "",
      ) ||
      limites.some((valor) => !Number.isFinite(valor))
    ) {
      return res.status(400).json({
        erro: "Informe north, south, east e west válidos",
      });
    }

    const [norte, sul, leste, oeste] = limites;

    if (
      sul < -90 ||
      norte > 90 ||
      sul > norte ||
      oeste < -180 ||
      leste > 180 ||
      oeste > leste
    ) {
      return res.status(400).json({
        erro: "Limites geográficos inválidos",
      });
    }

    const areaVisivel = fn("ST_MakeEnvelope", oeste, sul, leste, norte, 4326);

    const pois = await Poi.findAll({
      where: where(fn("ST_Intersects", col("localizacao"), areaVisivel), true),
    });

    res.json(pois);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao consultar ocorrências",
    });
  }
}

export async function createPoi(req, res) {
  try {
    const poi = await Poi.create(req.body);
    res.status(201).json(poi);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao cadastrar ocorrência" });
  }
}

export async function updatePoi(req, res) {
  try {
    const { id } = req.params;

    const poi = await Poi.findByPk(id);

    if (!poi) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada",
      });
    }

    const { nome, descricao, tipo, status, localizacao } = req.body;

    await poi.update({
      nome,
      descricao,
      tipo,
      status,
      localizacao,
    });

    res.json(poi);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao atualizar ocorrência" });
  }
}

export async function deletePoi(req, res) {
  try {
    const { id } = req.params;

    const poi = await Poi.findByPk(id);

    if (!poi) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada",
      });
    }

    await poi.destroy();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao excluir ocorrência" });
  }
}
