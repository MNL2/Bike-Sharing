document.addEventListener("DOMContentLoaded", function () {
  // Initialize map
  var map = L.map("map").setView([40.7128, -74.006], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);
  map.setMinZoom(12);
  map.setMaxZoom(18);

  L.Icon.Default.imagePath = "img/transparent";

  // Set map bounds to New York City
  var southWest = L.latLng(40.477399, -74.25909);
  var northEast = L.latLng(40.917577, -73.700272);
  var bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);

  // Add tile layer to the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
    map
  );

  // Create geocoder with bounds
  var geocoder = L.Control.Geocoder.nominatim({
    geocodingQueryParams: {
      viewbox: bounds.toBBoxString(),
      bounded: 1,
      countrycodes: "US",
    },
  });

  var userMarkers = [];
  var routingControl = null;

  // Function to show error message
  function showErrorMessage(message) {
    var errorContainer = document.getElementById("consoleOutput");
    errorContainer.innerHTML =
      '<p style="color: black;" font-family:"droid serif";>Attenzione! ' +
      message +
      "</p>";
  }

  // Search function
  function searchAddresses() {
    // Remove previous routing
    if (routingControl !== null) {
      map.removeControl(routingControl);
    }

    // Remove previous user markers
    userMarkers.forEach((marker) => map.removeLayer(marker));
    userMarkers = [];

    const startAddress = document
      .getElementById("startAddressInput")
      .value.trim();
    const endAddress = document.getElementById("endAddressInput").value.trim();
    if (startAddress && endAddress) {
      // Geocode the start address
      geocoder.geocode(startAddress, (startResults) => {
        if (startResults && startResults.length > 0) {
          const startLatLng = startResults[0].center;
          // Add start marker and color it red
          const startMarker = L.marker(startLatLng, {
            icon: blueIcon,
            draggable: true,
          }).addTo(map);
          startMarker.bindPopup("<b>Start Address:</b><br>" + startAddress);
          startMarker.dragging.disable(); // Disable marker dragging
          userMarkers.push(startMarker);

          // Find nearest station
          const nearestStation = NearStation(startLatLng);
          if (nearestStation) {
            // Add nearest station marker and color it yellow
            const stationLatLng = L.latLng(
              nearestStation.latitude,
              nearestStation.longitude
            );
            const stationMarker = L.marker(stationLatLng, {
              icon: redIcon,
            }).addTo(map);
            stationMarker.bindPopup(
              "<b>Nearest Station:</b><br>" + nearestStation.stationName
            );
            userMarkers.push(stationMarker);

            // Geocode the end address
            geocoder.geocode(endAddress, (endResults) => {
              if (endResults && endResults.length > 0) {
                const endLatLng = endResults[0].center;
                // Add end marker and color it green
                const endMarker = L.marker(endLatLng, {
                  icon: greenIcon,
                  draggable: true,
                }).addTo(map);
                endMarker.bindPopup("<b>End Address:</b><br>" + endAddress);
                endMarker.dragging.disable(); // Disable marker dragging
                userMarkers.push(endMarker);

                // Find nearest station to end address
                const nearEndStation = NearStation(endLatLng);
                if (nearEndStation) {
                  // Add nearest end station marker
                  const nearEndStationLatLng = L.latLng(
                    nearEndStation.latitude,
                    nearEndStation.longitude
                  );
                  const nearEndStationMarker = L.marker(nearEndStationLatLng, {
                    icon: redIcon,
                  }).addTo(map);
                  nearEndStationMarker.bindPopup(
                    "<b>Nearest End Station:</b><br>" +
                      nearEndStation.stationName
                  );
                  userMarkers.push(nearEndStationMarker);

                  // Fit map bounds to show all markers
                  const bounds = L.latLngBounds([
                    startLatLng,
                    stationLatLng,
                    nearEndStationLatLng,
                    endLatLng,
                  ]);
                  map.fitBounds(bounds);

                  // Add routing control
                  routingControl = L.Routing.control({
                    waypoints: [
                      L.latLng(startLatLng),
                      L.latLng(stationLatLng),
                      L.latLng(nearEndStationLatLng),
                      L.latLng(endLatLng),
                    ],
                    routeWhileDragging: true,
                    draggableWaypoints: false, // Disable dragging of waypoints
                    addWaypoints: false, // Disable adding new waypoints by clicking the map
                    geocoder: geocoder,
                    router: L.Routing.osrmv1({
                      serviceUrl:
                        "https://routing.openstreetmap.de/routed-foot/route/v1",
                      profile: "foot",
                    }),
                    lineOptions: {
                      styles: [{ color: "green", opacity: 1, weight: 2.5 }],
                    },
                  }).addTo(map);
                } else {
                  showErrorMessage(
                    "Nessuna stazione trovata nelle vicinanze della destinazione."
                  );
                }
              } else {
                showErrorMessage("Indirizzo non trovato: " + endAddress);
              }
            });
          } else {
            showErrorMessage(
              "Nessuna stazione trovata nelle vicinanze dell'indirizzo di partenza."
            );
          }
        } else {
          showErrorMessage("Indirizzo non trovato: " + startAddress);
        }
      });
    }
  }

  // Event listener for search button click
  document
    .getElementById("searchButton")
    .addEventListener("click", searchAddresses);

  // Event listener for pressing Enter key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchAddresses();
    }
  });

  var blueIcon = L.icon({
    iconUrl: "img/userpos.png",
    iconSize: [55, 55],
    iconAnchor: [29, 49],
  });

  var greenIcon = L.icon({
    iconUrl: "img/targetpos.png",
    iconSize: [55, 55],
    iconAnchor: [29, 49],
  });

  var redIcon = L.icon({
    iconUrl: "img/pos.png",
    iconSize: [55, 55],
    iconAnchor: [29, 49],
  });

  function NearStation(startLatLng) {
    var nearestStation = null;
    var nearestDistance = Infinity;

    for (var i = 0; i < stationList.length; i++) {
      var station = stationList[i];
      var stationLatLng = L.latLng(station.latitude, station.longitude);
      var distance = startLatLng.distanceTo(stationLatLng);

      if (distance < nearestDistance) {
        nearestStation = station;
        nearestDistance = distance;
      }
    }

    return nearestStation;
  }
});
