//Comparing tropospheric NO2 emissions prior and during the COVID-19 epidemics in Italy.
//Author: Cristina Vrînceanu, Nottingham Geospatial Institute, University of Nottingham
//Contact: cristina.vrinceanu@nottingham.ac.uk

//Daily update

var now=ee.Date(Date.now());
var start = ee.Date('2020-02-26');
var start_2019 = start.advance(-1, 'year');
var end_2019= now.advance(-1, 'year');


var s1 = start_2019.format('YYYY-MMM-dd').cat(' to ').cat(end_2019.format('YYYY-MMM-dd')).getInfo();
var s2 = start.format('YYYY-MMM-dd').cat(' to ').cat(now.format('YYYY-MMM-dd')).getInfo();

//create custom map style using snazzy maps

var mapStyle = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#54585c"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f7f7f7"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#ededed"
            },
            {
                "visibility": "on"
            }
        ]
    }
]

//Add a list of locations

var locationDict = {
'Northern Italy': {lon:10.610372, lat: 45.100862, zoom: 7},
'Italy':{lon:12.893177, lat: 42.639459, zoom:6},
'Iberic Peninsula':{lon: -3.698683, lat:40.404552, zoom:5},
'Great Britain':{lon:-1.458730, lat: 52.422526, zoom:7},
'Lower Countries':{lon: 4.901775, lat:51.532044, zoom:7},
'Western Germany':{lon: 6.988536, lat:50.977687, zoom:9},
'Central and Eastern Europe':{lon: 21.863912, lat:49.041213, zoom:6},
'Western Russia': {lon:  41.597885, lat:55.720396, zoom:5},
'Eastern Russia': {lon:  82.941846, lat:54.967532, zoom:5},
'Former Soviet Countries': {lon: 78.683543, lat: 42.172626, zoom: 7},
'Iran': {lon: 51.377277, lat: 35.719593, zoom: 11},
'Turkey': {lon: 29.491075, lat: 41.050601, zoom: 11},
'Eastern China': {lon: 112.996723, lat: 31.181314, zoom: 5},
'Arabic Peninsula': {lon: 43.448186, lat: 26.135886, zoom: 5},
'South East Asia': {lon: 95.361746, lat: 23.322562, zoom: 6},
'Center Africa': {lon: 10.930572, lat: 9.335993, zoom: 5},
'South Africa': {lon: 26.117402, lat: -29.479294, zoom: 9},
'USA East Coast ': {lon: -82.315033, lat: 37.031336, zoom: 5},
'USA West Coast': {lon: -115.051495, lat: 41.170790, zoom: 5},
'Western Canada': {lon: -113.847630, lat: 54.210779, zoom: 5},
};

var defaultLocation = locationDict['Northern Italy'];


// Importing Sentinel 5P image collections for the weeks prior to the COVID-19 first case
// Reference date: first cade 20.02.2020

var image_prior = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .select('tropospheric_NO2_column_number_density')
  .filterDate(start_2019, end_2019);

// Importing Sentinel 5P image collections for the weeks prior to the COVID-19 first case
  
var image_during = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .select('tropospheric_NO2_column_number_density')
  .filterDate(start, now);

// Importing color palette for visualization

var palettes = require('users/gena/packages:palettes');
var palette = palettes.matplotlib.magma[7];

// Setting map controls and removing some unnecessary control panels while keeping zoom and scale

var mapPanel = ui.Map();
Map.addLayer(image_prior.mean().multiply(1e6), {min: 30, max: 300, palette: palette, opacity:0.75});
Map.setOptions('SATELLITE',{'Lighter': mapStyle});
Map.setCenter(10.084656, 45.060917, 7);
Map.setControlVisibility({all: false, zoomControl: true, mapTypeControl: true});

// Creating the linked map and adding it to the split widget through a linker

var linkedMap = ui.Map();
linkedMap.setOptions('SATELLITE',{'Lighter':mapStyle});
linkedMap.addLayer(image_during.mean().multiply(1e6), {min: 30, max: 300, palette: palette, opacity:0.75});
linkedMap.setCenter(10.084656, 45.060917, 7);
linkedMap.setControlVisibility({all: false, zoomControl: true, mapTypeControl: true});
var linker = ui.Map.Linker([ui.root.widgets().get(0), linkedMap]);

// // Add title labels to the maps

var title_prior= Map.add(ui.Label(
    'Mean NO2 during ' + s1 , {fontWeight: 'bold', fontSize: '10px', position: 'bottom-left', color: 'slateGrey'}));
    
var title_during= linkedMap.add(ui.Label(
    'Mean NO2 during ' + s2, {fontWeight: 'bold', fontSize: '10px', position: 'bottom-right', color: 'slateGrey'}));


// Creating the split panel comprising the two maps

var splitPanel = ui.SplitPanel({
  firstPanel: linker.get(0),
  secondPanel: linker.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

ui.root.widgets().reset([splitPanel]);

//Let's add some explanation to the map

// Create side panel and add a header and text

var header = ui.Label('Comparison of mean NO2 concentrations during the COVID-19 epidemic', {
    fontSize: '15px', color: 'darkSlateGrey'});
var text_1 = ui.Label(
    'The map presents a comparison between the mean NO2 concentration during the COVID-19 epidemic (right panel) and the same reference period in 2019 (left panel). The starting date is 26 February.',
    {fontSize: '11px'});
var text_2 = ui.Label(
    'Data source: Sentinel-5P Near Real Time Data (European Comission/ESA/Copernicus)',
    {fontSize: '11px'});    
    
var text_3 = ui.Label(
    'Data is being currently daily updated. Last update: ' + now.format('YYYY-MMM-dd').getInfo(),
    {fontSize: '11px'}); 
    
var toolPanel = ui.Panel([header, text_1, text_2, text_3], 'flow', {width: '300px'});

//Create external reference with link

var link = ui.Label(
    'Nitrogen dioxide description and sensing information', {},
    'http://www.tropomi.eu/data-products/nitrogen-dioxide');
var linkPanel = ui.Panel(
    [ui.Label('For more information', {fontWeight: 'bold'}), link]);
toolPanel.add(linkPanel);

// Create the location pulldown.
var locations = Object.keys(locationDict);
var locationSelect = ui.Select({
  items: locations,
  value: locations[0],
  onChange: function(value) {
    var location = locationDict[value];
    mapPanel.setCenter(location.lon, location.lat, location.zoom);
  }
});

var locationPanel = ui.Panel([
  ui.Label('Select location:', {'font-size': '15px', 'fontWeight':'bold' }), locationSelect
]);
toolPanel.add(locationPanel);

// Create legend for the data

var vis = {min: 30, max: 300, palette: palette};

// Creates a color bar thumbnail image for use in legend from the given color
// palette.
function makeColorBarParams(palette) {
  return {
    bbox: [0, 0, 1, 0.1],
    dimensions: '100x5',
    format: 'png',
    min: 0,
    max: 1,
    palette: palette,
  };
}

// Create the color bar for the legend.
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0),
  params: makeColorBarParams(vis.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
});

// Create a panel with three numbers for the legend.
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, {margin: '4px 8px'}),
    ui.Label(
        (vis.max / 2),
        {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(vis.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var legendTitle = ui.Label({
  value: 'NO2 concentration (μmol/m^2)',
  style: {fontWeight: 'bold'}
});

var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
toolPanel.widgets().set(6, legendPanel);

//Create text for credit

var credit= ui.Label('Author: Cristina Vrinceanu, University of Nottingham. E-mail: cristina.vrinceanu@nottingham.ac.uk. Twitter: @cavrinceanu',
    {fontSize: '11px', position:'bottom-center', color:'darkGrey'});

toolPanel.add(credit)

ui.root.widgets().add(toolPanel);

