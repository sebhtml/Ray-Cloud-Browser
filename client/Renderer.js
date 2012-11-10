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

			this.drawArc(context,vertex.getX()-originX,vertex.getY()-originY,
				vertex2.getX()-originX,vertex2.getY()-originY,
				vertex2.getRadius());

		}
	}
}

Renderer.prototype.drawLine=function(context,ax,ay,bx,by){
	context.moveTo(ax,ay);
	context.lineTo(bx,by);
	context.stroke();
}

/*
 * ball 1                        ball 2
 *
 *  A               G   C          B
 *  .           |---|---|          .
 *                     /
 *                    /
 *                   /
 *                  .
 */
Renderer.prototype.drawArc=function(context,ax,ay,bx,by,radius){

	this.drawLine(context,ax,ay,bx,by);

	var arrowPartLength=5;
	var ab_x=bx-ax;
	var ab_y=by-ay;

	var ab_length=Math.sqrt(ab_x*ab_x+ab_y*ab_y);

/* G is a point, see above */


	var pointRatioForC=(ab_length-radius)/(0.0+ab_length);
	var cx=ax+pointRatioForC*ab_x;
	var cy=ay+pointRatioForC*ab_y;
	
	var pointRatio=(ab_length-radius-arrowPartLength)/(0.0+ab_length);
	var gx=ax+pointRatio*ab_x;
	var gy=ay+pointRatio*ab_y;

	var gc_x=cx-gx;
	var gc_y=cy-gy;

	var ge_x=gc_y;
	var ge_y=-gc_x;

	var gd_x=-gc_y;
	var gd_y=gc_x;

	var dx=gx+gd_x;
	var dy=gy+gd_y;
	var ex=gx+ge_x;
	var ey=gy+ge_y;

	this.drawLine(context,cx,cy,dx,dy);
	this.drawLine(context,cx,cy,ex,ey);
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

	if(x>=(width+buffer))
		return true;

	if(y<(0-buffer))
		return true;

	if(y>=(height+buffer))
		return true;

	return false;
}
