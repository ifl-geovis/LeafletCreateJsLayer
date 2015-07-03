/// <reference path="../typings/leaflet/leaflet.d.ts" />
/// <reference path="../typings/createjs/createjs.d.ts"/>

module omoa {
	export class CreateJSCanvasLayer implements L.ILayer {
		
		protected map:L.Map;
		protected stage:createjs.Stage;
		protected canvas:HTMLCanvasElement;
		
		constructor(){
		};
		
		addTo (map:L.Map) {
		    map.addLayer(this);
		    return this;
		}
		
		// L.ILayer
		/**
          * Should contain code that creates DOM elements for the overlay, adds them
          * to map panes where they should belong and puts listeners on relevant map events.
          * Called on map.addLayer(layer).
          */
        onAdd(map: L.Map) {
			this.map = map;
			
			// create Canvas
			var canvas = this.canvas = <HTMLCanvasElement> L.DomUtil.create(
				'canvas',
				'leaflet-createjs-layer leaflet-layer',
				map.getPanes().overlayPane
				);
			var size = map.getSize();
	        canvas.width  = size.x;
	        canvas.height = size.y;
			canvas.style.background = "transparent";
			
			L.DomUtil.addClass(canvas,'leaflet-zoom-hide');			
			
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

        /**
          * Should contain all clean up code that removes the overlay's elements from
          * the DOM and removes listeners previously added in onAdd. Called on map.removeLayer(layer).
          */
        onRemove(map: L.Map){
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
		
		// Event Handling
		
		private onMove(e?) {
			console.log("onMove");
		}
		
		private onMoveEnd(e?) {
			// compensate for translation through drag operation
			let mapPos = L.DomUtil.getPosition(this.map.getPanes().mapPane).clone();
			if (mapPos) {
				mapPos.x = mapPos.x*-1;
				mapPos.y = mapPos.y*-1;
				L.DomUtil.setPosition(this.canvas, mapPos);
			}
			this.recenter(this.stage, this.map);
		}
		
		private onZoom(e?) {
			console.log("onZoom");
		}
		
		private onEndZoom(e?) {
			console.log("onEndZoom");
		}
		
		private onResize(e?) {
			this.recenter(this.stage, this.map);
		}
		
		private onReset(e) {
			this.rescale( this.stage, this.map);
		}
		
		// Members to be implemented by subclass
		
		/**
		 * Implementation should contain the construction code of your 
		 * map layer, e.g. object creation and intialization. 
		 */
		protected setup(stage:createjs.Stage, map:L.Map) {
			throw new Error("Must be implemented by subclass.");
		}

		/**
		 * Implementation should contain the deconstruction of the objects
		 * of your map layer.
		 */
		protected cleanup(stage:createjs.Stage, map:L.Map) {
			throw new Error("Must be implemented by subclass.");
		}
		
		/**
		 * Implement the redrawing operations here, as this function is called
		 * after map panning AND zooming.
		 */
		protected recenter(stage:createjs.Stage, map:L.Map) {
			throw new Error("Must be implemented by subclass.");
		}
		
		/**
		 * Implement any zoom dependent redrawing operations here, as this function is
		 * called only after a scale change (map zooming).
		 */
		protected rescale(stage:createjs.Stage, map:L.Map) {
			throw new Error("Must be implemented by subclass.");
		}
	}
}