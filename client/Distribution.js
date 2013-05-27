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
 * Construct an distribution table
 *
 * @author Jean-François Erdelyi
 */


/**
 * Constructor of distribution table
 *
 * @constructor
 */
function Distribution() {
	this.objects = new Object();
	this.size = 0;
	this.minY = 0;
	this.minX = 0;
	this.maxY = 0;
	this.maxX = 0;
}

/**
 * Constructor of distribution table
 *
 * @param object (int) Object to insert into the graph
 */
Distribution.prototype.insert = function(object) {
	var x = parseInt(object);
	var y = this.objects[x];

	numberOfElements = 0;

	if(x in this.objects) {
		numberOfElements = y;
	} else {
		this.size++;
	}

	y = (this.objects[x] = numberOfElements + 1);

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
 * Return the list of objects with her scores
 *
 * @return (Object) List of objects with her scores
 */
Distribution.prototype.getObjects = function() {
	this.newData = false;
	return this.objects;
}

/**
 * Return number of elements
 *
 * @return (int) Number of elements
 */
Distribution.prototype.getSize = function() {
	return this.size;
}

/**
 * Return the max value Y
 *
 * @return (T1) Y max
 */
Distribution.prototype.getMaxY = function() {
	return this.maxY;
}

/**
 * Return the max value X
 *
 * @return (T2) X max
 */
Distribution.prototype.getMaxX = function() {
	return this.maxX;
}

/**
 * Return the min value Y
 *
 * @return (T1) Y min
 */
Distribution.prototype.getMinY = function() {
	return this.minY;
}

/**
 * Return the min value X
 *
 * @return (T2) X min
 */
Distribution.prototype.getMinX = function() {
	return this.minX;
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
Distribution.prototype.draw = function(context, originX, originY, height, width, renderer) {
	var pointA = null;
	var pointB = null;
	this.minY = 0;

	renderer.drawBufferedRectangle(context, originX, originY, height, width, "black", 5, "white", 200);
	context.beginPath();
	context.fillStyle = "black";
	context.font = "12px arial";
	context.fillText("Coverage depth", originX + (width / 2), originY + height + 60);
	context.fillText("Observed frequency", originX - 110, originY + (height / 2));
	if((this.maxX - this.minX) > 10) {
		context.fillText(this.minX, originX, originY + height + 30);
	}
	for(var x = this.minX; x <= this.maxX; x++) {
		if(x % (Math.round((this.maxX - this.minX) / 5)) == 0) {
			context.fillText(x, currentX, originY + height + 30);
			renderer.drawBufferedLineWithTwoPoints(context, new Point(currentX, originY + height), new Point(currentX, originY), 1, "grey", 201);
		} else if((this.maxX - this.minX) < 5) {
			context.fillText(x, currentX, originY + height + 30);
			renderer.drawBufferedLineWithTwoPoints(context, new Point(currentX, originY + height), new Point(currentX, originY), 1, "grey", 201);
		}
		var y = 0;
		if(this.objects[x]) {
			var y = this.objects[x];
		}
		var currentX = ((x - this.minX) / (this.maxX - this.minX)) * width + originX;
		var yRatio = (y - this.minY) / (this.maxY - this.minY);
		var currentY = originY + (1 - yRatio) * height;

		if(pointB == null) {
			pointB = new Point(currentX, currentY);
			continue;
		}
		pointA = pointB.copy();
		pointB = new Point(currentX, currentY);
		renderer.drawBufferedLineWithTwoPoints(context, pointA, pointB, 1, "red", 202);
	}
	for(var y = this.minY; y <= this.maxY; y++) {
		var yRatio = (y - this.minY) / (this.maxY - this.minY);
		var currentY = originY + (1 - yRatio) * height;
		if(y % (Math.round((this.maxY - this.minY) / 5)) == 0) {
			context.fillText(y, originX - 30, currentY);
			renderer.drawBufferedLineWithTwoPoints(context, new Point(originX, currentY), new Point(originX + width, currentY), 1, "grey", 201);
		} else if ((this.maxY - this.minY) < 5) {
			context.fillText(y, originX - 30, currentY);
			renderer.drawBufferedLineWithTwoPoints(context, new Point(originX, currentY), new Point(originX + width, currentY), 1, "grey", 201);
		}
	}
	context.closePath();
}


/**
 * Split the graph in "splitIndex" part
 *
 * @param splitIndex Divided the graph by
 */
Distribution.prototype.splitGraph = function(splitIndex) {
	var result = new Array();
	var stepping = (this.maxX - this.minX) / splitIndex;
	var partOfGraph = new Object();
	var begin = this.minX;
	var j = begin;
	for(var i = 0; i < splitIndex; i++) {
		for(j = begin; j < begin + stepping; j++) {
			if(this.objects[j]) {
				partOfGraph[j] = this.objects[j];
			} else {
				partOfGraph[j] = 0;
			}
		}
		result[i] = partOfGraph;
		partOfGraph = new Object();
		begin = j;
	}

	return result;
}
