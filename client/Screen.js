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

function Screen(){
	this.gameFrequency=gameFrequency;

	this.gameFrameLength=Math.floor(1000/this.gameFrequency);

	this.canvas=document.createElement("canvas");

	this.canvas.style.position="relative";

	var body=document.getElementsByTagName("body")[0];
	var center=document.createElement("center");
	center.appendChild(this.canvas);

	body.appendChild(center);

/*
 * Resolution.
 *
 */
	this.canvas.width=1300;
	this.canvas.height=600;

	this.vertexRadius=20;


	this.engine=new PhysicsEngine();

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
	
	this.blitter=new Blitter();

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

	//this.createGraph();
	this.createStartingGraph();

	this.gameMilliseconds=0;
	this.gameFrames=0;
	this.actualGameFrequency=0;
	this.actualGameFrameLength=0;

	this.drawingMilliseconds=0;
	this.drawingFrames=0;
	this.actualDrawingFrequency=0;
	this.actualDrawingFrameLength=0;
}

Screen.prototype.handleMouseMove=function(eventObject){
	var position=this.getMousePosition(eventObject);

	for(i in this.vertices){
		if(this.vertices[i].handleMouseMove(position[0]+this.originX,position[1]+this.originY)){
			return;
		}
	}

	if(this.moveOrigin){

		var dx=this.lastMouseX-position[0];
		var dy=this.lastMouseY-position[1];

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


	for(i in this.vertices){
		if(this.vertices[i].handleMouseDown(position[0]+this.originX,position[1]+this.originY,this.vertexRadius)){
			return;
		}
	}

	this.moveOrigin=true;
	this.lastMouseX=position[0];
	this.lastMouseY=position[1];
	this.lastOriginX=this.originX;
	this.lastOriginY=this.originY;

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

	for(i in this.vertices){
		if(this.vertices[i].handleMouseUp(position[0],position[1])){
			return;
		}
	}

	this.moveOrigin=false;

	//eventObject.target.style.cursor="default";
}

Screen.prototype.printGraph=function(){
	for(i in this.vertices){
		this.vertices[i].printArcs();
	}
}

Screen.prototype.createVertex=function(name){
	var vertex=new Vertex(this.getRandomX(),this.getRandomY(),name);
	this.vertices.push(vertex);

	return vertex;
}

Screen.prototype.createArcs=function(v1,v2){
	v1.addArc(v2);
	v2.addArc(v1);
}

Screen.prototype.createStartingGraph=function(){
	this.vertices=new Array();

	var sequence="TCTTCGAAAATCTCTTCAAACCACGTCAGCTTCACCTTGCAGTATATATGTTACTGACTTCGTCAGTTCTATCCACAACCTCAAAACGGTGTTTTGAGCTGACTTCGTCAGTTCTATCTACAACCTCAAAACACTGTTTTGAGCAACCTGCGGCTAGCTTCCTAGTTTGCTCTTTGATTTTCATTGAGTATTAGAAGATACAATGGAGGTCGTCATGGACAATATCATCGATGTGTCAATTCCTGTTGCAGAAGTGGTGGACAAGCATCCAGAAGTCTTGGAAATTCTAGTGGAGTTGGGTTTTAAACCCCTTGCCAATCCCTTAATGCGCAATACAGTTGGTCGTAAAGTATCACTTAAACAGGGTTCTAAGCTAGCAGGAACTCCTATGGACAAGATTGTACGCACACTGGAAGCGAATGGCTACGAAGTGATTGGATTAGACTAATGACAGATGAACGGATTCATATCCTACGGGATATTTTGTTAGAATTGCACAATGGCGCCTCTCCTGAGTCGGTTCAAGATCGCTTTGATGCGACCTTTACGGGCGTGTCAGCCATCGAGATTTCCCTTATGGAGCACGAGCTGATGAACTCGGATTCGGGCGTCACTTTTGAAGATGTTATGGAACTCTGTGATGTCCATGCCAATCTTTTTAAAAATGCTATCAAAGGTGTCGAAGTTTTAGATACCGAACACCCTGGGCACCCAGTTCGTGTCTTTAAGGAAGAAAATTTGGCCCTCCGTGCAGCTTTGATTCGCATTCGTAGATTGTTAGATACCTATGAGTTGATGGAAGACGAGGAAATGCTGGCGGAGATGCGCAAGGGCTTGGTGCGTCAGATGGGACTTGTGGGGCAATTTGACATCCATTACCAACGTAAAGAAGAACTCTTCTTTCCTATCATGGAGCGCTATGGACACGATTCACCTCCCAAAGTTATGTGGGGAGTGGATGATCAGATTAGGGAACTCTTTCAAACAGCTCTAACGACAGCCAAGTCACTACCAGAAGTGTCAATTAGCAGTGTAAAGGAAGCTTTTGAAGCTTTTGCGACAGAGTTTGAAAGTATGATTTTCAAGGAAGAGTCCATCCTCCTCATGATTCTCCTTGAGTCTTTTACTCAGGATGACTGGATTCAGATTGCGGAGGAGAGCGATGCCTATGGCTATGCCATCATCCGTCCGTCAGAGAAATGGGTGCCAGAACGACAGAGCTTTATTGAGGAAAAGATTGCAGAGGAGCCTGTACAGCTAGATACGGCAGAAGGTCAAGTTCAACAAGTCATAGATACGCCAGAAGGCCATTTTACCATTACCTTTACCCCTAAGGAAAAGGAAGCTGTGCTGGACCGCCATAGTCAACAGGCTTTTGGTAATGGCTATCTTTCAGTCGAGCAGGCCAATCTCATCCTCAATCATCTCCCTATGGAGATTACCTTTGTCAATAAAGAAGATATTTTCCAGTATTACAATGACAATACGCCAGCTGATGAGATGATTTTCAAACGAACGCCGTCCCAAGTCGGGCGCAATGTCGAACTCTGTCATCCGCCTAAGTATTTGGACAAGGTCAAGGCTATCATGAAGGGACTTCGTGAGGGGACCAAGGACAAGTATGAAATGTGGTTCAAGTCTGAGTCGCGAGGCAAGTTTGTCCACATCACCTATGCTGCAGTACACGATGAAGACGGAGAATTCCAAGGAGTGTTGGAGTATGTTCAGGATATCCAGCCCTACCGTGAGATTGATACGGACTATTTCCGTGGATTAGAATAAGGAGAAAAAATGAGTTACGAACAAGAATTTATGAAGGAATTTGAAGCTTGGGTCAATACCCAAATCATGATTAACGATATGGCGCACAAGGAAAGTCAAAAAGTTTACGAAGAAGACCAGGACGAGCGTGCCAAAGATGCCATGATTCGCTACGAGAGTCGCTTGGATGCTTATCAGTTCTTGCTTGGTAAGTTTGAAAACTTCAAAGCAGGCAAGGGATTCCATGATTTGCCAGAAGGCTTGTTTGGTGAGCGAAATTATTAAACGAGAAAGATTCTTGATTTTTCACTAAAATCTTGATAGAATGTTTATGTTAAATCCTTGTCAGAGCAGGGATTTTTTATTGAAAGGATTTTATCATGTCAAAGAAACTCAATCGTAAAAAACAATTACGAAATGGCCTCCGTCGCTCAGGTGCCTTTTCAAGTACTGTGACTAAGGTTGTAGATGAGACAAAAAAAGTCGTGAAGCGTGCAGAACAGTCAGCAAGCGCAGCTGGTAAGGCTGTTTCTAAAAAAGTTGAACAAGCAGTAGAAGCTACCAAAGAGCAAGCTCAAAAAGTAGCTAATTCTGTAGAAGATTTTGCAGCAAACTTGGGTGGACTTCCACTTGATCGTGCCAAGACTTTCTATGATGAAGGAATCAAGTCTGCTTCAGATTTCAAAAACTGGACTGAAAAAGAACTCCTTGACTTGAAAGGAATCGGCCCAGCTACCATCAAGAAATTGAAAGAAAATGGCATCAAGTTCAAGTAATTTTTCTTGAGCCTTGCATTTCCGAGAAAAACTTGCTACAATAGAGCCATTAGAGGTGTTTTGAATCCCACATTTTACAGAAAGTGGCGGCGCTGAGAAGTCCACAAATGTGTCAAAACTGGTTGCTAATGACTGAAAAAATGAAATATTTCTGTCTTTTTATTTTAAAGACTAAAGATGCGGGCTTGGCCCGAAATTGGGTGGTACCGCGGATAAACACATTCGTCCCTGTCATGTAGATGGCAGGGCTTTTCTTTTGTGTCTTAGTCAAAGGAGGTTGTTATAAAACAATCATTTAAAACTAATAAACTATATTATGGTTTTCCTGTTTTTATTTTAGGATATCAAGATTAGAATTTTGGCTATAACATCACGACCTGTAGTTCCTCTTATAGTCTAGGAGATTGGGTTGTGATTGGAGTCGTTGCGAGAGAGAATGCCGCAGAGCAGATCAAACAGTATCAAAAATTTACTGTGAATATTTCTGATGAAACTTCTATGCTTGCGATGGAGCAGGCTGGTTTTATCAGTCATCAGGAGAAATTGGAACGTTTGGGAGTGCATTATGAAATTTCTGAACGAACTCAGATTCCTATTTTAGACGCCTGTCCACTTGTTTTAGATTGTCGGGTAGATAGGATTGTTGAGGAAGACGGTATTTGCCACATCTTTGCCAAGATTCTTGAGCGACTTGTTGCCCCAGAACTCCTGGATGAAAAGGGACATTTTAAAAATCAACTGTTTGCCCCAACCTATTTCATGGGAGATGGATATCAGCGCGTTTATCGCTATCTGGATAAGCGTGTAGATATGAAGGGCAGTTTCATCAAAAAAGCGAGGAAGAAGGATGGCAAGAACTGAGCTGCCAGATAAAATCGAAACAGAACGTCTCGTTTTACGAGTCCGTACTGTGGCGGATGCTGAGGATATCTTTGACTATGCTAGTTTGCCAGAGGTCGCCTATCCAGCAGGTTTTCCTCCAGTCAAGACCTTGGAAGATGAGATTTATTATCTGGAGCACATTCTTCCGGAGCGTAATCAAAAGGAAAATCTCCCAGCAGGCTACGGGATTGTCGTCAAAGGAACGGATAAGATCGTTGGCTCTGTCGATTTCAACCATCGCCATGAAGATGATGTGCTGGAAATCGGCTATACCTTACACCCAGACTATTGGGGGCGAGGTTATGTGCCAGAAGCTGCGCGTGCCTTGATTGACTTAGCCTTTAAAGATTTGGGTCTTCACAAGATTGAACTAACTTGCTTTGGATATAACCTTCAAAGTAAACGAGTCGCGGAAAAGCTTGGCTTTACCCTCGAAGCTCGCATAAGAGACCGAAAGGATGTTCAAGGAAACCGCTGTGACAGTCTGATATATGGCTTGCTGAAGAGCGAGTGGGAGGAATAAGATGAGCGATGTAAAAGA";

	var kmerLength=31;

	var prefix=sequence.substr(0,kmerLength);
	var vertex1=new Vertex(400+50,200+50,prefix);
	this.vertices.push(vertex1);

	for(var i=0;i<30 /*sequence.length*/;i++){
		var suffix=sequence.substr(i+1,i+1+kmerLength);
		var vertex2=new Vertex(400+150+i,200+150+i,suffix);
		this.vertices.push(vertex2);
		vertex1.addArc(vertex2);
		vertex1=vertex2;
	}
}

Screen.prototype.createGraph=function(){
	this.vertices=new Array();

	var n=this.n;
	var degree=this.degree;


	var i=0;

	while(i<n){
		var vertex=this.createVertex(this.identifier);

		this.identifier++;

		i++;
	}

	i=0;

	while(i<n){
		var j=0;
		while(j<degree){

			var next=Math.floor(Math.random()*(n-1));

			if(this.type=="linear"){
				if(i==n-1){
					j++;
					continue;
				}

				next=i+1;
			}else if(this.type=="star"){
				if(i==0){
					j++;
					continue;
				}
				next=0;
			}

			if(next==i){
				continue;
			}

			this.createArcs(this.vertices[i],this.vertices[next]);

			j++;
		}
		i++;
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
		this.actualGameFrequency=this.roundNumber(this.gameFrames*1000/(start-this.lastUpdate),2);
		this.actualGameFrameLength=this.roundNumber(this.gameMilliseconds/this.gameFrames,2);
		this.gameMilliseconds=0;
		this.gameFrames=0;

		this.actualDrawingFrequency=this.roundNumber(this.drawingFrames*1000/(start-this.lastUpdate),2);
		this.actualDrawingFrameLength=this.roundNumber(this.drawingMilliseconds/this.drawingFrames,2);
		this.drawingMilliseconds=0;
		this.drawingFrames=0;

		this.lastUpdate=start;
	}

	this.engine.applyForces(this.vertices);
	this.engine.moveObjects(this.vertices);

	var end=this.getMilliseconds();
	this.gameMilliseconds+=(end-start);

	this.gameFrames++;
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

	var offset=300;
	//this.context.fillText("Display: "+this.canvas.width+","+this.canvas.height+" Origin: "+this.originX+","+this.originY, 10, this.canvas.height-6);

/*
	this.context.fillText("Frequency: "+this.gameFrequency+" Game frame: "+this.gameFrameLength,this.canvas.width-offset, this.canvas.height-34);

	this.context.fillText("Game FPS: "+this.actualGameFrequency+" Game frame: "+this.actualGameFrameLength+
		" ms",this.canvas.width-offset, this.canvas.height-20);
	this.context.fillText("Rendering FPS: "+this.actualDrawingFrequency+" Rendering slice: "+this.actualDrawingFrameLength+
		" ms",this.canvas.width-offset, this.canvas.height-6);
*/
}

Screen.prototype.draw=function(){
	
	var start=this.getMilliseconds();

	var context=this.context;
	context.clearRect(0,0,this.canvas.width,this.canvas.height);

	context.strokeStyle = "rgb(0,0,0)";

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
		this.drawArcs();
	}

	if(this.showVerticesButton.getState()){
		this.drawVertices();
	}

	this.drawControlPanel();

	var end=this.getMilliseconds();

	this.drawingMilliseconds+=(end-start);
	this.drawingFrames++;
}

Screen.prototype.drawVertices=function(){
	for(i in this.vertices){
		var vertex=this.vertices[i];
		vertex.draw(this.context,this.originX,this.originY/*,100,this.blitter*/);
	}
}

Screen.prototype.drawArcs=function(){
	// draw arcs
	for(i in this.vertices){
		var vertex=this.vertices[i];

		var arcs=vertex.getArcs();
		for(j in arcs){

			var vertex2=arcs[j];
	
			this.context.moveTo(vertex.getX()-this.originX,vertex.getY()-this.originY);
			this.context.lineTo(vertex2.getX()-this.originX,vertex2.getY()-this.originY);
			this.context.stroke();
		}
	}
}

Screen.prototype.getRandomX=function(){
	return Math.random()*(this.canvas.width-1);
}

Screen.prototype.getRandomY=function(){
	return Math.random()*(this.canvas.height-1);
}

