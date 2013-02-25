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
function Region(mapIndex,mapName,sectionIndex,sectionName,regionIndex,regionName,locationIndex,locationName,color){

	this.regionName=regionName;
	this.pathColor=color;
}

Region.prototype.getColor=function(){
	return this.pathColor;
}

Region.prototype.getName=function(){
	return this.regionName;
}
