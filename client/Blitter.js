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
 * The blitter is a cache for graphics.
 * It accelerate drawing.
 *
 * \author Sébastien Boisvert
 */
function Blitter(){
/*
 * This shows blitting information.
 */
	this.showBlits=false;
	this.debug=false;

/* 
 * Set to true to have framed blits.
 */
	this.framedBlits=false;

	this.clear();
}

Blitter.prototype.allocateBlit=function(key,width,height){

	if(this.hasBlit(key)){
		return this.getBlit(key);
	}

	if(this.debug){
		console.log("");
		console.log("allocateBlit "+key);
	}

/*
	console.log("");
	console.log(key+" Want "+width+" "+height);
*/
	this.update(width,height);

	var blit=new Blit(this.currentX,this.currentY,width,height,this.canvas);

	//blit.print();

	this.currentX+=width;
	if(this.currentY+height > this.nextY){
		this.nextY=this.currentY+height;
	}

	if(this.debug){
		console.log("Allocated1 blit "+key+" total= "+this.allocated+" "+blit.getX()+" "+blit.getY());
	}

	this.blits[key]=blit;

	if(this.debug){
		console.log("currentX "+this.currentX+" canvasWidth= "+this.canvas.width);
	}



	if(this.framedBlits){
		var context2=blit.getCanvas().getContext("2d");

		var cacheWidth=blit.getWidth();
		var cacheHeight=blit.getHeight();
		var x=blit.getX();
		var y=blit.getY();

		context2.beginPath();
		context2.moveTo(x,y);
		context2.lineTo(x+cacheWidth,y);
		context2.lineTo(x+cacheWidth,y+cacheHeight);
		context2.lineTo(x,cacheHeight+y);
		context2.lineTo(x,y);
		context2.stroke();
		context2.closePath();
	}

	this.allocated++;

	return blit;
}

Blitter.prototype.getBlit=function(key){

	if(this.debug){
		if(!key in this.blits){
			console.log("getBlit "+key+" unavailable.");
		}
	}

	return this.blits[key];
}

Blitter.prototype.hasBlit=function(key){

	if(key in this.blits){
		return true;
	}
	return false;
}

Blitter.prototype.clear=function(){

	this.width=1000;
	this.height=1000;

	this.createCanvas();
	this.blits=new Object();


	this.allocated=0;
}

Blitter.prototype.createCanvas=function(){
	this.canvas=document.createElement('canvas');
	this.canvas.width=this.width;
	this.canvas.height=this.height;

	this.nextY=0;
	this.currentX=0;
	this.currentY=0;

	if(this.showBlits){
		var body=document.getElementsByTagName("body")[0];

		body.appendChild(document.createElement("br"));
		var title=document.createElement('h1');
		var text=document.createTextNode("Blitter");
		title.appendChild(text);
		body.appendChild(title);
		body.appendChild(this.canvas);
	}
}

Blitter.prototype.update=function(width,height){

	var availableX=this.canvas.width-this.currentX;
	var availableY=this.canvas.height-this.currentY;

/*
	console.log("Requested "+width+" "+height);
	console.log("Available "+availableX+" "+availableY);
*/
	if(width <= availableX && height <= availableY){
		return;
	}
	
	if(width > availableX){
		this.currentX=0;
		this.currentY=this.nextY;
	}

	availableY=this.canvas.height-this.currentY;

	if(height > availableY){
		this.createCanvas();
	}
}

Blitter.prototype.getCount=function(){
	return this
}
