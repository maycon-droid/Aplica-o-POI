let center = [-6.8863, -38.5559];

var map = L.map("map").setView(center, 13);

let marker = L.marker(center, {
  draggable: true,
  opacity: 0.7,
  icon: L.icon({
    iconUrl:
      "https://images.icon-icons.com/7373/PNG/512/403167_map_pin_plus_ve2ec473621.png",
    iconSize: [30, 30],
  }),
}).addTo(map);

let ocorrenciaEmEdicao = null;

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Geolocalização do navegador
map.locate();

map.on("locationfound", (e) => {
  map.setView(e.latlng);
  marker.setLatLng(e.latlng);
});

// Selecionar localização pelo mapa
map.on("click", (e) => {
  map.setView(e.latlng);
  marker.setLatLng(e.latlng);
});

// Buscar localidades pelo Nominatim
const botaoBuscar = document.getElementById("btnBuscar");

botaoBuscar.addEventListener("click", async () => {
  const localBuscar = document.getElementById("buscar-inp").value.trim();

  if (!localBuscar) {
    alert("Digite uma localidade para buscar.");
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(localBuscar)}&format=json`,
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar localidade");
    }

    const data = await response.json();

    if (data.length > 0) {
      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);

      map.setView([lat, lon], 15);
      marker.setLatLng([lat, lon]);
    } else {
      alert("Local não encontrado");
    }
  } catch (error) {
    console.error(error);
    alert("Não foi possível buscar a localidade.");
  }
});

// Carregar pontos cadastrados
carregarPontos();

async function carregarPontos() {
  try {
    const response = await fetch("http://localhost:3000/pois");

    if (!response.ok) {
      throw new Error("Erro ao carregar ocorrências");
    }

    const pontos = await response.json();

    pontos.forEach((ponto) => {
      const [longitude, latitude] = ponto.localizacao.coordinates;

      const marcador = L.marker([latitude, longitude]).addTo(map);

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
      editar.textContent = "Editar";
      editar.addEventListener("click", () => editarOcorrencia(ponto));

      const excluir = document.createElement("button");
      excluir.textContent = "Excluir";
      excluir.addEventListener("click", () => excluirOcorrencia(ponto.id));

      popup.append(titulo, descricao, categoria, status, editar, excluir);

      marcador.bindPopup(popup);
    });
  } catch (error) {
    console.error(error);
    alert("Não foi possível carregar as ocorrências.");
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
    const response = await fetch(`http://localhost:3000/pois/${id}`, {
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
// Salvar ocorrência
const botaoSalvar = document.getElementById("btnSalvar");

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
    ? `http://localhost:3000/pois/${ocorrenciaEmEdicao}`
    : "http://localhost:3000/pois";

  try {
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
  }
});
