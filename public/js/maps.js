// public/js/script.js

let map;
let directionsService;
let directionsRenderer;

// Variaveis dos elementos
let originInput;
let destinationInput;
let historyList;
let submitButton;
let currentLocationButton;
let currentMapButton;

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

    if (existingIndex > -1) {
        routes.splice(existingIndex, 1);
    }

    const newRoute = { origin, destination };
    routes.unshift(newRoute);
    routes = routes.slice(0, 5);

    localStorage.setItem('routeHistory', JSON.stringify(routes));
}
//Verifica se o navegador do usuário suporta a geolocalização
const findUserLocation = () => {
    if (!navigator.geolocation) {
        alert("A geolocalização não está disponível no seu navegador")
        return
    }

    navigator.geolocation.getCurrentPosition((position) => {

        //Caso o navegador suporte, a localização é encontrada
        const userCords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        }

        //Geocodificação Reversa (coordenadas para localização)
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: userCords }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                    //Se o endereço for encontrado, atualiza o campo de partida
                    originInput.value = results[0].formatted_address;
                } else {
                    alert("Nenhum resultado obtido para as coordenadas")
                }
            } else {
                console.log("Geocoder falhou devido a: " + status);
            }
        });
    },
        (error) => {
            //Caso o usuário negar a permissão, ou houver uma falha
            let errorMessage = "Ocorreu um erro desconhecido ao buscar a localização";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Você negou a permissão de Geolocalização";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "As informações de localização não estão disponíveis";
                    break;
                case error.TIMEOUT:
                    errorMessage = "O pedido para obter a localização expirou";
                    break;
            }
            alert(errorMessage)
        }
    )
}

// Função que carrega o script do Google Maps dinamicamente
const loadGoogleMaps = async () => {
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
window.initMap = async function () {
    const { Map } = await google.maps.importLibrary("maps");
    const { Autocomplete } = await google.maps.importLibrary("places");

    map = new Map(document.getElementById("map"), {
        center: { lat: -23.586550, lng: -46.681533 }, // Centro de Santana de Parnaíba
        zoom: 15,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

     originInput = document.getElementById('origin');
     destinationInput = document.getElementById('destination');

    const autocompleteOptions = {
        componentRestrictions: { 'country': 'br' }
    }

    const originAutocomplete = new Autocomplete(originInput, autocompleteOptions);
    const destinationAutocomplete = new Autocomplete(destinationInput, autocompleteOptions);


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

const centerMapOnUser = () => {
    if (!navigator.geolocation) {
        alert("A geolocalização não está disponível no seu navegador")
        return
    }

    navigator.geolocation.getCurrentPosition((position) => {

        //Posição do usuário
        const userCords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        }
        map.setCenter(userCords);
        map.setZoom(15);

        new google.maps.Marker({
            position: userCords,
            map: map,
            title: "Sua localização atual",
            icon: {
                url: "/images/user-pin.png",
                scaledSize: new google.maps.Size(40, 40) // Tamnaho de 40 pixels para o marcador

            }
        })
    },
        (error) => {
            //Caso o usuário negar a permissão, ou houver uma falha
            let errorMessage = "Ocorreu um erro desconhecido ao buscar a localização";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Você negou a permissão de Geolocalização";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "As informações de localização não estão disponíveis";
                    break;
                case error.TIMEOUT:
                    errorMessage = "O pedido para obter a localização expirou";
                    break;
            }
            alert(errorMessage)
        }
    )
}


document.addEventListener('DOMContentLoaded', () => {
    currentLocationButton = document.getElementById('current-location-btn');
    submitButton = document.getElementById('submit');
    historyList = document.getElementById('history-list');
    currentMapButton = document.getElementById('current-map-button')

    currentLocationButton.addEventListener('click', findUserLocation);
    currentMapButton.addEventListener('click', centerMapOnUser);

    submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        const origin = originInput.value;
        const destination = destinationInput.value;
        if (origin && destination) {
            generateRoute(origin, destination);
        } else {
            alert('Por favor, preencha o ponto de partida e chegada');
        }
    })

    historyList.addEventListener('click', (event) => {
        if (event.target && event.target.nodeName === 'LI') {
            const clickedItem = event.target;
            const origin = clickedItem.dataset.origin;
            const destination = clickedItem.dataset.destination;

            originInput.value = origin;
            destinationInput.value = destination;
            generateRoute(origin, destination);
        }
    })
})