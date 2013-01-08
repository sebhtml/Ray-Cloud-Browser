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
 * The document in the browser.
 *
 * \author Sébastien Boisvert
 */
function WebDocument(){

	this.canvas=document.createElement("canvas");
	this.renderingCanvas=document.createElement("canvas");

	this.canvas.style.position="relative";

	var body=document.getElementsByTagName("body")[0];

	body.appendChild(this.canvas);

	var footer=document.createElement("div");

	var hrefLink=document.createElement("a");
	hrefLink.href="https://github.com/sebhtml/Ray-Cloud-Browser";
	var linkText=document.createTextNode("Ray Cloud Browser: interactively skim processed genomics data with energy");
	hrefLink.appendChild(linkText);

	var footerSmall=document.createElement("small");
	var controls=document.createTextNode(" controls: move: mouse or arrows, zoom: page down & page up ");
	var linkTextBottom=document.createTextNode("Copyright (C) 2012, 2013 Sébastien Boisvert, license: GPLv3");
	//footer.appendChild(document.createElement("br"));
	footerSmall.appendChild(hrefLink);
	footerSmall.appendChild(controls);
	footerSmall.appendChild(linkTextBottom);
	body.appendChild(footer);
	footer.appendChild(footerSmall);
}

WebDocument.prototype.getCanvas=function(){
	return this.canvas;
}

WebDocument.prototype.getRenderingCanvas=function(){
	return this.renderingCanvas;
}
