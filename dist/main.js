/// <reference path="../typings/leaflet/leaflet.d.ts" />
/// <reference path="../typings/createjs/createjs.d.ts"/>
var omoa;
(function (omoa) {
    var CreateJSCanvasLayer = (function () {
        function CreateJSCanvasLayer() {
        }
        ;
        CreateJSCanvasLayer.prototype.addTo = function (map) {
            map.addLayer(this);
            return this;
        };
        // L.ILayer
        /**
          * Should contain code that creates DOM elements for the overlay, adds them
          * to map panes where they should belong and puts listeners on relevant map events.
          * Called on map.addLayer(layer).
          */
        CreateJSCanvasLayer.prototype.onAdd = function (map) {
            this.map = map;
            // create Canvas
            var canvas = this.canvas = L.DomUtil.create('canvas', 'leaflet-createjs-layer leaflet-layer', map.getPanes().overlayPane);
            var size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            canvas.style.background = "transparent";
            L.DomUtil.addClass(canvas, 'leaflet-zoom-hide');
            this.stage = new createjs.Stage(canvas);
            // add listeners
            map.on('viewreset', this.onReset, this);
            map.on('moveend', this.onMoveEnd, this);
            map.on('resize', this.onResize, this);
            // Kommentar entfernen um daraus einen ADHS-Layer zu machen, 
            // TODO: Konfigurierbar
            /*
            L.DomUtil.addClass(canvas,'leaflet-zoom-animated');
            map.on('move', this.onMove, this);
            map.on({
                'zoomanim': this.onZoom,
                'zoomend': this.onEndZoom
            }, this);
            */
            this.setup(this.stage, this.map);
            this.onMoveEnd();
        };
        ;
        /**
          * Should contain all clean up code that removes the overlay's elements from
          * the DOM and removes listeners previously added in onAdd. Called on map.removeLayer(layer).
          */
        CreateJSCanvasLayer.prototype.onRemove = function (map) {
            this.stage.uncache();
            this.stage.removeAllChildren();
            this.stage.removeAllEventListeners();
            this.stage = null;
            this.map.getPanes().overlayPane.removeChild(this.canvas);
            this.canvas = null;
            map.off('viewreset', this.onReset, this);
            map.off('moveend', this.onMoveEnd, this);
            map.off('resize', this.onResize, this);
            /*
            map.off('move', this.onMove, this);
            map.off({
                'zoomanim': this.onZoom,
                'zoomend': this.onEndZoom
            }, this);
            */
            this.map = null;
            console.log("removed from map");
        };
        ;
        // Event Handling
        CreateJSCanvasLayer.prototype.onMove = function (e) {
            console.log("onMove");
        };
        CreateJSCanvasLayer.prototype.onMoveEnd = function (e) {
            // compensate for translation through drag operation
            var mapPos = L.DomUtil.getPosition(this.map.getPanes().mapPane).clone();
            if (mapPos) {
                mapPos.x = mapPos.x * -1;
                mapPos.y = mapPos.y * -1;
                L.DomUtil.setPosition(this.canvas, mapPos);
            }
            this.recenter(this.stage, this.map);
        };
        CreateJSCanvasLayer.prototype.onZoom = function (e) {
            console.log("onZoom");
        };
        CreateJSCanvasLayer.prototype.onEndZoom = function (e) {
            console.log("onEndZoom");
        };
        CreateJSCanvasLayer.prototype.onResize = function (e) {
            this.recenter(this.stage, this.map);
        };
        CreateJSCanvasLayer.prototype.onReset = function (e) {
            this.rescale(this.stage, this.map);
        };
        // Members to be implemented by subclass
        /**
         * Implementation should contain the construction code of your
         * map layer, e.g. object creation and intialization.
         */
        CreateJSCanvasLayer.prototype.setup = function (stage, map) {
            throw new Error("Must be implemented by subclass.");
        };
        /**
         * Implementation should contain the deconstruction of the objects
         * of your map layer.
         */
        CreateJSCanvasLayer.prototype.cleanup = function (stage, map) {
            throw new Error("Must be implemented by subclass.");
        };
        /**
         * Implement the redrawing operations here, as this function is called
         * after map panning AND zooming.
         */
        CreateJSCanvasLayer.prototype.recenter = function (stage, map) {
            throw new Error("Must be implemented by subclass.");
        };
        /**
         * Implement any zoom dependent redrawing operations here, as this function is
         * called only after a scale change (map zooming).
         */
        CreateJSCanvasLayer.prototype.rescale = function (stage, map) {
            throw new Error("Must be implemented by subclass.");
        };
        return CreateJSCanvasLayer;
    })();
    omoa.CreateJSCanvasLayer = CreateJSCanvasLayer;
})(omoa || (omoa = {}));
/// <reference path="./CreateJSCanvasLayer.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DemoLayer = (function (_super) {
    __extends(DemoLayer, _super);
    function DemoLayer() {
        _super.call(this);
    }
    DemoLayer.prototype.setup = function (stage, map) {
        // red box with a diagonal line, fixed in canvas coordinate space
        var r = new createjs.Shape();
        r.graphics.beginStroke("#ff0000")
            .setStrokeStyle(1)
            .drawRect(0, 0, this.canvas.width, this.canvas.height)
            .moveTo(this.canvas.width, 0).lineTo(0, this.canvas.height);
        // pink circle, fixed in canvas coordinate space
        var s = new createjs.Shape();
        s.graphics.beginFill("#cc3399").beginStroke("#ffaaff").setStrokeStyle(5)
            .drawCircle(100, 100, 50)
            .endStroke().endFill();
        // turquois equator line, fixed in map space and thus
        // redrawn on every map interaction
        this.equator = new createjs.Shape();
        // turquois circle, drawn once in canvas space 
        // and repositioned on every map interaction 
        this.zerozero = new createjs.Shape();
        this.zerozero.graphics.beginFill("rgba(127,255,255,0.5)")
            .beginStroke("#00aaaa").setStrokeStyle(2)
            .drawCircle(0, 0, 10)
            .endStroke().endFill();
        // label displaying the coordinate of the map center,
        // content updated on every map interaction
        this.centerLabel = new createjs.Text("stageCenter", "14px Arial", "#00aaaa");
        this.centerLabel.textAlign = "center";
        this.centerLabel.textBaseline = "middle";
        var size = map.getSize();
        this.centerLabel.x = size.x * 0.5;
        this.centerLabel.y = size.y * 0.5;
        this.centerLabel.shadow = new createjs.Shadow('#000000', 0, 0, 10);
        stage.addChild(r);
        stage.addChild(s);
        stage.addChild(this.equator);
        stage.addChild(this.zerozero);
        stage.addChild(this.centerLabel);
    };
    DemoLayer.prototype.cleanup = function (stage, map) {
        stage.removeAllChildren();
        this.centerLabel = null;
        this.equator = null;
        this.zerozero = null;
    };
    DemoLayer.prototype.recenter = function (stage, map) {
        // update text of center label
        var c_geo = map.getCenter();
        this.centerLabel.text = c_geo.toString();
        // Reposition zerozero
        var c = map.latLngToContainerPoint([0, 0]);
        this.zerozero.x = c.x;
        this.zerozero.y = c.y;
        //var t = createjs.Tween.get()
        // the equator is redrawn completely
        var g = this.equator.graphics;
        var p1 = map.latLngToContainerPoint([0, -180]);
        var p2 = map.latLngToContainerPoint([0, 180]);
        g.clear()
            .setStrokeStyle(2)
            .beginStroke('#00aaaa')
            .moveTo(p1.x, p1.y)
            .lineTo(p2.x, p2.y);
        // render the stage
        this.stage.update();
    };
    DemoLayer.prototype.rescale = function (stage, map) {
        console.log("DemoLayer.rescale");
    };
    return DemoLayer;
})(omoa.CreateJSCanvasLayer);
/// <reference path="./CreateJSCanvasLayer.ts"/>
var MassiveDataLayer = (function (_super) {
    __extends(MassiveDataLayer, _super);
    function MassiveDataLayer() {
        _super.call(this);
        this.data = [L.latLng(80, -180), L.latLng(-80, 180)];
        for (var i = 0; i < 10000; i++) {
            var p = L.latLng((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 360);
            this.data.push(p);
        }
    }
    MassiveDataLayer.prototype.setup = function (stage, map) {
        this.container = new createjs.Container();
        this.lines = new createjs.Shape();
        for (var i = 0; i < this.data.length; i++) {
            var shape = new createjs.Shape();
            shape.name = "shape" + i;
            shape.graphics.beginFill('#ccffcc').setStrokeStyle(0, "round", "round", 5, true).beginStroke('#004400')
                .drawCircle(0, 0, 10 * Math.random()).endFill().endStroke();
            this.container.addChild(shape);
        }
        stage.addChild(this.lines);
        stage.addChild(this.container);
    };
    MassiveDataLayer.prototype.cleanup = function (stage, map) {
        stage.removeAllChildren();
    };
    MassiveDataLayer.prototype.recenter = function (stage, map) {
        var t = new Date().getTime();
        // reproject center and reposition individual circle shapes
        var count = this.data.length;
        var p = map.latLngToContainerPoint([0, 0]);
        this.lines.graphics.clear()
            .setStrokeStyle(0, "round", "round", 5, true)
            .beginStroke('#007700')
            .moveTo(p.x, p.y);
        for (var i = 0; i < count; i++) {
            p = map.latLngToContainerPoint(this.data[i]);
            this.lines.graphics.lineTo(p.x, p.y);
            var shape = this.container.getChildAt(i);
            shape.x = p.x;
            shape.y = p.y;
        }
        this.lines.graphics.endStroke();
        // render the stage
        this.stage.update();
        document.getElementById('timingOutput').textContent = (new Date().getTime() - t).toString();
    };
    MassiveDataLayer.prototype.rescale = function (stage, map) {
    };
    return MassiveDataLayer;
})(omoa.CreateJSCanvasLayer);
/// <reference path="../typings/createjs/createjs.d.ts"/>
/// <reference path="../typings/leaflet/leaflet.d.ts"/>
/// <reference path="./DemoLayer.ts"/>
/// <reference path="./MassiveDataLayer.ts"/>
var Main = (function () {
    function Main() {
        var _this = this;
        // preload application assets
        var assets = [
            { src: "assets/ifl_praesi_bg.png", id: "bg" },
            { src: "assets/larrow.png", id: "arrow" },
        ];
        this.queue = new createjs.LoadQueue();
        this.queue.on('complete', function (e) { _this.onComplete(e); });
        this.queue.loadManifest(assets);
    }
    Main.prototype.onComplete = function (e) {
        console.log("complete");
        this.draw();
    };
    Main.prototype.draw = function () {
    };
    return Main;
})();
// boot up
window.addEventListener('load', function () {
    console.log("boot up");
    var main = new Main();
    var leafletDiv = document.getElementById('leafletmap');
    var leaflet = L.map(leafletDiv).setView([0.0, 0.0], 3);
    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>'
    }).addTo(leaflet);
    var dataLayer = new MassiveDataLayer();
    dataLayer.addTo(leaflet);
    var demoLayer = new DemoLayer();
    demoLayer.addTo(leaflet);
});
//# sourceMappingURL=main.js.map