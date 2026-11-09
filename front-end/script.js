const API_URL = "http://localhost:3000";
const center = [-6.8863, -38.5559];
const map = L.map("map").setView(center, 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const camadaOcorrencias = L.layerGroup().addTo(map);

const marker = L.marker(center, {
  draggable: true,
  opacity: 0.7,
  icon: L.icon({
    iconUrl:
      "https://images.icon-icons.com/7373/PNG/512/403167_map_pin_plus_ve2ec473621.png",
    iconSize: [30, 30],
  }),
}).addTo(map);

let ocorrenciaEmEdicao = null;
let consultaAtual = 0;
let modoProximidade = false;
let circuloBusca = null;
let buscaProximidadeAtual = 0;

const botaoBuscar = document.getElementById("btnBuscar");
const botaoSalvar = document.getElementById("btnSalvar");
const btnProximos = document.getElementById("btnProximos");
const btnLimparBusca = document.getElementById("btnLimparBusca");

map.locate();

map.on("locationfound", (e) => {
  map.setView(e.latlng);
  marker.setLatLng(e.latlng);
});

map.on("locationerror", (e) => {
  console.warn("Geolocalização indisponível:", e.message);
});

map.on("click", (e) => {
  marker.setLatLng(e.latlng);
});

botaoBuscar.addEventListener("click", async () => {
  const localBuscar = document.getElementById("buscar-inp").value.trim();

  if (!localBuscar) {
    alert("Digite uma localidade para buscar.");
    return;
  }

  try {
    const parametros = new URLSearchParams({
      q: localBuscar,
      format: "json",
      limit: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${parametros}`,
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar localidade");
    }

    const data = await response.json();

    if (data.length === 0) {
      alert("Local não encontrado.");
      return;
    }

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);

    map.setView([latitude, longitude], 15);
    marker.setLatLng([latitude, longitude]);
  } catch (error) {
    console.error(error);
    alert("Não foi possível buscar a localidade.");
  }
});

function exibirOcorrencias(pontos) {
  camadaOcorrencias.clearLayers();

  pontos.forEach((ponto) => {
    if (!ponto.localizacao?.coordinates) return;

    const [longitude, latitude] = ponto.localizacao.coordinates;

    const marcador = L.marker([latitude, longitude], {
      icon: criarIconeOcorrencia(ponto.tipo),
    });

    const popup = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = ponto.nome;

    const descricao = document.createElement("p");
    descricao.textContent = ponto.descricao || "";

    const categoria = document.createElement("p");
    categoria.textContent = `Categoria: ${ponto.tipo}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${ponto.status || "Pendente"}`;

    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar";

    editar.addEventListener("click", () => {
      editarOcorrencia(ponto);
    });

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.textContent = "Excluir";

    excluir.addEventListener("click", () => {
      excluirOcorrencia(ponto.id);
    });

    popup.append(titulo, descricao, categoria, status, editar, excluir);

    marcador.bindPopup(popup);
    marcador.addTo(camadaOcorrencias);
  });
}
async function carregarPontos() {
  if (modoProximidade) return;

  const numeroConsulta = ++consultaAtual;
  const bounds = map.getBounds();

  const parametros = new URLSearchParams({
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  });

  try {
    const response = await fetch(`${API_URL}/pois?${parametros}`);

    if (!response.ok) {
      throw new Error("Erro ao buscar ocorrências");
    }

    const pontos = await response.json();

    if (numeroConsulta !== consultaAtual || modoProximidade) {
      return;
    }

    exibirOcorrencias(pontos);
  } catch (error) {
    if (numeroConsulta === consultaAtual) {
      console.error("Erro ao carregar ocorrências:", error);
    }
  }
}
function editarOcorrencia(ponto) {
  ocorrenciaEmEdicao = ponto.id;

  document.getElementById("campoNome").value = ponto.nome;

  document.getElementById("campoDescricao").value = ponto.descricao || "";

  document.getElementById("campoTipo").value = ponto.tipo;

  const campoStatus = document.getElementById("campoStatus");

  if (campoStatus) {
    campoStatus.value = ponto.status || "Pendente";
  }

  const [longitude, latitude] = ponto.localizacao.coordinates;

  marker.setLatLng([latitude, longitude]);
  map.setView([latitude, longitude], 16);

  botaoSalvar.textContent = "Atualizar ocorrência";

  document.getElementById("campoNome").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

async function excluirOcorrencia(id) {
  const confirmado = confirm("Deseja realmente excluir esta ocorrência?");

  if (!confirmado) return;

  try {
    const response = await fetch(`${API_URL}/pois/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir ocorrência");
    }

    alert("Ocorrência excluída com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Não foi possível excluir a ocorrência.");
  }
}

botaoSalvar.addEventListener("click", async () => {
  const nome = document.getElementById("campoNome").value.trim();

  const descricao = document.getElementById("campoDescricao").value.trim();

  const tipo = document.getElementById("campoTipo").value;
  const campoStatus = document.getElementById("campoStatus");

  if (!nome || !tipo) {
    alert("Preencha o nome e a categoria.");
    return;
  }

  const { lat, lng } = marker.getLatLng();

  const ponto = {
    nome,
    descricao,
    tipo,
    status: campoStatus ? campoStatus.value : "Pendente",
    localizacao: {
      type: "Point",
      coordinates: [lng, lat],
    },
  };

  const editando = ocorrenciaEmEdicao !== null;

  const url = editando
    ? `${API_URL}/pois/${ocorrenciaEmEdicao}`
    : `${API_URL}/pois`;

  try {
    botaoSalvar.disabled = true;

    const response = await fetch(url, {
      method: editando ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ponto),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar ocorrência");
    }

    alert(
      editando
        ? "Ocorrência atualizada com sucesso!"
        : "Ocorrência cadastrada com sucesso!",
    );

    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar a ocorrência.");
  } finally {
    botaoSalvar.disabled = false;
  }
});

btnProximos.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  const tentativa = ++buscaProximidadeAtual;

  navigator.geolocation.getCurrentPosition(
    async (posicao) => {
      if (tentativa !== buscaProximidadeAtual) return;

      const latitude = posicao.coords.latitude;
      const longitude = posicao.coords.longitude;

      const raio = Number(document.getElementById("raioBusca").value);

      modoProximidade = true;
      const numeroConsulta = ++consultaAtual;

      try {
        const parametros = new URLSearchParams({
          lat: latitude,
          lng: longitude,
          raio,
        });

        const response = await fetch(`${API_URL}/pois/proximos?${parametros}`);

        if (!response.ok) {
          throw new Error("Erro ao buscar ocorrências próximas");
        }

        const ocorrencias = await response.json();

        if (
          numeroConsulta !== consultaAtual ||
          !modoProximidade ||
          tentativa !== buscaProximidadeAtual
        ) {
          return;
        }

        if (circuloBusca) {
          map.removeLayer(circuloBusca);
        }

        circuloBusca = L.circle([latitude, longitude], {
          radius: raio,
          color: "#2563eb",
          fillOpacity: 0.1,
        }).addTo(map);

        exibirOcorrencias(ocorrencias);

        map.fitBounds(circuloBusca.getBounds());

        alert(
          `${ocorrencias.length} ocorrência(s) encontrada(s) em um raio de ${raio} metros.`,
        );
      } catch (error) {
        if (
          tentativa !== buscaProximidadeAtual ||
          numeroConsulta !== consultaAtual
        ) {
          return;
        }

        console.error(error);
        modoProximidade = false;
        carregarPontos();

        alert("Não foi possível buscar ocorrências próximas.");
      }
    },
    (erro) => {
      if (tentativa !== buscaProximidadeAtual) return;

      console.error(erro);

      alert(
        "Não foi possível obter sua localização. Verifique a permissão do navegador.",
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    },
  );
});

btnLimparBusca.addEventListener("click", () => {
  ++buscaProximidadeAtual;
  ++consultaAtual;

  modoProximidade = false;

  if (circuloBusca) {
    map.removeLayer(circuloBusca);
    circuloBusca = null;
  }

  carregarPontos();
});

map.whenReady(() => {
  carregarPontos();
});

map.on("moveend", () => {
  if (!modoProximidade) {
    carregarPontos();
  }
});

const iconesOcorrencias = {
  "Buraco na via": {
    simbolo: "🚧",
    cor: "#d97706",
  },
  "Iluminação pública": {
    simbolo: "💡",
    cor: "#eab308",
  },
  "Acúmulo de lixo": {
    simbolo: "🗑️",
    cor: "#16a34a",
  },
  Alagamento: {
    simbolo: "🌊",
    cor: "#2563eb",
  },
  "Esgoto a céu aberto": {
    simbolo: "💧",
    cor: "#7c3aed",
  },
  Outros: {
    simbolo: "📍",
    cor: "#64748b",
  },
};

function criarIconeOcorrencia(tipo) {
  const configuracao = iconesOcorrencias[tipo] || iconesOcorrencias["Outros"];

  return L.divIcon({
    className: "icone-ocorrencia",
    html: `
      <div
        class="marcador-ocorrencia"
        style="background-color: ${configuracao.cor}"
      >
        <span>${configuracao.simbolo}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}
