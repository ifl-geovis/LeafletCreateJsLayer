/// <reference path="../typings/createjs/createjs.d.ts"/>
/// <reference path="../typings/leaflet/leaflet.d.ts"/>

/// <reference path="./DemoLayer.ts"/>
/// <reference path="./MassiveDataLayer.ts"/>

class Main {	
	private queue:createjs.LoadQueue;
	
	constructor () {		
		// preload application assets
		let assets = [
			{src:"assets/ifl_praesi_bg.png", id:"bg"},
			{src:"assets/larrow.png", id:"arrow"},
		]
		this.queue = new createjs.LoadQueue();
		this.queue.on('complete', (e:createjs.Event)=>{this.onComplete(e)});
		this.queue.loadManifest(assets);
	}
	
	private onComplete(e: createjs.Event) {
		console.log( "complete" );
		this.draw();
	}
	
	private draw() {
		
	}
}

// boot up
window.addEventListener('load', () => {
	console.log( "boot up" );
	
    var main = new Main();
	
	var leafletDiv = document.getElementById('leafletmap');
	var leaflet = L.map( leafletDiv ).setView([0.0,0.0],3);
	
	L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>'
    }).addTo(leaflet);
	
	
	
	var dataLayer = new MassiveDataLayer();
	dataLayer.addTo(leaflet);
	
	var demoLayer = new DemoLayer();
	demoLayer.addTo(leaflet);	
	
})