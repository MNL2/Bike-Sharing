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

function printDistance() {
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
}

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
        let txt =
          "Nearest station is: " + dock + " " + formatDistance(distance);
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
