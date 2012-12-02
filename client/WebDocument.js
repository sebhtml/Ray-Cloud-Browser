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

function WebDocument(){

	this.canvas=document.createElement("canvas");
	this.renderingCanvas=document.createElement("canvas");

	this.canvas.style.position="relative";

	var link=document.createElement("div");
	var hrefLink=document.createElement("a");
	hrefLink.href="https://github.com/sebhtml/Ray-Cloud-Browser";
	var linkText=document.createTextNode("Ray Cloud Browser: interactively skim processed genomics data with energy (DEBUG BUILD)");
	hrefLink.appendChild(linkText);
	link.appendChild(hrefLink);

	var body=document.getElementsByTagName("body")[0];
	body.appendChild(link);
	var center=document.createElement("center");
	center.appendChild(this.canvas);

	body.appendChild(center);

	var footer=document.createElement("div");
	var controls=document.createTextNode("Controls: move with mouse or arrows, zoom with page down & page up.");
	var linkTextBottom=document.createTextNode("This project is Copyright (C) 2012 Sébastien Boisvert and distributed under the GNU General Public License, version 3.");
	footer.appendChild(controls);
	footer.appendChild(document.createElement("br"));
	footer.appendChild(linkTextBottom);
	body.appendChild(footer);
}

WebDocument.prototype.getCanvas=function(){
	return this.canvas;
}

WebDocument.prototype.getRenderingCanvas=function(){
	return this.renderingCanvas;
}
