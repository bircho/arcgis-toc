/// <reference types="dojo/dijit"/>

import Map = require('esri/map');
import Layer = require('esri/layers/layer');

import basemaps = require('esri/basemaps');
import declare = require('dojo/_base/declare');
import ContentPane = require('dijit/layout/ContentPane');
import WidgetBase = require('dijit/_WidgetBase');
import Container = require('dijit/_Container');
import TemplatedMixin = require('dijit/_TemplatedMixin');

import i18n = require('dojo/i18n!./nls/main');
import template = require('dojo/text!./main.html');

// FIXME: testing if will be included
import GraphicsLayer = require("esri/layers/GraphicsLayer");

interface TocOptions {
    map: Map,
    showBasemap?:boolean,
    showGraphicLayers?:boolean
}

interface ServiceOptions {
    layer: Layer
}

enum ServiceStatus { loading, ready, error }

let ServiceNode = declare('service-node', [WidgetBase, TemplatedMixin], {
    templateString: template,
    baseClass: 'serviceNode',
    status: ServiceStatus.loading, 

    constructor(params:ServiceOptions, srcNodeRef?:HTMLElement|string) {
        if (!params || !params.layer) {
            throw new Error('Layer parameter missing! This is a bug.');
        }
        
        this.layer = params.layer;
        this.name = params.layer.id;

        this._installLayerBindings(this.layer);
    },

    postCreate () {
        this.labelNode.innerText = this.name;
        this.checkbox.checked = this.layer.visible;
    },

    destroy() {
        this.inherited(arguments);
        console.log(`layer destroyed: ${this.name}`);
    },

    _onCheckboxChange(event) {
        console.log('checkbox', event.target.checked, event);
        const checked = event.target.checked;
        (this.layer as Layer).setVisibility(checked);
    },

    _onExpandClick(event) {
        console.log('expand', event);
    },

    _installLayerBindings(layer:Layer) {
        if ((layer as any)._arcgis_toc) {
            return;
        }
        (layer as any)._arcgis_toc = true;

        // TODO: another Layer types have another events: see KMLLayer.on('network-link-error'), etc
        var handles = [
            layer.on('error', this.onLayerError),
            layer.on('load', this.createLayerObserver('load')),
            layer.on('opacity-change', this.createLayerObserver('opacity-change')),
            layer.on('refresh-interval-change', this.createLayerObserver('refresh-interval-change')),
            layer.on('resume', this.createLayerObserver('resume')),
            layer.on('scale-range-change', this.createLayerObserver('scale-range-change')),
            layer.on('scale-visibility-change', this.createLayerObserver('scale-visibility-change')),
            layer.on('suspend', this.createLayerObserver('suspend')),
            layer.on('visibility-change', this.createLayerObserver('visibility-change')),
            layer.on('update-start', this.createLayerObserver('update-start')),
            layer.on('update-end', this.createLayerObserver('update-end'))
        ];
        this.own(...handles); //FIXME: remove bindings on layer removal, not just on destroy().
    },

    onLayerError({error, target}) { console.log('layer-error', target.id, target); },
    createLayerObserver (type:string) {
        return function (event) {
            console.log('layer-'+type, event.target.id, event);
        }.bind(this);
    },
});

export = declare('arcgis-toc-declare', [WidgetBase, Container], {
    map:Map,
    baseClass: 'arcgis-toc-class',

    constructor(params:TocOptions, srcNodeRef?:HTMLElement|string) {
        if (!params || !params.map) {
            throw new Error('Map parameter missing! Check widget configuration.');
        }

        this.map = params.map;
        this._installMapBindings();

        if (this.map.loaded) {
            console.log('map alread loaded.');
        } else {
            this.map.on('load', () => console.log('map finished loading.'));
        }
    },

    destroy() {
        console.log('toc destroy!');
        this.inherited(arguments);
        //TODO: destroy ServiceNodes.
    },

    _installMapBindings() {
        var handles = [
            this.map.on('basemap-change', this.onBasemapChange.bind(this)),
            this.map.on('layer-add', this.onLayerAdd.bind(this)),
            this.map.on('layer-add-result', this.onLayerAddResult.bind(this)),
            this.map.on('layer-remove', this.onLayerRemove.bind(this)),
            this.map.on('layer-reorder', this.onLayerReorder.bind(this)),
            this.map.on('layer-resume', this.onLayerResume.bind(this)),
            this.map.on('layer-suspend', this.onLayerSuspend.bind(this)),
            this.map.on('layers-add-result', this.onLayersAddResult.bind(this)),
            this.map.on('layers-removed', this.onLayersRemoved.bind(this)),
            this.map.on('layers-reordered', this.onLayersReordered.bind(this)),
            this.map.on('zoom-end', this.onZoomEnd.bind(this))
        ];
        this.own(...handles);
    },

    onBasemapChange(event) { console.log('map: basemap-change', event); },
    onLayerAdd(event) {
        console.log('map: layer-add', event, this.parseLayer(event.layer));
        console.time(event.layer.id);
        // this._installLayerBindings(event.layer);
    },
    onLayerAddResult(event) {
        console.log('map: layer-add-result', event, this.parseLayer(event.layer));
        console.timeEnd(event.layer.id);
        // this._installLayerBindings(event.layer);
    },
    onLayerRemove(event) {
        console.log('map: layer-remove', event, this.parseLayer(event.layer));
    },
    onLayerReorder(event) {
        // console.log('map: layer-reorder', event, this.parseLayer(event.layer));
        // this._installLayerBindings(event.layer);
    },
    onLayerResume(event) {
        // console.log('map: layer-resume', event, this.parseLayer(event.layer));
        // this._installLayerBindings(event.layer);
    },
    onLayerSuspend(event) {
        console.log('map: layer-suspend', event, this.parseLayer(event.layer));
        // this._installLayerBindings(event.layer);
    },
    onLayersAddResult(event) {
        console.log('map: layers-add-result', event);
        event.layers.forEach(({ layer, error }) => {
            if (!error) {
                console.log(this.parseLayer(layer));
                // this._installLayerBindings(layer);
            } else {
                console.error(error);
            }
        });
    },
    onLayersRemoved(event) {
        console.log('map: layers-removed', event);
    },
    onLayersReordered(event) {
        // console.log('map: layers-reordered', event);
    },
    onZoomEnd(event) {
        console.log('map: zoom-end', event);
    },

    

    listLayers():void {
        const basemapId:string = this.map.getBasemap();
        const basemap = basemaps[basemapId];
        const basemapTitle = (basemap && basemap.title);

        const basemapLayerIds = this.map.basemapLayerIds;
        const layerIds = this.map.layerIds.filter(id => basemapLayerIds.indexOf(id) == -1);
        const graphicsLayerIds = this.map.graphicsLayerIds.filter(id => basemapLayerIds.indexOf(id) == -1);

        let content = '';
        
        graphicsLayerIds.forEach(id => {
            let layer = this.map.getLayer(id);
            console.log('# ' + layer.id, this.parseLayer(layer));
            this.doLayer(layer);
        });
        layerIds.forEach(id => {
            let layer = this.map.getLayer(id);
            console.log('- ' + layer.id, this.parseLayer(layer));
            this.doLayer(layer);
        });
        if (basemapTitle) {
            console.log('Basemap:' + basemapTitle);
            basemapLayerIds.forEach(id => {
                let layer = this.map.getLayer(id);
                console.log('  - ' + layer.id, this.parseLayer(layer));
                this.doLayer(layer);
            });
        } else {
            console.log('No basemap.');
        }

        this.set('content', content);

        function notInBasemap (id:string):boolean {
            return basemapLayerIds.indexOf(id) == -1;
        }
    },

    doLayer(layer:Layer) {
        const node = new ServiceNode({ layer });
        this.own(node);
        this.addChild(node);
    },

    parseLayer(layer:Layer):Object {
        const id = layer.id;
        let loaded = layer.loaded;
        let secure = !!layer.credential;
        const error = layer.loadError;
        let suspended = layer.suspended;
        let visible = layer.visible;
        let visibleAtMapScale = layer.visibleAtMapScale; // FIXME: Listen for events
        let opacity = layer.opacity;
        let refreshInterval = layer.refreshInterval;

        let data = { id, loaded, secure, error, suspended, visible, visibleAtMapScale, opacity, refreshInterval };

        // Controls
        // layer.hide();
        // layer.show();
        // layer.setOpacity();
        // layer.setVisibility();
        // layer.setRefreshInterval();

        let type = (layer as any).declaredClass;

        switch(type) {
            case 'esri.layers.ArcGISTiledMapServiceLayer':
                //layer.layerInfo;
                break;
            case 'esri.layers.GraphicsLayer':
                let graphicsLayer:GraphicsLayer = layer as GraphicsLayer;
                break;
            default:
                break;
        }

        return data;
    }
});
