var MAPBOX_TOKEN = 'pk.eyJ1IjoiZGNoYXJ2ZXkiLCJhIjoiY2s5N3Zjc3ZxMGYwazNlbm9ubzA1d3Q1dCJ9.szxUl4AKCdUNLlmvham6og'
var MAPBOX_STYLE = 'mapbox://styles/dcharvey/ck90r78ib0hnp1jnz9bwleg7h'
var SIDEWALKS_TILESET = 'mapbox://dcharvey.1typxzdb'
var SIDEWALKS_LAYER = 'sidewalkwidths_nyc-87ugfr'
var UNITS = 'ft' // change to 'm' for meters
var PRECISION = 0.1 // the number of decimal places
var GROUPS = [
  {
    "value": 0,
    "rating": "impossible",
    "color": "#FF0049"
  },
  {
    "value": 6,
    "rating": "very difficult",
    "color": "#FF461E"
  },
  {
    "value": 9,
    "rating": "difficult",
    "color": "#FF9300"
  },
  {
    "value": 12,
    "rating": "somewhat difficult",
    "color": "#DAD130"
  },
  {
    "value": 15,
    "rating": "somewhat easy",
    "color": "#00ff5a"
  },
  {
    "value": 18,
    "rating": "easy",
    "color": "#00FFC4"
  },
  {
    "value": 21,
    "rating": "very easy",
    "color": "#00D2FF"
  },
]
