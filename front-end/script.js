let center = [-6.8863, -38.5559];
var map = L.map('map').setView(center, 13);
let marker = L.marker(center, {
    draggable: true,
    opacity: 0.7,
        icon: L.icon({
        iconUrl: 'https://images.icon-icons.com/7373/PNG/512/403167_map_pin_plus_ve2ec473621.png',
        iconSize: [30, 30]
    })
}).addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
    map.locate();
    map.on('locationfound', e => {
        map.setView(e.latlng);
        marker.setLatLng(e.latlng);
            
    });
map.on('click', e => {
    map.setView(e.latlng);
    marker.setLatLng(e.latlng);
});     
const botaoBuscar = document.getElementById('btnBuscar');
        
botaoBuscar.addEventListener('click', async ()=>{
    let localBuscar = document.getElementById('buscar-inp').value;
    fetch(`https://nominatim.openstreetmap.org/search?q=${localBuscar}&format=json`)
        .then(response => response.json())
        .then(data =>{
            if(data.length > 0){
                const lat = data[0].lat;
                const lon = data[0].lon;
                map.setView({lat, lon});
            } else {
                alert('Local não encontrado');
            }
        });
});

carregarPontos();

async function carregarPontos(){
    fetch('https://aplicacao-poi.onrender.com/pois')
    .then(response => response.json())
    .then(data =>{
        data.forEach(ponto =>{
            const marker = L.marker(ponto.localizacao.coordinates)
            .addTo(map);
            marker.bindPopup(ponto.nome)
        });
    });
}

const botaoSalvar = document.getElementById('btnSalvar');
botaoSalvar.addEventListener('click', async ()=>{
    let nome = document.getElementById('campoNome').value;
    let descricao = document.getElementById('campoDescricao').value;
    let tipo = document.getElementById('campoTipo').value;
    let localizacao = {
        type: 'Point',
        coordinates: [marker.getLatLng().lat, marker.getLatLng().lng]
    }
    const ponto = {
        nome,
        descricao,
        tipo,
        localizacao
    }
    fetch('https://aplicacao-poi.onrender.com/pois', {
            method : 'POST',
            body: JSON.stringify(ponto),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.status === 201){
                alert('Salvo com sucesso');
                window.location.reload();
            }
        });
});
