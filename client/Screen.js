/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

/**
 * This class manages the screen, and calls the physics
 * engine and the rendering engine.
 *
 * \author Sébastien Boisvert
 */
function Screen(gameFrequency,renderingFrequency){
	
/*
 * Turn on the physics engine.
 */
	this.enableEngine=true;

	this.selectedVertex=null;

	this.activeObjects=new Array();
	this.activeIndex=0;
	this.nextActiveObjects=new Array();

	this.originXSpeed=0;
	this.originYSpeed=0;
	this.originDamping=0.90;
	this.originMoveSlices=3;
	this.originMoveInProgress=false;
	this.zoomValue=1;

	this.humanInterface=new HumanInterface(this);

	this.graphOperator=new GraphOperator();
	this.kmerLength=this.graphOperator.getKmerLength();

	this.gameFrequency=gameFrequency;
	this.renderingFrequency=renderingFrequency;

	this.gameFrameLength=this.roundNumber(1000/this.gameFrequency,2);
	this.renderingFrameLength=this.roundNumber(1000/this.renderingFrequency,2);

	this.webDocument=new WebDocument();
	this.canvas=this.webDocument.getCanvas();
	this.renderingCanvas=this.webDocument.getRenderingCanvas();
	
	this.renderer=new Renderer(this);

/*
 * Resolution.
 *
 */
	this.width=1300;
	this.height=600;

	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.renderingCanvas.width=this.width;
	this.renderingCanvas.height=this.height;

	this.engine=new PhysicsEngine(this);

	this.graph=new Graph(this.getWidth(),this.getHeight());

	/* number of vertices */
	this.n=16;
	this.degree=2;
	this.typeIndex=0;
	this.types=["linear","random","star"];
	this.type=this.types[this.typeIndex];

	this.context=this.canvas.getContext("2d");
	this.renderingContext=this.renderingCanvas.getContext("2d");

	var _this=this;

	function handleMouseDown(e){
		_this.handleMouseDown.call(_this,e);
	}

	function handleMouseUp(e){
		_this.handleMouseUp.call(_this,e);
	}

	function handleMouseMove(e){
		_this.handleMouseMove.call(_this,e);
	}

	this.canvas.addEventListener("mousedown",handleMouseDown,false);
	this.canvas.addEventListener("mouseup",handleMouseUp,false);
	this.canvas.addEventListener("mousemove",handleMouseMove,false);

	//this.createButtons();

	this.start();
}

Screen.prototype.getOriginX=function(){
	return this.originX;
}

Screen.prototype.getOriginY=function(){
	return this.originY;
}

Screen.prototype.getOriginXSpeed=function(){
	return this.originXSpeed;
}

Screen.prototype.getOriginYSpeed=function(){
	return this.originYSpeed;
}

Screen.prototype.start=function(){
	

	this.vertexSelected=null;
	this.lastUpdate=this.getMilliseconds();
	this.identifier=0;

	this.moveOrigin=false;

	this.originX=0;
	this.originY=0;

	this.lastOriginX=this.originX;
	this.lastOriginY=this.originY;
	this.lastMouseX=0;
	this.lastMouseY=0;

	this.graphOperator.createGraph(this.graph);

	this.gameMilliseconds=0;
	this.gameFrameNumber=0;
	this.globalGameFrameNumber=0;
	this.actualGameFrequency=0;
	this.actualGameFrameLength=0;

	this.drawingMilliseconds=0;
	this.drawingFrames=0;
	this.actualRenderingFrequency=0;
	this.actualRenderingFrameLength=0;
}

Screen.prototype.handleMouseMove=function(eventObject){
	var position=this.getMousePosition(eventObject);

	this.selectedVertex=null;
/*
 * Highlight the equipment.
 */

	for(i in this.graph.getVertices()){
		var vertexToCheck=this.graph.getVertices()[i];
		if(vertexToCheck.isFollower() || 
			vertexToCheck.isInside(this.translateX(position[0]),
			this.translateY(position[1]))){

			this.selectedVertex=vertexToCheck;
		}
	}

	for(i in this.graph.getVertices()){
		if(this.graph.getVertices()[i].handleMouseMove(this.translateX(position[0]),
			this.translateY(position[1]))){
/* 
 * If we handle a object, we can not move the screen too.
 */
			return;
		}
	}


	if(this.moveOrigin){

		var dx=this.lastMouseX-position[0];
		var dy=this.lastMouseY-position[1];

		dx/=this.zoomValue;
		dy/=this.zoomValue;

		if(dx!=0 || dy!=0){
			this.lastMouseGameFrame=this.globalGameFrameNumber;
			//console.log("Last move: "+this.lastMouseGameFrame);
		}

		this.originXSpeed=dx;
		this.originYSpeed=dy;

		this.originX=this.lastOriginX+dx;
		this.originY=this.lastOriginY+dy;
	}
}

Screen.prototype.handleMouseDown=function(eventObject){
	var position=this.getMousePosition(eventObject);

	for(i in this.buttons){
		var candidate=this.buttons[i];
		if(candidate.handleMouseDown(position[0],position[1])){

		
			this.vertexSelected=null;

			// only one of them can be active
			if(candidate.getState()){
				this.addArcButton.resetState();
				this.addVertexButton.resetState();
				this.removeArcButton.resetState();
				this.removeVertexButton.resetState();
				candidate.activateState();
			}

			//this.processButtons();

			return;
		}
	}

	if(false && this.addVertexButton.getState()){
		var vertex=new Vertex(position[0]+this.originX,position[1]+this.originY,this.identifier);
		this.vertices.push(vertex);

		this.identifier++;
		return;
	}

	if(false && this.removeVertexButton.getState()){
		for(i in this.vertices){
			var vertexToCheck=this.vertices[i];
			if(vertexToCheck.isInside(position[0]+this.originX,position[1]+this.originY,this.vertexRadius)){

				var newTable=new Array();

				for(j in this.vertices){
/*
					if(!this.useGrid){
						break;
					}
*/
					//this.grid.removeEntry(j);
				}

				for(j in this.vertices){
					if(vertexToCheck.getName()!=this.vertices[j].getName()){
						newTable.push(this.vertices[j]);
					}
				}


				this.vertices=newTable;

				//var scale=this.range*this.vertexRadius;

				for(j in this.vertices){
					var vertex=this.vertices[i];

					//if(this.useGrid){
						//this.grid.addEntry(i,vertex.getX(),vertex.getY(),scale,scale);
					//}
				}


				for(j in this.vertices){
					this.vertices[j].removeArc(vertexToCheck);
				}

				return;
			}
		}
	}


	if(false && this.addArcButton.getState()){
		for(i in this.vertices){
			if(this.vertices[i].isInside(position[0]+this.originX,position[1]+this.originY,this.vertexRadius)){
				if(this.vertexSelected==null){
					this.vertexSelected=i;
				}else{
					if(i!=this.vertexSelected){
						this.createArcs(this.vertices[i],this.vertices[this.vertexSelected]);
					}
					this.vertexSelected=null;
				}

				return;
			}
		}
	}

	if(false && this.removeArcButton.getState()){
		for(i in this.vertices){
			var vertexToCheck=this.vertices[i];
			if(vertexToCheck.isInside(position[0]+this.originX,position[1]+this.originY,this.vertexRadius)){
				if(this.vertexSelected==null){
					this.vertexSelected=i;
				}else{
					if(i!=this.vertexSelected){
						var otherVertex=this.vertices[this.vertexSelected];
						vertexToCheck.removeArc(otherVertex);
						otherVertex.removeArc(vertexToCheck);
					}
					this.vertexSelected=null;
				}

				return;
			}
		}
	}


	for(i in this.graph.getVertices()){
		if(this.graph.getVertices()[i].handleMouseDown(this.translateX(position[0]),
			this.translateY(position[1]))){

			return;
		}
	}

	this.moveOrigin=true;
	this.lastMouseX=position[0];
	this.lastMouseY=position[1];
	this.lastOriginX=this.originX;
	this.lastOriginY=this.originY;

	this.originMoveInProgress=false;

	//eventObject.target.style.cursor="default";
}

Screen.prototype.getMousePosition=function(e){

	var eventObject=e || window.event;

	var mouseX;
	var mouseY;

	if(eventObject.offsetX) {
		mouseX = eventObject.offsetX;
		mouseY = eventObject.offsetY;
	}else if(eventObject.layerX) {
		mouseX = eventObject.layerX;
		mouseY = eventObject.layerY;
	}

	return [mouseX,mouseY];
}

Screen.prototype.handleMouseUp=function(eventObject){
	var position=this.getMousePosition(eventObject);

	for(i in this.graph.getVertices()){
		if(this.graph.getVertices()[i].handleMouseUp(this.translateX(position[0]),this.translateY(position[1]))){
			return;
		}
	}

	this.moveOrigin=false;

	//eventObject.target.style.cursor="default";
}

Screen.prototype.printGraph=function(){
	for(i in this.graph.getVertices()){
		this.graph.getVertices()[i].printArcs();
	}
}

Screen.prototype.roundNumber=function(number,precision){
	var multiplier=1;
	var i=0;
	while(i<precision){
		multiplier*=10;
		i++;
	}

	return Math.round(number*multiplier)/multiplier;
}

Screen.prototype.iterate=function(){
	
	var start=this.getMilliseconds();

	if(start>= this.lastUpdate+1000){
		this.actualGameFrequency=this.roundNumber(this.gameFrameNumber*1000/(start-this.lastUpdate),2);
		this.actualGameFrameLength=this.roundNumber(this.gameMilliseconds/this.gameFrameNumber,2);
		this.gameMilliseconds=0;
		this.gameFrameNumber=0;

		this.actualRenderingFrequency=this.roundNumber(this.drawingFrames*1000/(start-this.lastUpdate),2);
		this.actualRenderingFrameLength=this.roundNumber(this.drawingMilliseconds/this.drawingFrames,2);
		this.drawingMilliseconds=0;
		this.drawingFrames=0;

		this.lastUpdate=start;
	}

	this.engine.applyForces(this.getActiveObjects());

	if(this.enableEngine){
		this.engine.moveObjects(this.getActiveObjects());
	}

	var mouseFadeDelay=this.gameFrequency/4;

/*
 * Cancel sliding events.
 */
	if(this.globalGameFrameNumber>=this.lastMouseGameFrame+mouseFadeDelay
		&& !this.originMoveInProgress){

		this.originXSpeed=0;
		this.originYSpeed=0;

		this.lastMouseGameFrame=this.globalGameFrameNumber;
	}

/*
 * To the crazy sliding thing.
 */
	if(!this.moveOrigin){
		
		this.originX=this.originX+this.originXSpeed/this.originMoveSlices;
		this.originY=this.originY+this.originYSpeed/this.originMoveSlices;

		this.originXSpeed*=this.originDamping;
		this.originYSpeed*=this.originDamping;

		this.originMoveInProgress=true;

/*
 * TODO: the epsilon case is buggy.
 */
		var epsilon=0.01;
		if(this.originXSpeed< epsilon && this.originYSpeed< epsilon){
			//this.originMoveInProgress=false;
		}
	}

	var end=this.getMilliseconds();
	this.gameMilliseconds+=(end-start);

	this.gameFrameNumber++;
	this.globalGameFrameNumber++;
}

Screen.prototype.getMilliseconds=function(){
	return new Date()*1;
}

Screen.prototype.drawControlPanel=function(){
	for(i in this.buttons){
		this.buttons[i].draw(this.context,this.blitter);
	}

	this.context.fillStyle    = '#000000';
	this.context.font         = 'bold 12px sans-serif';
/*
	this.context.fillText("Repulsion: "+this.forceConstant, this.repulsionBase, 25);
	this.context.fillText("Attraction: "+this.springConstant, this.attractionBase, 25);
	this.context.fillText("Type: "+this.type, this.typeBase, 25);
	this.context.fillText("Vertices: "+this.n, this.verticesBase, 25);
	this.context.fillText("Degree: "+this.degree, this.degreeBase, 25);
	this.context.fillText("Damping: "+this.damping, this.dampingBase, 25);
	this.context.fillText("Vertex radius: "+this.vertexRadius, this.radiusBase, 25);
	this.context.fillText("Edge length: "+this.arcLength, this.arcBase, 25);
*/

	if(this.selectedVertex!=null){
		var sequence=this.selectedVertex.getSequence();
		var toPrint=sequence.substr(0,this.kmerLength-1)+"["+sequence[sequence.length-1]+"]";
		this.context.fillText("Ball: "+toPrint, 32, 32);
	}


	var offsetX=10;
	var offsetY=90;
	var stepping=15;

	this.context.fillText("Registered objects: "+this.graph.getVertices().length+" active: "+this.activeObjects.length,
		offsetX,this.canvas.height-offsetY);
	offsetY-=stepping;

	var printableZoom=this.zoomValue;
	if(this.zoomValue<1){
		printableZoom="1/"+(1/this.zoomValue);
	}

	this.context.fillText("Display: resolution: "+this.canvas.width+"x"+this.canvas.height+" origin: ("+
		this.roundNumber(this.originX,2)+","+this.roundNumber(this.originY,2)+") "+
		"zoom: "+printableZoom,
		offsetX,this.canvas.height-offsetY);
	offsetY-=stepping;

	this.context.fillText("Game (expected): frequency: "+this.gameFrequency+" Hz, frame length: "+this.gameFrameLength+" ms",
		offsetX,this.canvas.height-offsetY);
	offsetY-=stepping;

	var warning="";

	if(this.actualGameFrameLength>this.gameFrameLength)
		warning=" EXCEEDED!";

	this.context.fillText("Game (actual): frequency: "+this.actualGameFrequency+" Hz, frame length: "+this.actualGameFrameLength+
		" ms"+warning,offsetX, this.canvas.height-offsetY);
	offsetY-=stepping;

	this.context.fillText("Rendering (expected): frequency: "+this.renderingFrequency+" Hz, frame length: "+this.renderingFrameLength+" ms",
		offsetX,this.canvas.height-offsetY);
	offsetY-=stepping;

	warning="";

	if(this.actualRenderingFrameLength>this.renderingFrameLength)
		warning=" EXCEEDED!";

	this.context.fillText("Rendering (actual): frequency: "+this.actualRenderingFrequency+" Hz, frame length: "+this.actualRenderingFrameLength+
		" ms"+warning,offsetX, this.canvas.height-offsetY);
	offsetY-=stepping;
}

/*
 * TODO: move this in HumanInterface
 */
Screen.prototype.draw=function(){
/*
 * Setting dimensions clear the content.
 * 2012-11-13: IE9 does not support that.
 */
/*
	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.renderingCanvas.width=this.width;
	this.renderingCanvas.height=this.height;
*/

	var start=this.getMilliseconds();

	var context=this.getContext();
	context.clearRect(0,0,this.width,this.height);

	//context.strokeStyle = "rgb(0,0,0)";

/*
 * Draw a line around the canvas.
 */
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(this.canvas.width,0);
	context.lineTo(this.canvas.width,this.canvas.height);
	context.lineTo(0,this.canvas.height);
	context.lineTo(0,0);
	context.stroke();
	context.closePath();


	//if(this.showArcsButton.getState()){
		this.renderer.drawArcs(this.getActiveObjects());
	//}

	//if(this.showVerticesButton.getState()){
		this.renderer.drawVertices(this.getActiveObjects());
	//}

	this.context.clearRect(0,0,this.width,this.height);

	this.context.drawImage(this.renderingCanvas,
		0,0,this.width,this.height,
		0,0,this.width,this.height);

	this.drawControlPanel();

/*
 * \see http://www.w3schools.com/tags/canvas_drawimage.asp
 */

	var end=this.getMilliseconds();

	this.drawingMilliseconds+=(end-start);

	this.drawingFrames++;

}

Screen.prototype.getRandomX=function(){
	return Math.random()*(this.canvas.width-1);
}

Screen.prototype.getRandomY=function(){
	return Math.random()*(this.canvas.height-1);
}

Screen.prototype.getContext=function(){
	return this.renderingContext;
}

Screen.prototype.getWidth=function(){
	return this.canvas.width;
}

Screen.prototype.getHeight=function(){
	return this.canvas.height;
}

Screen.prototype.isOutside=function(vertex,buffer){

	var x=vertex.getX()-this.getOriginX();
	var y=vertex.getY()-this.getOriginY();

	var width=this.width/this.zoomValue;
	var height=this.height/this.zoomValue;

/*
 * The buffer region around the screen.
 */
	if(x<(0-buffer))
		return true;

	if(x>=(width+buffer))
		return true;

	if(y<(0-buffer))
		return true;

	if(y>=(height+buffer))
		return true;

	return false;
}


Screen.prototype.getActiveObjects=function(){

/*
 * Quantum value of the machine.
 */
	var quantum=8192;
	var vertices=this.graph.getVertices();

/*
 * Size of buffer for active objects within the
 * activation engine.
 */
	var bufferForActiveObjects=512;

	var i=0;
	while(i<quantum && this.activeIndex<vertices.length){
		var vertex=vertices[this.activeIndex];

		if(!this.isOutside(vertex,bufferForActiveObjects))
			this.nextActiveObjects.push(vertex);

		i++;
		this.activeIndex++;
	}

/*
 * We tested all objects.
 */
	if(this.activeIndex>=vertices.length){
		this.activeObjects=this.nextActiveObjects;
		this.nextActiveObjects=new Array();
		this.activeIndex=0;
		//this.engine.resetActiveIndex();
	}

	return this.activeObjects;
}

Screen.prototype.translateX=function(x){
	var result=(x/this.zoomValue+this.originX);
	//console.log("x= "+x+" originX= "+this.originX+" zoom: "+this.zoomValue+" translated= "+result);
	return result;
}

Screen.prototype.translateY=function(y){
	return (y/this.zoomValue+this.originY);
}

Screen.prototype.getZoomValue=function(){
	return this.zoomValue;
}

Screen.prototype.processKeyboardEvent=function(e){
	this.humanInterface.processKeyboardEvent(e);
}

Screen.prototype.updateOrigin=function(originX,originY,originXSpeed,originYSpeed,zoomValue){
	this.originX=originX;
	this.originY=originY;
	this.originXSpeed=originXSpeed;
	this.originYSpeed=originYSpeed;
	this.zoomValue=zoomValue;
}

