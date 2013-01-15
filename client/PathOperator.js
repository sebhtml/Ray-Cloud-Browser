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

PathOperator.prototype.startOnPath=function(locationData){
	this.reset();
	this.locationData=locationData;

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
			this.keys[vertices[i++]["value"]]=true;
		}

		//console.log(vertices.length);
		var kmerSequence=vertices[Math.floor(vertices.length/2)]["value"];

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

PathOperator.prototype.isVertexInPath=function(vertex){
	if(vertex in this.keys)
		return true;

	return false;
}

PathOperator.prototype.reset=function(){

	this.keys=new Object();
}
