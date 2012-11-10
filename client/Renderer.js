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

function Renderer(screen){
	this.screen=screen;
}

Renderer.prototype.drawVertices=function(vertices){
	for(i in vertices){
		var vertex=vertices[i];

		if(this.isOutside(vertex))
			continue;

		vertex.draw(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY());
	}
}

Renderer.prototype.drawArcs=function(vertices){
	// draw arcs
	for(i in vertices){
		var vertex=vertices[i];

		var arcs=vertex.getArcs();
		for(j in arcs){

			var vertex2=arcs[j];

			if(this.isOutside(vertex) && this.isOutside(vertex2))
				continue;
	
			var context=this.screen.getContext();
			var originX=this.screen.getOriginX();
			var originY=this.screen.getOriginY();

			context.moveTo(vertex.getX()-originX,vertex.getY()-originY);
			context.lineTo(vertex2.getX()-originX,vertex2.getY()-originY);
			context.stroke();
		}
	}
}

Renderer.prototype.isOutside=function(vertex){

	var x=vertex.getX()-this.screen.getOriginX();
	var y=vertex.getY()-this.screen.getOriginY();

	var width=this.screen.getWidth();
	var height=this.screen.getHeight();

/*
 * The buffer region around the screen.
 */
	var buffer=50;

	if(x<(0-buffer))
		return true;

	return false;
}
