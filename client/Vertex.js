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

function Vertex(x,y,name,colored){
	this.x=x;
	this.y=y;
	this.colored=colored;
	this.name=name;

	if(this.colored){
		this.chiefNucleotide=name[name.length-1];
	}

	this.velocityX=0;
	this.velocityY=0;

	this.arcs=new Array();
	this.linkedObjects=new Array();

	this.followMouse=false;

	this.updated=false;

	this.canChangeColor=true;
	this.radius=10;

	this.redSeed=120;
	this.greenSeed=150;
	this.blueSeed=120;

	if(this.chiefNucleotide=="A"){
		this.redSeed=170;
		this.greenSeed=120;
		this.blueSeed=120;
	}else if(this.chiefNucleotide=="T"){

		this.redSeed=120;
		this.greenSeed=120;
		this.blueSeed=170;
	}else if(this.chiefNucleotide=="C"){

		this.redSeed=120;
		this.greenSeed=170;
		this.blueSeed=120;
	}else if(this.chiefNucleotide=="G"){

		this.redSeed=170;
		this.greenSeed=170;
		this.blueSeed=100;
	}

}

Vertex.prototype.getRadius=function(){
	return this.radius;
}

Vertex.prototype.getColor=function(){
	if(this.followMouse){
		return "rgb(255,255,255)";
	}
	
	if(!this.canChangeColor){
		return "rgb(235,225,240)";
	}

	var seed=Math.floor(10*Math.sqrt(this.velocityX*this.velocityX+10*this.velocityY*this.velocityY+10));
	var red=seed+this.redSeed;
	var green=seed+this.greenSeed; //Math.floor(10*this.velocityX*this.velocityX)+150;
	var blue=seed+this.blueSeed; //Math.floor(10*this.velocityY*this.velocityY)+150;

	if(red>255){
		red=255;
	}

	if(green>255){
		green=255;
	}

	if(blue>255){
		blue=255;
	}

	var color="rgb("+red+","+green+","+blue+")";


	return color;
}

Vertex.prototype.draw=function(context,originX,originY/*,radius,blitter*/){

	var radius=this.radius;
	var theColor= this.getColor();
	//var key=this.name+"-"+theColor+"-"+radius;

/*
	if(blitter.hasBlit(key)){
		var blit=blitter.getBlit(key);

		var width=blit.getWidth();
		var height=blit.getHeight();

		//blit.print();

		context.drawImage(blit.getCanvas(),blit.getX(),blit.getY(),width,height,
			this.x-originX-width/2,this.y-originY-height/2,width,height);

		return;
	}
	
	var blit=blitter.allocateBlit(key,4+2*radius,4+2*radius);
*/

	//var context2=blit.getCanvas().getContext("2d");
	var context2=context;

	var x=this.getX()-originX;
	var y=this.getY()-originY;

	if(this.colored){
		context2.beginPath();
		context2.fillStyle = theColor;
		context2.strokeStyle = "rgb(0,0,0)";
		context2.lineWidth=1;
		context2.arc(x,y,radius, 0, Math.PI*2, true);
	
		context2.fill();
		context2.stroke();
		context2.closePath();
	}

	context2.fillStyle    = '#000000';
	context2.font         = 'bold 12px sans-serif';

	if(this.colored){
		context2.fillText(this.chiefNucleotide,x-this.radius/2,y+this.radius/2);
	}else{
		context2.fillText(this.name,x-this.radius/2,y+this.radius/2);
	}

	//console.log("Drawed something.");

	//this.draw(context,originX,originY,radius,blitter);
}

Vertex.prototype.getX=function(){
	return this.x;
}

Vertex.prototype.getY=function(){
	return this.y;
}

Vertex.prototype.update=function(timeStep,timeState){
	if(!this.followMouse && timeState){
		this.x=this.x+this.velocityX*timeStep;
		this.y=this.y+this.velocityY*timeStep;
	}
}

Vertex.prototype.updateVelocity=function(forceX,forceY){

	this.velocityX+=forceX;
	this.velocityY+=forceY;
}

Vertex.prototype.applyDamping=function(damping){

	this.velocityX*=damping;
	this.velocityY*=damping;

	this.updated=true;
}

Vertex.prototype.getLinkedObjects=function(){
	return this.linkedObjects;
}

Vertex.prototype.getArcs=function(){
	return this.arcs;
}

Vertex.prototype.addArc=function(vertex){

	if(this.getName()==vertex.getName()){
		return;
	}

	for(i in this.arcs){
		if(this.arcs[i].getName()==vertex.getName()){
			return;
		}
	}

	this.arcs.push(vertex);
}

Vertex.prototype.addLinkedObject=function(vertex){
	if(this.getName()==vertex.getName()){
		return;
	}

	for(i in this.linkedObjects){
		if(this.linkedObjects[i].getName()==vertex.getName()){
			return;
		}
	}

	this.linkedObjects.push(vertex)
}

Vertex.prototype.getName=function(){
	return this.name;
}

Vertex.prototype.printArcs=function(){
	console.log("Name "+this.getName());

	for(i in this.arcs){
		console.log(this.arcs[i].getName());
	}
}

Vertex.prototype.isInside=function(x,y){
	if(!this.colored)
		return false;

	var dx=x-this.x;
	var dy=y-this.y;
	
	return (dx*dx+dy*dy <= this.radius*this.radius);
}

Vertex.prototype.handleMouseDown=function(x,y){

	if(!this.colored)
		return false;

	if(this.isInside(x,y,this.radius)){
		//console.log(this.name+" follows");
		this.followMouse=true;

		return true;
	}

	return false;
}

Vertex.prototype.handleMouseUp=function(x,y){

	if(!this.colored)
		return false;

	if(this.followMouse){
		this.followMouse=false;

		return true;
	}
	
	return false;
}

Vertex.prototype.handleMouseMove=function(x,y){

	if(!this.colored)
		return false;

	if(this.followMouse && this.updated){
/*
		console.log("mouse "+x+" "+y);
		console.log("self "+this.x+" "+this.y);
		console.log("new velocity= "+(x-this.x)+" "+(y-this.y));
*/

		var velocityX=x-this.x;
		var velocityY=y-this.y;

		this.x=x;
		this.y=y;

		this.updated=false;

		return true;
	}

	return false;

}

Vertex.prototype.removeArc=function(vertex){
	var newArcs=new Array();

	for(i in this.arcs){
		var candidate=this.arcs[i];
		if(candidate.getName()!=vertex.getName()){
			newArcs.push(candidate);
		}
	}
	this.arcs=newArcs;
}

Vertex.prototype.getSequence=function(){
	return this.name;
}

Vertex.prototype.isFollower=function(){
	return this.followMouse;
}

Vertex.prototype.isColored=function(){
	return this.colored;
}
