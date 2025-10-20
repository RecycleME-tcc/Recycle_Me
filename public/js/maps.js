// public/js/script.js

let map;
let directionsService;
let directionsRenderer;

//Exibição do Histórico
const displayHistory = () => {
    const historyList = document.getElementById("history-list");
    const routes = JSON.parse(localStorage.getItem('routeHistory')) || []

    historyList.innerHTML = '';

    routes.forEach(route => {
        const li = document.createElement('li');
        li.textContent = `De: ${route.origin} Para: ${route.destination}`;
        li.dataset.origin = route.origin;
        li.dataset.destination = route.destination;
        historyList.appendChild(li);
    })
}

const saveRouteToHistory = (origin, destination) => {
    let routes = JSON.parse(localStorage.getItem('routeHistory')) || [];
    const existingIndex = routes.findIndex(route =>
        route.origin === origin && route.destination === destination
    );

    if(existingIndex > -1){
        routes.splice(existingIndex, 1);
    }

    const newRoute = { origin, destination };
    routes.unshift(newRoute);
    routes = routes.slice(0, 5);

    localStorage.setItem('routeHistory', JSON.stringify(routes));
}

// Função que carrega o script do Google Maps dinamicamente
 const loadGoogleMaps = async() => {
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

    displayHistory();
}

// Função para gerar a rota
 const generateRoute = (origin, destination) => {
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, (response, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(response);
            saveRouteToHistory(origin, destination)
            displayHistory();
        } else {
            window.alert("Erro ao gerar rotas: " + status);
        }
    });
}

// Inicia o processo de carregamento
loadGoogleMaps();

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit');
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const historyList = document.getElementById('history-list');

    submitButton.addEventListener('click', (event) =>{
        event.preventDefault();
        const origin = originInput.value;
        const destination = destinationInput.value;
        if(origin && destination){
            generateRoute(origin, destination);
        } else {
            alert('Por favor, preencha o ponto de partida e chegada');
        }
    })

    historyList.addEventListener('click', (event) =>{
    if(event.target && event.target.nodeName === 'LI') {
        const clickedItem = event.target;
        const origin = clickedItem.dataset.origin;
        const destination = clickedItem.dataset.destination;

        originInput.value = origin;
            destinationInput.value = destination;
            generateRoute(origin, destination);
    }
})
})