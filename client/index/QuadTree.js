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
 *  @author Jean-François Erdelyi
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
function QuadTree(nbMaxElementsPerNode, center, width, height) {
	this.NB_MAX_ELEMENTS_PER_NODE = nbMaxElementsPerNode;
	this.center = center;
	this.width = width;
	this.height = height;

	this.nbElements = 0;
	this.depth = 0;
	this.southEast = null;
	this.northEast = null;
	this.southWest = null;
	this.northWest = null;

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
 */
QuadTree.prototype.insert = function(centerObject, object) {
	if(this.isLeaf()) {
		this.points.push(centerObject);
		this.objects.push(object);

		if(this.points.length > this.NB_MAX_ELEMENTS_PER_NODE) {
			this.split();
			this.depth++;
		}
	} else {

		var tree = this.classify(centerObject, true);
		tree.insert(centerObject, object);
	}

	this.nbElements++;
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

QuadTree.prototype.printStatus = function() {
	console.log("QuadTree object");
	console.log(" center: (" + this.center.getX() + ", " +
		this.center.getY() + ") width: " + this.width + " " + this.height);
	console.log(" objects: " + this.objects.length);

	console.log(" southWest: " + ((this.southWest == null) ? "null" : this.southWest.objects.length));
	console.log(" southEast: " + ((this.southEast == null) ? "null" : this.southEast.objects.length));
	console.log(" northWest: " + ((this.northWest == null) ? "null" : this.northWest.objects.length));
	console.log(" northEast: " + ((this.northEast == null) ? "null" : this.northEast.objects.length));
}

/**
 * Search the element in the tree and return the good area
 *
 * @param centreObject Contains center of the element
 * @param createIfNull If true create new cells
 *
 * @return QuadTree : area corresponding of object position
 */
QuadTree.prototype.classify = function(centreObject, createIfNull) {

	if(centreObject.getX() < this.center.getX()) {
		//South West
		if(centreObject.getY() < this.center.getY()) {
			if(this.southWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - (this.width / 2), this.center.getY() - (this.height / 2));
				this.southWest = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.width / 2), (this.height / 2));
			}
			return this.southWest;

		//North West
		} else {
			if(this.northWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - (this.width / 2), this.center.getY() + (this.height / 2));
				this.northWest = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.width / 2), (this.height / 2));
			}
			return this.northWest;
		}
	} else {
		//South East
		if(centreObject.getY() < this.center.getY()) {
			if(this.southEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + (this.width / 2), this.center.getY() - (this.height / 2));
				this.southEast = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.width / 2), (this.height / 2));
			}
			return this.southEast;

		//North East
		} else {
			if(this.northEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + (this.width / 2), this.center.getY() + (this.height / 2));
				this.northEast = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.width / 2), (this.height / 2));
			}
			return this.northEast;
		}
	}
	return null;
}


/**
 * Remove the element "object" in the tree
 *
 * @param centreObject Contains the center of the element
 * @param object The object to delete
 *
 * @return Boolean : true if the element is found
 */
QuadTree.prototype.remove = function(centreObject, object) {
	if(this.isLeaf()) {
		var position = -1;
		var points = new Array();
		var objects = new Array();

		for(var i = 0; i < this.points.length; i++) {
			if(this.objects[i] == object) {
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
		return tree.remove();
	}
}


/**
 * Return if the current area is a leaf
 *
 * @return Boolean : true if current area is a leaf
 */
QuadTree.prototype.isLeaf = function() {
	return this.northEast == null && this.northWest == null && this.southEast == null && this.southEast == null;
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
	/*
	console.log("[DEBUG] query (" + center.getX()+ " " + center.getY() + ") " + width + " " + height);
	console.log("[DEBUG] self -> (" + this.center.getX()+ " " + this.center.getY() + ") " + this.width + " " + this.height);
	console.log("[DEBUG] isLeaf -> " + this.isLeaf());
	*/
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
			elements.push(this.objects[i]);
		}
		return elements;
	}

	//console.log("Not a leaf, elements in current cell: " + this.nbElements);
	if(this.southEast != null && this.southEast.overlap(center, width, height)) {
		//console.log("southEast is not null -> " + this.southEast.size());
		this.southEast.queryRecursive(center, width, height, elements);
	}
	if(this.northEast != null && this.northEast.overlap(center, width, height)) {
		//console.log("northEast is not null -> " + this.northEast.size());
		this.northEast.queryRecursive(center, width, height, elements);
	}
	if(this.southWest != null && this.southWest.overlap(center, width, height)) {
		//console.log("southWest is not null -> " + this.southWest.size());
		this.southWest.queryRecursive(center, width, height, elements);
	}
	if(this.northWest != null && this.northWest.overlap(center, width, height)) {
		//console.log("northWest is not null -> " + this.northWest.size());
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
QuadTree.prototype.overlap = function(center, width, height) {
	if(center.getX() + (width / 2) < this.center.getX() - (this.width / 2) ||
	   center.getX() - (width / 2) > this.center.getX() + (this.width / 2) ||
	   center.getY() + (height / 2) < this.center.getY() - (this.height / 2) ||
	   center.getY() - (height / 2) > this.center.getY() + (this.height / 2)) {
		return false;
	}
	return true;
}
