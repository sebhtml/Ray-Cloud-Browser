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

/**
 * The renderer draws objects in a canvas.
 *
 * \author Sébastien Boisvert
 */
function Renderer(screen){

	this.lineWidth=2;

	this.screen=screen;
	this.blitter=new Blitter();
	this.renderingBuffer=10;

/*
 * Enable the blitter for better graphics.
 */
	this.useBlitter=true;
}

Renderer.prototype.drawVertices=function(vertices){
	for(i in vertices){
		var vertex=vertices[i];

		if(this.screen.isOutside(vertex,this.renderingBuffer))
			continue;

		this.drawVertex(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
			this.screen.getZoomValue(),vertex);
	}
}

Renderer.prototype.drawArcs=function(vertices){

	var context=this.screen.getContext();
	context.lineWidth=this.lineWidth;

	// draw arcs
	for(i in vertices){
		var vertex=vertices[i];

		var arcs=vertex.getArcs();
		for(j in arcs){

			var vertex2=arcs[j];

			if(this.screen.isOutside(vertex,this.renderingBuffer)
				 && this.screen.isOutside(vertex2,this.renderingBuffer)){
				continue;
			}
	
			var originX=this.screen.getOriginX();
			var originY=this.screen.getOriginY();

			this.drawArc(context,vertex.getX()-originX,vertex.getY()-originY,
				vertex2.getX()-originX,vertex2.getY()-originY,
				this.screen.getZoomValue(),
				vertex2.getRadius());

		}
	}

/*
 * Only stroke once.
 * \see http://gamedev.stackexchange.com/questions/5314/how-does-one-optimize-an-html5-canvas-and-javascript-web-application-for-mobile
 * "In case of line drawing, combine as many lineTo commands before calling stroke."
 * --Petteri Hietavirta
 */
	context.stroke();
}

Renderer.prototype.drawLine=function(context,ax,ay,bx,by){
	context.moveTo(ax,ay);
	context.lineTo(bx,by);
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
Renderer.prototype.drawArc=function(context,ax,ay,bx,by,zoomValue,radius){

	this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by);

	var arrowPartLength=5;
	var ab_x=bx-ax;
	var ab_y=by-ay;

	var ab_length=Math.sqrt(ab_x*ab_x+ab_y*ab_y);
	//var ab_length=ab_x*ab_x+ab_y*ab_y;

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

	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*dx,zoomValue*dy);
	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*ex,zoomValue*ey);
}

Renderer.prototype.drawVertex=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<1 && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();
	var key=vertex.getLabel()+"-"+theColor+"-"+radius+"-"+this.lineWidth;

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

	if(this.blitter.hasBlit(key)){
		var blit=this.blitter.getBlit(key);

		var width=blit.getWidth();
		var height=blit.getHeight();

		//blit.print();

		context.drawImage(blit.getCanvas(),blit.getX(),blit.getY(),width,height,
			(x-width/2)*zoomValue,(y-height/2)*zoomValue,width*zoomValue,height*zoomValue);

		return;
	}
	
	var context2=context;

	if(this.useBlitter){
		var blit=this.blitter.allocateBlit(key,4+2*radius,4+2*radius);
		context2=blit.getCanvas().getContext("2d");
	}

	var cacheWidth=blit.getWidth();
	var blitX=blit.getX()+cacheWidth/2;
	var blitY=blit.getY()+cacheWidth/2;

	if(vertex.isColored()){
		context2.beginPath();
		context2.fillStyle = theColor;
		context2.strokeStyle = "rgb(0,0,0)";
		context2.lineWidth=this.lineWidth;
		context2.arc(blitX,blitY,radius, 0, Math.PI*2, true);
	
		context2.fill();
		context2.stroke();
		context2.closePath();
	}

	context2.fillStyle    = '#000000';
	context2.font         = 'bold 12px sans-serif';

	context2.fillText(vertex.getLabel(),blitX-radius/2,blitY+radius/2);

	//console.log("Drawed something.");

	if(this.useBlitter)
		this.drawVertex(context,originX,originY,zoomValue,vertex);
}


