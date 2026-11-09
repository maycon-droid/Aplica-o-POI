import Poi from "../model/Poi.js";

export async function getPois(req, res) {
  try {
    const pois = await Poi.findAll();
    res.json(pois);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar ocorrências" });
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
