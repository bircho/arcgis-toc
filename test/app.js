var map, toc;

require([
    "esri/map",
    "arcgis-toc",
    "esri/dijit/BasemapToggle",
    "dojo/domReady!"
], function(Map, Toc, BasemapToggle) {
    map = new Map("map", {
        center: [-39, -13],
        zoom: 8,
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

});