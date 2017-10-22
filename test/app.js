var map, toc;


require([
    "esri/map",
    "arcgis-toc",
    "esri/dijit/BasemapToggle",
    "dijit/layout/ContentPane",
    "dojo/domReady!"], function(Map, Toc, BasemapToggle, ContentPane) {
    map = new Map("map", {
        center: [-39, -13],
        zoom: 8,
        basemap: "topo"
    });

    var basemapToggle = new BasemapToggle({
        //theme: "basemapToggle",
        map: map,
        visible: true,
        basemap: "hybrid"
      }, "basemapToggle");
      basemapToggle.startup();

    toc = new Toc({ map: map, content: 'TOC TOC DJ!' });
    toc.startup();

    new ContentPane({
        content:"<p>Optionally set new content now</p>",
        style:"height:125px"
    }, "targetID").startup();

});