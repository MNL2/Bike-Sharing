function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/*function printDistance() {
  var lat1 = document.getElementById("lat1").value;
  var lon1 = document.getElementById("lon1").value;
  var lat2 = document.getElementById("lat2").value;
  var lon2 = document.getElementById("lon2").value;
  var d = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
  nearStation(lat1, lon1, true)
    .then((txt) => {
      document.getElementById("output").innerHTML = txt;
    })
    .catch((error) => {
      // Handle any errors here
      console.error(error);
    });
}*/

function nearStation(lat, lon, isStart) {
  return new Promise((resolve, reject) => {
    let dock = "";
    let distance = Infinity;

    fetch("citybike.json")
      .then((response) => response.json())
      .then((data) => {
        data.stationBeanList.forEach((station) => {
          if (station.statusValue == "In Service") {
            if (
              getDistanceFromLatLonInKm(
                lat,
                lon,
                station.latitude,
                station.longitude
              ) < distance
            ) {
              if (isStart == true && station.availableBikes > 0) {
                distance = getDistanceFromLatLonInKm(
                  lat,
                  lon,
                  station.latitude,
                  station.longitude
                );
                dock = station.stationName;
              } else if (isStart == false && station.availableDocks > 0) {
                distance = getDistanceFromLatLonInKm(
                  lat,
                  lon,
                  station.latitude,
                  station.longitude
                );
                dock = station.stationName;
              }
            }
          }
        });
        let txt = dock + " " + formatDistance(distance);
        resolve(txt);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

function formatDistance(num) {
  if (num >= 1) {
    num = num.toFixed(2);
    return num + " km";
  } else {
    num = num * 1000;
    num = num.toFixed(0);
    return num + " m";
  }
}

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
        iconUrl: "img/pos.png",

        iconSize: [55, 55],

        iconAnchor: [29, 49],
      });
      data.stationBeanList.forEach((station) => {
        const marker = L.marker([station.latitude, station.longitude], {
          icon: customIcon,
        }).addTo(map);
        marker.bindPopup(station.stationName);
      });
    })
    .catch((error) => console.error(error));

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const userMarker = L.marker([lat, lon]).addTo(map);
    userMarker.bindPopup("Posizione dell'utente");
  });

  var marker;
  var marker2;

  function onMapClick(e) {
    if (marker) {
      map.removeLayer(marker);
    }
    const userIcon = L.icon({
      iconUrl: "img/userpos.png",

      iconSize: [55, 55],

      iconAnchor: [29, 49],
    });
    marker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
    document.getElementById("lat1").value = e.latlng.lat;
    document.getElementById("lon1").value = e.latlng.lng;
  }

  map.on("click", onMapClick);
}

function printDistance() {
  var startLat = document.getElementById("lat1").value;
  var startLon = document.getElementById("lon1").value;
  var targetLat = document.getElementById("lat2").value;
  var targetLon = document.getElementById("lon2").value;

  var startStationPromise = nearStation(startLat, startLon, true);
  var targetStationPromise = nearStation(targetLat, targetLon, false);

  Promise.all([startStationPromise, targetStationPromise])
    .then((results) => {
      var startStation = results[0];
      var targetStation = results[1];

      document.getElementById("output").innerHTML =
        "Nearest station to your current location: " +
        startStation +
        "<br>" +
        "Nearest station to your target location: " +
        targetStation;
    })
    .catch((error) => {
      // Gestisci eventuali errori qui
      console.error(error);
    });
}
