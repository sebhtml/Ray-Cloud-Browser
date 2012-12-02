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

var messageValue=0;
var RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE=messageValue++;
var RAY_MESSAGE_TAG_FIRST_KMER_JSON=messageValue++;
var RAY_MESSAGE_TAG_GET_KMER_LENGTH=messageValue++;
var RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY=messageValue++;
var RAY_MESSAGE_TAG_ADD_KMER=messageValue++;

/**
 * A message.
 */
function Message(tag,source,destination,content){
	this.tag=tag;
	this.source=source;
	this.destination=destination;
	this.content=content;
}

Message.prototype.getTag=function(){
	return this.tag;
}

Message.prototype.getSource=function(){
	return this.source;
}

Message.prototype.getDestination=function(){
	return this.destination;
}

Message.prototype.getContent=function(){
	return this.content;
}

