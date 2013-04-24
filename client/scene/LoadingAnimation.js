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

/**
 * This is the loading animation.
 *
 * \author Sébastien Boisvert
 */
function LoadingAnimation(screen){
	this.screen=screen;
	this.width=16;
	this.rectangles=8;

	this.zoneWidth=this.width*(1+this.rectangles)*2;
	this.loading=0;

	this.virtualIteration=0;
	this.iteration=0;
	this.base=this.screen.getWidth()/2-this.zoneWidth/2;

	this.x=new Array();

	this.GO_LEFT=0;
	this.GO_RIGHT=1;

	this.mode=this.GO_RIGHT;

	var i=0;
	while(i<this.rectangles){
		this.x.push((i+1)*2*this.width);

		i++;
	}
}

LoadingAnimation.prototype.iterate=function(){

	if(this.loading>0)
		this.loading--;

	if(this.loading==0)
		return;

	var box=parseInt(this.virtualIteration/(this.width*2),10);

	if(this.mode==this.GO_RIGHT){

		this.virtualIteration+=1;
		this.virtualIteration%=this.zoneWidth;

		if(box!=this.rectangles-1 && this.x[box]+this.width>=this.x[box+1])
			return;

		this.x[box]+=1;

		if(this.x[this.rectangles-1] >= this.zoneWidth){
			this.mode=this.GO_LEFT;
		}
	}else if(this.mode==this.GO_LEFT){

		this.virtualIteration-=1;

		if(this.virtualIteration<0)
			this.virtualIteration+=this.zoneWidth;

		if(box!=0 && this.x[box-1]+this.width>=this.x[box])
			return;

		this.x[box]-=1;

		if(this.x[0] <= 0){
			this.mode=this.GO_RIGHT;
		}
	}
}

LoadingAnimation.prototype.draw=function(context){

	if(this.loading==0)
		return;

	var rectangle=0;

	var color='#7788FF';

	while(rectangle<this.rectangles){

		var theStart=this.x[rectangle];

		context.beginPath();
		context.rect(this.base+theStart, this.width*0.5, this.width, this.width);
		context.fillStyle = color;
		context.fill();
		context.closePath();

		rectangle++;
	}
}

LoadingAnimation.prototype.setLoadingState=function(){
	this.loading=32;
}
