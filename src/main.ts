/// <reference path="../node_modules/@types/arcgis-js-api/index.d.ts"/>
/// <reference path="../node_modules/@types/dojo/index.d.ts"/>
/// <reference path="../node_modules/@types/dojo/dijit.d.ts"/>

import esri = require("esri");
import Map = require('esri/map');
import basemap = require('esri/basemaps');

import declare = require('dojo/_base/declare');
import ContentPane = require('dijit/layout/ContentPane');

export = Toc;

interface TocOptions {
    map: Map
}

class Toc extends ContentPane {
    map:Map;

    constructor(params:TocOptions, srcNodeRef?) {
        if (!params || !params.map) {
            throw new Error('Map parameter missing! Check widget configuration.');
        }

        super(params, srcNodeRef);

        this.map = params.map;
        this._installMapBindings();

        // if (this.map.loaded) {
        // } else {
        //     this.map.on('load', this.onMapLoad);
        // }
    }

    // destroy() {
    //     console.log('destroy!');
    //     this.inherited(arguments);
    // }

    _installMapBindings() {
        var handles = [
            this.map.on('basemap-change', this.onBasemapChange),
            this.map.on('layer-add', this.onLayerAdd),
            this.map.on('layer-add-result', this.onLayerAddResult),
            this.map.on('layer-remove', this.onLayerRemove),
            this.map.on('layer-reorder', this.onLayerReorder),
            this.map.on('layer-resume', this.onLayerResume),
            this.map.on('layer-suspend', this.onLayerSuspend),
            this.map.on('layers-add-result', this.onLayersAddResult), // TODO: really necessary?
            this.map.on('layers-removed', this.onLayersRemoved),
            this.map.on('layers-reordered', this.onLayersReordered),
            this.map.on('zoom-end', this.onZoomEnd)
        ];
        this.own(...handles);
    }

    onBasemapChange(event) { console.log('basemap-change', event); }
    onLayerAdd(event) { console.log('layer-add', event); }
    onLayerAddResult(event) { console.log('layer-add-result', event); }
    onLayerRemove(event) { console.log('layer-remove', event); }
    onLayerReorder(event) { console.log('layer-reorder', event); }
    onLayerResume(event) { console.log('layer-resume', event); }
    onLayerSuspend(event) { console.log('layer-suspend', event); }
    onLayersAddResult(event) { console.log('layers-add-result', event); }
    onLayersRemoved(event) { console.log('layers-removed', event); }
    onLayersReordered(event) { console.log('layers-reordered', event); }
    onZoomEnd(event) { console.log('zoom-end:', event); }

    listLayers () {
        let basemapId = this.map.getBasemap();
        let b = basemap[basemapId];
        let basemapTitle = (b && b.title);

        let basemapLayerIds = this.map.basemapLayerIds;
        let layerIds = this.map.layerIds.filter(id => basemapLayerIds.indexOf(id) == -1);
        let graphicsLayerIds = this.map.graphicsLayerIds.filter(id => basemapLayerIds.indexOf(id) == -1);
        
        graphicsLayerIds.forEach(id => {
            let layer = this.map.getLayer(id);
            console.log('# ' + layer.id);
        });
        layerIds.forEach(id => {
            let layer = this.map.getLayer(id);
            console.log('- ' + layer.id);
        });
        if (basemapTitle) {
            console.log('Basemap:' + basemapTitle);
            basemapLayerIds.forEach(id => {
                let layer = this.map.getLayer(id);
                console.log('  - ' + layer.id);
            });
        } else {
            console.log('No basemap.');
        }
    }
}
