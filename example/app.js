var map, toc;

require([
    "esri/map",
    "arcgis-toc",
    "esri/dijit/BasemapToggle",

    "esri/layers/ArcGISImageServiceLayer",
    "esri/layers/ImageServiceParameters",

    "esri/layers/KMLLayer",

    "dojo/domReady!"
], function(Map, Toc, BasemapToggle, ArcGISImageServiceLayer, ImageServiceParameters, KMLLayer) {
    map = new Map("map", {
        center: [-39, -13],
        zoom: 1,
        basemap: "topo"
    });

    var basemapToggle = new BasemapToggle({
        map: map,
        //visible: true,
        basemap: "hybrid"
    }, "basemapToggle");
    basemapToggle.startup();

    toc = new Toc({ map: map, content: 'empty' }, 'toc');
    toc.startup();

    // var kmlUrl = "https://esri.box.com/shared/static/nr6tol9ln8vng0szqlaqx5kmd9wf6bb6.kml";
    // var kml = new KMLLayer(kmlUrl, {
    //     id: 'KMLLayer_toc'
    // });
    // map.addLayer(kml);

    // var params = new ImageServiceParameters();
    // params.noData = 0;
    // var imageServiceLayer = new ArcGISImageServiceLayer("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer", {
    //     id: 'ArcGISImageServiceLayer_toc',
    //     imageServiceParameters: params,
    //     opacity: 0.75
    //     // minScale: 0,
    //     // maxScale: 0
    // });
    // map.addLayer(imageServiceLayer);

});