# Sidewalk Widths NYC

Sidewalk Widths NYC uses [New York City's Sidewalk dataset](https://data.cityofnewyork.us/City-Government/Sidewalk/vfx9-tbb6) to produce a map of sidewalk widths for the 5 boroughs.

This repo contains the notebooks to reproduce this work, as well as the finished Sidewalk Width dataset in GeoJSON format.

## Link
[www.sidewalkwidths.nyc](http://www.sidewalkwidths.nyc)

## Methodology

1) Polygons from NYC open data
![Sidewalk Polygons](assets/sidewalk_polygons.png)

1) Dissolve adjacent sidewalk polygons
![Sidewalk Polygons Dissolved](assets/sidewalk_polygons_dissolved.png)

2) Find sidewalk centerlines
![Centerlines](assets/centerline.png)

3) Remove short ends and simplify
![Centerlines Simplified](assets/centerline_simplified.png)

4) Measure distance from centerlines to original polygon
![Centerlines Widths](assets/centerline_widths.png)
