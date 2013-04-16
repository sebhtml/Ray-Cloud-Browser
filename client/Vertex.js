/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
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
 * This class represents a k-mer vertex.
 *
 * \author Sébastien Boisvert
 */
function Vertex(name,colored){

	this.annotations=new Object();
	this.resetPower();
	this.children=[];
	this.coverageValue=0;
	this.enabled=true;
	this.isPosition=false;
	this.hasPositionValue=false;
	this.x=0;
	this.y=0;
	this.oldCenter = new Point(this.x, this.y);
	this.center = new Point(this.x, this.y);
	this.positionIsSet=false;
	this.lastGridUpdateX=-9999;
	this.lastGridUpdateY=-9999;
	this.colored=colored;
	this.name=name;

	this.pathColor="rgb(80,80,255)";

	this.inPath=false;

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

	if(!this.colored){
		return "NULL";
	}

/*
	if(this.followMouse){
		return "rgb(255,255,255)";
	}
*/
	
	if(!this.canChangeColor){
		return "rgb(235,225,240)";
	}

	//var seed=Math.floor(10*Math.sqrt(this.velocityX*this.velocityX+10*this.velocityY*this.velocityY+10));
	var seed=10;
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

Vertex.prototype.getX=function(){
	return this.x;
}

Vertex.prototype.getY=function(){
	return this.y;
}

Vertex.prototype.setX=function(x){
	this.x=x;
}

Vertex.prototype.setY=function(y){
	this.y=y;
}

Vertex.prototype.hasPosition=function(){
	return this.positionIsSet;
}

Vertex.prototype.setPosition=function(){
	this.positionIsSet=true;
}

Vertex.prototype.update=function(timeStep,timeState){
	if(!this.followMouse && timeState){

		this.oldCenter = new Point(this.x, this.y);

		this.x = this.x+this.velocityX*timeStep;
		this.y = this.y+this.velocityY*timeStep;

		this.center= new Point(this.x, this.y);
	}

	this.updatePower();
}

Vertex.prototype.getOldCenter = function() {
	return this.oldCenter;
}

Vertex.prototype.getCenter = function() {
	return this.center;
}

Vertex.prototype.updatePower=function(){

	if(this.power==0)
		return;

	if(this.growPower){
		this.power+=2;

		if(this.power>12){
			this.growPower=false;
			this.shrinkPower=true;
		}
	}else if(this.shrinkPower){

		this.power--;
	}

	if(this.power<0){
		this.resetPower();
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

	//console.log(this.getSequence()+" handleMouseDown "+x+","+y)

	if(!this.colored)
		return false;


	if(this.isInside(x,y,this.radius)){
		//console.log(this.name+" follows");

		if(this.power==0){
			this.resetPower();
			this.power=1;
			this.growPower=true;
			this.shrinkPower=false;
		}

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

Vertex.prototype.getLabel=function(){
	if(this.colored)
		return this.chiefNucleotide;
	else
		return this.name;
}

Vertex.prototype.moved=function(threshold){

	var minimum=threshold*threshold;

	var dx=this.lastGridUpdateX-this.getX();
	var dy=this.lastGridUpdateY-this.getY();
	var actual=dx*dx+dy*dy;

	//console.log("Actual: "+Math.sqrt(actual)+" Threshold= "+Math.sqrt(minimum));
	return actual>=minimum;
}

Vertex.prototype.moveInGrid=function(){
	this.lastGridUpdateX=this.getX();
	this.lastGridUpdateY=this.getY();
}

Vertex.prototype.isInPath=function(){
	return this.hasPositionValue;
}

Vertex.prototype.hasAnnotation=function(predicate){
	return predicate in this.annotations;
}

Vertex.prototype.registerAnnotation=function(predicate){
	this.annotations[predicate]=true;
	this.hasPositionValue=true;
}

Vertex.prototype.setPositionType=function(){
	this.isPosition=true;
}

Vertex.prototype.isPositionVertex=function(){
	return this.isPosition;
}

Vertex.prototype.disable=function(){

	if(!this.enabled)
		return;

	this.enabled=false;

	for(var i in this.children)
		this.children[i].disable();
}

Vertex.prototype.enable=function(){
	if(this.enabled)
		return;

	this.enabled=true;

	for(var i in this.children)
		this.children[i].enable();
}

Vertex.prototype.isEnabled=function(){
	return this.enabled;
}

Vertex.prototype.getCoverageValue=function(){
	return this.coverageValue;
}

Vertex.prototype.setCoverageValue=function(value){
	this.coverageValue=value;
}

Vertex.prototype.addChild=function(value){
	this.children.push(value);
}

Vertex.prototype.getPower=function(){

/*
	if(this.power>0 && this.powerIteration%5==0){
		if(this.powerIteration<10){
			this.power+=this.powerChange;
			this.powerChange++;
		}else{
			this.power-=this.powerChange;
			this.powerChange++;
		}
	}
	this.powerIteration++;
*/

	return this.power;
}

Vertex.prototype.resetPower=function(){
	this.power=0;
	this.powerChange=1;
	this.powerIteration=0;

}

Vertex.prototype.getPathColor=function(){
	return this.pathColor;
}
