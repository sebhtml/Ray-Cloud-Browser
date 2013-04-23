/**
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

var RENDERER_LINE = 0;
var RENDERER_CIRCLE = 1;
var RENDERER_TEXT = 2

/**
 * The renderer draws objects in a canvas.
 *
 * \author Sébastien Boisvert
 */
function Renderer(screen){
	this.pathMultiplierForVertex=1.5;
	this.pathMultiplierForArc=2;
	this.zoomForLevelOfDetails=0.12;
	this.zoomForLevelOfDetailsForCoverage=0.5
	this.lineWidth=2;
	this.lineWidthForPath=5;

	this.screen=screen;
	this.blitter=new Blitter();
	this.renderingBuffer=100;
	this.extraMultiplier=5;
	this.pathMultiplierMacro=8;

/*
 * Enable the blitter for better graphics.
 */
	this.useBlitter=false;

	this.bufferedOperations=new Object();
}

Renderer.prototype.setPathOperator=function(value){
	this.pathOperator=value;
}

Renderer.prototype.drawVertices = function(vertices){

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

		if(this.screen.isOutside(vertex,this.renderingBuffer))
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

			while(k<colors1.length && fullDetails){
				var layer = -(colors1.length-k-1);
				this.drawPathArc(context,vertex.getX()-originX,vertex.getY()-originY,
					vertex2.getX()-originX,vertex2.getY()-originY,
					this.screen.getZoomValue(),
					vertex2.getRadius(),fullDetails,colors1[k],extra,layer);

				extra-=this.extraMultiplier;

				k++;
			}
		}
	}
}

Renderer.prototype.drawBufferedOperations=function(context){
	var keysLayer = new Array();

	for(var key in this.bufferedOperations) {
		keysLayer.push(parseInt(key, 10));
	}

	keysLayer.sort(function(a, b){return a - b;});

	for(var i = 0; i < keysLayer.length; i++) {
		var layer = keysLayer[i];
		for(var materialType in this.bufferedOperations[layer]) {
			var operations = this.bufferedOperations[layer][materialType];
			var j = 0;
			var material = operations[0].getMaterial();

			material.startRendering(context);
			while(j < operations.length) {
				var operation = operations[j++];
				if(operation.getType() == RENDERER_LINE) {
					operation.drawLine(context);
				} else if(operation.getType() == RENDERER_CIRCLE) {
					operation.drawCircle(context);
				} else if(operation.getType() == RENDERER_TEXT) {
					operation.drawText(context);
				}
			}
			material.stopRendering(context);
		}
	}
	this.bufferedOperations=new Object();
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
}

Renderer.prototype.drawBufferedLine = function(context, ax, ay, bx, by, lineWidth, color, layer) {
	if(!(layer in this.bufferedOperations)) {
		this.bufferedOperations[layer] = new Object();
	}

	var material = new Material(color, lineWidth, "", "", "");
	var materialKey = material.toString();

	if(!(materialKey in this.bufferedOperations[layer])) {
		this.bufferedOperations[layer][materialKey] = new Array();
	}

	this.bufferedOperations[layer][materialKey].push(new RenderedLine(new Point(ax, ay), new Point(bx, by), material));
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
	var color = 'black';
	var layer = 10;
// only draw the small line if it won't be done later on
	this.drawBufferedLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,zoomValue*lineWidth,color, layer);
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

	this.drawBufferedLine(context,zoomValue*cx,zoomValue*cy,zoomValue*dx,zoomValue*dy,zoomValue*lineWidth,color, layer);
	this.drawBufferedLine(context,zoomValue*cx,zoomValue*cy,zoomValue*ex,zoomValue*ey,zoomValue*lineWidth,color, layer);
}

Renderer.prototype.drawPathArc=function(context,ax,ay,bx,by,zoomValue,radius,fullDetails,pathColor,extra,layer){

	var lineWidth=(this.lineWidthForPath+extra)*this.pathMultiplierForArc;

	this.drawBufferedLine(context,zoomValue*ax,zoomValue*ay,zoomValue*bx,zoomValue*by,
		lineWidth*zoomValue,pathColor,layer);
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
		context.closePath();
	}
}

Renderer.prototype.drawVertex = function(context, originX, originY, zoomValue, vertex){

	if(zoomValue <= this.zoomForLevelOfDetailsForCoverage && !vertex.isColored())
		return;

	var lineWidth = this.lineWidth * zoomValue
	var radius = vertex.getRadius() * zoomValue;
	var x = (vertex.getX() - originX) * zoomValue;
	var y = (vertex.getY() - originY) * zoomValue;
	var theColor = vertex.getColor();

	if(vertex.isColored()) {
		this.drawBufferedCircle(context, x, y, radius, "black", lineWidth, theColor, 20);
	}

	var fillStyle = 'black';
	var font = 'bold ' + Math.floor(12 * zoomValue) + 'px Arial';
	var align = "center";
	var text = vertex.getLabel();

	if(vertex.isColored()) {
		this.drawBufferedText(context, x, (y + radius / 2), text, align, fillStyle, font, 30);

	} else if(this.m_showCoverage) {
		this.drawBufferedText(context, (x - radius), (y + radius / 2), text, "", fillStyle, font, 30);
	}
}

Renderer.prototype.drawBufferedText = function(context, x, y, text, align, fillStyle, font, layer) {
	if(!(layer in this.bufferedOperations)) {
		this.bufferedOperations[layer] = new Object();
	}

	var material = new Material("", 0, fillStyle, font, align);
	var materialKey = material.toString();

	if(!(materialKey in this.bufferedOperations[layer])) {
		this.bufferedOperations[layer][materialKey] = new Array();
	}

	this.bufferedOperations[layer][materialKey].push(new RenderedText(new Point(x, y), text, material));
}

Renderer.prototype.drawPathVertex = function(context,originX,originY,zoomValue,vertex){

	if(!vertex.isColored())
		return;

	var withDetails=!(zoomValue<=this.zoomForLevelOfDetails);

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

		var radius2=this.pathMultiplierForVertex*zoomValue*(radius+extra);

		if(!withDetails)
			radius2*=this.pathMultiplierMacro;

		var layer = -(colors.length - i - 1);
		this.drawBufferedCircle(context,x*zoomValue,y*zoomValue,radius2, "", 0, pathColor, layer);

		i++;
		extra-=this.extraMultiplier;
	}
}

Renderer.prototype.drawBufferedCircle = function(context, x, y, radius, strokeStyle, lineWidth, fillStyle, layer) {
	if(!(layer in this.bufferedOperations)) {
		this.bufferedOperations[layer] = new Object();
	}

	var material = new Material(strokeStyle, 0, fillStyle, "", "");
	var materialKey = material.toString();

	if(!(materialKey in this.bufferedOperations[layer])) {
		this.bufferedOperations[layer][materialKey] = new Array();
	}

	this.bufferedOperations[layer][materialKey].push(new RenderedCircle(new Point(x, y), radius, material));
}

Renderer.prototype.draw = function(objects) {
	var context = this.screen.getContext();
	this.drawVertexPowers(objects);

	if(this.screen.getHumanInterface().getInventory().useColorsForRendering())
		this.drawPaths(objects);

	this.drawArcs(objects);
	this.m_showCoverage = this.screen.getHumanInterface().getInventory().showCoverageForRendering();
	this.drawVertices(objects);
	if(this.screen.getDebugMode()) {
		this.drawQuadTree();
	}
	this.drawBufferedOperations(context);

/*
 * Only stroke once.
 * \see http://gamedev.stackexchange.com/questions/5314/how-does-one-optimize-an-html5-canvas-and-javascript-web-application-for-mobile
 * "In case of line drawing, combine as many lineTo commands before calling stroke."
 * --Petteri Hietavirta
 */
}

Renderer.prototype.drawQuadTree = function(context) {
	var zoomValue = this.screen.getZoomValue();
	var lineWidth = 1 * zoomValue;
	var theColor = "black";
	var originX = this.screen.getOriginX();
	var originY = this.screen.getOriginY();
	var screenWidth = this.screen.getWidth() / zoomValue;
	var screenHeight = this.screen.getHeight() / zoomValue;
	var listOfQuadTrees = this.quadTree.queryAllLeaves(new Point(originX + screenWidth / 2, originY + screenHeight / 2),  screenWidth, screenHeight);

	for(var k = 0 ; k < listOfQuadTrees.length; k++) {
		var currentQuadTree = listOfQuadTrees[k];

		var width = currentQuadTree.getWidth();
		var height = currentQuadTree.getHeight();
		var centerX = currentQuadTree.getCenter().getX();
		var centerY = currentQuadTree.getCenter().getY();

		var pointA = new Point(((centerX + width / 2) - originX) * zoomValue, ((centerY + height / 2) - originY) * zoomValue);
		var pointB = new Point(((centerX + width / 2) - originX) * zoomValue, ((centerY - height / 2) - originY) * zoomValue);
		var pointC = new Point(((centerX - width / 2) - originX) * zoomValue, ((centerY + height / 2) - originY) * zoomValue);
		var pointD = new Point(((centerX - width / 2) - originX) * zoomValue, ((centerY - height / 2) - originY) * zoomValue);

		this.drawBufferedTwoPoint(context, pointA, pointB, lineWidth, theColor, 100);
		this.drawBufferedTwoPoint(context, pointA, pointC, lineWidth, theColor, 100);
		this.drawBufferedTwoPoint(context, pointA, pointD, lineWidth, theColor, 100);
		this.drawBufferedTwoPoint(context, pointB, pointC, lineWidth, theColor, 100);
		this.drawBufferedTwoPoint(context, pointB, pointD, lineWidth, theColor, 100);
		this.drawBufferedTwoPoint(context, pointC, pointD, lineWidth, theColor, 100);

		var textX = (centerX - originX) * zoomValue;
		var textY = ((centerY - (height - 30) / 2) - originY) * zoomValue;
		this.drawBufferedText(context, textX, textY, currentQuadTree.getNumberOfElementsInLeaf(), "center", "red", "arial", 30);
	}
}

Renderer.prototype.setQuadTree = function(quadTree) {
	this.quadTree = quadTree;
}

Renderer.prototype.drawBufferedTwoPoint = function(context, pointA, pointB, lineWidth, theColor, layer) {
	this.drawBufferedLine(context, pointA.getX(), pointA.getY(), pointB.getX(), pointB.getY(), lineWidth, theColor, layer);
}
