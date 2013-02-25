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
	regionLength,color){

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
