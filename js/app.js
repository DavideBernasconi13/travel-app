document.addEventListener('DOMContentLoaded', () => {
  const tripListElement = document.getElementById('tripList');
  const tripDetailsElement = document.getElementById('trip-details');
  const tripInfoElement = document.getElementById('trip-info');
  const tripTitle = document.querySelector('.trip-title');
  const stopsCardsElement = document.getElementById('stops-cards');

  let currentTripData;

  // Carica i dati dal localStorage o dal file JSON se il localStorage è vuoto
  function initializeApp() {
    const savedTrips = localStorage.getItem('tripsData');
    if (savedTrips) {
      currentTripData = JSON.parse(savedTrips);
      populateTripDropdown(currentTripData.trips);
    } else {
      // Fetch dei dati dal file JSON iniziale
      fetch('data/trips.json')
        .then(response => response.json())
        .then(data => {
          currentTripData = data;
          saveTripsToLocalStorage(currentTripData); // Salva i dati nel localStorage
          populateTripDropdown(currentTripData.trips);
        })
        .catch(error => console.error('Error fetching trips:', error));
    }
  }

  // Salva i dati nel localStorage
  function saveTripsToLocalStorage(tripData) {
    localStorage.setItem('tripsData', JSON.stringify(tripData));
  }

  // Popola il dropdown con i viaggi
  function populateTripDropdown(trips) {
    tripListElement.innerHTML = ''; // Pulisce il dropdown esistente

    trips.forEach((trip, index) => {
      const tripItem = document.createElement('li');
      const tripLink = document.createElement('a');
      tripLink.className = 'dropdown-item';
      tripLink.textContent = trip.title;
      tripLink.href = '#';
      tripLink.onclick = () => showTripDetails(trip);
      tripItem.appendChild(tripLink);
      tripListElement.appendChild(tripItem);
    });

    // Mostra i dettagli del primo viaggio per default
    if (trips.length > 0) showTripDetails(trips[0]);
  }

  // Mostra i dettagli del viaggio
  function showTripDetails(trip) {
    tripTitle.innerHTML = `<h3>${trip.title}</h3>`;
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

  // Genera le card per ogni tappa
  function generateStopCards(days) {
    stopsCardsElement.innerHTML = ''; // Pulisce l'elemento per evitare duplicati

    days.forEach((day, dayIndex) => { // Itera attraverso i giorni
      day.stops.forEach((stop, stopIndex) => { // Itera attraverso le tappe del giorno
        const stopCard = document.createElement('div');
        stopCard.className = 'col-md-4 mb-4';

        stopCard.innerHTML = `
          <div class="card h-100">
            <img src="${stop.image}" class="card-img-top rounded-0 cu-h" alt="${stop.title}">
            <div class="card-body">
              <h5 class="card-title">${stop.title}</h5>
              <p class="card-text">${stop.description}</p>
              <p id="completedStatusCard">${stop.completed ? 'Completato' : 'Non completato'}</p>
              
              <button class="btn btn-primary w-100" onclick="showStopDetailsModal('${stop.title}', '${stop.description}', '${stop.image}', '${stop.notes}', '${stop.rating}', ${stop.completed}, ${dayIndex}, ${stopIndex})">Dettagli</button>
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
    <p><strong>Completato:</strong><span id="completedStatus"> ${completed ? 'Sì' : 'No'}</span></p>
    <img src="${image}" alt="${title}" class="img-fluid">
    <div class="form-check form-switch mt-3">
      <input class="form-check-input" type="checkbox" id="completedSwitch" ${completed ? 'checked' : ''} onchange="toggleCompletion(${dayIndex}, ${stopIndex}, this.checked)">
      <label class="form-check-label" for="completedSwitch">Segna come completato</label>
    </div>
  `;

    const modalFooter = `
    <div class="btn-group">
      <button class="btn btn-outline-danger" onclick="editStop(${dayIndex}, ${stopIndex})">Modifica</button>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
    </div>
  `;

    document.querySelector('.modal-footer').innerHTML = modalFooter;
    document.getElementById('modalContent').innerHTML = modalContent;

    const stopDetailModal = new bootstrap.Modal(document.getElementById('stopDetailModal'));
    stopDetailModal.show();
  };

  // Funzione per aggiornare lo stato di completamento della tappa
  window.toggleCompletion = (dayIndex, stopIndex, isCompleted) => {
    const trip = currentTripData.trips[0]; // Supponiamo che stiamo lavorando con il primo viaggio
    trip.days[dayIndex].stops[stopIndex].completed = isCompleted;

    // Persisti l'aggiornamento nel localStorage
    saveTripsToLocalStorage(currentTripData);

    // Aggiorno i valori della modale e nella card
    document.getElementById('completedStatus').textContent = isCompleted ? 'Sì' : 'No';
    document.getElementById('completedStatusCard').textContent = isCompleted ? 'Completato' : 'Non completatato';

    // Aggiorna l'interfaccia utente per riflettere le modifiche
    showTripDetails(trip);


  };

  // Funzione per aprire il modulo di modifica della tappa
  window.editStop = (dayIndex, stopIndex) => {
    const stop = currentTripData.trips[0].days[dayIndex].stops[stopIndex];

    const editFormContent = `
    <div class="mb-3">
      <label for="editTitle" class="form-label">Titolo</label>
      <input type="text" class="form-control" id="editTitle" value="${stop.title}">
    </div>
    <div class="mb-3">
      <label for="editDescription" class="form-label">Descrizione</label>
      <textarea class="form-control" id="editDescription">${stop.description}</textarea>
    </div>
    <div class="mb-3">
      <label for="editNotes" class="form-label">Note</label>
      <textarea class="form-control" id="editNotes">${stop.notes}</textarea>
    </div>
    <div class="mb-3">
      <label for="editRating" class="form-label">Valutazione</label>
      <input type="number" class="form-control" id="editRating" value="${stop.rating}" min="1" max="5">
    </div>
    <div class="mb-3">
      <label for="editImage" class="form-label">Immagine</label>
      <input type="text" class="form-control" id="editImage" value="${stop.image}">
    </div>
    <button class="btn btn-primary" onclick="saveStopChanges(${dayIndex}, ${stopIndex})">Salva</button>
    <button class="btn btn-secondary" onclick="showStopDetailsModal('${stop.title}', '${stop.description}', '${stop.image}', '${stop.notes}', '${stop.rating}', ${stop.completed}, ${dayIndex}, ${stopIndex})">Annulla</button>
  `;

    document.getElementById('modalContent').innerHTML = editFormContent;
  };

  // Funzione per salvare le modifiche della tappa
  window.saveStopChanges = (dayIndex, stopIndex) => {
    const trip = currentTripData.trips[0]; // Supponiamo di lavorare con il primo viaggio
    const stop = trip.days[dayIndex].stops[stopIndex];

    // Recupera i nuovi valori dal modulo
    stop.title = document.getElementById('editTitle').value;
    stop.description = document.getElementById('editDescription').value;
    stop.notes = document.getElementById('editNotes').value;
    stop.rating = parseInt(document.getElementById('editRating').value);
    stop.image = document.getElementById('editImage').value;

    // Salva i dati aggiornati nel localStorage
    saveTripsToLocalStorage(currentTripData);

    // Aggiorna l'interfaccia utente per riflettere le modifiche
    showStopDetailsModal(stop.title, stop.description, stop.image, stop.notes, stop.rating, stop.completed, dayIndex, stopIndex);
    //ricarica la pagina
    window.location.reload()
  };

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

  // Inizializza l'applicazione
  initializeApp();
});