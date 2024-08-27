document.addEventListener('DOMContentLoaded', () => {
    const tripListElement = document.getElementById('trips');
    const tripDetailsElement = document.getElementById('trip-details');
    const tripInfoElement = document.getElementById('trip-info');

    // Carica i dati dal file JSON
    fetch('data/trips.json')
        .then(response => response.json())
        .then(data => {
            const trips = data.trips;

            // Popola la lista dei viaggi
            trips.forEach(trip => {
                const tripItem = document.createElement('a');
                tripItem.className = 'list-group-item list-group-item-action';
                tripItem.textContent = trip.title;
                tripItem.href = '#';
                tripItem.onclick = () => showTripDetails(trip);
                tripListElement.appendChild(tripItem);
            });
        })
        .catch(error => console.error('Error fetching trips:', error));

    // Mostra i dettagli del viaggio
    function showTripDetails(trip) {
        tripInfoElement.innerHTML = `
        <h3>${trip.title}</h3>
        <p>${trip.description}</p>
        <p><strong>Start Date:</strong> ${trip.startDate}</p>
        <p><strong>End Date:</strong> ${trip.endDate}</p>
      `;

        tripDetailsElement.classList.remove('d-none');

        // Inizializza la mappa
        initMap(trip.days);
    }

    // Inizializza la mappa utilizzando Leaflet
    function initMap(days) {
        const map = L.map('map').setView([41.8902, 12.4922], 5); // Centra la mappa su Roma

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Aggiungi marker per ogni tappa
        days.forEach(day => {
            day.stops.forEach(stop => {
                const marker = L.marker([stop.location.latitude, stop.location.longitude]).addTo(map);
                marker.bindPopup(`<b>${stop.title}</b><br>${stop.description}`);
            });
        });
    }
});

// Funzione per aggiornare lo stato di completamento di una tappa
function updateStopStatus(tripId, dayIndex, stopIndex, completed) {
    // Aggiorna il JSON locale
    fetch('data/trips.json')
        .then(response => response.json())
        .then(data => {
            const trip = data.trips.find(t => t.id === tripId);
            if (trip) {
                trip.days[dayIndex].stops[stopIndex].completed = completed;

                // Salva lo stato nel localStorage
                localStorage.setItem('trips', JSON.stringify(data.trips));
            }
        });
}

// Recupera lo stato dal localStorage all'inizio
function loadProgress() {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
        return JSON.parse(savedTrips);
    }
    return null;
}

function showImageModal(imageSrc) {
    const stopImageElement = document.getElementById('stopImage');
    stopImageElement.src = imageSrc;
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
  }
  
