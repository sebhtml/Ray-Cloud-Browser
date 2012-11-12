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
	this.selectedVertex=null;

	this.activeObjects=new Array();
	this.activeIndex=0;
	this.nextActiveObjects=new Array();

	this.originXSpeed=0;
	this.originYSpeed=0;
	this.originDamping=0.90;
	this.originMoveSlices=2;
	this.originMoveInProgress=false;
	this.zoomValue=1;

	this.kmerLength=31;
	this.graphOperator=new GraphOperator(this.kmerLength);

	this.gameFrequency=gameFrequency;
	this.renderingFrequency=renderingFrequency;

	this.gameFrameLength=this.roundNumber(1000/this.gameFrequency,2);
	this.renderingFrameLength=this.roundNumber(1000/this.renderingFrequency,2);

	this.webDocument=new WebDocument();
	this.canvas=this.webDocument.getCanvas();
	
	this.renderer=new Renderer(this);

/*
 * Resolution.
 *
 */
	this.width=1300;
	this.height=600;
	this.canvas.width=this.width;
	this.canvas.height=this.height;

	this.engine=new PhysicsEngine(this);

	this.graph=new Graph(this.getWidth(),this.getHeight());

	/* number of vertices */
	this.n=16;
	this.degree=2;
	this.typeIndex=0;
	this.types=["linear","random","star"];
	this.type=this.types[this.typeIndex];

	this.context=this.canvas.getContext("2d");

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

	this.createButtons();

	this.start();
}

Screen.prototype.getOriginX=function(){
	return this.originX;
}

Screen.prototype.getOriginY=function(){
	return this.originY;
}



Screen.prototype.createButtons=function(){
	this.buttons=new Array();

	this.timeControlButton=new Button(30,35,40,50,"time",true);
	//this.buttons.push(this.timeControlButton);

	this.repulsionBase=280;
	this.attractionBase=180;
	this.typeBase=470;
	this.verticesBase=560;
	this.resetBase=80;
	this.degreeBase=640;
	this.dampingBase=380;
	this.radiusBase=720;
	this.arcBase=830;

	var smallButtonWidth=20;

	this.showArcsButton=new Button(140,50,60,20,"edges",true);
	//this.buttons.push(this.showArcsButton);

	this.showVerticesButton=new Button(140,20,60,20,"vertices",true);
	//this.buttons.push(this.showVerticesButton);

	this.increaseRepulsionButton=new Button(this.repulsionBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseRepulsionButton);

	this.decreaseRepulsionButton=new Button(this.repulsionBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseRepulsionButton);

	this.increaseAttractionButton=new Button(this.attractionBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseAttractionButton);

	this.decreaseAttractionButton=new Button(this.attractionBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseAttractionButton);

	this.resetButton=new Button(this.resetBase,45,40,30,"reset",false);
	//this.buttons.push(this.resetButton);

	this.increaseTypeButton=new Button(this.typeBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseTypeButton);

	this.decreaseTypeButton=new Button(this.typeBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseTypeButton);

	this.increaseVerticesButton=new Button(this.verticesBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseVerticesButton);

	this.decreaseVerticesButton=new Button(this.verticesBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseVerticesButton);

	this.increaseDegreeButton=new Button(this.degreeBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseDegreeButton);

	this.decreaseDegreeButton=new Button(this.degreeBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseDegreeButton);

	this.increaseArcButton=new Button(this.arcBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseArcButton);

	this.decreaseArcButton=new Button(this.arcBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseArcButton);

	this.increaseRadiusButton=new Button(this.radiusBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseRadiusButton);

	this.decreaseRadiusButton=new Button(this.radiusBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseRadiusButton);

	this.increaseDampingButton=new Button(this.dampingBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseDampingButton);

	this.decreaseDampingButton=new Button(this.dampingBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseDampingButton);

	this.addVertexButton=new Button(950+40,25,100,smallButtonWidth,"add vertex",false);
	//this.buttons.push(this.addVertexButton);

	this.removeVertexButton=new Button(950+40,55,100,smallButtonWidth,"remove vertex",false);
	//this.buttons.push(this.removeVertexButton);


	this.addArcButton=new Button(1070+40,25,100,smallButtonWidth,"add edge",false);
	//this.buttons.push(this.addArcButton);

	this.removeArcButton=new Button(1070+40,55,100,smallButtonWidth,"remove edge",false);
	//this.buttons.push(this.removeArcButton);
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

	if(this.addVertexButton.getState()){
		var vertex=new Vertex(position[0]+this.originX,position[1]+this.originY,this.identifier);
		this.vertices.push(vertex);

		this.identifier++;
		return;
	}

	if(this.removeVertexButton.getState()){
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


	if(this.addArcButton.getState()){
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

	if(this.removeArcButton.getState()){
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

/*
Screen.prototype.processButtons=function(){
	if(this.increaseRepulsionButton.getState()){
		this.forceConstant+=this.forceStep;
		this.forceConstant=this.roundNumber(this.forceConstant,6);
		this.increaseRepulsionButton.resetState();
	}

	if(this.decreaseRepulsionButton.getState()){
		this.forceConstant-=this.forceStep;
		this.forceConstant=this.roundNumber(this.forceConstant,6);
		this.decreaseRepulsionButton.resetState();
	}

	if(this.increaseAttractionButton.getState()){
		this.springConstant+=this.sprintStep;
		this.springConstant=this.roundNumber(this.springConstant,6);
		this.increaseAttractionButton.resetState();
	}

	if(this.decreaseAttractionButton.getState()){
		this.springConstant-=this.sprintStep;
		this.springConstant=this.roundNumber(this.springConstant,6);
		this.decreaseAttractionButton.resetState();
	}

	if(this.resetButton.getState()){
		this.start();
		this.resetButton.resetState();
	}

	if(this.increaseTypeButton.getState()){
		this.typeIndex++;
		if(this.typeIndex == this.types.length){
			this.typeIndex=0;
		}
		this.type=this.types[this.typeIndex];
		this.increaseTypeButton.resetState();

		//console.log("new type "+this.type);
	}

	if(this.decreaseTypeButton.getState()){
		this.typeIndex--;
		if(this.typeIndex == -1){
			this.typeIndex=this.types.length-1;
		}
		this.type=this.types[this.typeIndex];
		this.decreaseTypeButton.resetState();

		//console.log("new type "+this.type);
	}

	if(this.increaseVerticesButton.getState()){
		this.n++;

		this.increaseVerticesButton.resetState();
	}

	if(this.decreaseVerticesButton.getState()){

		if(this.n!=0){
			this.n--;
		}

		this.decreaseVerticesButton.resetState();
	}

	if(this.increaseDegreeButton.getState()){
		this.degree++;

		this.increaseDegreeButton.resetState();
	}

	if(this.decreaseDegreeButton.getState()){
		if(this.degree!=0){
			this.degree--;
		}
		this.decreaseDegreeButton.resetState();
	}

	if(this.increaseArcButton.getState()){
		this.arcLength+=10;

		this.increaseArcButton.resetState();
	}

	if(this.decreaseArcButton.getState()){
		if(this.arcLength!=0){
			this.arcLength-=10;
		}

		this.decreaseArcButton.resetState();

		while(this.arcLength < 2.5*this.vertexRadius){
			this.vertexRadius-=10;
		}
	}

	if(this.increaseRadiusButton.getState()){
		this.vertexRadius+=10;

		this.increaseRadiusButton.resetState();

		while(this.arcLength < 2.5*this.vertexRadius){
			this.arcLength+=10;
		}
	}

	if(this.decreaseRadiusButton.getState()){
		if(this.vertexRadius!=0){
			this.vertexRadius-=10;
		}

		this.decreaseRadiusButton.resetState();
	}

	if(this.increaseDampingButton.getState()){
		if(this.damping<1){
			this.damping+=0.1;
		}
		this.increaseDampingButton.resetState();
		this.damping=this.roundNumber(this.damping,2);
	}

	if(this.decreaseDampingButton.getState()){
		if(this.damping>0){
			this.damping-=0.1;
		}
		this.decreaseDampingButton.resetState();
		this.damping=this.roundNumber(this.damping,2);
	}
}
*/

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
	this.engine.moveObjects(this.getActiveObjects());

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

		var epsilon=0.01;
		if(this.originXSpeed< epsilon && this.originYSpeed< epsilon){
			this.originMoveInProgress=false;
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

	this.context.fillText("Display: resolution: "+this.canvas.width+"x"+this.canvas.height+" origin: ("+
		this.roundNumber(this.originX,2)+","+this.roundNumber(this.originY,2)+") "+
		"zoom: "+this.zoomValue,
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



Screen.prototype.draw=function(){
/*
 * Setting dimensions clear the content.
 */
	this.canvas.width=this.width;
	this.canvas.height=this.height;

	var start=this.getMilliseconds();

	var context=this.context;
	//context.clearRect(0,0,this.canvas.width,this.canvas.height);

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


	if(this.showArcsButton.getState()){
		this.renderer.drawArcs(this.getActiveObjects());
	}

	if(this.showVerticesButton.getState()){
		this.renderer.drawVertices(this.getActiveObjects());
	}

	this.drawControlPanel();

/*
 * \see http://www.w3schools.com/tags/canvas_drawimage.asp
 */
/*
	this.context.drawImage(this.renderingCanvas,
		0,0,this.renderingCanvas.width,this.renderingCanvas.height,
		0,0,this.canvas.width,this.canvas.height);
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
	return this.context;
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

/*
 * \see http://stackoverflow.com/questions/5597060/detecting-arrow-keys-in-javascript
 *
 * accepted
 * arrow keys are only triggered by onkeydown, not onkeypress
 *
 * keycodes are:
 *
 * left = 37
 * up = 38
 * right = 39
 * down = 40
 */
Screen.prototype.processKeyboardEvent=function(e){
	var key=e.which;

	var leftKey=37;
	var upKey=38;
	var rightKey=39;
	var downKey=40;

	var backspace=8;
	var enter=13;

	var shift=32;

	var zoomingChange=2;

	if(key==leftKey){
		this.originXSpeed-=shift;
	}else if(key==rightKey){
		this.originXSpeed+=shift;
	}else if(key==downKey){
		this.originYSpeed+=shift;
	}else if(key==upKey){
		this.originYSpeed-=shift;
	}else if(key==enter){
/*
 * Re-center the origin too.
 */
		this.originX+=this.width/this.zoomValue/zoomingChange/2;
		this.originY+=this.height/this.zoomValue/zoomingChange/2;

		this.zoomValue*=zoomingChange;

	}else if(key==backspace){
/*
 * Re-center the origin too.
 */
		this.originX-=this.width/this.zoomValue/2;
		this.originY-=this.height/this.zoomValue/2;

		this.zoomValue/=zoomingChange;

	}

/*
	if(this.zoomValue>=1)
		this.zoomValue=1;
*/
}

Screen.prototype.getActiveObjects=function(){

	var quantum=200;
	var vertices=this.graph.getVertices();
	var bufferForActiveObjects=300;

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
