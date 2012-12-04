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

/**
 * This is a window that allows a selection.
 */
function Selector(title,choices,x,y,width,height,visible){
	this.selected=false;
	this.screen=screen;
	this.mouseX=0;
	this.mouseY=0;

	this.choices=choices;

	this.choice=null;

	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;
	this.visible=visible;

	this.buttonWidth=40;

	this.closeButton=new Button(this.x+this.buttonWidth/2,this.y+this.buttonWidth/2,
		this.buttonWidth,this.buttonWidth,"",false);

	this.overlay=new Button(this.x+this.width/2,this.y+this.buttonWidth/2,
		this.width,this.buttonWidth,"     "+title,false);

	this.overlay.setBackgroundColor("#99CCCC");
	this.overlay.setActiveColor("#99CCCC");
}

Selector.prototype.draw=function(context){

	var height=this.height;
	if(!this.visible)
		height=this.buttonWidth;

	context.beginPath();
	context.rect(this.x, this.y, this.width,height );
	context.fillStyle = '66FF00';
	context.fill();
	context.lineWidth = 0;
	context.strokeStyle = 'black';
	context.stroke();

	this.overlay.draw(context,null);
	this.closeButton.draw(context,null);
}

Selector.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	if(this.closeButton.handleMouseDown(x,y)){
		this.visible=!this.visible;
		return true;
	}else if(this.overlay.handleMouseDown(x,y)){
		this.selected=true;
		return true;
	}

	return false;
}

Selector.prototype.handleMouseMove=function(x,y){
	if(this.selected){
		var deltaX=x-this.mouseX;
		var deltaY=y-this.mouseY;

		this.closeButton.move(deltaX,deltaY);
		this.overlay.move(deltaX,deltaY);
		this.x+=deltaX;
		this.y+=deltaY;
	}

	this.mouseX=x;
	this.mouseY=y;
}

Selector.prototype.handleMouseUp=function(x,y){
	this.selected=false;
}

