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
 * This is the panel that selects:
 * - map
 * - section
 * - region
 * - location
 *
 * \author Sébastien Boisvert
 */
function Selector(x,y,width,height,dataStore,useAddress){
	this.nucleotidesSelected = -1;
	this.depth = 0;
	this.useAddress=useAddress;
	this.fontSize=12;
	this.tableOfIndex = new Object();
	this.tableOfNameOfRegions = new Array();

	this.displaySearchWidget = false;
	this.maxNucleotides = 0;
	this.minNucleotides = 0;

	this.dataStore=dataStore;
	this.consumed=false;

	var width=width;
	var height=height;

	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;

	var step=0;

	this.SLAVE_MODE_PULL_MAPS=step++;
	this.SLAVE_MODE_SELECT_MAP=step++;
	this.SLAVE_MODE_SELECT_SECTION=step++;
	this.SLAVE_MODE_PULL_REGIONS=step++;
	this.SLAVE_MODE_SELECT_REGION=step++;
	this.SLAVE_MODE_SELECT_LOCATION=step++;
	this.SLAVE_MODE_FINISHED=step++;

	this.state=this.SLAVE_MODE_PULL_MAPS;

	this.objects=[];
	this.deadObjects=[];

	this.requestedMaps=false;
}
Selector.prototype.getDepth = function(){
	return this.depth;
}

Selector.prototype.pumpAddressTokens=function(){

	if(!this.useAddress)
		return;
	if(this.state==this.SLAVE_MODE_SELECT_MAP && this.address.hasToken("map")){

		var map=this.address.getTokenValueAsInteger("map");
		this.selectMapIndex(map);

	}else if(this.state==this.SLAVE_MODE_SELECT_SECTION && this.address.hasToken("section")){

		var index=this.address.getTokenValueAsInteger("section");
		this.selectSectionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_REGION && this.address.hasToken("region") && this.receivedMapFileData){

		var index=this.address.getTokenValueAsInteger("region");
		this.selectRegionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_LOCATION && this.address.hasToken("location")){

		var index=this.address.getTokenValueAsInteger("location");
		this.selectLocationIndex(index);
	}
	if(this.address.hasToken("depth")){
		this.depth = this.address.getTokenValueAsInteger("depth");
	}
}

/**
 * Since this method is called several times per second,
 * we'll use it as a progress thread.
 */
Selector.prototype.draw=function(context){
	this.pumpAddressTokens();

	// some granularity
	if(this.state == this.SLAVE_MODE_PULL_MAPS){

		if(!this.requestedMaps){

			this.receivedMaps=false;
			this.requestedMaps=true;

			var message=new Message(RAY_MESSAGE_TAG_GET_MAPS,this,this.dataStore,null);
			this.dataStore.receiveAndProcessMessage(message);

		}else if(this.receivedMaps){

			this.mapWidget=new SelectionWidget(this.x,this.y,this.width*1.0,this.height,"(1/4) Select map",this.mapChoices);
			this.objects.push(this.mapWidget);
			this.state=this.SLAVE_MODE_SELECT_MAP;

			this.requestedRegions=false;
		}

	} else if(this.state == this.SLAVE_MODE_PULL_REGIONS) {
		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);
		if(!this.requestedRegions){
			var parameters=new Object();
			parameters["map"]=this.mapIndex;
			parameters["section"]=this.sectionIndex;
			parameters["start"]=0;
			parameters["count"]=500000;

			var message=new Message(RAY_MESSAGE_TAG_GET_REGIONS,this,this.dataStore,parameters);

			this.requestedRegions=true;
			this.receivedRegions=false;

			this.dataStore.receiveAndProcessMessage(message);

		}else if(this.receivedRegions){
			var choices=new Array();
			var i=0;
			this.objects=new Array();
			while(i<this.regionData["regions"].length){
				var entry=this.regionData["regions"][i++];
				if(this.nucleotidesSelected != -1) {
					if(this.nucleotidesSelected == entry["nucleotides"]) {
						choices.push(entry["name"]+" ("+entry["nucleotides"]+")");
						this.tableOfNameOfRegions.push(entry["name"]+" ("+entry["nucleotides"]+")");
					}
				} else {
					choices.push(entry["name"]+" ("+entry["nucleotides"]+")");
					this.tableOfIndex[entry["name"]+" ("+entry["nucleotides"]+")"] = i;
				}
				if(this.maxNucleotides < entry["nucleotides"]) {
					this.maxNucleotides = entry["nucleotides"];
				}
				if(this.minNucleotides == 0 || this.minNucleotides > entry["nucleotides"]) {
					this.minNucleotides = entry["nucleotides"];
				}
			}
			this.integerSelection = new IntegerSelectionWidget(this.x - this.width - 5, this.y + 115, this.width * 1.0, this.width - 70, "Search region with number of nucleotides", this.minNucleotides, this.maxNucleotides);
			this.objects.push(this.integerSelection);
			if(!this.searchButton) {
				this.searchButton = new Button(this.x + 200, this.y + 135, 50, 25, "Search", false);
				this.resetButton = new Button(this.x + 260, this.y + 135, 50, 25, "Reset", false);
			}
			this.regionWidget=new SelectionWidget(this.x,this.y+115,this.width*1.0, this.width - 70,"(3/4) Select region",choices);
			this.objects.push(this.regionWidget);
			this.state=this.SLAVE_MODE_SELECT_REGION;
		}

	} else {
		this.applyState(this.state, context);
		if(this.searchButton && this.resetButton) {
			this.searchButton.draw(context);
			this.resetButton.draw(context);
		}
	}

// show extra information
	if(this.receivedMapFileData){

		context.beginPath();
		context.textAlign="left";
		context.fillStyle    = '#000000';
		context.font         = ''+this.fontSize+'px Arial';

		context.fillText("Sequence length: "+this.mapFileData["sequenceLength"], this.x+10,this.y+55);
		context.fillText("Sequences: "+this.mapFileData["sequences"], this.x+140,this.y+55);
		context.closePath();
	}
}

Selector.prototype.applyState = function(state, context) {
	switch(state) {
		case this.SLAVE_MODE_SELECT_MAP:
			if(!this.mapWidget.getBlink()) {
				this.mapWidget.enableBlink();
			}
			this.mapWidget.draw(context);
			break;

		case this.SLAVE_MODE_SELECT_SECTION:
			if(!this.sectionWidget.getBlink()) {
				this.mapWidget.disableBlink();
				this.sectionWidget.enableBlink();
			}

			this.mapWidget.draw(context);
			this.sectionWidget.draw(context);
			break;

		case this.SLAVE_MODE_SELECT_REGION:
			if(!this.regionWidget.getBlink()) {
				this.mapWidget.disableBlink();
				this.sectionWidget.disableBlink();
				this.regionWidget.enableBlink();
			}
			if(this.displaySearchWidget) {
				this.integerSelection.draw(context);
			}
			this.mapWidget.draw(context);
			this.sectionWidget.draw(context);
			this.regionWidget.draw(context);
			break;

		case this.SLAVE_MODE_SELECT_LOCATION:
			if(!this.locationWidget.getBlink()) {
				this.mapWidget.disableBlink();
				this.sectionWidget.disableBlink();
				this.regionWidget.disableBlink();
				this.locationWidget.enableBlink();
			}
			this.searchButton = null;
			this.resetButton = null
			this.mapWidget.draw(context);
			this.sectionWidget.draw(context);
			this.regionWidget.draw(context);
			this.locationWidget.draw(context);
			break;

		case this.SLAVE_MODE_FINISHED:
			if(this.locationWidget.getBlink()) {
				this.mapWidget.disableBlink();
				this.sectionWidget.disableBlink();
				this.regionWidget.disableBlink();
				this.locationWidget.disableBlink();
			}
			this.mapWidget.draw(context);
			this.sectionWidget.draw(context);
			this.regionWidget.draw(context);
			this.locationWidget.draw(context);
	}
}

Selector.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	var result=false;

	var i=0;
	while(i<this.objects.length){
		if(this.objects[i].handleMouseDown(x,y)){
			result=true;
			break;
		}
		i++;
	}
	if(this.state==this.SLAVE_MODE_SELECT_MAP && this.mapWidget.hasChoice()){

		var index=this.mapWidget.getChoice();

		this.selectMapIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_SECTION && this.sectionWidget.hasChoice()){

		var index=this.sectionWidget.getChoice();

		this.selectSectionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_REGION && this.regionWidget.hasChoice() && this.receivedMapFileData){
		var index=this.regionWidget.getChoice();
		if(this.nucleotidesSelected != -1) {
			this.selectRegionIndex(this.tableOfIndex[this.tableOfNameOfRegions[index]]);
		} else {
			this.selectRegionIndex(index);
		}



	} else if(this.state == this.SLAVE_MODE_SELECT_REGION && this.integerSelection.hasChoice()) {
		if(this.integerSelection && this.nucleotidesSelected != this.integerSelection.getValue()) {
			this.nucleotidesSelected = this.integerSelection.getValue();
			this.state = this.SLAVE_MODE_PULL_REGIONS;
		}
	} else if(this.state==this.SLAVE_MODE_SELECT_LOCATION && this.locationWidget.hasChoice()) {

		var index=this.locationWidget.getChoice()-1;

		this.selectLocationIndex(index);
	} else if(this.state == this.SLAVE_MODE_SELECT_REGION && this.searchButton.handleMouseDown(x, y)) {
		this.displaySearchWidget = this.searchButton.getState();
	} else if(this.state == this.SLAVE_MODE_SELECT_REGION && this.resetButton.handleMouseDown(x, y)) {
		this.nucleotidesSelected = -1;
		this.resetButton.resetState();
		this.state = this.SLAVE_MODE_PULL_REGIONS;
	}

	return result;
}

Selector.prototype.handleMouseDoubleClick = function(x, y) {
	var result = false;
	if(this.mapWidget) {
		result = this.mapWidget.handleMouseDoubleClick();
	}
	if(this.sectionWidget && !result) {
		result = this.sectionWidget.handleMouseDoubleClick();
	}
	if(this.regionWidget && !result) {
		result = this.regionWidget.handleMouseDoubleClick();
	}
	if(this.locationWidget && !result) {
		result = this.locationWidget.handleMouseDoubleClick();
	}
	if(result) {
		this.handleMouseDown(x, y);
	}
	return result;
}

Selector.prototype.handleMouseMove=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	return false;
}

Selector.prototype.handleMouseUp=function(x,y){

}

Selector.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;

	for(var item in this.objects){
		this.objects[item].move(x,y);
	}

	for(var item in this.deadObjects){
		this.deadObjects[item].move(x,y);
	}
	if(this.searchButton) {
		this.searchButton.move(x, y);
	}
	if(this.resetButton) {
		this.resetButton.move(x, y);
	}
}

Selector.prototype.receiveAndProcessMessage=function(message){

	var tag=message.getTag();

	if(tag==RAY_MESSAGE_TAG_GET_MAPS_REPLY){


		this.mapData=message.getContent()["maps"];

		this.dataStore.setMapData(this.mapData);

		this.mapChoices=new Array();

		for(var i in this.mapData){
			this.mapChoices.push(this.mapData[i]["name"]);
		}

		this.receivedMaps=true;

	}else if(tag==RAY_MESSAGE_TAG_GET_REGIONS_REPLY){

		this.regionData=message.getContent();

		this.receivedRegions=true;

	}else if(tag==RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY){

		this.mapFileData=message.getContent();
		this.receivedMapFileData=true;

		this.dataStore.setMapAttributes(this.mapFileData);
	}
}

Selector.prototype.hasChoices=function(){
	return this.state==this.SLAVE_MODE_FINISHED && !this.consumed;
}

Selector.prototype.getLocationData=function(){

	var parameters=new Object();
	parameters["section"]=this.sectionIndex;
	parameters["region"]=this.regionIndex;
	parameters["location"]=this.locationIndex;
	parameters["sequenceLength"]=this.mapFileData["sequenceLength"];
	parameters["regionLength"]=this.regionLength;
	parameters["map"]=this.mapIndex;

	parameters["mapName"]=this.mapData[this.mapIndex]["name"];
	parameters["sectionName"]=this.mapData[this.mapIndex]["sections"][this.sectionIndex]["name"];
	parameters["regionName"]=this.regionData["regions"][this.regionIndex]["name"];
	parameters["locationName"]=this.locationIndex+1;

	return parameters;
}

Selector.prototype.markAsConsumed=function(){
	this.consumed=true;
}

Selector.prototype.selectMapIndex=function(index){

	if(!(index<this.mapData.length))
		return;

	this.mapIndex=index;

	var sections=new Array();

	var i=0;
	while(i<this.mapData[this.mapIndex]["sections"].length){
		sections.push(this.mapData[this.mapIndex]["sections"][i++]["name"]);
	}

	this.sectionWidget=new SelectionWidget(this.x,this.y+65,this.width*1.0,this.height,"(2/4) Select section",sections);
	this.objects=new Array();
	this.objects.push(this.sectionWidget);
	this.state=this.SLAVE_MODE_SELECT_SECTION;

	this.deadObjects.push(this.mapWidget);

	this.mapWidget.resetState();
	this.mapWidget.setHeight(60);

// this is a new communication pattern, you send, but you wait later
// it is like a readahead messaging

	var parameters=new Object();
	parameters["map"]=this.mapIndex;

	var message=new Message(RAY_MESSAGE_TAG_GET_MAP_INFORMATION,this,this.dataStore,parameters);
	this.dataStore.receiveAndProcessMessage(message);

	this.mapWidget.setChoice(index);
}

Selector.prototype.selectSectionIndex=function(index){

	if(!(index<this.mapData[this.mapIndex]["sections"].length))
		return;

	this.sectionIndex=index;

	this.state=this.SLAVE_MODE_PULL_REGIONS;

	this.sectionWidget.resetState();

	this.objects=new Array();
	this.deadObjects.push(this.sectionWidget);

	this.sectionWidget.setChoice(index);
}

Selector.prototype.selectRegionIndex=function(index){

	if(!(index<this.regionData["regions"].length))
		return;

	this.regionIndex=index;

	this.state=this.SLAVE_MODE_SELECT_LOCATION;

	this.regionWidget.resetState();

	var maximum=entry=this.regionData["regions"][this.regionIndex]["nucleotides"]-this.mapFileData["sequenceLength"]+1;
	this.regionLength=maximum;

	this.locationWidget=new IntegerSelectionWidget(this.x,this.y+165,this.width*1.0,this.height,"(4/4) Select location",
		1,maximum);

	this.objects=new Array();
	this.objects.push(this.locationWidget);

	this.deadObjects.push(this.regionWidget);

	this.regionWidget.setChoice(index);
}

Selector.prototype.selectLocationIndex=function(index){

	if(!(index<this.regionLength))
		return;

// we want 0-based positions
	this.locationIndex=index;
	this.locationWidget.resetState();

	this.objects=new Array();
	this.deadObjects.push(this.locationWidget);

	this.state=this.SLAVE_MODE_FINISHED;
	this.consumed=false;

}

Selector.prototype.setAddressManager=function(address){
	this.address=address;
}

Selector.prototype.iterate = function() {
	if(this.mapWidget != null && this.mapWidget.getBlink()) {
		this.mapWidget.blinkBox();
	}
	if(this.sectionWidget != null && this.sectionWidget.getBlink()) {
		this.sectionWidget.blinkBox();
	}
	if(this.regionWidget != null && this.regionWidget.getBlink()) {
		this.regionWidget.blinkBox();
	}
	if(this.locationWidget != null && this.locationWidget.getBlink()) {
		this.locationWidget.blinkBox();
	}
}
