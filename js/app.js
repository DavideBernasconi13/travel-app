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
      currentTripData = data; // Salva i dati del viaggio corrente per modifiche future
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

  function generateStopCards(days) {
    stopsCardsElement.innerHTML = ''; // Pulisce l'elemento per evitare duplicati

    days.forEach((day, dayIndex) => { // Itera attraverso i giorni
      day.stops.forEach((stop, stopIndex) => { // Itera attraverso le tappe del giorno
        const stopCard = document.createElement('div');
        stopCard.className = 'col-md-6 mb-6';

        stopCard.innerHTML = `
          <div class="card h-100">
            <img src="${stop.image}" class="card-img-top" alt="${stop.title}">
            <div class="card-body">
              <h5 class="card-title">${stop.title}</h5>
              <p class="card-text">${stop.description} | ${stop.completed}</p>
              
              <button class="btn btn-primary" onclick="showStopDetailsModal('${stop.title}', '${stop.description}', '${stop.image}', '${stop.notes}', '${stop.rating}', ${stop.completed}, ${dayIndex}, ${stopIndex})">Dettagli</button>
            </div>
          </div>
        `;

        stopsCardsElement.appendChild(stopCard);
      });
    });
  }
  // Funzione per mostrare i dettagli della tappa nella modal
  window.showStopDetailsModal = (title, description, image, notes, rating, completed, dayIndex, stopIndex) => {
    const modalContent = `
    <h4>${title}</h4>
    <p>${description}</p>
    <p><strong>Note:</strong> ${notes}</p>
    <p><strong>Rating:</strong> ${rating} stelle</p>
    <p><strong>Completato:</strong> ${completed ? 'Sì' : 'No'}</p>
    <img src="${image}" alt="${title}" class="img-fluid">
    <div class="form-check form-switch mt-3">
      <input class="form-check-input" type="checkbox" id="completedSwitch" ${completed ? 'checked' : ''} onchange="toggleCompletion(${dayIndex}, ${stopIndex}, this.checked)">
      <label class="form-check-label" for="completedSwitch">Segna come completato</label>
    </div>
    
  `;
    //Modal footer
    const modalFooter = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
    <button class="btn btn-secondary mt-3" onclick="editStop(${dayIndex}, ${stopIndex})">Modifica</button>
    `

    document.querySelector('.modal-footer').innerHTML = modalFooter; 
    document.getElementById('modalContent').innerHTML = modalContent;

    // Mostra la modal
    const stopDetailModal = new bootstrap.Modal(document.getElementById('stopDetailModal'));
    stopDetailModal.show();
  };

  // Funzione per aggiornare lo stato di completamento della tappa
  window.toggleCompletion = (dayIndex, stopIndex, isCompleted) => {
    const trip = currentTripData.trips[0]; // Supponiamo che stiamo lavorando con il primo viaggio
    trip.days[dayIndex].stops[stopIndex].completed = isCompleted;

    // Aggiorna il JSON e salvalo
    console.log(`Tappa ${trip.days[dayIndex].stops[stopIndex].title} aggiornata a completato: ${isCompleted}`);

     // Persisti l'aggiornamento nel localStorage
     saveTripsToLocalStorage(currentTripData);
  };

  function saveTripsToLocalStorage(tripData) {
    localStorage.setItem('tripsData', JSON.stringify(tripData));
  }
  
  // // Quando carichi l'app, controlla se ci sono dati salvati nel localStorage
  // document.addEventListener('DOMContentLoaded', () => {
  //   const savedTrips = localStorage.getItem('tripsData');
  //   if (savedTrips) {
  //     currentTripData = JSON.parse(savedTrips);
  //     // Continua con il resto della logica usando currentTripData
  //   } else {
  //     // Codice per fetch di JSON iniziale se non ci sono dati salvati
  //     fetch('data/trips.json')
  //       .then(response => response.json())
  //       .then(data => {
  //         currentTripData = data;
  //         initializeApp(currentTripData);
  //       });
  //   }
  // });
 
  // Carica i dati dal localStorage al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
  const savedTrips = localStorage.getItem('tripsData');
  if (savedTrips) {
    currentTripData = JSON.parse(savedTrips);
  } else {
    // Se non ci sono dati salvati, carica i dati dal JSON iniziale
    fetch('data/trips.json')
      .then(response => response.json())
      .then(data => {
        currentTripData = data;
        saveTripsToLocalStorage(currentTripData); // Salva i dati iniziali nel localStorage
      });
  }

  // Inizializza l'applicazione con i dati caricati
  initializeApp(currentTripData);
});
  
  function initializeApp(data) {
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