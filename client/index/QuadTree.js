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
 * @param w The width of this cell
 * @param h The height of this cell
 */
function QuadTree(nbMaxElementsPerNode, center, w, h) {
	this.NB_MAX_ELEMENTS_PER_NODE = nbMaxElementsPerNode;
	this.center = center;
	this.w = w;
	this.h = h;

	this.nbElements = 0;
	this.depth = 0;
	this.southWest = null;
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
	this.nbElements++;
	this.points.push(centerObject);
	this.objects.push(object);

	if(this.points.length > this.NB_MAX_ELEMENTS_PER_NODE) {
		this.split();
		this.depth++;
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
 * @param centreObject Contains center of the element
 * @param createIfNull If true create new cells
 *
 * @return QuadTree : area corresponding of object position
 */
QuadTree.prototype.classify = function(centreObject, createIfNull) {
	if(this.points[i].getX() < this.origin.getX()) {
		//South West
		if(this.points[i].getY() < this.origin.getY()) {
			if(this.southWest == null && createIfNull) {
				var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() - (this.h / 2));
				this.southWest = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.w / 2), (this.h / 2));
			}
			return this.soutWest;

		//North West
		} else {
			if(this.northWest == null && createIfNull) {
				var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() + (this.h / 2));
				this.northWest = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.w / 2), (this.h / 2));
			}
			return this.nothWest;
		}
	} else {
		//South East
		if(this.points[i].getY() < this.origin.getY()) {
			if(this.southEast == null && createIfNull) {
				var newOrigin = new Point(this.origin.getX() + (this.w / 2), this.origin.getY() - (this.h / 2));
				this.southEast = new QuadTree(this.NB_MAX_ELEMENTS_PER_NODE, newOrigin, (this.w / 2), (this.h / 2));
			}
			return this.southEast;

		//North East
		} else {
			if(this.northEast == null && createIfNull) {
				var newOrigin = new Point(this.origin.getX() + (this.w / 2), this.origin.getY() + (this.h / 2));
				this.northEast = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.w / 2), (this.h / 2));
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
 * @param origin Contains the origin of the range
 * @param w The width of this range
 * @param h The height of this range
 *
 * @return Array<Object> : list of objects for a range
 */
QuadTree.prototype.query = function(origin, w, h) {
}


/**
 * Return a list of all objects
 *
 * @return Array<Object> : list of objects
 */
QuadTree.prototype.queryAll = function() {
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
