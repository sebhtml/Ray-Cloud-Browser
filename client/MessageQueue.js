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
 * A first-in first-out queue.
 *
 * \author Sébastien Boisvert
 */
function MessageQueue(){
	this.head=0;
	this.objects=new Array();
	this.minimumDirtySlotsForCollection=64;
}

MessageQueue.prototype.push=function(object){
	this.objects.push(object);
}

MessageQueue.prototype.pop=function(){
	if(this.head>=this.objects.length)
		return null;

	var object=this.objects[this.head++];

/* nothing to garbage-collect */
	if(this.head<this.minimumDirtySlotsForCollection)
		return object;

/* garbage collect the old stuff */
	var secondArray=new Array();
	while(this.head<this.objects.length){
		secondArray.push(this.objects[this.head++]);
	}
	this.objects=secondArray;

	return object;
}
