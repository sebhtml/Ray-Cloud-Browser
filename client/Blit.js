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

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

function Blit(x,y,width,height,canvas){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.canvas=canvas;
}

Blit.prototype.getX=function(){
	return this.x;
}

Blit.prototype.getY=function(){
	return this.y;
}

Blit.prototype.getWidth=function(){
	return this.width;
}

Blit.prototype.getHeight=function(){
	return this.height;
}

Blit.prototype.getCanvas=function(){
	return this.canvas;
}

Blit.prototype.print=function(){
	console.log("x "+this.x+" y "+this.y+" width "+this.width+" height "+this.height," canvas "+this.canvas.width+" "+this.canvas.height);
}
