/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
 *  Copyright (C) 2013 Jean-François Erdelyi
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

/**
 * A nice animation to show for the selected region.
 *
 * The square dimensions are computed with
 * the Pythagorean Theorem.
 *
 * \see http://mathcentral.uregina.ca/QQ/database/QQ.09.04/bob1.html
 *
 * \author Sébastien Boisvert
 */
function RegionGateAnimation(x,y,radius,color){
	this.x=x;
	this.y=y;
	this.middlePoint=new Point(this.x,this.y);
	this.color=color;
	this.radius=radius;

	this.squareSideLength=Math.sqrt(2*this.radius*this.radius);
	this.stripe=this.squareSideLength/5;

	this.stride=this.stripe;

	this.angle=0;

	var stepValue=0;
	this.ANIMATION_STEP_SHRINK=stepValue++;
	this.ANIMATION_STEP_FIRST_ROTATION=stepValue++;
	this.ANIMATION_STEP_GROW=stepValue++;
	this.ANIMATION_STEP_SECOND_ROTATION=stepValue++;

	this.step=this.ANIMATION_STEP_SHRINK;
}

/**
 * Primer numbers were selected from the link below.
 *
 * \see http://primes.utm.edu/lists/small/1000.txt
 */
RegionGateAnimation.prototype.iterate=function(){

	if(this.step==this.ANIMATION_STEP_FIRST_ROTATION){
		this.angle+=this.sign*2*Math.PI/61;

		if(this.angle>=this.rotationGoal){
			this.step=this.ANIMATION_STEP_GROW;
		}
	}else if(this.step==this.ANIMATION_STEP_SECOND_ROTATION){

		this.angle+=this.sign*2*Math.PI/69;

		if(this.angle>=this.rotationGoal){
			this.step=this.ANIMATION_STEP_SHRINK;
		}

	}else if(this.step==this.ANIMATION_STEP_GROW){
		this.stride+=this.squareSideLength/101;

		if(this.stride>=this.stripe){

			this.step=this.ANIMATION_STEP_SECOND_ROTATION;
			this.rotationGoal=this.angle+this.getAngleJump();
		}

	}else if(this.step==this.ANIMATION_STEP_SHRINK){
		this.stride-=this.squareSideLength/37;

		if(this.stride<=0){
			this.step=this.ANIMATION_STEP_FIRST_ROTATION;

			this.rotationGoal=this.angle+this.getAngleJump();
		}
	}
}

RegionGateAnimation.prototype.getAngleJump=function(){

	this.sign=+1;

	return this.sign*2*Math.PI/(Math.random()*16);
}

RegionGateAnimation.prototype.draw=function(context){

	context.beginPath();
	context.strokeStyle = this.color;
	context.lineWidth=4;
	//console.log("Drawing with "+this.color);
	context.arc(this.x,this.y,this.radius, 0, Math.PI*2, true);
	context.stroke();
	context.closePath();

	var i=0;
	var modifier=-this.stride-this.stripe;

	while(i<3){
		var rectangleX=this.x+modifier;
		var rectangleY=this.y;
		var rectangleWidth=this.stripe;
		var rectangleHeight=this.squareSideLength;

		this.drawRectangle(context,rectangleX,rectangleY,rectangleWidth,rectangleHeight,this.angle);

		i++;
		modifier+=this.stride+this.stripe;
	}
}

/**
 * P1   P2
 *
 * P4   P3
 *
 */
RegionGateAnimation.prototype.drawRectangle=function(context,x,y,width,height,angle){

	var p1Raw=new Point(x-width/2,y-height/2);
	var p2Raw=new Point(x+width/2,y-height/2);
	var p3Raw=new Point(x+width/2,y+height/2);
	var p4Raw=new Point(x-width/2,y+height/2);

	var p1=p1Raw.rotate(this.middlePoint,angle);
	var p2=p2Raw.rotate(this.middlePoint,angle);
	var p3=p3Raw.rotate(this.middlePoint,angle);
	var p4=p4Raw.rotate(this.middlePoint,angle);

	context.beginPath();
	//context.fillStyle=this.color;
	context.moveTo(p1.getX(),p1.getY());
	context.lineTo(p2.getX(),p2.getY());
	context.lineTo(p3.getX(),p3.getY());
	context.lineTo(p4.getX(),p4.getY());
	context.lineTo(p1.getX(),p1.getY());
	context.fill();
	context.closePath();
}

RegionGateAnimation.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;
	this.middlePoint=new Point(this.x,this.y);
}

RegionGateAnimation.prototype.setColor = function(color){
	this.color = color;
}
