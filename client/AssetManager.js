/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013  Sébastien Boisvert
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

function AssetManager() {
	this.cache = new Object();
	this.assetNames = new Array();
	this.pending = 0;

	this.debug = false;
}

AssetManager.prototype.streamContent = function(asset) {

	this.assetNames.push(asset);

	var address = asset.replace(".", "/") + ".js";
	var method = "GET";

	var xmlHttpRequest = null;

	if(window.XMLHttpRequest){
		xmlHttpRequest=new XMLHttpRequest();
	}

	var runInTheBackground = false;

	xmlHttpRequest.open(method, address, runInTheBackground);
	xmlHttpRequest.send();

	this.pending ++;

	if(this.debug)
		console.log("Requesting asset " + asset);

	//if(xmlHttpRequest.status == 200) {

	var thisIsMe = this;

	if(runInTheBackground) {
		xmlHttpRequest.onreadystatechange=function(){
			if(xmlHttpRequest.readyState==4){

				var content = xmlHttpRequest.responseText;
				thisIsMe.cache[asset] = content;

				if(this.debug)
					console.log("Received asset " + asset);

				thisIsMe.pending --;
			}
		}
	} else {

		var content = xmlHttpRequest.responseText;
		thisIsMe.cache[asset] = content;

		if(this.debug)
			console.log("Received asset " + asset);

		thisIsMe.pending --;
	}
}

AssetManager.prototype.installContent = function() {

	var thisIsMe = this;

	function handlerForInstallation() {
		thisIsMe.installContent();
	}

	while(this.pending) {

		if(this.debug)
			console.log("Pending: " + this.pending);

		setTimeout(handlerForInstallation, 5);
		return;
	}

	if(this.debug) {
		console.log("Pending: " + this.pending);
		console.log("[AssetManager] installing " + this.assetNames.length + " assets");
	}

	var i = 0;

	var code = "";
	var numberOfAssets = this.assetNames.length;

	while(i < numberOfAssets) {
		var asset = this.assetNames[i];
		var content = this.cache[asset];
		code += content;

		if(this.debug)
			console.log("[AssetManager] processing asset " + asset + ", " + content.length + " characters");

		i ++;
	}

	this.cache = new Object();
	this.assetNames = new Array();

	if(this.debug)
		console.log("[AssetManager] installing code, " + code.length + " characters");

	eval(code);

	if(this.debug)
		console.log("[AssetManager] installed " + numberOfAssets + " assets");
}

