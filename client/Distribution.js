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
	var x = object;
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

	renderer.drawBufferedRectangle(context, originX, originY, height, width, "black", 5, "white", 200);
	var numberOfScaletoWriteX = width / 50;
	this.steppingOfScaleX = (this.maxX - this.minX) / numberOfScaletoWriteX;
	var numberOfScaletoWriteY = height / 50;
	this.steppingOfScaleY = (this.maxY - this.minY) / numberOfScaletoWriteY;

	var steppingX = width / numberOfScaletoWriteX;
	var steppingY = height / numberOfScaletoWriteY;

	var scaleX = this.minX;
	var scaleY = this.minY;

	var currentXScale = originX;
	var currentYScale = originY + height;

	context.beginPath();
	context.fillStyle = "black";
	context.font = "12px arial";
	context.fillText("Coverage depth", originX + (width / 2), originY + height + 60);
	context.fillText(scaleX, currentXScale, originY + height + 30);
	for(var i = 0; i < numberOfScaletoWriteX - 1; i++) {
		currentXScale += steppingX;
		scaleX = parseInt(scaleX + this.steppingOfScaleX);
		context.fillText(scaleX, currentXScale, originY + height + 30);
		renderer.drawBufferedLineWithTwoPoints(context, new Point(currentXScale, originY + height), new Point(currentXScale, originY), 1, "grey", 201);
	}
	context.fillText(this.maxX, width + originX, originY + height + 30);

	context.fillText("Observed frequency", originX - 110, originY + (height / 2));
	context.fillText(scaleY, originX - 30, currentYScale);
	for(var i = numberOfScaletoWriteY; i > 1; i--) {
		currentYScale -= steppingY;
		scaleY = parseInt(scaleY + this.steppingOfScaleY);
		context.fillText(scaleY, originX - 30, currentYScale);
		renderer.drawBufferedLineWithTwoPoints(context, new Point(originX, currentYScale), new Point(originX + width, currentYScale), 1, "grey", 201);
	}
	context.fillText(this.maxY, originX - 30, originY);
	context.closePath();

	for(x in this.objects) {
		var y = this.objects[x];
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
}


/**
 * Split the graph in "splitIndex" part
 *
 * @param splitIndex Divided the graph by
 *
 * @return Array<Object> List of part
 */
Distribution.prototype.splitGraph = function(splitIndex) {
	var result = new Array();
	var length = this.size;
	var stepping = Math.floor(length / splitIndex);
	var partOfGraph = new Object();
	var i = 0;
	var j = 0;
// 	console.log("*** [DEBUG] : " + stepping + " - " + length + "***");
	for(x in this.objects) {
		if(j == stepping) {
			result[i] = partOfGraph;
			partOfGraph = new Object();
			i++;
			j = 0;
		}
// 		console.log("*** [DEBUG] : " + x + " - " + this.objects[x] + "***");
		if(i == splitIndex) {
			stepping = length - (stepping * i);
		}
		partOfGraph[x] = this.objects[x];
		j++;
// 		console.log("*** [DEBUG] : " + i + " - " + j + "***");
	}
// 	console.log("*** [DEBUG] : " + result.length + "***");
	return result;
}
