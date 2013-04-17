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
 *
 *  @author Jean-François Erdely
 *  @version 1.0
 */


/**
 * Construct a QuadTree
 *
 * @constructor
 *
 * @param nbMaxElementsPerNode Number of elements max in this cell
 * @param center Contains the center of this cell
 * @param width The width of this cell
 * @param height The height of this cell
 */
function QuadTree(numberMaxElementsPerNode, center, width, height) {
	this.numberMaxElementsPerNode = numberMaxElementsPerNode;
	this.center = center;
	this.width = width;
	this.height = height;

	this.nbElements = 0;
	this.depth = 0;
	this.southEast = null;
	this.northEast = null;
	this.southWest = null;
	this.northWest = null;

	this.debug = false;
	this.createArrays();
}


/**
 * Create arrays of elements
 */
QuadTree.prototype.createArrays = function() {
	this.points = new Array();
	this.objects = new Array();
}


/**
 * Insert element into this cell
 *
 * If number of elements is too large,
 * split the current cell in 4 cells
 * and insert the objects into the good area
 *
 * @param center centerObject of the element
 * @param object Element to insert
 * @return Boolean true if the object was inserted, false otherwise
 */
QuadTree.prototype.insert = function(centerObject, object) {

	if(this.isLeaf()) {
		if(!this.overlapBetweenPointAndRectangle(centerObject, this.center, this.width, this.height))
			return false;

		this.points.push(centerObject);
		this.objects.push(object);

		if(this.points.length > this.numberMaxElementsPerNode) {
			this.split();
			this.depth++;
		}

		this.nbElements ++;
		return true;
	} else {

		var tree = this.classify(centerObject, true);
		if(tree == null)
			return false;

		var result = tree.insert(centerObject, object);

		if(result)
			this.nbElements ++;

		return result;
	}
}


/**
 * Split this cell in 4
 * <pre>
 *  _________
 * | NW | NE |
 * |____|____|
 * | SW | SE |
 * |____|____|
 * </pre>
 */
QuadTree.prototype.split = function() {
	for(var i = 0; i < this.points.length; i++) {
		var tree = this.classify(this.points[i], true);
		tree.insert(this.points[i], this.objects[i]);
	}
	this.createArrays();
}

/**
 * Search the element in the tree and return the good area
 *
 * @param centerObject Contains center of the element
 * @param createIfNull If true create new cells
 *
 * @return QuadTree : area corresponding of object position
 */
QuadTree.prototype.classify = function(centerObject, createIfNull) {
	var deltaX = this.width / 4;
	var deltaY = this.height / 4;

	if(centerObject.getX() < this.center.getX()) {
		//South West
		if(centerObject.getY() < this.center.getY()) {
			if(this.southWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - deltaX, this.center.getY() - deltaY);
				this.southWest = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2);
			}
			//this.southWest.printStatus();
			return this.southWest;

		//North West
		} else {
			if(this.northWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - deltaX, this.center.getY() + deltaY);
				this.northWest = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2);
			}
			return this.northWest;
		}
	} else {
		//South East
		if(centerObject.getY() < this.center.getY()) {
			if(this.southEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + deltaX, this.center.getY() - deltaY);
				this.southEast = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2);
			}
			return this.southEast;

		//North East
		} else {
			if(this.northEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + deltaX, this.center.getY() + deltaY);
				this.northEast = new QuadTree(this.NB_MAX_NODE, newOrigin, this.width / 2, this.height / 2);
			}
			return this.northEast;
		}
	}
	return null;
}


/**
 * Remove the element "object" in the tree
 *
 * @param centerObject Contains the center of the element
 * @param object The object to delete
 *
 * @return Boolean : true if the element is found
 */
QuadTree.prototype.remove = function(centerObject, object) {

	if(this.isLeaf()) {
		var position = -1;
		var points = new Array();
		var objects = new Array();
		for(var i = 0; i < this.points.length; i++) {

			if(this.objects[i] == object && this.points[i].equals(centerObject)) {
				position = i;
			} else {
				points.push(this.points[i]);
				objects.push(this.objects[i]);
			}
		}
		this.points = points;
		this.objects = objects;
		if(position != -1) {
			this.nbElements--;
		}
		return position != -1;
	} else {

		var tree = this.classify(centerObject, false);
		if(tree == null) {
			return false;
		}
		var remove = tree.remove(centerObject, object);
		if(remove) {
			this.nbElements--;
		}
		return remove;
	}
}

/**
 * Return if the current area is a leaf
 *
 * @return Boolean : true if current area is a leaf
 */
QuadTree.prototype.isLeaf = function() {
	return this.northEast == null && this.northWest == null && this.southEast == null && this.southWest == null;
}


/**
 * Return a list of objects for a range
 *
 * @param center Contains the center of the range
 * @param width The width of this range
 * @param height The height of this range
 *
 * @return Array<Object> : list of objects for a range
 */
QuadTree.prototype.query = function(center, width, height) {
	var elements = new Array();
	this.queryRecursive(center, width, height, elements);
	return elements;
}


/**
 *
 */
QuadTree.prototype.queryAll = function() {
	var elements = new Array();
	this.queryRecursive(this.center, this.width, this.height, elements);
	return elements;
}


/**
 * Return a list of all objects
 *
 * @return Array<Object> : list of objects
 */
QuadTree.prototype.queryRecursive = function(center, width, height, elements) {
	if(this.isLeaf()) {
		for(var i = 0; i < this.objects.length; i++) {
			if(this.overlapBetweenPointAndRectangle(this.points[i], center, width, height)) {
				elements.push(this.objects[i]);
			}
		}
		return elements;
	}
	if(this.southEast != null && this.southEast.checkOverlap(center, width, height)) {
		this.southEast.queryRecursive(center, width, height, elements);
	}
	if(this.northEast != null && this.northEast.checkOverlap(center, width, height)) {
		this.northEast.queryRecursive(center, width, height, elements);
	}
	if(this.southWest != null && this.southWest.checkOverlap(center, width, height)) {
		this.southWest.queryRecursive(center, width, height, elements);
	}
	if(this.northWest != null && this.northWest.checkOverlap(center, width, height)) {
		this.northWest.queryRecursive(center, width, height, elements);
	}
}


/**
 * Return a number of elements
 *
 * @return Integer : number of elements
 */
QuadTree.prototype.size = function() {
	return this.nbElements;
}


/**
 * Return the depth
 *
 * @return Integer : the depth
 */
QuadTree.prototype.depth = function() {
	return this.depth;
}

/**
 *
 */
QuadTree.prototype.overlapBetweenPointAndRectangle = function(point, center, width, height) {
	return this.checkOverlapBetweenTwoRectangles(point, 0, 0, center, width, height)
}

/**
 *
 */
QuadTree.prototype.checkOverlapBetweenTwoRectangles = function(center, width, height, center2, width2, height2) {
	if(center.getX() + (width / 2) < center2.getX() - (width2 / 2) ||
	   center.getX() - (width / 2) > center2.getX() + (width2 / 2) ||
	   center.getY() + (height / 2) < center2.getY() - (height2 / 2) ||
	   center.getY() - (height / 2) > center2.getY() + (height2 / 2)) {
		return false;
	}
	return true;
}

/**
 *
 */
QuadTree.prototype.checkOverlap = function(center, width, height) {
	return this.checkOverlapBetweenTwoRectangles(center, width, height, this.center, this.width, this.height);
}

QuadTree.prototype.queryCircle = function(center, radius) {
	var elements = new Array();
	this.queryCircleRecursive(center, radius, elements);
	return elements;
}

/**
 * Return a list of all objects
 *
 * @return Array<Object> : list of objects
 */
QuadTree.prototype.queryCircleRecursive = function(center, radius, elements) {
	if(this.isLeaf()) {
		for(var i = 0; i < this.objects.length; i++) {
			if(this.checkOverlapBetweenCircleAndPoint(center, radius, this.points[i])) {
				elements.push(this.objects[i]);
			}
		}
		return elements;
	}
	if(this.southEast != null && this.southEast.checkOverlap(center, radius, radius)) {
		this.southEast.queryCircleRecursive(center, radius, elements);
	}
	if(this.northEast != null && this.northEast.checkOverlap(center, radius, radius)) {
		this.northEast.queryCircleRecursive(center, radius, elements);
	}
	if(this.southWest != null && this.southWest.checkOverlap(center, radius, radius)) {
		this.southWest.queryCircleRecursive(center, radius, elements);
	}
	if(this.northWest != null && this.northWest.checkOverlap(center, radius, radius)) {
		this.northWest.queryCircleRecursive(center, radius, elements);
	}
}

/**
 *
 */
QuadTree.prototype.checkOverlapBetweenCircleAndPoint = function(center, radius, point) {
	return(Math.pow(radius, 2) >= Math.pow(point.getX() - center.getX(), 2) + Math.pow(point.getY() - center.getY(), 2));
}


/**
 *
 */
QuadTree.prototype.update = function(oldCenter, newCenter, object) {
	if(this.isLeaf()) {
		for(var i = 0; i < this.points.length; i++) {
			if(this.objects[i] == object && this.points[i].equals(oldCenter)) {
				this.points[i] = newCenter;
				return;
			}
		}
		return;
	}
	var oldTree = this.classify(oldCenter, false);
	var newTree = this.classify(newCenter, true);
	if(oldTree.toString() == newTree.toString()) {
		newTree.update(oldCenter, newCenter, object);
	} else {
		oldTree.remove(oldCenter, object);
		newTree.insert(newCenter, object);
	}
	return;
}

/**
 *
 */
QuadTree.prototype.toString = function() {
	return 	this.numberMaxElementsPerNode + "-" +
		this.center.toString() + "-" +
		this.width + "-" +
		this.height + "-" +
		this.nbElements + "-" +
		this.depth;
}
