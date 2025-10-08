// public/js/script.js

let map;
let directionsService;
let directionsRenderer;

// Função que carrega o script do Google Maps dinamicamente
async function loadGoogleMaps() {
    try {
        // 1. Busca a chave da API no nosso backend
        const response = await fetch('/api/key');
        const data = await response.json();
        const apiKey = data.apiKey;

        // 2. Cria a tag <script> e a adiciona à página
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

    } catch (error) {
        console.error("Não foi possível carregar a chave da API do Google Maps.", error);
    }
}

// Esta função será chamada automaticamente pelo script do Google Maps após o carregamento
window.initMap = async function() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: -23.586550, lng: -46.681533 }, // Centro de Santana de Parnaíba
        zoom: 15,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

// Função para gerar a rota (continua a mesma)
function generateRoute() {
    var routesOrigin = document.getElementById("origin").value;
    var routesDestination = document.getElementById("destination").value;

    const request = {
        origin: routesOrigin,
        destination: routesDestination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, (response, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(response);
        } else {
            window.alert("Erro ao gerar rotas: " + status);
        }
    });
}

// Inicia o processo de carregamento
loadGoogleMaps();