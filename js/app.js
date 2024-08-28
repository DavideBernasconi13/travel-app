document.addEventListener('DOMContentLoaded', () => {
  const tripListElement = document.getElementById('tripList');
  const tripDetailsElement = document.getElementById('trip-details');
  const tripInfoElement = document.getElementById('trip-info');
  const tripTitle = document.querySelector('.trip-title');
  const stopsCardsElement = document.getElementById('stops-cards');

  // Carica i dati dal file JSON
  fetch('data/trips.json')
    .then(response => response.json())
    .then(data => {
      const trips = data.trips;

      // Popola il dropdown con i viaggi
      trips.forEach(trip => {
        const tripItem = document.createElement('li');
        const tripLink = document.createElement('a');
        tripLink.className = 'dropdown-item';
        tripLink.textContent = trip.title;
        tripLink.href = '#';
        tripLink.onclick = () => showTripDetails(trip);
        tripItem.appendChild(tripLink);
        tripListElement.appendChild(tripItem);
      });
    })
    .catch(error => console.error('Error fetching trips:', error));

  // Mostra i dettagli del viaggio
  function showTripDetails(trip) {
    tripTitle.innerHTML = `<h3>${trip.title}</h3>`
    tripInfoElement.innerHTML = `
      <p>${trip.description}</p>
      <p><strong>Start Date:</strong> ${trip.startDate}</p>
      <p><strong>End Date:</strong> ${trip.endDate}</p>
    `;

    tripDetailsElement.classList.remove('d-none');

    // Inizializza la mappa
    initMap(trip.days);

    // Genera le card per ogni tappa
    generateStopCards(trip.days);
  }

  // Funzione per generare le card delle tappe
  function generateStopCards(days) {
    stopsCardsElement.innerHTML = ''; // Pulisce l'elemento per evitare duplicati

    days.forEach(day => {
      day.stops.forEach(stop => {
        const stopCard = document.createElement('div');
        stopCard.className = 'col-md-4 mb-4';

        stopCard.innerHTML = `
          <div class="card w-100">
            <img src="${stop.image}" class="card-img-top" alt="${stop.title}">
            <div class="card-body">
              <h5 class="card-title">${stop.title}</h5>
              <p class="card-text">${stop.description}</p>
              <button class="btn btn-primary" onclick="showStopDetailsModal('${stop.title}', '${stop.description}', '${stop.image}', '${stop.notes}', '${stop.rating}')">Dettagli</button>
            </div>
          </div>
        `;

        stopsCardsElement.appendChild(stopCard);
      });
    });
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