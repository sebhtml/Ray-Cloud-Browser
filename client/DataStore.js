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
 * The data store is the backend for data
 * retrieval.
 *
 * \author Sébastien Boisvert
 */
function DataStore(kmerLength){
	
	this.waiting=true;
	this.httpRequests=0;

	this.pullData();

	this.messageQueue=new MessageQueue();
}

DataStore.prototype.pullData=function(){
	var xmlHttp=null;

/*
 * This won't work with older browser, things before IE7.
 */
	if(window.XMLHttpRequest){
		xmlHttp=new XMLHttpRequest();
	}

	_this=this;
	xmlHttp.onreadystatechange=function(){
		if(xmlHttp.readyState==4){
			//alert(xmlHttp.responseText);
			var message=new Message(RAY_MESSAGE_TAG_FIRST_KMER_JSON,
						_this,
						_this,
						xmlHttp.responseText);
			_this.receiveMessage(message);
			_this.processMessages();
		}
	}

	xmlHttp.open("GET","start.json",true);
	xmlHttp.send(null);
	this.httpRequests++;
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
		if(this.waiting){
			this.receiveMessage(message);
			return;
		}

		var prefix=this.firstKmer;
		graphOperator=message.getSource();

		graphOperator.receiveFirstKmer(prefix);

	}else if(tag==RAY_MESSAGE_TAG_FIRST_KMER_JSON){
		var text=message.getContent();

		this.store=JSON.parse(text);
		this.finishConstruction();
		this.waiting=false;
	}
}

DataStore.prototype.getKmerInformation=function(kmerSequence,graphOperator){

/*
 * Send a request to the server.
 * TODO: to some readahead.
 */
	if(!(kmerSequence in this.store)){
 		var xmlHttp=null;

/*
 * This won't work with older browser, things before IE7.
 */
		if(window.XMLHttpRequest){
			xmlHttp=new XMLHttpRequest();
		}

		_this=this;
		xmlHttp.onreadystatechange=function(){
			if(xmlHttp.readyState==4){

				var kmerData=JSON.parse(xmlHttp.responseText);
				_this.store[kmerSequence]=kmerData[kmerSequence];
				
// do a fancy recursive call !

				_this.getKmerInformation(kmerSequence,graphOperator);
			}
		}

		var address="/cgi-bin/RayCloudBrowser.webServer.cgi?object="+kmerSequence;
		xmlHttp.open("GET",address,true);
		xmlHttp.send(null);
		this.httpRequests++;

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

