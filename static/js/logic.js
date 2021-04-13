//Add tile layers for background
var streetLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    })

var satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Create map
var myMap = L.map("map", {
    center: [
    37.09, -95.71
    ],
    zoom: 5,
    layers: [satelliteLayer]
});

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Store data for plate geojson
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Request data from plates geojson
d3.json(platesLink,function(info){
    //console.log(response);
    var plates = L.geoJSON(info,{  
        style: function(feature){
            return {
                color:"#f1c40f",
                fillColor: "white",
                fillOpacity:0
            }
        },      
        onEachFeature: function(feature,layer){
            layer.bindPopup("Plate Name: "+feature.properties.PlateName);
        }
        
    }).addTo(myMap);

    // Function to determine marker size based on magnitude
    function markerSize(magnitude) {
        return magnitude * 5;
        } 

    // Perform a request for earthquake data
    d3.json(queryUrl, function(data) {
        function styleInfo(features) {
            return {
                opacity: 1,
                fillOpacity: 1,
                stroke: false,
                fillOpacity: 0.75,
                color: chooseColor(features.geometry.coordinates[2]),
                fillColor: chooseColor(features.geometry.coordinates[2]),
                radius: markerSize(features.properties.mag)
            }
        }
        // Add GeoJSON layer with circles
        var EarthQuakes =  L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },
            // cirecle style
            style: styleInfo,
            // popup for each marker
            onEachFeature: function(feature, layer) {
                layer.bindPopup(`<h3>Date/Time: ${Date(feature.properties.time)}</h3> <hr><br>Earthquake Magnitude: ${feature.properties.mag} <br>Location: ${feature.properties.place} <br>Depth (km): ${feature.geometry.coordinates[2]}`);
            }
        }).addTo(myMap);

        // Create function for color based off depth
        function chooseColor(depth) {
            switch (true) {
            case (depth<-10):
                return "green";
            case (depth<10):
                return "lightgreen";
            case (depth<30):
                return "yellow";
            case (depth<50):
                return "orange";
            case (depth<70):
                return "orangered";
            case (depth<90):
                return "red";    
            case (depth>90):
                return "darkred";     
            default:
                return "black";
            }
        }

        // Define base maps
        var baseMaps = {
            "Street Map": streetLayer,
            "Satellite Map": satelliteLayer
        };

        // Create overlay maps
        var overlayMaps = {
            Earthquakes: EarthQuakes,
            Plates: plates,
        };    

        // Add Layer Control
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

        //Add Legend
        var legend = L.control({ position: "bottomleft" });

        legend.onAdd = function(myMap) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Earthquake Depth</h4>";
        div.innerHTML += '<i style="background: lightgreen"></i><span><10km</span><br>';
        div.innerHTML += '<i style="background: yellow"></i><span>10-30km</span><br>';
        div.innerHTML += '<i style="background: orange"></i><span>30-50km</span><br>';
        div.innerHTML += '<i style="background: orangered"></i><span>50-70km</span><br>';
        div.innerHTML += '<i style="background: red"></i><span>70-90km</span><br>';
        div.innerHTML += '<i style="background: darkred"></i><span>90+km</span><br>';
        return div;
        };

        legend.addTo(myMap);

    });

});
