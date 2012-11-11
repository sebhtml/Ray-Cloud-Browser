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

function Graph(width,height){

	this.vertices=new Array();
	this.width=width;
	this.height=height;

	this.nextX=60;
	this.nextY=60;
}

Graph.prototype.addVertex=function(sequence,coverage){

	var vertex1=new Vertex(this.getNextX(),this.getNextY(),sequence,true);
	var coverage=new Vertex(this.getNextX(),this.getNextY()+40,"99",false);
	this.nextPlace();
	vertex1.addLinkedObject(coverage);
	coverage.addLinkedObject(vertex1);

	this.vertices.push(vertex1);
	this.vertices.push(coverage);

	return vertex1;
}

Graph.prototype.getNextX=function(){
	return this.nextX;
}

Graph.prototype.getNextY=function(){
	return this.nextY;
}

Graph.prototype.nextPlace=function(){
	var stepping=120;
	this.nextX+=stepping;
	if(this.nextX>=this.width){
		this.nextY+=stepping;
		this.nextX=stepping;
	}
}

Graph.prototype.addArc=function(vertex1,vertex2){

	vertex1.addArc(vertex2);

	vertex1.addLinkedObject(vertex2);
	vertex2.addLinkedObject(vertex1);
}

Graph.prototype.getVertices=function(){
	return this.vertices;
}

