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
	this.contextLocal = this.canvas.getContext("2d");
	this.listOfPoints = new Array();
	this.size = 0;
	this.lastUpdate = 0
	this.start = new Date() * 1;
	this.period = period;
	this.minY = 0;
	this.maxY = 0;
	this.minX = 0;
	this.maxX = 0;
}

/**
 * Insert element into the graphic
 *
 * @param point (Point) A point
 */
Graphic.prototype.insert = function(point) {
	var x = point.getX();
	var y = point.getY();

	this.listOfPoints.push(point);

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
	this.size++;
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
Graphic.prototype.draw = function(context, originX, originY, height, width, renderer, nameX, nameY) {
	var pointA = null;
	var pointB = null;
	if(this.minX < 100) {
		this.minX = 0;
	}
	this.minY = 0;

	renderer.drawBufferedRectangle(this.contextLocal, originX, originY, height, width, "black", 5, "white", 200);
	renderer.drawBufferedText(this.contextLocal, originX + (width / 2), originY + height + 40, nameX, "center", "black", "12px arial", 202);
	renderer.drawBufferedText(this.contextLocal, originX - 75, originY + (height / 2), nameY, "center", "black", "12px arial", 202);
	for(var i = 0; i < this.listOfPoints.length; i++) {
		var x = this.listOfPoints[i].getX();
		var y = this.listOfPoints[i].getY();
		var currentX = ((x - this.minX) / (this.maxX - this.minX)) * width + originX;
		var yRatio = (y - this.minY) / (this.maxY - this.minY);
		var currentY = originY + (1 - yRatio) * height;
		if(pointB == null) {
			pointB = new Point(currentX, currentY);
			continue;
		}
		pointA = pointB;
		pointB = new Point(currentX, currentY);
		if(pointB.getX() < pointA.getX() || (pointB.getX() - pointA.getX()) > 100) {
			continue;
		}
		renderer.drawBufferedLineWithTwoPoints(this.contextLocal, pointA, pointB, 1, "red", 202);
		if(x % (Math.round((this.maxX - this.minX) / 10)) == 0) {
			renderer.drawBufferedText(this.contextLocal, currentX, originY + height + 20, x, "center", "black", "12px arial", 202);
			renderer.drawBufferedLineWithTwoPoints(this.contextLocal, new Point(currentX, originY + height), new Point(currentX, originY), 1, "grey", 201);
		}
	}
	for(var y = 0; y <= this.maxY; y++) {
		var yRatio = (y - this.minY) / (this.maxY - this.minY);
		var currentY = originY + (1 - yRatio) * height;
		if(y % (Math.round((this.maxY - this.minY) / 3)) == 0) {
			renderer.drawBufferedText(this.contextLocal, originX - 20, currentY, y, "center", "black", "12px arial", 202);
			renderer.drawBufferedLineWithTwoPoints(this.contextLocal, new Point(originX, currentY), new Point(originX + width, currentY), 1, "grey", 201);
		}
	}
	this.start = new Date() * 1;
	if(this.start >= this.lastUpdate + this.period) {
		this.lastUpdate = this.start;
		context.drawImage(this.canvas, originX, originY, width, height);
	}
}
