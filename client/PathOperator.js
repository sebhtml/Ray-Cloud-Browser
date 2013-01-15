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
 * Operate on paths
 *
 * \author Sébastien Boisvert
 */
function PathOperator(dataStore,graphOperator){
	this.dataStore=dataStore;
	this.graphOperator=graphOperator;

	this.reset();
}

/**
 * QUERY_STRING:
 * tag=RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION&section=Contigs.fasta.dat&region=0&location=34&kmerLength=31&readahead=512
 */
PathOperator.prototype.startOnPath=function(locationData){
	this.reset();
	this.locationData=locationData;
	this.regionLength=this.locationData["regionLength"];
	this.currentLocation=this.locationData["location"];

	locationData["readahead"]=512;

	this.dataStore.clear();
	this.graphOperator.clear();

	var message=new Message(RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION,
				this,this.dataStore,locationData);

	message.send();

}

PathOperator.prototype.receiveAndProcessMessage=function(message){
	var tag=message.getTag();

	if(tag==RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY){

		this.active=false;
/*
		var kmer=new Kmer(kmerSequence,coverage,parents,children);

		var message=new Message(RAY_MESSAGE_TAG_ADD_KMER,this,graphOperator,kmer);
		graphOperator.receiveMessage(message);
*/

		var content=message.getContent();

		//console.log(content);
		var vertices=content["vertices"]


		var i=0;
		while(i<vertices.length){

			var sequence=vertices[i]["value"];
			var position=vertices[i]["position"];

			this.vertexAtPosition[position]=sequence;

			if(!this.hasLeft|| position<this.lastLeft){
				this.lastLeft=position;
				this.hasLeft=true;
			}

/*
			if(position<10)
				console.log("position= "+position);
*/

			this.keys[sequence]=true;
			if(!(sequence in this.pathPositions)){
				this.pathPositions[sequence]=new Array();
			}
			this.pathPositions[sequence].push(position);

			if(!this.hasRight|| position>this.lastRight){
				this.lastRight=position;
				this.hasRight=true;
			}

			i++;
		}

/*
 * We only need to bootstrap the beast once.
 */
		if(this.started)
			return;

		this.started=true;

		var locationInRegion=this.locationData["location"];
		//console.log(vertices.length);

// pick up a middle position
		var kmerSequence=vertices[Math.floor(vertices.length/2)]["value"];

		var i=0;
		while(i<vertices.length){
			var sequence=vertices[i]["value"];
			var position=vertices[i]["position"];

			if(position==locationInRegion){
				kmerSequence=sequence;

				//console.log("Found starting point");
				break;
			}

			i++;
		}

		var parameters=new Object();
		parameters["map"]=this.dataStore.getMapFile();
		parameters["object"]=kmerSequence;
		parameters["depth"]=this.dataStore.getDefaultDepth();

		//console.log("kmerSequence= "+kmerSequence);

		var theMessage=new Message(RAY_MESSAGE_TAG_GET_KMER_FROM_STORE,this.dataStore,this.dataStore,parameters);
		this.dataStore.sendMessageOnTheWeb(theMessage);

		//console.log(JSON.stringify(message.getContent()));
	}
}

/**
 * QUERY_STRING:
 * tag=RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION&section=Contigs.fasta.dat&region=0&location=34&kmerLength=31&readahead=512
 */
PathOperator.prototype.doReadahead=function(vertex){

	if(this.active)
		return;

	var position=this.getVertexPosition(vertex);

	var buffer=1024;

	if(position<this.lastLeft+buffer && this.lastLeft!=0){

		//console.log("doReadahead on the left with lastLeft="+this.lastLeft+" and position "+position);
		this.active=true;
		this.locationData["location"]=this.lastLeft;

		var message=new Message(RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION,
				this,this.dataStore,this.locationData);
		message.send();

	}else if(position > this.lastRight-buffer && this.lastRight!=this.regionLength-1){

		//console.log("doReadahead on the right with lastRight="+this.lastRight+" and position "+position);
		this.active=true;
		this.locationData["location"]=this.lastRight;

		var message=new Message(RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION,
				this,this.dataStore,this.locationData);
		message.send();
	}
}

PathOperator.prototype.isVertexInPath=function(vertex){

	if(vertex in this.keys){

		this.doReadahead(vertex);

		return true;
	}

	return false;
}

PathOperator.prototype.reset=function(){

	this.active=false;

	this.keys=new Object();
	this.pathPositions=new Object();
	this.vertexAtPosition=new Object();

	this.started=false;
	this.lastLeft=0;
	this.lastRight=0;
	this.hasLeft=false;
	this.hasRight=false;

	this.currentLocation=0;
	this.regionLength=0;
}

PathOperator.prototype.getVertexPosition=function(sequence){
	if(sequence in this.pathPositions){
		if(this.pathPositions[sequence].length==1){
			return this.pathPositions[sequence][0];
		}else{
// TODO show many coverages when there are many
			return this.pathPositions[sequence][0];
		}

	}
	return 0;
}

PathOperator.prototype.hasVertex=function(){

	//console.log(this.currentLocation+" -- "+this.regionLength);

	return this.currentLocation<this.regionLength && this.currentLocation>=0;
}

PathOperator.prototype.getVertex=function(){
	if(!this.hasVertex)
		return null;

	return this.vertexAtPosition[this.currentLocation];
}

PathOperator.prototype.next=function(){
	this.currentLocation++;

	if(this.currentLocation>=this.regionLength)
		this.currentLocation=this.regionLength-1;
}

PathOperator.prototype.previous=function(){
	this.currentLocation--;
	if(this.currentLocation<0)
		this.currentLocation=0;
}
