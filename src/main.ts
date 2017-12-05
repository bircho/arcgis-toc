/// <reference types="dojo/dijit"/>

import Map = require('esri/map');
import Layer = require('esri/layers/layer');

import basemap = require('esri/basemaps');
import declare = require('dojo/_base/declare');
import ContentPane = require('dijit/layout/ContentPane');
import WidgetBase = require('dijit/_WidgetBase');
import TemplatedMixin = require('dijit/_TemplatedMixin');

// import i18n = require('dojo/i18n!./nls/main');
// import serviceTemplate = require('dojo/text!./templates/service.html');
// import template = require('dojo/text!main.html');

interface TocOptions {
    showGraphicLayers?:boolean,
    showBasemap?:boolean,
    map: Map
}

let ServiceNode = declare('service-node', [WidgetBase, TemplatedMixin], {
    templatePath: '../src/main.html', //FIXME: use templateString
    //templateString: '<div class="${baseClass}" data-dojo-attach-point="focusNode" data-dojo-attach-event="click:_onClick" role="menuitem" tabindex="-1"><span data-dojo-attach-point="containerNode"></span></div>',

    constructor(params, srcNodeRef?:HTMLElement|string) {
        params = params || {};
        //TODO: finish testing.
        this.layer = params.layer;
        this.name = params.layer.id;
    },

    postCreate () {
        this.labelNode.innerText = this.name;
        console.log('got layer:', this.layer);
    },

    _onCheckboxClick(event) { console.log('checkbox', event.target.checked, event); },
    _onExpandClick(event) { console.log('expand', event); }
});

export = declare('arcgis-toc-declare', [WidgetBase/*, TemplatedMixin*/], {
    map:Map,
    baseClass: 'arcgis-toc-class',
    
    _onClick() { console.log('clicou.'); },

    constructor(params:TocOptions, srcNodeRef?:HTMLElement|string) {
        //super(params, srcNodeRef);
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
        console.log('destroy!');
        this.inherited(arguments);
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
        this._installLayerBindings(event.layer);
    },
    onLayerAddResult(event) {
        console.log('map: layer-add-result', event, this.parseLayer(event.layer));
        this._installLayerBindings(event.layer);
    },
    onLayerRemove(event) {
        console.log('map: layer-remove', event, this.parseLayer(event.layer));
        //this._installLayerBindings(event.layer);
    },
    onLayerReorder(event) {
        console.log('map: layer-reorder', event, this.parseLayer(event.layer));
        this._installLayerBindings(event.layer);
    },
    onLayerResume(event) {
        console.log('map: layer-resume', event, this.parseLayer(event.layer));
        this._installLayerBindings(event.layer);
    },
    onLayerSuspend(event) {
        console.log('map: layer-suspend', event, this.parseLayer(event.layer));
        this._installLayerBindings(event.layer);
    },
    onLayersAddResult(event) {
        console.log('map: layers-add-result', event);
        event.layers.forEach(({ layer, error }) => {
            if (!error) {
                console.log(this.parseLayer(layer));
                this._installLayerBindings(layer);
            } else {
                console.error(error);
            }
        });
    },
    onLayersRemoved(event) {
        console.log('map: layers-removed', event);
    },
    onLayersReordered(event) {
        console.log('map: layers-reordered', event);
    },
    onZoomEnd(event) {
        console.log('map: zoom-end', event);
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

    listLayers () {
        let basemapId = this.map.getBasemap();
        let b = basemap[basemapId];
        let basemapTitle = (b && b.title);

        let basemapLayerIds = this.map.basemapLayerIds;
        let layerIds = this.map.layerIds.filter(id => basemapLayerIds.indexOf(id) == -1);
        let graphicsLayerIds = this.map.graphicsLayerIds.filter(id => basemapLayerIds.indexOf(id) == -1);

        let content = '';
        
        graphicsLayerIds.map(id => {
            let layer = this.map.getLayer(id);
            console.log('# ' + layer.id, this.parseLayer(layer));
            this.doLayer(layer);
        });
        layerIds.map(id => {
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
    },

    doLayer(layer:Layer) {
        let node = new ServiceNode({ layer });
        node.placeAt(this.domNode);
    },

    parseLayer(layer:Layer):Object {
        let id = layer.id;
        let loaded = layer.loaded;
        let secure = !!layer.credential;
        let error = layer.loadError;
        let suspended = layer.suspended;
        let visible = layer.visible;
        let visibleAtMapScale = layer.visibleAtMapScale;
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
            default:
                break;
        }

        return data;
    }
});
