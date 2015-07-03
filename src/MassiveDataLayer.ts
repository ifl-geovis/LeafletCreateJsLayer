/// <reference path="./CreateJSCanvasLayer.ts"/>

class MassiveDataLayer extends omoa.CreateJSCanvasLayer {
	
	private data:L.LatLng[];
	private container:createjs.Container;
	
	private lines:createjs.Shape;
	private linesBaseSize:number;
	
	constructor () {
		super();
		this.data = [L.latLng( 80,-180),L.latLng( -80,180)];
		for (var i = 0; i < 10000; i++) {
			let p = L.latLng( (Math.random()-0.5)*160,
							(Math.random()-0.5)*360);
			this.data.push(p);
		}
	}
	
	setup(stage:createjs.Stage, map:L.Map) {
		this.container = new createjs.Container();
		this.lines = new createjs.Shape();
		
		for (var i = 0; i < this.data.length; i++) {			
			let shape = new createjs.Shape();
			shape.name = "shape"+i;
			shape.graphics.beginFill('#ccffcc').setStrokeStyle(0,"round","round",5,true).beginStroke('#004400')
			.drawCircle(0, 0, 10*Math.random()).endFill().endStroke();
			this.container.addChild(shape);
		}
		
		stage.addChild(this.lines);
		stage.addChild(this.container);
	}
	
	cleanup(stage:createjs.Stage, map:L.Map) {
		stage.removeAllChildren();
	}
	
	recenter(stage:createjs.Stage, map:L.Map) {
		let t = new Date().getTime();
		
		// reproject center and reposition individual circle shapes
		let count = this.data.length;
		let p = map.latLngToContainerPoint([0,0]);
		
		this.lines.graphics.clear()
		.setStrokeStyle(0,"round","round",5,true)
		.beginStroke('#007700')
		.moveTo(p.x, p.y);
		
		for (var i = 0; i < count; i++) {
			p = map.latLngToContainerPoint(this.data[i]);
			this.lines.graphics.lineTo(p.x, p.y);
			
			let shape = this.container.getChildAt(i);
			shape.x = p.x;
			shape.y = p.y;
		}
		this.lines.graphics.endStroke();
	
		// render the stage
		this.stage.update();
		document.getElementById('timingOutput').textContent = (new Date().getTime() - t).toString();
	}
	
	rescale(stage:createjs.Stage, map:L.Map) {
	}
}