
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
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(localBuscar)}&format=json`
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
      throw new Error("Erro ao carregar pontos");
    }

    const data = await response.json();

    data.forEach((ponto) => {
      const [longitude, latitude] = ponto.localizacao.coordinates;

      const marcador = L.marker([latitude, longitude]).addTo(map);

      marcador.bindPopup(ponto.nome);
    });
  } catch (error) {
    console.error(error);
  }
}

// Salvar ocorrência
const botaoSalvar = document.getElementById("btnSalvar");

botaoSalvar.addEventListener("click", async () => {
  const nome = document.getElementById("campoNome").value.trim();
  const descricao = document.getElementById("campoDescricao").value.trim();
  const tipo = document.getElementById("campoTipo").value;

  if (!nome || !tipo) {
    alert("Preencha o nome e a categoria da ocorrência.");
    return;
  }

  const { lat, lng } = marker.getLatLng();

  const localizacao = {
    type: "Point",
    coordinates: [lng, lat],
  };

  const ponto = {
    nome,
    descricao,
    tipo,
    localizacao,
  };

  try {
    const response = await fetch("http://localhost:3000/pois", {
      method: "POST",
      body: JSON.stringify(ponto),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar ocorrência");
    }

    alert("Ocorrência cadastrada com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Não foi possível cadastrar a ocorrência.");
  }
});
