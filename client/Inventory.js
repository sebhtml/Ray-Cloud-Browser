/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
 *  Copyright (C) 2013  Jean-François Erdelyi
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
function Inventory(x,y,width,height,visible,screen,dataStore) {
	this.showDistributionGraph = false;
	this.minimumCoverage=CONFIG_MINIMUM_COVERAGE_TO_DISPLAY;
	this.originHeight=height;
	this.dataStore=dataStore;
	this.fontSize=12;
	this.useColorsForRenderingLevel = 1;

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

	this.regionsOffset=170;

	this.speedInObjectsPer1000Iterations=1;

	this.buttonWidth=25;

	this.closeButton=new Button(this.x+this.buttonWidth/2,this.y+this.buttonWidth/2,
		this.buttonWidth,this.buttonWidth,"↕",false);

	this.closeButton.setFontSize(24);

	var title="Ray Cloud Browser";

	var color="#6699FF";
	this.overlay=new Button(this.x+this.width/2,this.y+this.buttonWidth/2,
		this.width,this.buttonWidth,""+title,false);
	this.overlay.setBackgroundColor(color);
	this.overlay.setActiveColor(color);

/*
	this.debugButton=new Button(this.x+this.buttonWidth+5*this.buttonWidth/2,
		this.y+2*this.buttonWidth,
		6*this.buttonWidth,this.buttonWidth,"Display map location",false);
*/

	this.warpButton=new Button(this.x+110,
		this.y+3.4*this.buttonWidth,
		3.5*this.buttonWidth,this.buttonWidth,"Go to location",false);

	this.useColors=new Button(this.x+this.buttonWidth+19*this.buttonWidth/2  - 80,
		this.y+this.regionsOffset+100,
		2.2*this.buttonWidth,this.buttonWidth,"Colors",false);

	this.graphsButton = new Button((this.x + this.buttonWidth + 19 * this.buttonWidth / 2) - 140,
		this.y + this.regionsOffset + 100,
		2.2 * this.buttonWidth, this.buttonWidth, "Graphs", false);

	this.useCoverage=new Button(this.x+30,
		this.y+3.4*this.buttonWidth,
		1.9*this.buttonWidth,this.buttonWidth,"Depth",false);

	this.useCoverage.activateState();

	this.increaseCoverageButton=new Button(this.x+this.buttonWidth+9.5*this.buttonWidth/2,
		this.y+1.5*this.buttonWidth+10,
		1*this.buttonWidth,this.buttonWidth,"+",false);

	this.decreaseCoverageButton=new Button(this.x+20,
		this.y+1.5*this.buttonWidth+10,
		1*this.buttonWidth,this.buttonWidth,"-",false);

	this.previousButton=new Button(this.x+20,
		this.y+this.height+145,
		1*this.buttonWidth,this.buttonWidth,"<",false);

	this.nextButton=new Button(this.x+80,
		this.y+this.height+145,
		1*this.buttonWidth,this.buttonWidth,">",false);

	this.decreaseButton=new Button(this.x+130,
		this.y+this.height+145,
		1*this.buttonWidth,this.buttonWidth,"-",false);

	this.increaseButton=new Button(this.x+210,
		this.y+this.height+145,
		1*this.buttonWidth,this.buttonWidth,"+",false);

	this.getLinkButton=new Button(this.x+this.width-this.buttonWidth-5,
		this.y+this.height+145,this.buttonWidth*2,this.buttonWidth,"Link",false);

	this.pushSelector();

	this.pathOperator=null;
	this.registeredRegions=[];

	this.animatedRing=new AnimatedRing(x+this.width-50,y+70);

	this.regionGateAnimation=null;
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

	var heightToAdd=registeredRegions.length;
	if(heightToAdd>10)
		heightToAdd=10;
	heightToAdd*=30;

	this.regionSelector=new SelectionWidget(this.x,this.y+this.height+this.regionsOffset,
					this.width,this.height+heightToAdd,
					"Regions",registeredRegions);

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
		if(this.regionSelector.getNumberOfChoices()>=1){
			this.regionSelector.draw(context);
		}

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
		context.rect(this.x+20, this.y+this.buttonWidth+10, 120,this.buttonWidth);
		context.fillStyle = '#FFF8F9';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();


		//this.debugButton.draw(context,null);
		this.warpButton.draw(context,null);
		this.useCoverage.draw(context,null);
		this.increaseCoverageButton.draw(context,null);
		this.decreaseCoverageButton.draw(context,null);

		context.fillStyle    = '#000000';
		context.font         = 'bold '+this.fontSize+'px Arial';

		context.textAlign="left";
		context.fillText("Min. depth: "+this.minimumCoverage, this.x+40,this.y+52);

		this.animatedRing.draw(context);

		if(this.warpButton.getState()) {
			this.selector.draw(context);
			if(this.selector.getDepth()) {
				this.minimumCoverage = this.selector.getDepth();
			}
		}

		if(!this.warpButton.getState() && this.pathOperator.hasSelectedRegion()){

			var startingY=this.y+this.height+30;
			context.beginPath();
			context.fillStyle = '#FFF8F9';
			context.rect(this.x, startingY, this.width, this.height+55);
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();

			context.fillStyle    = '#000000';
			context.font         = 'bold 12px Arial';

			var jump=16;
			var index=1;

			context.textAlign="left";
			context.fillText("Map: ",this.x+10,startingY+index++*jump);
			context.fillText("Sequence length: ", this.x+10,startingY+index++*jump);
			context.fillText("Sequences: ", this.x+10,startingY+index++*jump);
			context.fillText("Section: ",this.x+10,startingY+index++*jump);
			context.fillText("Region: ",this.x+10,startingY+index++*jump);
			context.fillText("Location: ",this.x+10,startingY+index*jump);

			context.fillText("Length: ",this.x+160,startingY+index*jump);
			//context.fillText("Annotation: direct|reverse",this.x+100,startingY+index*jump);

			context.font         = '12px Arial';

			var region=this.pathOperator.getSelectedRegion();

			if(this.regionGateAnimation==null || region!=this.currentRegion){
				var radius=24;
				this.regionGateAnimation=new RegionGateAnimation(this.x+this.width-radius-10,this.y+this.height+radius+40,
					radius,region.getColor());

				this.currentRegion=region;
			}

			index=1;
			context.fillText(region.getMapName(),this.x+40,startingY+index++*jump);
			context.fillText(this.dataStore.getKmerLength(), this.x+120,startingY+index++*jump);
			context.fillText(this.dataStore.getNumberOfSequences(), this.x+90,startingY+index++*jump);
			context.fillText(region.getSectionName(),this.x+60,startingY+index++*jump);
			context.fillText(region.getRegionName(),this.x+60,startingY+index++*jump);
			context.fillText(region.getLocationName(),this.x+65,startingY+index*jump);
			context.fillText(region.getRegionLength(),this.x+210,startingY+index*jump);

			context.beginPath();
			context.fillStyle = region.getColor();

			this.regionGateAnimation.draw(context);

			this.getLinkButton.draw(context,null);

			//var color="#6699FF";
			context.beginPath();
			context.rect(this.x+15, this.y+this.height+132.5, 60,this.buttonWidth);
			//context.fillStyle = color;
			//context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();

			//context.beginPath();
			context.rect(this.x+140, this.y+this.height+132.5, 60,this.buttonWidth);
			//context.fillStyle = color;
			//context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();
			context.closePath();

			context.fillStyle="black";
			context.fillText("Play", this.x+50,this.y+this.height+150);
			context.fillText("Speed", this.x+170,this.y+this.height+150);
			switch(this.useColorsForRenderingLevel) {
				case 0:
					context.fillText("No colors", this.x + 255, this.y + 275);
					break;
				case 1:
					context.fillText("Regions", this.x + 255, this.y + 275);
					break;
				case 2:
					context.fillText("Sections", this.x + 255, this.y + 275);
			}
			this.nextButton.draw(context,null);
			this.previousButton.draw(context,null);
			this.increaseButton.draw(context,null);
			this.decreaseButton.draw(context,null);
			this.graphsButton.draw(context, null);
			this.useColors.draw(context, null);
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
	}else if(this.useCoverage.handleMouseDown(x,y)){

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



	}else if(this.warpButton.getState()){
		if(this.selector.handleMouseDown(x,y)){

			return true;
		}

	}else if(this.closeButton.getState() && !this.warpButton.getState()){
		if(this.nextButton.handleMouseDown(x,y)){

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

		}else if(this.regionSelector.handleMouseDown(x,y)){

			if(this.regionSelector.hasChoice()){
				var index=this.regionSelector.getChoice();

				this.pathOperator.selectRegion(index);

				this.createRegionSelector();
			}

			return true;
		}else if(this.pathOperator.hasSelectedRegion()
			&& this.getLinkButton.handleMouseDown(x,y)){

			var address=this.getAddress();

			if(this.screen.getZoomValue()!=1)
				address+="&zoom="+this.screen.getZoomValue();

			if(this.getPreviousButton().getState()){
				address+="&play=backward";
				address+="&speed="+this.getSpeed();
			}else if(this.getNextButton().getState()){
				address+="&play=forward";
				address+="&speed="+this.getSpeed();
			}

			alert(address);

			this.getLinkButton.resetState();
		}

	}
	if(this.graphsButton.handleMouseDown(x, y)){
		this.showDistributionGraph = !this.showDistributionGraph;
		return true;
	}
	if(this.useColors.handleMouseDown(x, y)) {
		this.useColorsForRenderingLevel++;
		if(this.useColorsForRenderingLevel == 3) {
			this.useColorsForRenderingLevel = 0;
		}
		this.useColors.resetState();
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
		this.animatedRing.move(deltaX,deltaY);

		if(this.regionGateAnimation!=null)
			this.regionGateAnimation.move(deltaX,deltaY);

		//this.debugButton.move(deltaX,deltaY);
		this.warpButton.move(deltaX,deltaY);
		this.useColors.move(deltaX,deltaY);
		this.useCoverage.move(deltaX,deltaY);
		this.selector.move(deltaX,deltaY);
		this.decreaseButton.move(deltaX,deltaY);
		this.increaseButton.move(deltaX,deltaY);
		this.decreaseCoverageButton.move(deltaX,deltaY);
		this.increaseCoverageButton.move(deltaX,deltaY);
		this.nextButton.move(deltaX,deltaY);
		this.previousButton.move(deltaX,deltaY);
		this.getLinkButton.move(deltaX,deltaY);
		this.regionSelector.move(deltaX,deltaY);
		this.graphsButton.move(deltaX, deltaY);
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

	this.animatedRing.iterate();
	this.selector.iterate();

	if(this.regionGateAnimation!=null)
		this.regionGateAnimation.iterate();

/*
 * Rebuild the menu if new elements are available.
 */
	if(this.pathOperator!=null
		&& this.pathOperator.getRegions().length != this.regionSelector.getNumberOfChoices()){

		this.createRegionSelector();
	}
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

Inventory.prototype.getAddress=function(){

	var address=this.address.getAddressWithoutQueryString();
	var region=this.pathOperator.getSelectedRegion();

	address+="?";
	address+="map="+region.getMap();
	address+="&section="+region.getSection();
	address+="&region="+region.getRegion();
	address+="&location="+region.getLocation();
	address+="&depth="+this.minimumCoverage;

	return address;
}

Inventory.prototype.useColorsForRendering=function(){
	return this.useColorsForRenderingLevel;
}

Inventory.prototype.showCoverageForRendering=function(){
	return this.useCoverage.getState();
}

Inventory.prototype.drawGraphs = function() {

	if(this.showDistributionGraph) {
		var coverageByPositionGraphX = 100;
		var coverageByPositionGraphY = this.screen.getHeight() - 150;
		this.distributionGraph = this.screen.getPathOperator().getDistributionGraph();
		var locationInSelectedRegion = this.screen.getPathOperator().getPositionInSelectedRegion();
		this.distributionGraph.draw(this.screen.getContext(), this.x - 420, this.y + 5, 200, 400, this.screen.getRenderer());
		this.coverageByPositionGraph = this.screen.getPathOperator().getCoverageByPositionGraph();
		this.coverageByPositionGraph.draw(this.screen.getContext(), coverageByPositionGraphX, coverageByPositionGraphY, 100,
							this.screen.getWidth() - 200, this.screen.getRenderer(), "Location", "Depth",
							locationInSelectedRegion, 2000);
	}


}
