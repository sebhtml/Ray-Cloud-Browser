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

function AnimatedRing(x,y){
	this.x=x;
	this.y=y;

	this.maximumRadius=30;
	this.angle1=0;
	this.largeRadius1=this.maximumRadius-3;
	this.smallRadius1=4;

	this.angle2=0;
	this.largeRadius2=this.largeRadius1-7;
	this.smallRadius2=this.smallRadius1;

	this.angle3=0;
	this.largeRadius3=this.largeRadius2-7;
	this.smallRadius3=this.smallRadius1;

	this.grow=true;

	this.growingColor="#6699FF";
	this.shrinkingColor="#FF9966";

	this.color=this.growingColor;
}

AnimatedRing.prototype.validateAngle=function(angle){

	return angle;

	if(angle<0)
		return 2*Math.PI;

	if(angle>=2*Math.PI)
		angle=0;

	return 0;
}
AnimatedRing.prototype.iterate=function(){

	var sign=+1;

	this.angle1+= sign*(2*Math.PI) / 61;
	this.angle2+= sign*(2*Math.PI) / 67;
	this.angle3+= sign*(2*Math.PI) / 71;

	this.angle1=this.validateAngle(this.angle1);
	this.angle2=this.validateAngle(this.angle2);
	this.angle3=this.validateAngle(this.angle3);

	if(this.largeRadius1>=this.maximumRadius-this.smallRadius1/2-1){
		this.grow=false;
		this.color=this.shrinkingColor;
	}else if(this.largeRadius1<=this.maximumRadius/2){
		this.grow=true;
		this.color=this.growingColor;
	}

	if(this.grow){
		this.largeRadius1+=0.1;
		this.largeRadius2+=0.1;
		this.largeRadius3+=0.1;
	}else{
		this.largeRadius1-=2;
		this.largeRadius2-=2;
		this.largeRadius3-=2;
	}
}

AnimatedRing.prototype.draw=function(context){

	context.beginPath();
	context.strokeStyle = this.color;
	context.fillStyle="white";
	context.lineWidth=2;
	context.arc(this.x,
		this.y,this.maximumRadius, 0, Math.PI*2, true);
	context.stroke();
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle=this.color;
	context.arc(this.x,
		this.y,this.smallRadius1, 0, Math.PI*2, true);

	context.fill();
	context.closePath();

	this.drawStargate(context,this.x,this.y,this.angle1,this.largeRadius1,this.smallRadius1);
	this.drawStargate(context,this.x,this.y,this.angle2,this.largeRadius2,this.smallRadius2);
	this.drawStargate(context,this.x,this.y,this.angle3,this.largeRadius3,this.smallRadius3);
}

AnimatedRing.prototype.drawStargate=function(context,x,y,angle,largeRadius,smallRadius){

	var color=this.color;

	var cosValue=Math.cos(angle);
	var sinValue=Math.sin(angle);

	var x1=x+largeRadius*cosValue;
	var y1=y+largeRadius*sinValue;
	var x2=x-largeRadius*cosValue;
	var y2=y-largeRadius*sinValue;

	context.beginPath();
	context.fillStyle= color;
	context.arc(x1,
		y1,smallRadius, 0, Math.PI*2, true);

	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle= color;
	context.arc(x2,
		y2,smallRadius, 0, Math.PI*2, true);

	context.fill();
	context.closePath();
}

AnimatedRing.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;
}
