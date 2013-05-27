/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
 *  Copyright (C) 2013 Jean-François Erdelyi
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
 *
 * This class represents a view on a region.
 *
 * A region has:
 *
 * a map (name and index)
 * a section (name and index)
 * a region (name and index)
 * a location (name and index)
 *
 * \author Sébastien Boisvert
 */
function Region(mapIndex,mapName,sectionIndex,sectionName,regionIndex,regionName,locationIndex,locationName,
	regionLength,color) {

	this.distributionGraph = new Distribution();
	this.mapName=mapName;
	this.sectionName=sectionName;
	this.regionName=regionName;
	this.locationName=locationName;

	this.mapIndex=mapIndex;
	this.sectionIndex=sectionIndex;
	this.regionIndex=regionIndex;
	this.locationIndex=locationIndex;

	this.pathColor=color;
	this.regionLength=regionLength;

	this.lastLeft=0;
	this.lastRight=0;

	this.hasLeft=false;
	this.hasRight=false;

	this.pathPositions=new Object();
	this.vertexAtPosition=new Object();
}

Region.prototype.hasRightPosition=function(){
	return this.hasRight;
}

Region.prototype.hasLeftPosition=function(){
	return this.hasLeft;
}

Region.prototype.setRightPosition=function(value){
	this.lastRight=value;
	this.hasRight=true;
}

Region.prototype.getRightPosition=function(value){
	return this.lastRight;
}

Region.prototype.setLeftPosition=function(value){
	this.lastLeft=value;
	this.hasLeft=true;
}

Region.prototype.getLeftPosition=function(value){
	return this.lastLeft;
}

Region.prototype.getRegionLength=function(){
	return this.regionLength;
}

Region.prototype.getColor=function(){
	return this.pathColor;
}

Region.prototype.getName=function(){
	return this.regionName;
}

Region.prototype.getMapName=function(){
	return this.mapName;
}

Region.prototype.getSectionName=function(){
	return this.sectionName;
}

Region.prototype.getRegionName=function(){
	return this.regionName;
}

Region.prototype.getLocationName=function(){
	return this.locationIndex+1;
}

Region.prototype.getLocation=function(){
	return this.locationIndex;
}

Region.prototype.setLocation=function(value){
	this.locationIndex=value;
}

Region.prototype.next=function(){
	this.locationIndex++;

	if(this.locationIndex>=this.regionLength)
		this.locationIndex=this.regionLength-1;
}

Region.prototype.previous=function(){
	this.locationIndex--;
	if(this.locationIndex<0)
		this.locationIndex=0;
}

Region.prototype.getMap=function(){
	return this.mapIndex;
}

Region.prototype.getSection=function(){
	return this.sectionIndex;
}

Region.prototype.getRegion=function(){
	return this.regionIndex;
}

Region.prototype.isVertexInPath=function(vertex){

	if(vertex in this.pathPositions){

		return true;
	}

	return false;
}

Region.prototype.getVertexPosition=function(sequence){

	if(sequence in this.pathPositions){
		if(this.pathPositions[sequence].length==1){
			return this.pathPositions[sequence][0];
		}else{
// TODO show many coverages when there are many
			return this.pathPositions[sequence][0];
		}

	}

	return -1;
}

Region.prototype.getVertexPositions=function(sequence){

	if(sequence in this.pathPositions){
		return this.pathPositions[sequence];
	}

	return [];
}

Region.prototype.setCurrentVertex=function(sequence){

	if(sequence in this.pathPositions){

// TODO maybe returning the first is not actually the best best, who knows.
		this.setLocation(this.pathPositions[sequence][0]);
		this.hasLocation=true;

		return true;
	}

	return false;
}

Region.prototype.getPathPositions=function(){
	return this.pathPositions;
}

Region.prototype.getVertex=function(){
	var currentLocation=this.getLocation();

	return this.vertexAtPosition[currentLocation];
}

Region.prototype.addVertexAtPosition=function(position, sequence, coverage){
	this.vertexAtPosition[position] = sequence;
	this.distributionGraph.insert(coverage);
}

Region.prototype.hasVertex=function(){
	if(!(this.locationIndex<this.regionLength))
		return false;

	if(!(this.locationIndex>=0))
		return false;

	if(!(this.locationIndex in this.vertexAtPosition))
		return false;

	return true;
}

Region.prototype.getDistributionGraph = function() {
	return this.distributionGraph;
}

Region.prototype.print=function(){
	console.log("Current: "+this.locationIndex+" Left: "+this.lastLeft+" Right: "+this.lastRight);
	console.log("Geometry: ("+this.mapIndex+","+this.sectionIndex+","+this.regionIndex+","+this.locationIndex+")");
	console.log("Length: "+this.getRegionLength());
	console.log(" ---> "+this.getVertex());
}
