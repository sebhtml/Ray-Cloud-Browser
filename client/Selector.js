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

function Selector(x,y){

	var width=240;
	var height=280;

	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;


}

Selector.prototype.draw=function(context){

	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height );
	context.fillStyle = '#FFF8F9';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

}

Selector.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	return false;
}

Selector.prototype.handleMouseMove=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	return false;
}

Selector.prototype.handleMouseUp=function(x,y){

}

Selector.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;

}
