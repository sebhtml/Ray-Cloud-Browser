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

	this.useAddress=useAddress;
	this.address=new AddressManager(document.URL);

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

Selector.prototype.pumpAddressTokens=function(){

	if(!this.useAddress)
		return;

	if(this.state==this.SLAVE_MODE_SELECT_MAP && this.address.hasToken("map")){

		var map=this.address.getTokenValue("map");
		this.selectMapIndex(map);

	}else if(this.state==this.SLAVE_MODE_SELECT_SECTION && this.address.hasToken("section")){

		var index=this.address.getTokenValue("section");
		this.selectSectionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_REGION && this.address.hasToken("region") && this.receivedMapFileData){

		var index=this.address.getTokenValue("region");
		this.selectRegionIndex(index);
	}
}

/**
 * Since this method is called several times per second,
 * we'll use it as a progress thread.
 */
Selector.prototype.draw=function(context){

	this.pumpAddressTokens();

/*
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height );
	context.fillStyle = '#FFF8F9';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();
*/

// some granularity
	if(this.state==this.SLAVE_MODE_PULL_MAPS){


		if(!this.requestedMaps){


			this.receivedMaps=false;
			this.requestedMaps=true;

			var message=new Message(RAY_MESSAGE_TAG_GET_MAPS,this,this.dataStore,null);
			this.dataStore.receiveAndProcessMessage(message);

		}else if(this.receivedMaps){

			this.mapWidget=new SelectionWidget(this.x,this.y+10,this.width*1.5,this.height,"(1/4) Select map",this.mapChoices);
			this.objects.push(this.mapWidget);
			this.state=this.SLAVE_MODE_SELECT_MAP;

			this.requestedRegions=false;

		}

	}else if(this.state==this.SLAVE_MODE_SELECT_MAP){

		this.mapWidget.draw(context);

	}else if(this.state==this.SLAVE_MODE_SELECT_SECTION){

		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);

	}else if(this.state==this.SLAVE_MODE_PULL_REGIONS){

		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);

		if(!this.requestedRegions){
			var parameters=new Object();
			this.sectionFile=this.mapData[this.mapIndex]["sections"][this.sectionIndex]["file"];
			parameters["section"]=this.sectionFile;
			parameters["first"]=0;
			parameters["readahead"]=4096;

			var message=new Message(RAY_MESSAGE_TAG_GET_REGIONS,this,this.dataStore,parameters);

			this.requestedRegions=true;
			this.receivedRegions=false;

			this.dataStore.receiveAndProcessMessage(message);

		}else if(this.receivedRegions){

			var choices=new Array();
			var i=0;

			while(i<this.regionData["regions"].length){
				var entry=this.regionData["regions"][i++];
				choices.push(entry["name"]+" ("+entry["nucleotides"]+")");
			}

			this.regionWidget=new SelectionWidget(this.x,this.y+110,this.width*1.5,this.height,"(3/4) Select region",choices);
			this.objects=new Array();
			this.objects.push(this.regionWidget);
			this.state=this.SLAVE_MODE_SELECT_REGION;
		}

	}else if(this.state==this.SLAVE_MODE_SELECT_REGION){

		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);
		this.regionWidget.draw(context);

	}else if(this.state==this.SLAVE_MODE_SELECT_LOCATION){

		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);
		this.regionWidget.draw(context);
		this.locationWidget.draw(context);
	}else if(this.state==this.SLAVE_MODE_FINISHED){

		this.mapWidget.draw(context);
		this.sectionWidget.draw(context);
		this.regionWidget.draw(context);
		this.locationWidget.draw(context);
	}

// show extra information
	if(this.receivedMapFileData){
		context.fillStyle    = '#000000';
		context.font         = 'bold '+this.fontSize+'px Arial';
		context.fillText(this.metaData, this.x+200,this.y+30);
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
		//alert("Choice: # "+index+" "+this.mapChoices[index]);

		this.selectMapIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_SECTION && this.sectionWidget.hasChoice()){

		var index=this.sectionWidget.getChoice();

		this.selectSectionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_REGION && this.regionWidget.hasChoice() && this.receivedMapFileData){

		var index=this.regionWidget.getChoice();

		this.selectRegionIndex(index);

	}else if(this.state==this.SLAVE_MODE_SELECT_LOCATION && this.locationWidget.hasChoice()){

// we want 0-based positions
		this.locationIndex=this.locationWidget.getChoice()-1;
		this.locationWidget.resetState();

		this.objects=new Array();
		this.deadObjects.push(this.locationWidget);

		this.state=this.SLAVE_MODE_FINISHED;
		this.consumed=false;
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
}

Selector.prototype.receiveAndProcessMessage=function(message){

	var tag=message.getTag();

	if(tag==RAY_MESSAGE_TAG_GET_MAPS_REPLY){


		this.mapData=message.getContent()["maps"];

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

		this.metaData="Kmer length: "+this.mapFileData["kmerLength"]+" entries: "+this.mapFileData["entries"];
	}
}

Selector.prototype.hasChoices=function(){
	return this.state==this.SLAVE_MODE_FINISHED && !this.consumed;
}

Selector.prototype.getLocationData=function(){

	var parameters=new Object();
	parameters["section"]=this.sectionFile;
	parameters["region"]=this.regionIndex;
	parameters["location"]=this.locationIndex;
	parameters["kmerLength"]=this.mapFileData["kmerLength"];
	parameters["regionLength"]=this.regionLength;
	parameters["map"]=this.mapData[this.mapIndex]["file"];

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

	this.sectionWidget=new SelectionWidget(this.x,this.y+60,this.width*1.5,this.height,"(2/4) Select section",sections);
	this.objects=new Array();
	this.objects.push(this.sectionWidget);
	this.state=this.SLAVE_MODE_SELECT_SECTION;

	this.deadObjects.push(this.mapWidget);

	this.mapWidget.resetState();

// this is a new communication pattern, you send, but you wait later
// it is like a readahead messaging

	var parameters=new Object();
	parameters["map"]=this.mapData[this.mapIndex]["file"];

	var message=new Message(RAY_MESSAGE_TAG_GET_MAP_INFORMATION,this,this.dataStore,parameters);
	this.dataStore.receiveAndProcessMessage(message);

	this.receivedMapFileData=true;

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

	var maximum=entry=this.regionData["regions"][this.regionIndex]["nucleotides"]-this.mapFileData["kmerLength"]+1;
	this.regionLength=maximum;

	this.locationWidget=new IntegerSelectionWidget(this.x,this.y+160,this.width*1.5,this.height,"(4/4) Select location",
		1,maximum);

	this.objects=new Array();
	this.objects.push(this.locationWidget);

	this.deadObjects.push(this.regionWidget);

	this.regionWidget.setChoice(index);
}
