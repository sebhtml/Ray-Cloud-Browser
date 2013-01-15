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

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

/**
 * The renderer draws objects in a canvas.
 *
 * \author Sébastien Boisvert
 */
function Renderer(screen){

	this.pathColor="rgb(80,80,255)";
	this.pathMultiplierForVertex=1.5;
	this.pathMultiplierForArc=3;
	this.zoomForLevelOfDetails=0.12;
	this.zoomForLevelOfDetailsForCoverage=0.5
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

	var zoomValue=this.screen.getZoomValue();

	if(zoomValue<=this.zoomForLevelOfDetails)
		return;

// draw selection
	var i=0;
	while(i<vertices.length){
		var vertex=vertices[i];

		if(this.screen.isOutside(vertex,this.renderingBuffer)){
			i++;
			continue;
		}

		this.drawVertex(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
			zoomValue,vertex);
		i++;
	}
}

/**
 * This gene was duplicated from Renderer.prototype.drawVertices.
 * The function of this gene changed over time.
 */
Renderer.prototype.drawPathVertices=function(vertices){

	var zoomValue=this.screen.getZoomValue();

	if(zoomValue<=this.zoomForLevelOfDetails)
		return;

// draw selection
	var i=0;

	while(i<vertices.length){
		var vertex=vertices[i];

		if(this.screen.isOutside(vertex,this.renderingBuffer)){
			i++;
			continue;
		}

		this.drawPathVertex(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
			zoomValue,vertex);
		i++;
	}

}

Renderer.prototype.drawArcs=function(vertices){

	var context=this.screen.getContext();
	context.lineWidth=this.lineWidth;

	var zoomValue=this.screen.getZoomValue();
	
	var fullDetails=true;

	if(zoomValue<=this.zoomForLevelOfDetails)
		fullDetails=false;

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

			var importantArc=false;

			if(vertex.isInPath() && vertex2.isInPath())
				importantArc=true;

			this.drawArc(context,vertex.getX()-originX,vertex.getY()-originY,
				vertex2.getX()-originX,vertex2.getY()-originY,
				this.screen.getZoomValue(),
				vertex2.getRadius(),fullDetails,importantArc);

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

Renderer.prototype.drawLine=function(context,ax,ay,bx,by,zoomValue,fullDetails,lineWidth,color){

	if(fullDetails)
		context.lineWidth=lineWidth*zoomValue;
	else
		context.lineWidth=lineWidth;

	context.strokeStyle=color;
	context.beginPath();
	context.moveTo(ax,ay);
	context.lineTo(bx,by);
	context.stroke();
	context.closePath();
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
Renderer.prototype.drawArc=function(context,ax,ay,bx,by,zoomValue,radius,fullDetails,importantArc){

	var lineWidth=this.lineWidth;
	var color='black';

	//var headWasCorrected=false;

/*
 * Calculate boundaries.
 *
 * y = m*x + z
 *
 * m = (by-ay) / (bx-xa)
 *
 * z = y - m*x
 */

/*
	var aIsOutside=this.screen.isPointOutside(ax,ay,10);
	var bIsOutside=this.screen.isPointOutside(bx,by,10);
	
	if(aIsOutside || bIsOutside){

		var m1=(by-ay);
		if((bx-ax)!=0)
			m1/=(bx-ax);

		var z1=ay-m1*ax;
		var m2=(bx-ax);

		if((by-ay)!=0)
			m2/=(by-ay);

		if(aIsOutside){
			if(ax<0){
				ax=0;
			}
			if(ax>=this.screen.getWidth()){
				ax=this.screen.getWidth()-1;
				ax/=this.screen.getZoomValue();
			}

			ay=m1*ax+z1;
		}

		if(bIsOutside){
			if(bx<0){
				bx=0;
			}
			if(bx>=this.screen.getWidth()){
				bx=this.screen.getWidth()-1;
				bx/=this.screen.getZoomValue();
			}

			by=m1*bx+z1;


			headWasCorrected=true;
		}
	}
*/

	if(importantArc){
		this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,
			lineWidth*this.pathMultiplierForArc,this.pathColor);
	}

// only draw the small line if it won't be done later on
	if(!importantArc)
		this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,lineWidth,color);

	//return;

	if(!fullDetails)
		return;

/*
	if(headWasCorrected)
		return;
*/

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

	if(importantArc){

// draw the 2 big lines
		this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,
			lineWidth*this.pathMultiplierForArc,this.pathColor);

		this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,
			lineWidth*this.pathMultiplierForArc,this.pathColor);

		this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,lineWidth,color);
	}

	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*dx,zoomValue*dy,zoomValue,fullDetails,lineWidth,color);
	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*ex,zoomValue*ey,zoomValue,fullDetails,lineWidth,color);
}

Renderer.prototype.drawVertex=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<=this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();
	var key=vertex.getLabel()+"-"+theColor+"-"+radius+"-"+this.lineWidth;

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

/*
	if(this.blitter.hasBlit(key)){
		var blit=this.blitter.getBlit(key);

		var width=blit.getWidth();
		var height=blit.getHeight();

		//blit.print();

		context.drawImage(blit.getCanvas(),blit.getX(),blit.getY(),width,height,
			(x-width/2)*zoomValue,(y-height/2)*zoomValue,width*zoomValue,height*zoomValue);

		return;
	}
*/

	//var context2=context;

/*
	if(this.useBlitter){
		var blit=this.blitter.allocateBlit(key,4+3*radius,4+3*radius);
		context2=blit.getCanvas().getContext("2d");
	}
*/

/*
	var cacheWidth=blit.getWidth();
	var blitX=blit.getX()+cacheWidth/2;
	var blitY=blit.getY()+cacheWidth/2;
*/


	if(vertex.isColored()){
		context.beginPath();
		context.fillStyle = theColor;
		context.strokeStyle = "rgb(0,0,0)";
		context.lineWidth=this.lineWidth*zoomValue;
		context.arc((x)*zoomValue,
				(y)*zoomValue,zoomValue*radius, 0, Math.PI*2, true);
	
		context.fill();
		context.stroke();
		context.closePath();
	}

	context.fillStyle    = '#000000';
	context.font         = 'bold '+Math.floor(12*zoomValue)+'px Arial';

	if(vertex.isColored()){
		context.fillText(vertex.getLabel(),(x-radius/2)*zoomValue,(y+radius/2)*zoomValue);
	}else{
		context.fillText(vertex.getLabel(),(x-radius)*zoomValue,(y+radius/2)*zoomValue);
	}

	//console.log("Drawed something.");

/*
	if(this.useBlitter)
		this.drawVertex(context,originX,originY,zoomValue,vertex);
*/
}

Renderer.prototype.drawPathVertex=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<=this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();
	var key=vertex.getLabel()+"-"+theColor+"-"+radius+"-"+this.lineWidth;

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

/*
	if(this.blitter.hasBlit(key)){
		var blit=this.blitter.getBlit(key);

		var width=blit.getWidth();
		var height=blit.getHeight();

		//blit.print();

		context.drawImage(blit.getCanvas(),blit.getX(),blit.getY(),width,height,
			(x-width/2)*zoomValue,(y-height/2)*zoomValue,width*zoomValue,height*zoomValue);

		return;
	}
*/

	//3var context2=context;

/*
	if(this.useBlitter){
		var blit=this.blitter.allocateBlit(key,4+3*radius,4+3*radius);
		context2=blit.getCanvas().getContext("2d");
	}
*/

/*
	var cacheWidth=blit.getWidth();
	var blitX=blit.getX()+cacheWidth/2;
	var blitY=blit.getY()+cacheWidth/2;
*/

	if(vertex.isInPath()){

		context.beginPath();
		context.fillStyle = this.pathColor;
		context.strokeStyle = "rgb(0,0,0)";
		context.lineWidth=this.lineWidth*zoomValue;
		context.arc((x)*zoomValue,
				(y)*zoomValue,this.pathMultiplierForVertex*zoomValue*radius, 0, Math.PI*2, true);

		context.fill();
		//context.stroke();
		context.closePath();
	}
}
