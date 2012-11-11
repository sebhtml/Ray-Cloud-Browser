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

function GraphOperator(kmerLength){
	this.numberOfElements=2000;

	this.kmerLength=kmerLength;

	this.dataStore=new DataStore(this.kmerLength);
}

GraphOperator.prototype.createGraph=function(graph){

	var firstKmer=this.dataStore.getFirstKmer();

	var head=0;
	var added=new Object();
	var productionQueue=new Array();
	productionQueue.push(firstKmer);

	while(graph.getVertices().length<this.numberOfElements
		 && head < productionQueue.length){

		var kmerObject=productionQueue[head++];

		if(kmerObject in added)
			continue;

		var kmerData=this.dataStore.getKmerInformation(kmerObject);

		graph.addVertex(kmerData.getSequence());
		//console.log(kmerData.getChildren().length);

		graph.addParents(kmerData.getSequence(),kmerData.getParents());
		graph.addChildren(kmerData.getSequence(),kmerData.getChildren());

		graph.addCoverage(kmerData.getSequence(),kmerData.getCoverage());

		added[kmerObject]=true;

		for(var i=0;i<kmerData.getParents().length;i++)
			productionQueue.push(kmerData.getParents()[i]);

		for(var i=0;i<kmerData.getChildren().length;i++)
			productionQueue.push(kmerData.getChildren()[i]);
	}
}


