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

var messageValue=0;
var messageSymbols=new Object();
var RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE]="RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE";
var RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY]="RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY";
var RAY_MESSAGE_TAG_GET_KMER_LENGTH=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_LENGTH]="RAY_MESSAGE_TAG_GET_KMER_LENGTH";
var RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY]="RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY";
var RAY_MESSAGE_TAG_ADD_KMER=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_ADD_KMER]="RAY_MESSAGE_TAG_ADD_KMER";
var RAY_MESSAGE_TAG_GET_KMER_FROM_STORE=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]="RAY_MESSAGE_TAG_GET_KMER_FROM_STORE";
var RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY]="RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY";
var RAY_MESSAGE_TAG_GET_MAPS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS]="RAY_MESSAGE_TAG_GET_MAPS";
var RAY_MESSAGE_TAG_GET_MAPS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS_REPLY]="RAY_MESSAGE_TAG_GET_MAPS_REPLY";
var RAY_MESSAGE_TAG_GET_REGIONS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS]="RAY_MESSAGE_TAG_GET_REGIONS";
var RAY_MESSAGE_TAG_GET_REGIONS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS_REPLY]="RAY_MESSAGE_TAG_GET_REGIONS_REPLY";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]="RAY_MESSAGE_TAG_GET_MAP_INFORMATION";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY]="RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY";

var messageReplies=new Object();
messageReplies[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]=RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_REGIONS]=RAY_MESSAGE_TAG_GET_REGIONS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_MAPS]=RAY_MESSAGE_TAG_GET_MAPS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY;

/**
 * A message.
 *
 * \param tag the message type
 * \param source the source
 * \param destination the destination
 * \param content the content, can be anything, but usually a javascript Object instance
 *
 * \author Sébastien Boisvert
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

