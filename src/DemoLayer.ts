/// <reference path="./CreateJSCanvasLayer.ts"/>

class DemoLayer extends omoa.CreateJSCanvasLayer {
	private centerLabel:createjs.Text;
	private equator:createjs.Shape;
	private zerozero:createjs.Shape;
	
	constructor () {
		super();
	}
	
	setup(stage:createjs.Stage, map:L.Map) {
		// red box with a diagonal line, fixed in canvas coordinate space
		let r = new createjs.Shape();
		r.graphics.beginStroke("#ff0000")
		.setStrokeStyle(1)
		.drawRect(0,0,this.canvas.width,this.canvas.height)
		.moveTo(this.canvas.width,0).lineTo(0,this.canvas.height);
		
		// pink circle, fixed in canvas coordinate space
		let s = new createjs.Shape();
		s.graphics.beginFill("#cc3399").beginStroke("#ffaaff").setStrokeStyle(5)
		.drawCircle(100,100,50)
		.endStroke().endFill();
		
		// turquois equator line, fixed in map space and thus
		// redrawn on every map interaction
		this.equator = new createjs.Shape();
		
		// turquois circle, drawn once in canvas space 
		// and repositioned on every map interaction 
		this.zerozero = new createjs.Shape();
		this.zerozero.graphics.beginFill("rgba(127,255,255,0.5)")
		.beginStroke("#00aaaa").setStrokeStyle(2)
		.drawCircle(0,0,10)
		.endStroke().endFill();
		
		// label displaying the coordinate of the map center,
		// content updated on every map interaction
		this.centerLabel = new createjs.Text("stageCenter", "14px Arial", "#00aaaa");
		this.centerLabel.textAlign = "center";
		this.centerLabel.textBaseline = "middle";
		let size = map.getSize();
		this.centerLabel.x = size.x * 0.5;
		this.centerLabel.y = size.y * 0.5;
		this.centerLabel.shadow = new createjs.Shadow('#000000', 0, 0, 10);
		
		stage.addChild(r);
		stage.addChild(s);
		stage.addChild(this.equator);
		stage.addChild(this.zerozero);
		stage.addChild(this.centerLabel)
	}
	
	cleanup(stage:createjs.Stage, map:L.Map) {
		stage.removeAllChildren();
		this.centerLabel = null;
		this.equator = null;
		this.zerozero = null;
	}
	
	recenter(stage:createjs.Stage, map:L.Map) {
		// update text of center label
		let c_geo = map.getCenter();
		this.centerLabel.text = c_geo.toString();
		
		// Reposition zerozero
		let c = map.latLngToContainerPoint([0,0]);
		this.zerozero.x = c.x;
		this.zerozero.y = c.y;
		//var t = createjs.Tween.get()
		
		// the equator is redrawn completely
		let g = this.equator.graphics;
		let p1 = map.latLngToContainerPoint([0,-180]);
		let p2 = map.latLngToContainerPoint([0,180]);
		g.clear()
		.setStrokeStyle(2)
		.beginStroke('#00aaaa')
		.moveTo(p1.x,p1.y)
		.lineTo(p2.x,p2.y);
		
		// render the stage
		this.stage.update();
	}
	
	rescale(stage:createjs.Stage, map:L.Map) {
		console.log("DemoLayer.rescale");
	}
}