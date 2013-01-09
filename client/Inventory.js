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
 * This is a window that allows a selection.
 *
 * \author Sébastien Boisvert
 */
function Inventory(x,y,width,height,visible,screen,dataStore){

	this.selected=false;
	this.screen=screen;
	this.mouseX=0;
	this.mouseY=0;

	this.width=width;
	this.height=height/5;
	this.x=x;
	this.y=y;
	this.visible=visible;

	this.buttonWidth=25;

	this.closeButton=new Button(this.x+this.buttonWidth/2,this.y+this.buttonWidth/2,
		this.buttonWidth,this.buttonWidth,"",false);

	var title="Inventory";

	this.overlay=new Button(this.x+this.width/2,this.y+this.buttonWidth/2,
		this.width,this.buttonWidth,"     "+title,false);
	this.overlay.setBackgroundColor("#99CCCC");
	this.overlay.setActiveColor("#99CCCC");


	this.debugButton=new Button(this.x+this.buttonWidth+5*this.buttonWidth/2,
		this.y+2*this.buttonWidth,
		6*this.buttonWidth,this.buttonWidth,"Display map position",false);

	this.warpButton=new Button(this.x+this.buttonWidth+5*this.buttonWidth/2,
		this.y+3.2*this.buttonWidth,
		6*this.buttonWidth,this.buttonWidth,"Go somewhere",false);

	this.selector=new Selector(this.x,this.y+this.height+30,this.width,height/5*4,dataStore);
}

Inventory.prototype.draw=function(context){

	var height=this.height-5;
	var drawingY=this.y;
	if(!this.visible){
		height=this.buttonWidth;
		drawingY=this.y+5
	}else{
		drawingY=this.y+this.buttonWidth+5
	}

// draw the pink overlay
	context.beginPath();

	if(!this.visible)
		context.rect(this.x, drawingY, this.width, 30 );
	else if(!this.warpButton.getState())
		context.rect(this.x, drawingY, this.width, 100 );

	context.fillStyle = '#FFF8F9';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	context.beginPath();
	context.rect(this.x, drawingY, this.width,height );
	context.fillStyle = '#FFFF99';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	this.overlay.draw(context,null);
	this.closeButton.draw(context,null);
	
	if(this.visible){
		this.debugButton.draw(context,null);
		this.warpButton.draw(context,null);

		if(this.warpButton.getState())
			this.selector.draw(context);
	}
}

Inventory.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	if(this.closeButton.handleMouseDown(x,y)){
		this.visible=!this.visible;
		return true;
	}else if(this.overlay.handleMouseDown(x,y)){
		this.selected=true;
		return true;
	}else if(this.debugButton.handleMouseDown(x,y)){
		this.screen.toggleDebugMode();
		return true;
	}else if(this.warpButton.handleMouseDown(x,y)){
	
		return true;
	}else if(this.selector.handleMouseDown(x,y)){
		return true;
	}

	return false;
}

Inventory.prototype.handleMouseMove=function(x,y){
	if(this.selected){
		var deltaX=x-this.mouseX;
		var deltaY=y-this.mouseY;

		this.closeButton.move(deltaX,deltaY);
		this.overlay.move(deltaX,deltaY);
		this.debugButton.move(deltaX,deltaY);
		this.warpButton.move(deltaX,deltaY);
		this.selector.move(deltaX,deltaY);
		this.x+=deltaX;
		this.y+=deltaY;
	}

	this.mouseX=x;
	this.mouseY=y;
}

Inventory.prototype.handleMouseUp=function(x,y){
	this.selected=false;
}

