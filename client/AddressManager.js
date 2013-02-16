/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013 Sébastien Boisvert
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

function AddressManager(address){
	this.address=address;

	this.getTokenValue("map");
	this.getTokenValue("section");
}

AddressManager.prototype.remoteQueryString=function(){
	var i=0;
	while(i<this.address.length){
		if(this.address[i]=='?')
			break;
		i++;
	}

	var newAddress=this.address.substring(0,i);
}

AddressManager.prototype.getTokenValue=function(name){
	var start=0;
	while(start<this.address.length){
		start++;

		if(this.address[start]=='?')
			break;
	}

	var content=this.address.substring(start);

	//console.log("QUERY_STRING= "+content);

	token=name+"=";
	start=content.search(token);

	if(start==-1)
		return null;

	start+=token.length;

	var end=start;

	while(end<content.length){
		if(content[end]=='&')
			break;

		end++;
	}

	//console.log("Start= "+start+" End= "+end);

	var value=content.substring(start,end);

	//console.log("Key= <"+name+"> Value= <"+value+">");

	return value;
}

AddressManager.prototype.hasToken=function(name){
	return this.getTokenValue(name)!=null;
}

AddressManager.prototype.getTokenValueAsInteger=function(name){
	return parseInt(this.getTokenValue(name));
}
