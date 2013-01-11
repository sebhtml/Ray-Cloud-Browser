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
 * The data store is the backend for data
 * retrieval.
 *
 * This is the only class allowed to send HTTP GET requests.
 *
 * \author Sébastien Boisvert
 */
function DataStore(kmerLength){

	this.firstKmerReceived=false;
	this.pendingRequests=0;

	this.store=new Object();

	this.defaultDepthFirst=32;
	this.defaultDepth=512;
	this.maximumParallelQueries=8;
	this.activeQueries=0;
	this.httpRequests=0;

	this.pullData();

	this.messageQueue=new MessageQueue();
}

/**
 *
 * This send a message on the web.
 * The source is obviously this.
 * This is the only place that uses JSON and XMLHttpRequest.
 *
 * \param messageTag message tag
 * \param source local source
 * \param destination local destination
 * \param content array of arguments
 * \param replyTag reply tag to the message tag
 *
 */
DataStore.prototype.sendMessageOnTheWeb=function(messageTag,source,destination,content,replyTag){

	var xmlHttp=null;

/*
 * This won't work with older browser, things before IE7.
 */
	if(window.XMLHttpRequest){
		xmlHttp=new XMLHttpRequest();
	}

	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){

			var content=JSON.parse(xmlHttp.responseText);

			//alert(xmlHttp.responseText);
			var message=new Message(replyTag,
						source,
						destination,
						content);

			source.pendingRequests--;

			//console.log("[DataStore::sendMessageOnTheWeb] received response PendingRequests: "+source.pendingRequests+" Tag: "+messageSymbols[replyTag]);
			destination.receiveMessageFromTheWeb(message);
		}
	}

	var cgiProgram=CONFIG_WEB_SERVER+"RayCloudBrowser.webServer.cgi";
	
	var processed=new Object();

	var queryString="tag="+messageSymbols[messageTag];
	processed["tag"]=true;

	for(var key in content){

		if(key in processed)
			continue;

		queryString+="&"+key+"="+content[key];

		processed[key]=true;
	}

	var method="GET";

	var address=cgiProgram+"?"+queryString;

	xmlHttp.open(method,address,true);
	xmlHttp.send();

	this.pendingRequests++;
	//console.log("[DataStore::sendMessageOnTheWeb] PendingRequests: "+this.pendingRequests+" GET "+address);

	this.httpRequests++;

}

DataStore.prototype.receiveMessageFromTheWeb=function(message){

	this.receiveAndProcessMessage(message);
}

DataStore.prototype.pullData=function(){

	var body=new Object();
	body["depth"]=this.defaultDepthFirst;

	var tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE;

	this.sendMessageOnTheWeb(tag,
		this,this,body,messageReplies[tag]);
}

DataStore.prototype.finishConstruction=function(){

	this.graphFiles=new Array();
	this.sequenceFiles=new Array();

	this.graphFiles.push("mock-kmers.txt");
	this.sequenceFiles.push("mock-Contigs.fasta");

	for(key in this.store){
		this.firstKmer=key;
		break;
	}

/*
 * Pick up a starting key.
 */
	for(key in this.store){
		var entry=this.store[key];

		if(entry["parents"].length>=1 && entry["children"].length >=1 && entry["coverage"]>=10){
			this.firstKmer=key;
			break;
		}
	}
	
	this.kmerLength=this.firstKmer.length;
}

DataStore.prototype.getSequenceFiles=function(){
	return this.sequenceFiles;
}

DataStore.prototype.getKmerLength=function(){
	return this.kmerLength;
}

DataStore.prototype.getGraphFiles=function(){
	return this.graphFiles;
}

DataStore.prototype.receiveMessage=function(message){

	this.messageQueue.push(message);
}

DataStore.prototype.processMessages=function(){
	var message=this.messageQueue.pop();

	while(message!=null){
		this.processMessage(message);
		message=this.messageQueue.pop();
	}
}

DataStore.prototype.processMessage=function(message){
	var tag=message.getTag();

	//console.log("Message tag: "+tag);

	if(tag==RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE){
	
/* message ordering stuff */
		if(!this.firstKmerReceived){
			this.receiveMessage(message);

			this.firstKmerReceived=true;
			return;
		}

		var prefix=this.firstKmer;
		graphOperator=message.getSource();

		graphOperator.receiveFirstKmer(prefix);

	}else if(tag==RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY){
		var text=message.getContent();

		this.addDataInStore(text["vertices"]);

		this.finishConstruction();
	}else if(tag==RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY){

		var text=message.getContent();

		this.addDataInStore(text["vertices"]);

		var kmerSequence=text["object"];
// do a fancy recursive call !

		this.getKmerInformation(kmerSequence,this.graphOperator);
		this.activeQueries--;

	}else if(tag==RAY_MESSAGE_TAG_GET_MAPS){

		//console.log("[DataStore] received RAY_MESSAGE_TAG_GET_MAPS");

		var parameters=new Object();

		this.sendMessageOnTheWeb(tag,
			this,message.getSource(),parameters,messageReplies[tag]);

	}else if(tag==RAY_MESSAGE_TAG_GET_REGIONS){

		this.sendMessageOnTheWeb(tag,
			this,message.getSource(),message.getContent(),messageReplies[tag]);

	}else if(tag==RAY_MESSAGE_TAG_GET_MAP_INFORMATION){

		this.sendMessageOnTheWeb(tag,
			this,message.getSource(),message.getContent(),messageReplies[tag]);
	}
}

DataStore.prototype.getKmerInformation=function(kmerSequence,graphOperator){

// TODO: this should be done only once
	this.graphOperator=graphOperator;

/*
 * Send a request to the server.
 * TODO: to some readahead.
 */
	if(!(kmerSequence in this.store)){

/*
 * We don't answer queries when we are waiting.
 */
		if(this.activeQueries==this.maximumParallelQueries){
			return;
		}

		var parameters=new Object();
		parameters["map"]="kmers.txt.dat";
		parameters["object"]=kmerSequence;
		parameters["depth"]=this.defaultDepth;

		var tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE;

		this.sendMessageOnTheWeb(tag,
			this,this,parameters,messageReplies[tag]);

		this.activeQueries++;

		return;
	}

	var coverage=0;
	var parents=new Array();
	var children=new Array();

	if(kmerSequence in this.store){
		coverage=this.store[kmerSequence]["coverage"];

		for(var index in this.store[kmerSequence]["parents"]){
			var symbol=this.store[kmerSequence]["parents"][index];
			var otherSequence=symbol+kmerSequence.substr(0,this.kmerLength-1);
			parents.push(otherSequence);
		}

		for(var index in this.store[kmerSequence]["children"]){
			var symbol=this.store[kmerSequence]["children"][index];
			var otherSequence=kmerSequence.substr(1,this.kmerLength-1)+symbol;
			children.push(otherSequence);
		}
	}

	var kmer=new Kmer(kmerSequence,coverage,parents,children);

	var message=new Message(RAY_MESSAGE_TAG_ADD_KMER,this,graphOperator,kmer);
	graphOperator.receiveMessage(message);
}

DataStore.prototype.getHTTPRequests=function(){
	return this.httpRequests;
}

DataStore.prototype.addDataInStore=function(kmerData){

	for(var kmerSequenceIterator in kmerData){
		if(kmerSequenceIterator in this.store)
			continue;

		this.store[kmerSequenceIterator]=kmerData[kmerSequenceIterator];
	}

}

DataStore.prototype.receiveAndProcessMessage=function(message){

	//console.log("[DataStore::receiveAndProcessMessage] Tag: "+messageSymbols[message.getTag()]);

	//this.processMessage(message);
	this.receiveMessage(message);
	this.processMessages();
}

DataStore.prototype.hasPendingQueries=function(){
	return this.pendingRequests>0;
}
