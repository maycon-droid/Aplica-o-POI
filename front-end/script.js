let center = [-6.8863, -38.5559];
var map = L.map('map').setView(center, 13);
let marker = L.marker(center, {
    draggable: true,
    opacity: 0.7
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
