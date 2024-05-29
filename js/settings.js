var MAPBOX_TOKEN = 'pk.eyJ1IjoiZGNoYXJ2ZXkiLCJhIjoiY2ltemVpNjY1MDRlanVya2szYzlnM2dxcyJ9.im9EDlP7YIYefEt_wz2fww'
var MAPBOX_STYLE = 'mapbox://styles/dcharvey/ck90r78ib0hnp1jnz9bwleg7h'
var SIDEWALKS_TILESET = 'mapbox://dcharvey.8bq5zr3j'
var SIDEWALKS_LAYER = 'sidewalkwidths_nyc-8ntneu'
var DISTRICTS_TILESET = 'mapbox://dcharvey.7dbzv200'
var DISTRICTS_LAYER = 'districts_nyc-1eoi4m'
var UNITS = 'ft' // change to 'm' for meters
var PRECISION = 0.1 // the number of decimal places
var GROUPS = [
  {
    "value": 0.0,
    "rating": "impossible",
    "color": "#FF0049"
  },
  {
    "value": 6.0,
    "rating": "very difficult",
    "color": "#FF461E"
  },
  {
    "value": 9.0,
    "rating": "difficult",
    "color": "#FF9300"
  },
  {
    "value": 12.0,
    "rating": "somewhat difficult",
    "color": "#e4da27"
  },
  {
    "value": 15.0,
    "rating": "somewhat easy",
    "color": "#1ce262"
  },
  {
    "value": 18.0,
    "rating": "easy",
    "color": "#00FFC4"
  },
  {
    "value": 21.0,
    "rating": "very easy",
    "color": "#00D2FF"
  },
]
