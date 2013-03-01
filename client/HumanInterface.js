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
 * The controls for the human using the application.
 *
 * \author Sébastien Boisvert
 */
function HumanInterface(screen,dataStore){

	this.hasLocation=false;

	this.address=new AddressManager(document.URL);

	this.sampleInventory=new Inventory(screen.getWidth()-310,10,300,400,false,screen,dataStore);
	this.sampleInventory.setAddressManager(this.address);

	this.consumedLocation=false;
	this.screen=screen;

	this.zoomingChange=1.04;

	this.buttonWidth=24;
	this.buttonColor="#6699FF";
	this.buttonFontSize=22;

	var arrowVerticalOffset=0;

	this.goUp=new Button(this.buttonWidth*1.4,
		this.buttonWidth*0.9+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"↑",false);
	this.goUp.setBackgroundColor(this.buttonColor);
	this.goUp.setActiveColor(this.buttonColor);
	this.goUp.setFontSize(this.buttonFontSize);

	this.goDown=new Button(this.buttonWidth*1.4,
		this.buttonWidth*(3+0.1)+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"↓",false);
	this.goDown.setBackgroundColor(this.buttonColor);
	this.goDown.setActiveColor(this.buttonColor);
	this.goDown.setFontSize(this.buttonFontSize);

	this.goLeft=new Button(this.buttonWidth*(1.4-0.5-0.05),
		this.buttonWidth*(0.9+1+0.1)+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"←",false);
	this.goLeft.setBackgroundColor(this.buttonColor);
	this.goLeft.setActiveColor(this.buttonColor);
	this.goLeft.setFontSize(this.buttonFontSize)

	this.goRight=new Button(this.buttonWidth*(1.4+0.5+0.05),
		this.buttonWidth*(0.9+1+0.1)+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"→",false);
	this.goRight.setBackgroundColor(this.buttonColor);
	this.goRight.setActiveColor(this.buttonColor);
	this.goRight.setFontSize(this.buttonFontSize)

	this.zoomOut=new Button(this.buttonWidth*1.4,
		this.buttonWidth*(6.1-0.5)+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"-",false);
	this.zoomOut.setBackgroundColor(this.buttonColor);
	this.zoomOut.setActiveColor(this.buttonColor);
	this.zoomOut.setFontSize(this.buttonFontSize)

	this.zoomIn=new Button(this.buttonWidth*1.4,
		this.buttonWidth*4.5+arrowVerticalOffset,this.buttonWidth,this.buttonWidth,"+",false);
	this.zoomIn.setBackgroundColor(this.buttonColor);
	this.zoomIn.setActiveColor(this.buttonColor);
	this.zoomIn.setFontSize(this.buttonFontSize)

	this.leftKey=37;
	this.upKey=38;
	this.rightKey=39;
	this.downKey=40;

	this.backspace=8;
	this.enter=13;

	this.pageUp=33;
	this.pageDown=34;
	this.d=68;

	this.sampleInventory.getCloseButton().activateState();
	this.sampleInventory.getWarpButton().activateState();

	if(this.address.hasToken("zoom")){

		var zoom=this.address.getTokenValueAsFloat("zoom");

		if(zoom>0)
			this.screen.setZoomValue(zoom);
	}

	if(this.address.hasToken("play")){

		var direction=this.address.getTokenValue("play");

		if(direction=="backward"){
			this.sampleInventory.getPreviousButton().activateState();
		}else if(direction=="forward"){
			this.sampleInventory.getNextButton().activateState();
		}
	}
}

/*
 * \see http://stackoverflow.com/questions/5597060/detecting-arrow-keys-in-javascript
 *
 * accepted
 * arrow keys are only triggered by onkeydown, not onkeypress
 *
 * keycodes are:
 *
 * left = 37
 * up = 38
 * right = 39
 * down = 40
 */
HumanInterface.prototype.processKeyboardEvent=function(e){
	var key=e.which;

	var zoomValue=this.screen.getZoomValue();
	var zoomValueSpeed=this.screen.getZoomValueSpeed();

	var translationForce=16;
	var shift=translationForce/zoomValue;

	var originXSpeed=this.screen.getOriginXSpeed();
	var originYSpeed=this.screen.getOriginYSpeed();
	var originX=this.screen.getOriginX();
	var originY=this.screen.getOriginY();

	if(key==this.d){
		this.screen.toggleDebugMode();
	}else if(key==this.leftKey){
		originXSpeed-=shift;
		this.goLeft.activateColor();
	}else if(key==this.rightKey){
		originXSpeed+=shift;
		this.goRight.activateColor();
	}else if(key==this.downKey){
		originYSpeed+=shift;
		this.goDown.activateColor();
	}else if(key==this.upKey){
		originYSpeed-=shift;
		this.goUp.activateColor();
	}else if(key==this.pageDown){

		this.zoomIn.activateColor();

		var newZoom=zoomValue*this.zoomingChange;

		zoomValueSpeed+=(newZoom-zoomValue);

	}else if(key==this.pageUp){

		this.zoomOut.activateColor();

		var newZoom=zoomValue/this.zoomingChange;

		zoomValueSpeed+=(newZoom-zoomValue);
	}

	this.screen.updateOrigin(originX,originY,originXSpeed,originYSpeed,zoomValue,zoomValueSpeed);
}

HumanInterface.prototype.createButtons=function(){
	this.buttons=new Array();

	this.timeControlButton=new Button(30,35,40,50,"time",true);

	this.repulsionBase=280;
	this.attractionBase=180;
	this.typeBase=470;
	this.verticesBase=560;
	this.resetBase=80;
	this.degreeBase=640;
	this.dampingBase=380;
	this.radiusBase=720;
	this.arcBase=830;

	var smallButtonWidth=20;

	this.showArcsButton=new Button(140,50,60,20,"edges",true);
	//this.buttons.push(this.showArcsButton);

	this.showVerticesButton=new Button(140,20,60,20,"vertices",true);
	//this.buttons.push(this.showVerticesButton);

	this.increaseRepulsionButton=new Button(this.repulsionBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseRepulsionButton);

	this.decreaseRepulsionButton=new Button(this.repulsionBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseRepulsionButton);

	this.increaseAttractionButton=new Button(this.attractionBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseAttractionButton);

	this.decreaseAttractionButton=new Button(this.attractionBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseAttractionButton);

	this.resetButton=new Button(this.resetBase,45,40,30,"reset",false);
	//this.buttons.push(this.resetButton);

	this.increaseTypeButton=new Button(this.typeBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseTypeButton);

	this.decreaseTypeButton=new Button(this.typeBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseTypeButton);

	this.increaseVerticesButton=new Button(this.verticesBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseVerticesButton);

	this.decreaseVerticesButton=new Button(this.verticesBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseVerticesButton);

	this.increaseDegreeButton=new Button(this.degreeBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseDegreeButton);

	this.decreaseDegreeButton=new Button(this.degreeBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseDegreeButton);

	this.increaseArcButton=new Button(this.arcBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseArcButton);

	this.decreaseArcButton=new Button(this.arcBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseArcButton);

	this.increaseRadiusButton=new Button(this.radiusBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseRadiusButton);

	this.decreaseRadiusButton=new Button(this.radiusBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseRadiusButton);

	this.increaseDampingButton=new Button(this.dampingBase+40,45,smallButtonWidth,smallButtonWidth,"+",false);
	//this.buttons.push(this.increaseDampingButton);

	this.decreaseDampingButton=new Button(this.dampingBase+20,45,smallButtonWidth,smallButtonWidth,"-",false);
	//this.buttons.push(this.decreaseDampingButton);

	this.addVertexButton=new Button(950+40,25,100,smallButtonWidth,"add vertex",false);
	//this.buttons.push(this.addVertexButton);

	this.removeVertexButton=new Button(950+40,55,100,smallButtonWidth,"remove vertex",false);
	//this.buttons.push(this.removeVertexButton);


	this.addArcButton=new Button(1070+40,25,100,smallButtonWidth,"add edge",false);
	//this.buttons.push(this.addArcButton);

	this.removeArcButton=new Button(1070+40,55,100,smallButtonWidth,"remove edge",false);
	//this.buttons.push(this.removeArcButton);
}

/*
HumanInterface.prototype.processButtons=function(){
	if(this.increaseRepulsionButton.getState()){
		this.forceConstant+=this.forceStep;
		this.forceConstant=this.roundNumber(this.forceConstant,6);
		this.increaseRepulsionButton.resetState();
	}

	if(this.decreaseRepulsionButton.getState()){
		this.forceConstant-=this.forceStep;
		this.forceConstant=this.roundNumber(this.forceConstant,6);
		this.decreaseRepulsionButton.resetState();
	}

	if(this.increaseAttractionButton.getState()){
		this.springConstant+=this.sprintStep;
		this.springConstant=this.roundNumber(this.springConstant,6);
		this.increaseAttractionButton.resetState();
	}

	if(this.decreaseAttractionButton.getState()){
		this.springConstant-=this.sprintStep;
		this.springConstant=this.roundNumber(this.springConstant,6);
		this.decreaseAttractionButton.resetState();
	}

	if(this.resetButton.getState()){
		this.start();
		this.resetButton.resetState();
	}

	if(this.increaseTypeButton.getState()){
		this.typeIndex++;
		if(this.typeIndex == this.types.length){
			this.typeIndex=0;
		}
		this.type=this.types[this.typeIndex];
		this.increaseTypeButton.resetState();

		//console.log("new type "+this.type);
	}

	if(this.decreaseTypeButton.getState()){
		this.typeIndex--;
		if(this.typeIndex == -1){
			this.typeIndex=this.types.length-1;
		}
		this.type=this.types[this.typeIndex];
		this.decreaseTypeButton.resetState();

		//console.log("new type "+this.type);
	}

	if(this.increaseVerticesButton.getState()){
		this.n++;

		this.increaseVerticesButton.resetState();
	}

	if(this.decreaseVerticesButton.getState()){

		if(this.n!=0){
			this.n--;
		}

		this.decreaseVerticesButton.resetState();
	}

	if(this.increaseDegreeButton.getState()){
		this.degree++;

		this.increaseDegreeButton.resetState();
	}

	if(this.decreaseDegreeButton.getState()){
		if(this.degree!=0){
			this.degree--;
		}
		this.decreaseDegreeButton.resetState();
	}

	if(this.increaseArcButton.getState()){
		this.arcLength+=10;

		this.increaseArcButton.resetState();
	}

	if(this.decreaseArcButton.getState()){
		if(this.arcLength!=0){
			this.arcLength-=10;
		}

		this.decreaseArcButton.resetState();

		while(this.arcLength < 2.5*this.vertexRadius){
			this.vertexRadius-=10;
		}
	}

	if(this.increaseRadiusButton.getState()){
		this.vertexRadius+=10;

		this.increaseRadiusButton.resetState();

		while(this.arcLength < 2.5*this.vertexRadius){
			this.arcLength+=10;
		}
	}

	if(this.decreaseRadiusButton.getState()){
		if(this.vertexRadius!=0){
			this.vertexRadius-=10;
		}

		this.decreaseRadiusButton.resetState();
	}

	if(this.increaseDampingButton.getState()){
		if(this.damping<1){
			this.damping+=0.1;
		}
		this.increaseDampingButton.resetState();
		this.damping=this.roundNumber(this.damping,2);
	}

	if(this.decreaseDampingButton.getState()){
		if(this.damping>0){
			this.damping-=0.1;
		}
		this.decreaseDampingButton.resetState();
		this.damping=this.roundNumber(this.damping,2);
	}
}
*/

HumanInterface.prototype.draw=function(){

	var context=this.screen.getContext();
	this.sampleInventory.draw(context);
	this.goUp.draw(context,null);
	this.goDown.draw(context,null);
	this.goLeft.draw(context,null);
	this.goRight.draw(context,null);
	this.zoomOut.draw(context,null);
	this.zoomIn.draw(context,null);
}

HumanInterface.prototype.handleMouseDoubleClick=function(x,y){

	if(this.handleMouseDown(x,y)){
		return true;
	}

	var aEvent=new Object();
	aEvent.which=this.pageDown;
	this.processKeyboardEvent(aEvent);
	return true;
}

HumanInterface.prototype.handleMouseDown=function(x,y){

	if(this.sampleInventory.handleMouseDown(x,y)){

		if(this.getInventory().getSelector().hasChoices()){

			this.locationData=this.getInventory().getSelector().getLocationData();
		}

		return true;

	}else if(this.goLeft.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.leftKey;
		this.processKeyboardEvent(aEvent);
		return true;

	}else if(this.goRight.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.rightKey;
		this.processKeyboardEvent(aEvent);
		return true;

	}else if(this.zoomOut.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.pageUp;
		this.processKeyboardEvent(aEvent);
		return true;

	}else if(this.zoomIn.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.pageDown;
		this.processKeyboardEvent(aEvent);
		return true;

	}else if(this.goDown.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.downKey;
		this.processKeyboardEvent(aEvent);
		return true;

	}else if(this.goUp.handleMouseDown(x,y)){
		var aEvent=new Object();
		aEvent.which=this.upKey;
		this.processKeyboardEvent(aEvent);
		return true;
	}

	return false;
}

HumanInterface.prototype.handleMouseUp=function(x,y){

	if(this.sampleInventory.handleMouseUp(x,y))
		return true;
	return false;
}

HumanInterface.prototype.handleMouseMove=function(x,y){
	if(this.sampleInventory.handleMouseMove(x,y))
		return true;
	return false;
}

HumanInterface.prototype.goNext=function(){
	return this.sampleInventory.getNextButton().getState();
}

HumanInterface.prototype.goPrevious=function(){
	return this.sampleInventory.getPreviousButton().getState();
}

HumanInterface.prototype.getMoviePeriod=function(){
	return this.sampleInventory.getMoviePeriod();
}

HumanInterface.prototype.getMinimumCoverage=function(){
	return this.sampleInventory.getMinimumCoverage();
}

HumanInterface.prototype.getInventory=function(){
	return this.sampleInventory;
}

HumanInterface.prototype.iterate=function(){

	this.getInventory().iterate();

	if(!this.hasLocation && this.getInventory().getSelector().hasChoices()){
		this.locationData=this.getInventory().getSelector().getLocationData();

		this.hasLocation=true;
	}
}

HumanInterface.prototype.setCurrentLocation=function(value){

	this.getInventory().setCurrentLocation(value);
}
