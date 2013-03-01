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

	this.pathMultiplierForVertex=1.5;
	this.pathMultiplierForArc=3;
	this.zoomForLevelOfDetails=0.12;
	this.zoomForLevelOfDetailsForCoverage=0.5
	this.lineWidth=2;

	this.screen=screen;
	this.blitter=new Blitter();
	this.renderingBuffer=10;
	this.extraMultiplier=3;

/*
 * Enable the blitter for better graphics.
 */
	this.useBlitter=false;
}

Renderer.prototype.setPathOperator=function(value){
	this.pathOperator=value;
}

Renderer.prototype.drawVertices=function(vertices){

	var zoomValue=this.screen.getZoomValue();

	if(zoomValue<=this.zoomForLevelOfDetails)
		return;

// draw selection
	var i=0;
	while(i<vertices.length){
		var vertex=vertices[i];

		if(vertex.isEnabled()
			&& !this.screen.isOutside(vertex,this.renderingBuffer)){

			this.drawVertex(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
				zoomValue,vertex);
		}

		i++;
	}
}

Renderer.prototype.drawVertexPowers=function(vertices){

	var zoomValue=this.screen.getZoomValue();

	if(zoomValue<=this.zoomForLevelOfDetails)
		return;

// draw selection
	var i=0;
	while(i<vertices.length){
		var vertex=vertices[i];

		if(vertex.isEnabled()
			&& !this.screen.isOutside(vertex,this.renderingBuffer)){

			this.drawVertexPower(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
				zoomValue,vertex);
		}

		i++;
	}
}

Renderer.prototype.drawPaths=function(vertices){

	var context=this.screen.getContext();
	context.lineWidth=this.lineWidth;

	var zoomValue=this.screen.getZoomValue();

	var fullDetails=true;

	if(zoomValue<=this.zoomForLevelOfDetails)
		fullDetails=false;

	// draw arcs
	for(var i in vertices){
		var vertex=vertices[i];

		if(!vertex.isEnabled())
			continue;

		this.drawPathVertex(this.screen.getContext(),this.screen.getOriginX(),this.screen.getOriginY(),
			zoomValue,vertex);

		var arcs=vertex.getArcs();
		for(var j in arcs){

			var vertex2=arcs[j];

			if(this.screen.isOutside(vertex,this.renderingBuffer)
				 && this.screen.isOutside(vertex2,this.renderingBuffer)){
				continue;
			}

			if(!vertex2.isEnabled())
				continue;

			var originX=this.screen.getOriginX();
			var originY=this.screen.getOriginY();

			var colors1=this.pathOperator.getColorsForPair(vertex,vertex2);

			var extra=(colors1.length-1)*this.extraMultiplier;

			var k=0;

			while(k<colors1.length){
				this.drawPathArc(context,vertex.getX()-originX,vertex.getY()-originY,
					vertex2.getX()-originX,vertex2.getY()-originY,
					this.screen.getZoomValue(),
					vertex2.getRadius(),fullDetails,colors1[k],extra);

				extra-=this.extraMultiplier;

				k++;
			}
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

Renderer.prototype.drawArcs=function(vertices){

	var context=this.screen.getContext();
	context.lineWidth=this.lineWidth;

	var zoomValue=this.screen.getZoomValue();

	var fullDetails=true;

	if(zoomValue<=this.zoomForLevelOfDetails)
		fullDetails=false;

	// draw arcs
	for(var i in vertices){
		var vertex=vertices[i];

		if(!vertex.isEnabled())
			continue;

		var arcs=vertex.getArcs();
		for(var j in arcs){

			var vertex2=arcs[j];

			if(this.screen.isOutside(vertex,this.renderingBuffer)
				 && this.screen.isOutside(vertex2,this.renderingBuffer)){
				continue;
			}

			if(!vertex2.isEnabled())
				continue;

			var originX=this.screen.getOriginX();
			var originY=this.screen.getOriginY();

			var importantArc=false;

			if(vertex.isInPath() && vertex2.isInPath())
				importantArc=true;

			this.drawArc(context,vertex.getX()-originX,vertex.getY()-originY,
				vertex2.getX()-originX,vertex2.getY()-originY,
				this.screen.getZoomValue(),
				vertex2.getRadius(),fullDetails);
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

	context.lineWidth=lineWidth*zoomValue;

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
Renderer.prototype.drawArc=function(context,ax,ay,bx,by,zoomValue,radius,fullDetails){

	var lineWidth=this.lineWidth;
	var color='black';

// only draw the small line if it won't be done later on
	this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,lineWidth,color);

	if(!fullDetails)
		return;

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

	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*dx,zoomValue*dy,zoomValue,fullDetails,lineWidth,color);
	this.drawLine(context,zoomValue*cx,zoomValue*cy,zoomValue*ex,zoomValue*ey,zoomValue,fullDetails,lineWidth,color);
}

Renderer.prototype.drawPathArc=function(context,ax,ay,bx,by,zoomValue,radius,fullDetails,pathColor,extra){

	var lineWidth=(this.lineWidth+extra)*this.pathMultiplierForArc;

	this.drawLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue,fullDetails,
		lineWidth,pathColor);
}

Renderer.prototype.drawVertexPower=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<=this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

	var power=vertex.getPower();
	if(power>0){
		context.beginPath();
		context.fillStyle = "rgb(255,40,40)";
		context.strokeStyle = "rgb(0,0,0)";
		context.lineWidth=this.lineWidth*zoomValue;
		context.arc((x)*zoomValue,
				(y)*zoomValue,zoomValue*radius*power, 0, Math.PI*2, true);

		context.fill();
		context.stroke();
		context.closePath();
	}
}

Renderer.prototype.drawVertex=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<=this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

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
		context.fillStyle="black";
		context.fillText(vertex.getLabel(),(x-radius/2)*zoomValue,(y+radius/2)*zoomValue);

	//}else if(vertex.isPositionVertex()){
/**
 * TODO: use the color of the path.
 */
/*
		var pathColor="#000000";
		context.fillStyle=pathColor;
		context.fillText(vertex.getLabel(),(x-radius)*zoomValue,(y+radius/2)*zoomValue);
*/
	}else{
		context.fillStyle="black";
		context.fillText(vertex.getLabel(),(x-radius)*zoomValue,(y+radius/2)*zoomValue);
	}
}

Renderer.prototype.drawPathVertex=function(context,originX,originY,zoomValue,vertex){

	if(zoomValue<=this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var radius=vertex.getRadius();
	var theColor= vertex.getColor();
	var key=vertex.getLabel()+"-"+theColor+"-"+radius+"-"+this.lineWidth;

	var x=vertex.getX()-originX;
	var y=vertex.getY()-originY;

	var colors=this.pathOperator.getColors(vertex);

	if(colors.length==0)
		return;

	var i=0;

	var extra=(colors.length-1)*this.extraMultiplier;

	while(i<colors.length){

		var pathColor=colors[i];

		context.beginPath();
		context.fillStyle = pathColor;
		context.strokeStyle = "rgb(0,0,0)";
		context.lineWidth=(this.lineWidth+extra)*zoomValue;
		context.arc((x)*zoomValue,
				(y)*zoomValue,this.pathMultiplierForVertex*zoomValue*(radius+extra), 0, Math.PI*2, true);

		context.fill();
		context.closePath();

		i++;
		extra-=this.extraMultiplier;
	}
}

Renderer.prototype.draw=function(objects){
	this.drawVertexPowers(objects);

	this.drawPaths(objects);

	this.drawArcs(objects);
	this.drawVertices(objects);
}
