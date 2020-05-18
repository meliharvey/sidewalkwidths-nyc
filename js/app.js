var filterRange = [0, Infinity];
var data = {};
var districts;
var chartsActive = false;
var lineColor = ["step", ["get", 'width']]

for (var i=0; i<GROUPS.length; i++) {
  if (i==0) lineColor.push(GROUPS[0].color)
  else lineColor.push(GROUPS[i].value, GROUPS[i].color)
}


function enterMap() {
  var x = document.getElementById('infoWindow')
  x.style.display = "none";
  x.classList.remove("landing");
  x.classList.add("menu")
  var y = document.getElementById('enter')
  y.style.display = "none";
  var z = document.getElementById('landingClose')
  z.style.display = "block";
}


function toggleWindow(id) {
  var x = document.getElementById(id);
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    var windows = document.querySelectorAll('.window');
    Array.prototype.forEach.call(windows, function(element, index) {
      if (element.id != id) {
        element.style.display = 'none';
      }
    });
  }
  if (chartsActive == true) {
    map.setLayoutProperty('districts-border', 'visibility', 'none')
    chartsActive = false
  } else if (id == 'chartsWindow') {
    map.setLayoutProperty('districts-border', 'visibility', 'visible');
    chartsActive = true
  }
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleDropdown() {
  document.getElementById("chartDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropdown-btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


// function getUniqueFeatures(features) {
//
//   uniqueFeatures = []
//   uniqeIds = []
//
//   for (var i=0; i<features.length; i++) {
//
//     if (i == 0) {
//
//       uniqueFeatures.push(features[i])
//       uniqeIds.push(features[i].properties.id)
//
//     } else {
//
//       if (!uniqeIds.includes(features[i].properties.id)) {
//
//         uniqueFeatures.push(features[i])
//         uniqeIds.push(features[i].properties.id)
//
//       } else {
//
//         for (var j=0; j<uniqeIds.length; j++) {
//
//           if (features[i].properties.id == uniqeIds[j]) {
//
//             var newLength = turf.length(turf.lineString(uniqueFeatures[j]._geometry.coordinates), {units: 'meters'});
//             var length = turf.length(turf.lineString(features[i]._geometry.coordinates), {units: 'meters'});
//
//             if (length > newLength) {
//               uniqueFeatures[j] = features[i]
//             }
//           }
//         }
//       }
//     }
//   }
//   return uniqueFeatures;
// }

mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: MAPBOX_STYLE,
  center: [-74.005, 40.714],
  zoom: 13,
  maxZoom: 22,
  minZoom: 13,
  // maxBounds: [
  //   [-74.36, 40.41], // Southwest coordinates
  //   [-73.66, 40.98] // Northeast coordinates
  // ],
  hash: true
});

map.addControl(new mapboxgl.NavigationControl());
map.on('load', function() {

  map.addSource('sidewalks', {
     type: 'vector',
     url: SIDEWALKS_TILESET
  });

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
  'road-label-simple'
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
    'road-label-simple'
  );

  loadSummaryData(data, loadDistrictData);

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

// var draw = new MapboxDraw({
//   displayControlsDefault: false,
//   controls: {
//       polygon: true,
//       trash: true
//   }
// });
//
// document.getElementById('draw').onclick = function () {
//   draw.changeMode('draw_polygon');
// }
//
// document.getElementById('delete').onclick = function () {
//   draw.deleteAll()
//   var data = draw.getAll();
//   map.removeLayer('splitted').removeSource('split');
//   map.setLayoutProperty('sidewalks', 'visibility', 'visible');
// }
//
// map.addControl(draw);
//
// map.on('draw.create', function(e){
//   getInteriorFeatures('sidewalks', e.features[0])
// });
//
// function getInteriorFeatures(source, polygon) {
//
//   console.log(polygon)
//
//   // generate bounding box from polygon the user drew
//   var polygonBoundingBox = turf.bbox(polygon);
//   var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
//   var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];
//
//   // query rendered features within the polygon's bounding box
//   // var features = map.queryRenderedFeatures([map.project(southWest), map.project(northEast)], { layers: ['sidewalks'] });
//   var features = map.querySourceFeatures('sidewalks', {sourceLayer: SIDEWALKS_LAYER});
//
//   var splitFeatures = [];
//
//   features.forEach( function(feature) {
//
//     if (turf.booleanCrosses(feature, polygon)) {
//
//       var interiorStart;
//       if (turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates[0]), polygon)){
//         interiorStart = 0
//       } else {
//         interiorStart = 1
//       }
//
//       turf.lineSplit(feature, polygon).features.forEach( function(part, i) {
//         if((i + interiorStart)%2 === 0) {
//           feature.geometry = part.geometry
//           splitFeatures.push(feature)
//         }
//       });
//     } else if (turf.booleanWithin(feature, polygon)) {
//       splitFeatures.push(feature)
//     }
//
//   });
//
//   var uniqueFeatures = getUniqueFeatures(splitFeatures)
//
//   map.addSource('split', {
//     'type': 'geojson',
//       'data': {
//         'type': 'FeatureCollection',
//           'features': uniqueFeatures
//       }
//   });
//
//   map.addLayer({
//     'id': 'splitted',
//     'type': 'line',
//     'source': 'split',
//     'layout': {
//       'line-cap': 'round',
//     },
//     'paint': {
//       'line-width': [
//         'interpolate',
//         ['linear'],
//         ['zoom'],
//         14, 1,
//         19, 10,
//       ],
//       'line-color': lineColor,
//       'line-opacity': 1,
//     },
//   }, '3d-buildings');
//
//   map.setLayoutProperty('sidewalks', 'visibility', 'none');
// }

function getLowHigh(index) {

  var low, high;

  if (GROUPS[index - 1] == null) {
    low = item.value
    high = Infinity
  }

  else {
    if (item.value == 0)
      low = 0
    else
      low = item.value

    high = GROUPS[index - 1].value - PRECISION
  }

  return [low, high]
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

// load the summary statistics
function loadSummaryData(data, callback) {

  d3.csv("./summary.csv", function(d) {

    data['City'] = {}

    for (var i=0; i<d.length; i++) {

      data['City'][d[i].district] = {}
      data['City'][d[i].district]['chart'] = []

      // format the data
      GROUPS.forEach(function(group) {
        var datum = {};
        datum.width = group.value;
        datum.length = parseFloat(d[i][group.value]);
        datum.color = group.color;
        data['City'][d[i].district]['chart'].push(datum);
      })
    }

    console.log('loaded summary data', data)
    drawChart(data['City'][Object.keys(data['City'])[0]]['chart'])
    callback(data)
  })
}


function loadDistrictData(data) {

  d3.json("./districts_nyc.geojson", function(d) {

    districts = d
    data['Districts'] = {}

    for (var i=0; i<d.features.length; i++) {

      data['Districts'][d.features[i].properties.name] = {}
      data['Districts'][d.features[i].properties.name]['chart'] = []

      GROUPS.forEach(function(group) {
        var datum = {};
        datum.width = group.value;
        datum.length = d.features[i].properties[group.value.toFixed(1)];
        datum.color = group.color;
        data['Districts'][d.features[i].properties.name]['chart'].push(datum);
      })

      data['Districts'][d.features[i].properties.name]['feature'] = d.features[i]
    }

    addToDropdown(data)

    map.addSource('districts', {
       type: 'geojson',
       data: d
    });

    map.addLayer({
      'id': 'districts-border',
      'type': 'line',
      'source': 'districts',
      'layout': {
        'line-cap': 'round',
        'visibility': 'none'
      },
      'paint': {
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 1,
          11, 2,
          14, 3,
          19, 15,
        ],
        'line-color': 'white',
        'line-opacity': .8,
      },
    },
    'road-label-simple'
    );

    console.log('loaded district data', data)

  })
}

function addToDropdown(d) {

  for (var type in d) {

    names = []

    for (var area in d[type]) {

      names.push(area)

    }

    var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    names.sort(collator.compare)

    for (var i=0; i<names.length; i++) {

      if (document.getElementById("list" + type) != null) {

        var dropdown = document.getElementById("chartDropdown");
        var list = document.getElementById("list" + type);
        var row = document.createElement("LI");

        row.innerHTML = names[i]
        row.classList.add('dropdown-item')
        row.setAttribute("onclick","selectArea('" + type + "','" + names[i] + "');")
        list.appendChild(row)

      } else {

        var dropdown = document.getElementById("chartDropdown");
        var list = document.createElement("UL");
        var header = document.createElement("LI");
        var row = document.createElement("LI");

        list.id = "list" + type

        header.classList.add('dropdown-header')
        header.innerHTML = type
        list.appendChild(header)
        row.innerHTML = names[i]
        row.classList.add('dropdown-item')
        row.setAttribute("onclick","selectArea('" + type + "','" + names[i] + "');")
        list.appendChild(row)
        dropdown.appendChild(list)
      }
    }
  }

  console.log('added data to dropdown', d)
}

var brush;
var brushArea;
var selected = null;
var svg;

function drawChart(data) {

  totalLength = 0;

  for (var i=0; i<data.length; i++) {
    totalLength += data[i].length
  }

  var margin = {top: 40, right: 5, bottom: 50, left: 5},
    width = 300 - margin.left - margin.right,
    height = 240 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeBands([0, width], 0.05),
    x2 = d3.scale.ordinal().rangeBands([0, width], 0.05),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d){return d+UNITS}).outerTickSize(0),
    yAxis = d3.svg.axis().scale(y).orient("left");

  	x.domain(data.map(function(d){ return d.width}));
    y.domain([0, d3.max(data, function(d) { return d.length; })]);
  	x2.domain(x.domain());
    y2.domain(y.domain());

  // sizing chart
  svg = d3.select("#chartContainer").append("svg")
    .attr("id", "chart")
    .attr("width", "100%")
    .attr(
      "viewBox",
      [0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom]
    );

  // positioning chart
  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bars = context.selectAll('.bar').data(data)

  bars.enter().append("rect")
    .classed('bar', true)
    .attr(
    {
      height: function (d) {
        return height - y2(d.length);
      },
      width: function(d){ return x.rangeBand()},
      x: function(d) {
        return x2(d.width);
      },
      y: function(d)
      {
        return y2(d.length)
      },
      fill: function (d) {
        return d.color
      }
    })

  var formatSuffix = d3.format('.2s')
  var formatPercent = d3.format(",.1%")

  bars.enter().append('text')
    .attr("class", "text")
    .attr("x", function(d) {
      return x2(d.width) - 2 + x(data[1].width) / 2;})
    .attr("y", function(d) {return y2(d.length) - 22})
    .text(function(d) {
      return formatSuffix(d.length) + ' mi';
     })
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")

  bars.enter().append('text')
    .attr("class", "text")
    .attr("x", function(d) {return x2(d.width) - 2 + x(data[1].width) / 2;})
    .attr("y", function(d){return y2(d.length) - 8})
    .text(function(d) {
      return formatPercent((d.length / totalLength));
     })
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "normal")

  context.selectAll('bars')
    .append("text")

  var xAxis = context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  xAxis.selectAll("line")
    .attr("transform", "translate(" + ((x(data[1].width) / -2) + 1) + ",0)")

  xAxis.selectAll("text")
    .attr("transform", "translate(" + ((x(data[1].width) / -2) + 6) + ",2)")

  // text label for the x axis
  svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 35) + ")")
      .style("text-anchor", "middle")
      .text("sidewalk widths (ft)");

  xAxis.select('.domain')
    .attr('stroke-width', 0);

  brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

  brushArea = context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", - 40)
      .attr("height", height + 40);

  function brushed() {

    console.log('chart brushed')

    selected = x2.domain().filter(function(d){
        return (brush.extent()[0] <= x2(d)) && (x2(d) <= brush.extent()[1]);
			});

    var start;
    var end;

    var chartSelected;

    if (brush.extent()[1] != width) {
      chartSelected = selected.slice(0, -1)
    } else {
      chartSelected = selected
    }

    svg.selectAll('.bar')
      .style('fill-opacity', function(d) {
        if (chartSelected.includes(d.width)) {
          return 0.9
        } else {
          return 0.1
        }
      })

  	if(brush.extent()[0] != brush.extent()[1]) {

      start = selected[0];

      if (brush.extent()[1] == width) {
        end = Infinity
      } else {
        end = selected[selected.length - 1];
      }

    } else {
  		start = 0;
  		end = data.length;
    }

    updateBrush([start, end]);
  }
}

function selectArea(type, area) {

  document.getElementById('chartDropdownButton').innerHTML = area;

  if (type == 'Districts') {
    var district = data[type][area]

    if (district.feature.geometry.type == 'MultiPolygon') {
      polygon = turf.multiPolygon(district.feature.geometry.coordinates)
    } else {
      polygon = turf.polygon(district.feature.geometry.coordinates)
    }

    map.easeTo({
      center: turf.centerOfMass(polygon).geometry.coordinates,
      zoom: 13
    });
  }

  map.setFilter('sidewalks', undefined);
  updateChart(type, area)

}

function updateChart(type, area) {

  document.getElementById('removeBrush').style.visibility = "hidden";
  document.getElementById('chart').remove();
  console.log('removed chart')

  drawChart(data[type][area].chart)

}

function filterSidewalks(low, high) {

  if (low == high) {

    map.setFilter('sidewalks', false);

  } else {

    map.setFilter('sidewalks', ['all', ['>=', 'width', low], ['<', 'width', high]]);
    results = map.querySourceFeatures('sidewalks', {sourceLayer: SIDEWALKS_LAYER, filter: map.getFilter('sidewalks')})

  }

}

function updateBrush(range) {

  document.getElementById('removeBrush').style.visibility = "visible";

  if (filterRange[0] != range[0] || filterRange[1] != range[1]) {

    filterSidewalks(range[0], range[1]);
    filterRange = range;

  }
}

function removeBrush() {

  document.getElementById('removeBrush').style.visibility = "hidden";

  d3.select(".brush").call(brush.clear());
  svg.selectAll('.bar').style('fill-opacity', 0.9)

  map.setFilter('sidewalks', undefined);
  filterRange = [0, Infinity];

}
