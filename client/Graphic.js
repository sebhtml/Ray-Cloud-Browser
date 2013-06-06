/**
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013 Jean-François Erdelyi
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
 * Construct a graphic
 *
 * @author Jean-François Erdelyi
 */


/**
 * Construct a graphic
 *
 * @constructor
 */
function Graphic(period) {
	this.canvas = document.createElement("canvas");
	this.localContext = this.canvas.getContext("2d");
	this.listOfPoints = new Object();
	this.size = 0;
	this.lastUpdate = 0
	this.start = new Date() * 1;
	this.period = period;
	this.minY = 0;
	this.maxY = 0;
	this.minX = 0;
	this.maxX = 0;
	this.graphMinimumYPosition = 0;
	this.init = true;
	this.change = false;
	this.newEnd = 0;
	this.index = 0;
}

/**
 * Insert element into the graphic
 *
 * @param point (Point) A point
 */
Graphic.prototype.insert = function(valueX, valueY) {
	var x = valueX;
	var y = valueY;

	this.listOfPoints[x] = y;

	if(this.minY > y || this.minY == 0) {
		this.minY = y;
	}
	if(this.minX > x || this.minX == 0) {
		this.minX = x;
	}
	if(this.maxY < y) {
		this.maxY = y;
	}
	if(this.maxX < x) {
		this.maxX = x;
	}
}

/**
 * Return the list of points with her scores
 *
 * @return (Object) List of points with her scores
 */
Graphic.prototype.getListOfPoints = function() {
	return this.listOfPoints;
}

/**
 * Return number of elements
 *
 * @return (int) Number of elements
 */
Graphic.prototype.getSize = function() {
	return this.size;
}


/**
 * Draw this graph
 *
 * @param context Canvas
 * @param originX Origin of graph
 * @param originY Origin of graph
 * @param height Height of graph
 * @param width Width of graph
 * @param renderer For buffered opperations
 */
Graphic.prototype.draw = function(context, originX, originY, height, width, renderer, nameX, nameY, actualLocation, window) {
	var pointA = null;
	var pointB = null;
	if(this.maxX - this.minX < window) {
		this.begin = this.minX;
		this.end = this.maxX;
		this.changeLeft = false;
		this.changeRight = false;
	}
	var gap = this.begin - this.end;
	if(this.init) {
		this.begin = actualLocation - window / 2;
		this.end = actualLocation + window / 2;
		this.init = false;
	}
	if(this.changeRight) {
		if(this.index < 50) {
			this.index += 50;
		} else {
			this.index -= 10;
		}
		this.begin += this.index;
		this.end += this.index;
		if(this.end >= this.newEnd) {
			this.begin = actualLocation - window / 4;
			this.end = actualLocation + 3 * (window / 4);
			this.changeRight = false;
		}
	} else if(this.changeLeft) {
		if(this.index < 50) {
			this.index += 50;
		} else {
			this.index -= 10;
		}
		this.begin -= this.index;
		this.end -= this.index;
		if(this.end <= this.newEnd) {
			this.begin = actualLocation - 3 * (window / 4);
			this.end = actualLocation + window / 4;
			this.changeLeft = false;
		}
	} else {
		if(actualLocation > this.end + (gap / 4)) {
			this.init = false;
			this.changeRight = true;
			this.newEnd = this.end + (window / 2);
		} else if (actualLocation < this.begin - (gap / 4)) {
			this.changeLeft = true;
			this.newEnd = this.end - (window / 2);
		}
		this.index = 0;
	}
	if(this.begin <= 0) {
		this.begin = 0;
		this.end = window;
		if(actualLocation < this.end + (window / 2)) {
			this.changeLeft = false;
		}
	}
	if(this.end >= this.listOfPoints.length) {
		this.begin = this.listOfPoints.length - window;
		this.end = this.listOfPoints.length;
		if(actualLocation < this.end + (window / 2)) {
			this.changeRight = false;
		}
	}
	renderer.drawBufferedRectangle(this.localContext, originX, originY, height, width, "black", 5, "white", 200);
	renderer.drawBufferedText(this.localContext, originX + (width / 2), originY + height + 40, nameX, "center", "black", "12px arial", 202);
	renderer.drawBufferedText(this.localContext, originX - 75, originY + (height / 2), nameY, "center", "black", "12px arial", 202);
	this.graphMinimumXPosition = this.begin;
	this.graphMaximumXPosition = this.end;
	this.graphMaximumYPosition = 0;
	for(var x = this.begin; x < this.end; x++) {
		var y = this.listOfPoints[x];
		if(y > this.graphMaximumYPosition) {
			this.graphMaximumYPosition = y;
		}
	}
		for(var x = this.begin; x < this.end; x++) {
			var y = this.listOfPoints[x];
			var currentX = ((x - this.graphMinimumXPosition) / (this.graphMaximumXPosition - this.graphMinimumXPosition)) * width + originX;
			var yRatio = (y - this.graphMinimumYPosition) / (this.graphMaximumYPosition - this.graphMinimumYPosition);
			var currentY = originY + (1 - yRatio) * height;
			if(pointB == null) {
				pointB = new Point(currentX, currentY);
				continue;
			}
			pointA = pointB;
			pointB = new Point(currentX, currentY);
			renderer.drawBufferedLineWithTwoPoints(this.localContext, pointA, pointB, 1, "red", 202);
			if(x % (Math.round((this.graphMaximumXPosition - this.graphMinimumXPosition) / 15)) == 0) {
				renderer.drawBufferedText(this.localContext, currentX, originY + height + 20, x, "center", "black", "12px arial", 202);
				renderer.drawBufferedLineWithTwoPoints(this.localContext, new Point(currentX, originY + height), new Point(currentX, originY), 1, "grey", 201);
			}
		}
		for(var y = 0; y <= this.graphMaximumYPosition; y++) {
			var yRatio = (y - this.graphMinimumYPosition) / (this.graphMaximumYPosition - this.graphMinimumYPosition);
			var currentY = originY + (1 - yRatio) * height;
			if(y % (Math.round((this.graphMaximumYPosition - this.graphMinimumYPosition) / 3)) == 0) {
				renderer.drawBufferedText(this.localContext, originX - 20, currentY, y, "center", "black", "12px arial", 202);
				renderer.drawBufferedLineWithTwoPoints(this.localContext, new Point(originX, currentY), new Point(originX + width, currentY), 1, "grey", 201);
			}
		}
	this.start = new Date() * 1;
	if(this.start >= this.lastUpdate + this.period) {
		this.lastUpdate = this.start;
		context.drawImage(this.canvas, originX, originY, width, height);
	}
	var actualLocationX = ((actualLocation - this.graphMinimumXPosition) / (this.graphMaximumXPosition - this.graphMinimumXPosition)) * width + originX;
	renderer.drawBufferedText(this.localContext, actualLocationX, originY - 20, actualLocation, "center", "black", "12px arial", 202);
	renderer.drawBufferedLineWithTwoPoints(this.localContext, new Point(actualLocationX, originY + height), new Point(actualLocationX, originY), 2, "rgb(0,255,0)", 201);
}
