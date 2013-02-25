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
 * This class is the graph.
 *
 * \author Sébastien Boisvert
 */
function Graph(width,height){

	this.layout=new LayoutEngine();
	this.width=width;
	this.height=height;

	this.clear();
}

Graph.prototype.addVertex=function(sequence){

	if(sequence in this.index){
		return this.index[sequence];
	}

	var vertex1=new Vertex(sequence,true);
	this.vertices.push(vertex1);
	this.index[sequence]=vertex1;

	if(this.vertices.length == 1){
		this.layout.setPositionOfFirstObject(vertex1);
	}

	this.objectsWithoutCoverage[sequence]=true;

	return vertex1;
}

Graph.prototype.getVertex=function(sequence){

	if(sequence in this.index){
		return this.index[sequence];
	}

	return null;
}

Graph.prototype.addCoverage=function(sequence,coverage){

	if(sequence in this.objectsWithCoverage)
		return;

	var vertex1=this.addVertex(sequence);
	var coverageVertex=new Vertex(coverage,false);
	this.layout.applyGoodLayout(vertex1,coverageVertex);

	vertex1.addLinkedObject(coverageVertex);
	coverageVertex.addLinkedObject(vertex1);

	this.vertices.push(coverageVertex);

	this.objectsWithCoverage[sequence]=true;

	vertex1.addChild(coverageVertex);
	vertex1.setCoverageValue(coverage);

	delete this.objectsWithoutCoverage[sequence];
}

Graph.prototype.addPosition=function(sequence,position){

	var vertex1=this.addVertex(sequence);

	if(vertex1.hasAnnotation("position="+position)){
		return;
	}

	var positionVertex=new Vertex(position,false);
	positionVertex.setPositionType();
	this.layout.applyGoodLayout(vertex1,positionVertex);

	vertex1.addLinkedObject(positionVertex);
	positionVertex.addLinkedObject(vertex1);

	vertex1.addChild(positionVertex);
	this.vertices.push(positionVertex);

	vertex1.registerAnnotation("position="+position);
}

Graph.prototype.addParents=function(sequence,parents){

	if(sequence in this.objectsWithCoverage)
		return;

	for(var i=0;i<parents.length;i++){
		this.addArc(this.addVertex(parents[i]),this.addVertex(sequence));
	}
}

Graph.prototype.addChildren=function(sequence,children){

	if(sequence in this.objectsWithCoverage)
		return;

	for(var i=0;i<children.length;i++){
		this.addArc(this.addVertex(sequence),this.addVertex(children[i]));
	}
}

Graph.prototype.addArc=function(vertex1,vertex2){

	vertex1.addArc(vertex2);


	vertex1.addLinkedObject(vertex2);
	vertex2.addLinkedObject(vertex1);

	this.layout.applyGoodLayout(vertex1,vertex2);
}

Graph.prototype.getVertices=function(){
	return this.vertices;
}

Graph.prototype.getObjectsWithoutData=function(){
	return this.objectsWithoutCoverage;
}

Graph.prototype.clear=function(){
	this.vertices=new Array();
	this.index=new Object();

// TODO remove objectsWithCoverage, instead use this.vertices to store this information
	this.objectsWithCoverage=new Object();
	this.objectsWithoutCoverage=new Object();
}
