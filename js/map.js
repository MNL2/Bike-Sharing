function loadMap() {
  var map = L.map("map").setView([40.7128, -74.006], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 12,
  }).addTo(map);

  fetch("citybike.json")
    .then((response) => response.json())
    .then((data) => {
      const customIcon = L.icon({
        iconUrl: "img/coso.png",

        iconSize: [55, 55],

        iconAnchor: [29, 49],
      });
      data.stationBeanList.forEach((station) => {
        const marker = L.marker([station.latitude, station.longitude], {icon: customIcon}).addTo(map);
        marker.bindPopup(station.stationName);
      });
    })
    .catch((error) => console.error(error));

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const userMarker = L.marker([lat, lon]).addTo(map);
    userMarker.bindPopup("Posizione dell'utente");

    if (data) {
      data.stationBeanList.forEach((station) => {
        const marker = L.marker([station.latitude, station.longitude]).addTo(
          map
        );
        marker.bindPopup(station.stationName);
      });
    }
  });

  var marker;

  function onMapClick(e) {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
    document.getElementById("lat1").value = e.latlng.lat;
    document.getElementById("lon1").value = e.latlng.lng;
  }

  map.on("click", onMapClick);
}
