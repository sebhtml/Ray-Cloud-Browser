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
 * The operator operates the graph. It is responsible
 * for adding and removing vertices.
 *
 * It uses the data store for obtaining information.
 * Everything is event-driven.
 *
 * \author Sébastien Boisvert
 */
function GraphOperator(screen){

	this.screen=screen;
	this.dataStore=new DataStore();

	this.dataStore.setGraphOperator(this);

	this.resetProductionQueue();
	this.positionsToAdd=[];

	this.depth=0;

	this.objectsPerQuantum=8;

	this.bufferForCommunicationOperations=512;

	this.minimumCoverageAccepted=CONFIG_MINIMUM_COVERAGE_TO_DISPLAY;
}

GraphOperator.prototype.createGraph=function(graph){

	this.graph=graph;

	var message=new Message(RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE,
				this,
				this.dataStore,
				null);

	this.dataStore.receiveMessage(message);
}

GraphOperator.prototype.receiveMessage=function(message){

	var tag=message.getTag();

	if(tag==RAY_MESSAGE_TAG_GET_KMER_LENGTH){
		var message=new Message(RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY,this,message.getSource(),
			this.kmerLength);
		message.getSource().receiveMessage(message);

	}else if(tag==RAY_MESSAGE_TAG_ADD_KMER){
		this.receiveObject(message.getContent());

	}else if(tag==RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS_REPLY){

		var body=message.getContent();

		var i=0;
		while(i<body["vertices"].length){

			var entry=body["vertices"][i];

			this.addedAnnotations[entry["sequence"]]=true;

			var annotations=entry["annotations"];

			i++;
		}

		this.requestedAnnotations=false;
	}
}

GraphOperator.prototype.receiveAndProcessMessage=function(message){
	this.receiveMessage(message);
}

GraphOperator.prototype.receiveFirstKmer=function(firstKmer){

	if(firstKmer==undefined){
		return;
	}

	this.productionQueue.push(firstKmer);
}

GraphOperator.prototype.pullObjects=function(){

	while(this.head < this.productionQueue.length){

		var kmerObject=this.productionQueue[this.head];

		this.head++;

		if(kmerObject in this.added){
			continue;
		}

/*
 * Only fetch one object everytime.
 /*/
		this.dataStore.getKmerInformation(kmerObject,this);
		return;
	}

	if(this.pullAnnotations())
		return;

	this.resetProductionQueue();

/* add stuff in the queue */

	var objectsWithoutData=this.graph.getObjectsWithoutData();

	var maximumElements=128;
	var added=0;
	for(key in objectsWithoutData){
		
		if(added==maximumElements)
			break;

		var vertex=this.graph.getVertex(key);
	
/* Ignore off-screen objects */
		if(this.screen.isOutside(vertex,this.bufferForCommunicationOperations))
			continue;
		
		this.productionQueue.push(key);
		added++;
	}
}

GraphOperator.prototype.pullAnnotations=function(){

	if(this.requestedAnnotations)
		return;

	while(this.headForAnnotations < this.productionQueue.length){

		var kmerObject=this.productionQueue[this.headForAnnotations];

		this.headForAnnotations++;

		if(kmerObject in this.addedAnnotations){
			continue;
		}

/*
 * Fetch annotations
 */

		var parameters=new Object();
		parameters["map"]=this.dataStore.getMapIndex();
		parameters["sequence"]=kmerObject;
		parameters["count"]=this.dataStore.getDefaultDepth();

		var message=new Message(RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS,
			this,
			this.dataStore,
			parameters);

		this.dataStore.forwardMessageOnTheWeb(message);

// probe the other DNA strand too
		parameters["sequence"]=this.getReverseComplement(kmerObject);

		var message2=new Message(RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS,
			this,
			this.dataStore,
			parameters);

		this.dataStore.forwardMessageOnTheWeb(message2);

		this.requestedAnnotations=true;

		return true;
	}

	return false;
}

GraphOperator.prototype.getReverseComplement=function(sequence){
	var table=new Object();
	table["A"]="T";
	table["T"]="A";
	table["C"]="G";
	table["G"]="C";

	var output="";

	var i=sequence.length-1;

	while(i>=0){
		output+=table[sequence[i--]];
	}

	return output;
}

GraphOperator.prototype.receiveObject=function(kmerData){

	var addVertexFriends=false;

	var kmerObject=kmerData.getSequence();
	var parents=kmerData.getParents();
	var children=kmerData.getChildren();

	var vertex=this.graph.getVertex(kmerData.getSequence());

	if(kmerData.getCoverage()>=this.minimumCoverageAccepted){

		vertex=this.graph.addVertex(kmerData.getSequence());

		this.graph.addParents(kmerObject,parents);
		this.graph.addChildren(kmerObject,children);

		this.added[kmerObject]=true;
		addVertexFriends=!this.screen.isOutside(vertex,this.bufferForCommunicationOperations);

	}

	if(vertex!=null){
		if(kmerData.getCoverage()>=this.minimumCoverageAccepted){
			this.graph.addCoverage(kmerObject,kmerData.getCoverage());
		}else{
			vertex.disable();
		}
	}

	if(kmerData.getCoverage()<this.minimumCoverageAccepted){
		addVertexFriends=false;
	}
/*
 * Only add friends for stuff inside the screen...
 */
	if(addVertexFriends){

		for(var i=0;i<parents.length;i++)
			this.productionQueue.push(parents[i]);

		for(var i=0;i<children.length;i++)
			this.productionQueue.push(children[i]);
	}

	this.depth++;

	if(this.depth<this.objectsPerQuantum){
		this.pullObjects();
	}else{
		this.depth=0;
	}
}

GraphOperator.prototype.resetProductionQueue=function(){

	this.head=0;
	this.headForAnnotations=0;
	this.productionQueue=new Array();
}

GraphOperator.prototype.getKmerLength=function(){
	return this.dataStore.getKmerLength();
}

GraphOperator.prototype.getDataStore=function(){
	return this.dataStore;
}

GraphOperator.prototype.clear=function(){

/**
 * == TODO ==
 * This elements (added and addedAnnotations) will likely be large
 * at some point.
 */

	this.graph.clear();
	this.addedAnnotations=new Object();
	this.added=new Object();
	this.requestedAnnotations=false;
}

GraphOperator.prototype.setPathOperator=function(pathOperator){
	this.pathOperator=pathOperator;
}

GraphOperator.prototype.setMinimumCoverage=function(value){
	this.minimumCoverageAccepted=value;
}

GraphOperator.prototype.addPositionForVertex=function(sequence,position){

	this.positionsToAdd.push([sequence,position]);
}

GraphOperator.prototype.iterate=function(){

	this.pathOperator.doReadahead();

	//console.log("Iterate");

	var i=0;
	var hasSome=false;
	while(i<this.positionsToAdd.length){
		var vertex=this.graph.getVertex(this.positionsToAdd[i][0]);
		if(vertex!=null){
			hasSome=true;
			break;
		}

		i++;
	}

	if(!hasSome)
		return;

	var newArray=[];
	i=0;

	while(i<this.positionsToAdd.length){
		var sequence=this.positionsToAdd[i][0];
		var vertex=this.graph.getVertex(sequence);

		if(vertex!=null){
			var position=this.positionsToAdd[i][1];
			this.graph.addPosition(sequence,position+1);

		}else{
			newArray.push(this.positionsToAdd[i]);
		}

		i++;
	}

	this.positionsToAdd=newArray;
}
