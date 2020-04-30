function toggleInfo() {
  var x = document.getElementById("info");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    document.getElementById("legend-window").style.display = "none";
  }
}

function toggleLegend() {
  var x = document.getElementById("legend-window");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    document.getElementById("info").style.display = "none";
  }
}

mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: MAPBOX_STYLE,
  center: [-74.005, 40.714],
  zoom: 13,
  maxZoom: 22,
  minZoom: 13,
  maxBounds: [
    [-74.33, 40.41], // Southwest coordinates
    [-73.63, 40.98] // Northeast coordinates
  ],
  hash: true
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
  // Insert the layer beneath any symbol layer.
  var layers = map.getStyle().layers;

  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      labelLayerId = layers[i].id;
      break;
    }
  }

  map.addSource('sidewalks', {
     type: 'vector',
     url: SIDEWALKS_TILESET
  });

  var lineColor = ["step", ["get", 'width']]

  for (var i=0; i<GROUPS.length; i++) {
    if (i==0) lineColor.push(GROUPS[0].color)
    else lineColor.push(GROUPS[i].value, GROUPS[i].color)
  }

  map.addLayer({
    'id': 'sidewalks',
    'type': 'line',
    'source': 'sidewalks',
    'source-layer': SIDEWALKS_LAYER,
    'layout': {
      'line-cap': 'round',
    },
    'paint': {
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        14, 1,
        19, 10,
      ],
      'line-color': lineColor,
      'line-opacity': 1,
    },
  },
  labelLayerId
  );

  map.addLayer(
    {
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
      'fill-extrusion-color': '#141c26',
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15, 0,
        15.05, ['get', 'height']
      ],
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15, 0,
        15.05, ['get', 'min_height']
      ],
      'fill-extrusion-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15, 0,
        16, 0.95
      ]
    }
  },
  labelLayerId
  );

  var filters = [];

  function filterSidewalks(index) {

    if (filters[index].active == false) {
      filters[index].active = true;
    }
    else {
      filters[index].active = false;
    }

    var conditions = ['any'];

    for (var i = 0; i < filters.length; i++) {
      if (filters[i].active == true)
        conditions.push(filters[i].condition);
    }
    console.log(conditions)
    map.setFilter('sidewalks', conditions);
  }

  function getMaxValue(groups) {
    maxValue = 0.0
    for (var i=0; i<groups.length; i++) {
      console.log(groups[i].value, maxValue)
      if (groups[i].value > maxValue) {
        maxValue = groups[i].value
      }
    }
    return maxValue
  }

  // add a legend item
  function addLegendItem(item, index) {

    if (GROUPS[index - 1] == null) {
      var low = item.value
      var high = Infinity
      var string = low + UNITS + '+'
    }

    else {
      if (item.value == 0)
        var low = 0
      else
        var low = item.value

      var high = GROUPS[index - 1].value - PRECISION
      var string = low + ' - ' + high + UNITS
    }

    filters.push({'condition': ['all',['>', 'width', low],['<=', 'width', high]], 'active': false})

    var row = document.createElement("LI");
    var rowContent = document.createElement("DIV");
    var rowLeft = document.createElement("DIV");
    var color = document.createElement("DIV");
    var rowRight = document.createElement("DIV");

    rowLeft.innerHTML = "<p>" + item.rating + "</p>"
    rowLeft.classList.add("row-left");
    color.classList.add("color");
    color.setAttribute("style", "background:" + item.color + ";");
    rowLeft.appendChild(color)
    row.appendChild(rowLeft)
    rowRight.classList.add("row-right");
    rowRight.innerHTML = "<p>" + string + "</p>";
    row.appendChild(rowRight);
    document.getElementById("legend-main").appendChild(row);
  }

  GROUPS.reverse().forEach(addLegendItem);
  GROUPS.reverse()

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  function addPopup(e) {

    map.getCanvas().style.cursor = 'pointer';

    var lineWidth = e.features[0].properties.width
    var lineColor = e.features[0].layer.paint['line-color']
    var coordinates = e.lngLat;
    var stopIndex;

    for (i=0; i < GROUPS.length; i++) {
      if (GROUPS[i + 1] == null) {
        if (lineWidth >= GROUPS[i].value) {
          groupIndex = i;
        }
      } else {
        if (lineWidth >= GROUPS[i].value && lineWidth < GROUPS[i + 1].value) {
          groupIndex = i;
        }
      }
    }

    lineColor = GROUPS[groupIndex].color

    var description =
      '<div class="name">Sidewalk Width:</div>' +
      '<div class="width">' + (Math.round(lineWidth * 10) / 10) + ' ' + UNITS + '</div>' +
      '<div class="message">Social distancing is ' + GROUPS[groupIndex].rating + ' on this path</div>'

    popup.setLngLat(coordinates)
    popup.setHTML(description)
    popup.addTo(map)

    popup._content.style.color = lineColor
    popup._content.style.borderColor = lineColor

    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-bottom')) {
      popup._tip.style.borderTopColor = lineColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-top')) {
      popup._tip.style.borderBottomColor = lineColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-right')) {
      popup._tip.style.borderLeftColor = lineColor
    }
    if (popup._tip.offsetParent.className.includes('mapboxgl-popup-anchor-left')) {
      popup._tip.style.borderRightColor = lineColor
    }

    popup.addTo(map)
  }

  map.on('touchstart', 'sidewalks', function(e) {
    addPopup(e);
  })

  map.on('mousemove', 'sidewalks', function(e) {
    addPopup(e);
  });

  map.on('mouseleave', 'sidewalks', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

});
