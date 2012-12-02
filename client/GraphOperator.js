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
 * The operator operates the graph. It is responsible
 * for adding and removing vertices.
 *
 * It uses the data store for obtaining information.
 * Everything is event-driven.
 *
 * \author Sébastien Boisvert
 */
function GraphOperator(){

	this.dataStore=new DataStore();

	this.resetProductionQueue();

	this.depth=0;

	this.objectsPerQuantum=8;
}

GraphOperator.prototype.createGraph=function(graph){

	this.graph=graph;
	var message=new Message(RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE,
				this,
				this.dataStore,
				null);

	this.dataStore.receiveMessage(message);
}

GraphOperator.prototype.receiveFirstKmer=function(firstKmer){
	this.productionQueue.push(firstKmer);
}

GraphOperator.prototype.pullObjects=function(){

	while(this.head < this.productionQueue.length){

		var kmerObject=this.productionQueue[this.head++];

		if(kmerObject in this.added){
			continue;
		}

/*
 * Only fetch one object everytime.
 */
		this.dataStore.getKmerInformation(kmerObject,this);
		return;
	}

	this.resetProductionQueue();
}

GraphOperator.prototype.receiveObject=function(kmerData){

	var vertex=this.graph.addVertex(kmerData.getSequence());

	var kmerObject=kmerData.getSequence();
	var parents=kmerData.getParents();
	this.graph.addParents(kmerObject,parents);
	var children=kmerData.getChildren();
	this.graph.addChildren(kmerObject,children);

	this.graph.addCoverage(kmerObject,kmerData.getCoverage());

	this.added[kmerObject]=true;

	for(var i=0;i<parents.length;i++)
		this.productionQueue.push(parents[i]);

	for(var i=0;i<children.length;i++)
		this.productionQueue.push(children[i]);

	this.depth++;

	if(this.depth<this.objectsPerQuantum){
		this.pullObjects();
	}else{
		this.depth=0;
	}
}

GraphOperator.prototype.resetProductionQueue=function(){

	this.added=new Object();
	this.head=0;
	this.productionQueue=new Array();
}

GraphOperator.prototype.getKmerLength=function(){
	return this.dataStore.getKmerLength();
}


