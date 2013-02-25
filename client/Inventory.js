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

	this.hasLocation=false;
	this.minimumCoverage=CONFIG_MINIMUM_COVERAGE_TO_DISPLAY;
	this.originHeight=height;
	this.dataStore=dataStore;

	this.useAddress=true;
	this.usedAddressForSpeed=false;

	this.selected=false;
	this.screen=screen;
	this.mouseX=0;
	this.mouseY=0;

	this.width=width;
	this.height=height/5;
	this.x=x;
	this.y=y;

	this.speedInObjectsPer1000Iterations=1;

	this.buttonWidth=25;

	this.closeButton=new Button(this.x+this.buttonWidth/2,this.y+this.buttonWidth/2,
		this.buttonWidth,this.buttonWidth,"↕",false);

	this.closeButton.setFontSize(24);

	var title="Navigation";

	this.overlay=new Button(this.x+this.width/2,this.y+this.buttonWidth/2,
		this.width,this.buttonWidth,"     "+title,false);
	this.overlay.setBackgroundColor("#99CCCC");
	this.overlay.setActiveColor("#99CCCC");

/*
	this.debugButton=new Button(this.x+this.buttonWidth+5*this.buttonWidth/2,
		this.y+2*this.buttonWidth,
		6*this.buttonWidth,this.buttonWidth,"Display map location",false);
*/

	this.warpButton=new Button(this.x+this.buttonWidth+6*this.buttonWidth/2,
		this.y+3.3*this.buttonWidth,
		4.5*this.buttonWidth,this.buttonWidth,"Go to location",false);

	this.buttonWidth=20;

	this.increaseCoverageButton=new Button(this.x+this.buttonWidth+14.5*this.buttonWidth/2,
		this.y+2.2*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,"+",false);

	this.decreaseCoverageButton=new Button(this.x+this.buttonWidth+0.1*this.buttonWidth/2,
		this.y+2.2*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,"-",false);

	this.previousButton=new Button(this.x+this.buttonWidth+19.5*this.buttonWidth/2,
		this.y+2.3*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,"<<",false);

	this.nextButton=new Button(this.x+this.buttonWidth+26.5*this.buttonWidth/2,
		this.y+2.3*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,">>",false);

	this.decreaseButton=new Button(this.x+this.buttonWidth+19.5*this.buttonWidth/2,
		this.y+4.0*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,"-",false);

	this.increaseButton=new Button(this.x+this.buttonWidth+26.5*this.buttonWidth/2,
		this.y+4.0*this.buttonWidth,
		1*this.buttonWidth,this.buttonWidth,"+",false);

	this.pushSelector();

	this.pathOperator=null;
	this.registeredRegions=[];
}

Inventory.prototype.createRegionSelector=function(){

	if(this.pathOperator==null)
		return;

	var regions=this.pathOperator.getRegions();

	var registeredRegions=[];
	var colors=[];

	var i=0;
	while(i<regions.length){
		registeredRegions.push(regions[i].getName());
		colors.push(regions[i].getColor());
		i++;
	}

	this.regionSelector=new SelectionWidget(this.x+this.width+10,this.y+10,
					this.width,this.height+30*registeredRegions.length,
					"regions",registeredRegions);

	this.regionSelector.setColors(colors);
}

Inventory.prototype.pushSelector=function(){

	this.selector=new Selector(this.x,this.y+this.height+30,this.width,this.originHeight/5*4,this.dataStore,this.useAddress);
	this.useAddress=false;
}

Inventory.prototype.draw=function(context){

	var height=this.height-5;
	var drawingY=this.y;
	if(!this.closeButton.getState()){
		height=this.buttonWidth;
		drawingY=this.y+5
	}else{
		drawingY=this.y+this.buttonWidth+5
	}

// draw the pink overlay
	context.beginPath();

	if(!this.closeButton.getState())
		context.rect(this.x, drawingY, this.width, 30 );
	else if(!this.warpButton.getState())
		context.rect(this.x, drawingY, this.width, 100 );

	if(this.closeButton.getState() && !this.warpButton.getState())
		if(this.regionSelector.getNumberOfChoices())
			this.regionSelector.draw(context);

	context.beginPath();
	context.rect(this.x, drawingY, this.width,height );
	context.fillStyle = '#FFFF99';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	this.overlay.draw(context,null);
	this.closeButton.draw(context,null);
	
	if(this.closeButton.getState()){

		context.beginPath();
		context.rect(this.x+20, this.y+30, 150,30);
		context.fillStyle = '#FFF8F9';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();

		context.beginPath();
		context.rect(this.x+210, this.y+30, 80,30);
		context.fillStyle = '#FFF8F9';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();

		context.beginPath();
		context.rect(this.x+210, this.y+65, 80,30);
		context.fillStyle = '#FFF8F9';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();

		//this.debugButton.draw(context,null);
		this.warpButton.draw(context,null);

		this.nextButton.draw(context,null);
		this.previousButton.draw(context,null);
		this.increaseButton.draw(context,null);
		this.decreaseButton.draw(context,null);
		this.increaseCoverageButton.draw(context,null);
		this.decreaseCoverageButton.draw(context,null);

		context.fillStyle    = '#000000';
		context.font         = 'bold '+this.fontSize+'px Arial';

		context.fillText("min. coverage: "+this.minimumCoverage, this.x+40,this.y+50);
		context.fillText("play", this.x+235,this.y+50);
		context.fillText("speed", this.x+235,this.y+85);

		if(this.warpButton.getState())
			this.selector.draw(context);

		if(!this.warpButton.getState() && this.pathOperator.hasSelectedRegion()){

			context.beginPath();
			context.fillStyle = '#FFF8F9';
			context.rect(this.x, this.y+110, this.width, this.height );
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();

			context.fillStyle    = '#000000';
			context.font         = 'bold 12px Arial';

			context.fillText("map: ",this.x+20,this.y+130);
			context.fillText("section: ",this.x+20,this.y+145);
			context.fillText("region: ",this.x+20,this.y+160);
			context.fillText("location: ",this.x+20,this.y+175);

			context.font         = '12px Arial';

			var region=this.pathOperator.getSelectedRegion();

			context.fillText(region.getMapName(),this.x+80,this.y+130);
			context.fillText(region.getSectionName(),this.x+80,this.y+145);
			context.fillText(region.getRegionName(),this.x+80,this.y+160);
			context.fillText(region.getLocationName(),this.x+80,this.y+175);
		}
	}
}

Inventory.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	if(this.closeButton.handleMouseDown(x,y)){
		return true;
	}else if(this.overlay.handleMouseDown(x,y)){
		this.selected=true;
		return true;
/*
	}else if(this.debugButton.handleMouseDown(x,y)){
		this.screen.toggleDebugMode();
		return true;
*/
	}else if(this.warpButton.handleMouseDown(x,y)){
	
		if(this.warpButton.getState())
			this.pushSelector();

		return true;
	}else if(this.selector.handleMouseDown(x,y)){

		return true;
	}else if(this.nextButton.handleMouseDown(x,y)){

		if(this.nextButton.getState())
			this.previousButton.resetState();

		return true;
	}else if(this.previousButton.handleMouseDown(x,y)){

		if(this.previousButton.getState())
			this.nextButton.resetState();

		return true;
	}else if(this.increaseButton.handleMouseDown(x,y)){

		this.speedInObjectsPer1000Iterations*=2;
		this.checkSpeedBounds();

		this.increaseButton.resetState();

		return true;

	}else if(this.decreaseButton.handleMouseDown(x,y)){

		this.speedInObjectsPer1000Iterations/=2;
		this.checkSpeedBounds();

		this.decreaseButton.resetState();
		return true;
	}else if(this.decreaseCoverageButton.handleMouseDown(x,y)){

		this.minimumCoverage--;

		this.decreaseCoverageButton.resetState();

		if(this.minimumCoverage<0)
			this.minimumCoverage=0;

		return true;
	}else if(this.increaseCoverageButton.handleMouseDown(x,y)){

		this.minimumCoverage++;

		this.increaseCoverageButton.resetState();

		return true;

	}else if(this.regionSelector.handleMouseDown(x,y)){

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
		//this.debugButton.move(deltaX,deltaY);
		this.warpButton.move(deltaX,deltaY);
		this.selector.move(deltaX,deltaY);
		this.decreaseButton.move(deltaX,deltaY);
		this.increaseButton.move(deltaX,deltaY);
		this.decreaseCoverageButton.move(deltaX,deltaY);
		this.increaseCoverageButton.move(deltaX,deltaY);
		this.nextButton.move(deltaX,deltaY);
		this.previousButton.move(deltaX,deltaY);

		this.regionSelector.move(deltaX,deltaY);

		this.x+=deltaX;
		this.y+=deltaY;
	}

	this.mouseX=x;
	this.mouseY=y;
}

Inventory.prototype.handleMouseUp=function(x,y){
	this.selected=false;
}

Inventory.prototype.hasChoices=function(){
	return this.selector.hasChoices();
}

Inventory.prototype.getPreviousButton=function(){
	return this.previousButton;
}

Inventory.prototype.getNextButton=function(){
	return this.nextButton;
}

Inventory.prototype.iterate=function(){
}

/**
 * 256 objects / 1000 iterations
 *
 * 1000 iterations / 256 objects
 *
 * ~4 iterations / object
 */
Inventory.prototype.getMoviePeriod=function(){
	return 1000.0/this.speedInObjectsPer1000Iterations
}

Inventory.prototype.getSpeed=function(){
	return this.speedInObjectsPer1000Iterations;
}

Inventory.prototype.getMinimumCoverage=function(){
	return this.minimumCoverage;
}

Inventory.prototype.getWarpButton=function(){
	return this.warpButton;
}

Inventory.prototype.getCloseButton=function(){
	return this.closeButton;
}

Inventory.prototype.getSelector=function(){
	return this.selector;
}

Inventory.prototype.setAddressManager=function(address){
	this.address=address;
	this.selector.setAddressManager(this.address);

	if(!this.usedAddressForSpeed){
		if(this.address.hasToken("speed")){
			this.speedInObjectsPer1000Iterations=this.address.getTokenValueAsInteger("speed");

			this.checkSpeedBounds();
		}

		this.usedAddressForSpeed=true;
	}
}

Inventory.prototype.checkSpeedBounds=function(){
	if(this.speedInObjectsPer1000Iterations<1)
		this.speedInObjectsPer1000Iterations=1;
}

Inventory.prototype.setPathOperator=function(value){
	this.pathOperator=value;

	this.createRegionSelector();
}
