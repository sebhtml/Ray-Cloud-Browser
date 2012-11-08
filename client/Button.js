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

function Button(x,y,width,height,name,defaultState){
	this.x=x;
	this.y=y;
	this.name=name;
	this.width=width;
	this.height=height;

	this.state=defaultState;

	this.x1=x-width/2;
	this.y1=y-height/2;
	this.x2=x+width/2;
	this.y2=y-height/2;
	this.x3=x+width/2;
	this.y3=y+height/2;
	this.x4=x-width/2;
	this.y4=y+height/2;
}

Button.prototype.handleMouseDown=function(x,y){
	if(!(x>=this.x1 && x<= this.x2 && y >= this.y1 && y <= this.y4)){
		return false;
	}

	//console.log("handleMouseClick");
	this.state=!this.state;
	
	return true;
}

Button.prototype.getState=function(){
	return this.state;
}

Button.prototype.draw=function(context,blitter){

	var key=this.name+"-"+this.width+"-"+this.height+"-"+this.state;

	if(blitter.hasBlit(key)){
		var blit=blitter.getBlit(key);

		var width=blit.getWidth();
		var height=blit.getHeight();

		//blit.print();

		context.drawImage(blit.getCanvas(),blit.getX(),blit.getY(),width,height,
			this.x-width/2,this.y-height/2,width,height);

		return;
	}

	var blit=blitter.allocateBlit(key,4+this.width,4+this.height);

	var context2=blit.getCanvas().getContext("2d");

	var cacheWidth=blit.getWidth();
	var cacheHeight=blit.getHeight();
	var x=blit.getX()+cacheWidth/2;
	var y=blit.getY()+cacheHeight/2;

	context2.fillStyle = "rgb(220,220,220)";
	context2.strokeStyle = "rgb(0,0,0)";

	if(this.state){
		context2.fillStyle = "rgb(200,250,200)";
	}

	var width=this.width;
	var height=this.height;

	x1=x-width/2;
	y1=y-height/2;
	x2=x+width/2;
	y2=y-height/2;
	x3=x+width/2;
	y3=y+height/2;
	x4=x-width/2;
	y4=y+height/2;

	context2.beginPath();
	context2.moveTo(x1,y1);
	context2.lineTo(x2,y2);
	context2.lineTo(x3,y3);
	context2.lineTo(x4,y4);
	context2.lineTo(x1,y1);
	context2.fill();
	context2.stroke();
	context2.closePath();

	context2.fillStyle    = '#000000';
	context2.font         = 'bold 12px sans-serif';
	context2.fillText(this.name, x-(this.width/2)*0.7, y+6);

	this.draw(context,blitter);
}

Button.prototype.resetState=function(){
	this.state=false;
}

Button.prototype.activateState=function(){
	this.state=true;
}
