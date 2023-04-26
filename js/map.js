var map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);


  fetch('data.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    var bikes = data.bikes;
    for (var i = 0; i < bikes.length; i++) {
      var bike = bikes[i];
      var marker = L.marker([bike.latitude, bike.longitude]).addTo(map);
      marker.bindPopup('<strong>Bike ID:</strong> ' + bike.id);
    }
  });
