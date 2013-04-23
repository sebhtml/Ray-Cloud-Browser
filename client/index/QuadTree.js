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
 * Implementation of QuadTree
 *
 * @author Jean-François Erdelyi
 */


/**
 * Construct a QuadTree
 *
 * @constructor
 *
 * @param nbMaxElementsPerNode (int) Number of elements max in this cell
 * @param center (Point) Contains the center of this cell
 * @param width (int) The width of this cell
 * @param height (int) The height of this cell
 */
function QuadTree(numberMaxElementsPerNode, center, width, height, depth) {
	this.numberMaxElementsPerNode = numberMaxElementsPerNode;
	this.center = center;
	this.width = width;
	this.height = height;
	this.nbElements = 0;
	this.depth = depth;
	this.southEast = null;
	this.northEast = null;
	this.southWest = null;
	this.northWest = null;
	this.createArrays();
	this.sumOfMasses = 0;
	this.gravityCenter = null;
}

/**
 * Insert element into this cell
 *
 * If number of elements is too large,
 * split the current cell in 4 cells
 * and insert the objects into the good area
 *
 * @param centerObject (Point) Center of the element
 * @param object (Object) Element to insert
 *
 * @return (Boolean) TRUE if the object was inserted, FALSE otherwise
 */
QuadTree.prototype.insert = function(centerObject, object) {
	if(this.isLeaf()) {
		if(!this.checkOverlapBetweenPointAndRectangle(centerObject, this.center, this.width, this.height))
			return false;

		this.points.push(centerObject);
		this.objects.push(object);

		this.calculateTheCenterOfGravity();
		this.checkIfItIsTooBig();

		this.nbElements ++;

		this.calculateTheCenterOfGravity();
		return true;
	} else {
		var tree = this.classify(centerObject, true);
		if(tree == null)
			return false;

		var result = tree.insert(centerObject, object);

		if(result) {
			this.nbElements ++;
		}

		this.calculateTheCenterOfGravity();
		return result;
	}
}

QuadTree.prototype.calculateTheCenterOfGravity = function() {
	if(this.isLeaf()) {
		console.log("Is a leaf !!");

		this.gravityCenter = new Point(0, 0);
		for(var i = 0; i < this.points.length; i++) {
			this.gravityCenter.add(this.points[i]);
		}
		this.sumOfMasses = i;
		this.gravityCenter.divideBy(this.sumOfMasses);
	} else {
		console.log("Is not a leaf !!");
		this.gravityCenter = new Point(0, 0);
		this.sumMasses = 0;
		if(this.southEast != null) {
			this.gravityCenter.add(this.southEast.getGravityCenter());
			this.sumOfMasses += this.southEast.getSumOfMasses();
		}
		if(this.northEast != null) {
			this.gravityCenter.add(this.northEast.getGravityCenter());
			this.sumOfMasses += this.northEast.getSumOfMasses();
		}
		if(this.southWest != null) {
			this.gravityCenter.add(this.southWest.getGravityCenter());
			this.sumOfMasses += this.southWest.getSumOfMasses();
		}
		if(this.northWest != null) {
			this.gravityCenter.add(this.northWest.getGravityCenter());
			this.sumOfMasses += this.northWest.getSumOfMasses();
		}
		this.gravityCenter.divideBy(this.sumMasses);
	}

	console.log("Sum of masses : " + this.sumOfMasses);
	console.log("Gravity Center : " + this.gravityCenter.toString());
}
QuadTree.prototype.checkIfItIsTooBig = function() {
	if(this.nbElements >= this.numberMaxElementsPerNode) {
		if(this.depth < 50){
			this.split();
		}
	}
}

/**
 * Remove the element "object" in the tree
 *
 * @param centerObject (Point) Contains the center of the element
 * @param object (Object) The object to delete
 *
 * @return (Boolean) True if the element is found
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
			this.checkIfChildrenAreEmpty();
			this.calculateTheCenterOfGravity();
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
			this.checkIfChildrenAreEmpty();
			this.calculateTheCenterOfGravity();
		}
		return remove;
	}
}

QuadTree.prototype.checkIfChildrenAreEmpty = function() {
	if(this.southEast != null && this.southEast.isEmptyLeaf()) {
		this.southEast = null;
	}
	if(this.northEast != null && this.northEast.isEmptyLeaf()) {
		this.northEast = null;
	}
	if(this.southWest != null && this.southWest.isEmptyLeaf()) {
		this.southWest = null;
	}
	if(this.northWest != null && this.northWest.isEmptyLeaf()) {
		this.northWest = null;
	}
}

QuadTree.prototype.isEmptyLeaf = function() {
	return this.isLeaf() && this.objects.length == 0;
}

/**
 * Update a object position from old point to new point
 *
 * @param oldCenter (Point) Previous position
 * @param newCenter (Point) New position
 * @param object (Object) Object to move
 * @param forceInsertion true if the object is not already there.
 *
 * @return true if the update was successful.
 */
QuadTree.prototype.update = function(oldCenter, newCenter, object, forceInsertion) {
	//If is a leaf
	if(this.isLeaf()) {
		for(var i = 0; i < this.points.length; i++) {
			if(this.objects[i] == object && this.points[i].equals(oldCenter)) {
				this.points[i] = newCenter;
				return true;
			}
		}

		// Insert the object because it was not found.
		if(forceInsertion) {
			this.insert(newCenter, object);
		}
		this.checkIfChildrenAreEmpty();
		this.calculateTheCenterOfGravity();
		return forceInsertion;
	}

	// at this point, we are not in a leaf.
	// check if the oldCenter actually exists
	var oldTree = this.classify(oldCenter, false);

	// return false if the object does not exist and
	// forceInsertion is false
	if(oldTree == null && !forceInsertion)
		return false;

	if(oldTree == null) {
		return this.insert(newCenter, object);
	}

	// at this point, there are two cases:
	// 1. the object was in the old tree, in the case, we update that anyway
	// 2. the object was not in the old tree, but forceInsertion is true
	var newTree = this.classify(newCenter, true);

	//Else if test if the old and new tree are the same
	// here we just perform a deleguation of the update call
	if(oldTree.equals(newTree)) {
		return newTree.update(oldCenter, newCenter, object, forceInsertion);
		this.checkIfChildrenAreEmpty();
		this.calculateTheCenterOfGravity();
	}

	//Else is not the same tree

	oldTree.remove(oldCenter, object);
	newTree.insert(newCenter, object);

	return true;
}

/**
 * Split this cell in 4
 *
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
	//To delete a current arrays
	this.createArrays();
}

/**
 * Search the element in the tree and return the good area
 *
 * @param centerObject (Point) contains center of the element
 * @param createIfNull (Boolean) if true create new cells
 *
 * @return (QuadTree) Area corresponding of object position
 */
QuadTree.prototype.classify = function(centerObject, createIfNull) {
	var deltaX = this.width / 4;
	var deltaY = this.height / 4;

	if(centerObject.getX() < this.center.getX()) {
		//South West
		if(centerObject.getY() < this.center.getY()) {
			if(this.southWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - deltaX, this.center.getY() - deltaY);
				this.southWest = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2, this.depth+1);
			}
			//this.southWest.printStatus();
			return this.southWest;

		//North West
		} else {
			if(this.northWest == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() - deltaX, this.center.getY() + deltaY);
				this.northWest = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2, this.depth+1);
			}
			return this.northWest;
		}
	} else {
		//South East
		if(centerObject.getY() < this.center.getY()) {
			if(this.southEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + deltaX, this.center.getY() - deltaY);
				this.southEast = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2, this.depth+1);
			}
			return this.southEast;

		//North East
		} else {
			if(this.northEast == null && createIfNull) {
				var newOrigin = new Point(this.center.getX() + deltaX, this.center.getY() + deltaY);
				this.northEast = new QuadTree(this.numberMaxElementsPerNode, newOrigin, this.width / 2, this.height / 2, this.depth+1);
			}
			return this.northEast;
		}
	}
	//If not exist return null
	return null;
}

/**
 * Return a list of objects for a range
 *
 * @param center (Point) Contains the center of the: t range
 * @param width (int) The width of this range
 * @param height (int) The height of this range
 *
 * @return (Array<Object>) List of objects for a range
 */
QuadTree.prototype.query = function(center, width, height) {
	var elements = new Array();
	this.queryRecursive(center, width, height, elements);
	return elements;
}

/**
 * Return a list of objects corresponding at the query
 *
 * @return (Array<Object>) List of objects
 */
QuadTree.prototype.queryRecursive = function(center, width, height, elements) {
	if(this.isLeaf()) {
		for(var i = 0; i < this.objects.length; i++) {
			if(this.checkOverlapBetweenPointAndRectangle(this.points[i], center, width, height)) {
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
 * Return a list of objects into a circle
 *
 * @param center (Point) Contains the center of the: t range
 * @param radius (int) Radius of the circle
 *
 * @return (Array<Object>) List of objects for a range
 */
QuadTree.prototype.queryCircle = function(center, radius) {
	var elements = new Array();
	this.queryCircleRecursive(center, radius, elements);
	return elements;
}

/**
 * Return a list of objects corresponding at the query "Circle"
 *
 * @return (Array<Object>) List of objects
 */
QuadTree.prototype.queryCircleRecursive = function(center, radius, elements) {
	if(this.isLeaf()) {
		for(var i = 0; i < this.objects.length; i++) {
			if(this.checkOverlapBetweenPointAndCircle(this.points[i], center, radius)) {
				elements.push(this.objects[i]);
			}
		}
		return;
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
 * Return a list of all objects
 *
 * @return (Array<Object>) List of objects
 */
QuadTree.prototype.queryAll = function() {
	var elements = new Array();
	this.queryRecursive(this.center, this.width, this.height, elements);
	return elements;
}


/**
 * Return a list of leafs
 *
 * @return (Array<QuadTree>) List of leafs
 */
QuadTree.prototype.queryLeavesRecursive = function(elements, center, width, height) {
	if(this.isLeaf()) {
		if(this.checkOverlap(center, width, height)) {
			elements.push(this);
		}
		return;
	}
	if(this.southEast != null) {
		this.southEast.queryLeavesRecursive(elements, center, width, height);
	}
	if(this.northEast != null) {
		this.northEast.queryLeavesRecursive(elements, center, width, height);
	}
	if(this.southWest != null) {
		this.southWest.queryLeavesRecursive(elements, center, width, height);
	}
	if(this.northWest != null) {
		this.northWest.queryLeavesRecursive(elements, center, width, height);
	}
}

/**
 * Return a list of leafs
 *
 * @return (Array<QuadTree>) List of leafs
 */
QuadTree.prototype.queryAllLeaves = function(center, width, height) {
	var elements = new Array();
	this.queryLeavesRecursive(elements, center, width, height);
	return elements;
}

/**
 * Test if the current rectangle and other rectangle overlaps
 *
 * @param center (Point) Center of other rectangle
 * @param width (int) Width of other rectangle
 * @param height (int) Height of other rectangle
 *
 * @return (Boolean) True if the current rectangle and other rectangle overlaps
 */
QuadTree.prototype.checkOverlap = function(center, width, height) {
	return this.checkOverlapBetweenTwoRectangles(center, width, height, this.center, this.width, this.height);
}

/**
 * Test if two rectangle overlaps
 *
 * @param center (Point) Center of first rectangle
 * @param width (int) Width of first rectangle
 * @param height (int) Height of first rectangle
 * @param centerSecond (Point) Center of second rectangle
 * @param widthSecond (int) Width of second rectangle
 * @param heightSecond (int) Height of second rectangle
 *
 * @return (Boolean) True if two rectangle overlaps
 */
QuadTree.prototype.checkOverlapBetweenTwoRectangles = function(center, width, height, centerSecond, widthSecond, heightSecond) {
	if(center.getX() + (width / 2) < centerSecond.getX() - (widthSecond / 2) ||
	   center.getX() - (width / 2) > centerSecond.getX() + (widthSecond / 2) ||
	   center.getY() + (height / 2) < centerSecond.getY() - (heightSecond / 2) ||
	   center.getY() - (height / 2) > centerSecond.getY() + (heightSecond / 2)) {
		return false;
	}
	return true;
}

/**
 * Test if the point is into the rectangle
 *
 * @param point (Point) The point to test
 * @param center (Point) Center of rectangle
 * @param width (int) Width of rectangle
 * @param height (int) Height of rectangle
 *
 * @return (Boolean) True if the point is into the rectangle
 */
QuadTree.prototype.checkOverlapBetweenPointAndRectangle = function(point, center, width, height) {
	return this.checkOverlapBetweenTwoRectangles(point, 0, 0, center, width, height)
}

/**
 * Test if the point is into the circle
 *
 * @param point (Point) The point to test
 * @param center (Point) Center of the circle
 * @param radius (int) Radius of the circle
 *
 * @return (Boolean) True if the point is into the circle
 */
QuadTree.prototype.checkOverlapBetweenPointAndCircle = function(point, center, radius) {
	return(Math.pow(radius, 2) >= Math.pow(point.getX() - center.getX(), 2) + Math.pow(point.getY() - center.getY(), 2));
}

/**
 * Create arrays of elements
 */
QuadTree.prototype.createArrays = function() {
	this.points = new Array();
	this.objects = new Array();
}

/**
 * Return if the current area is a leaf
 *
 * @return (Boolean) True if current area is a leaf
 */
QuadTree.prototype.isLeaf = function() {
	return this.northEast == null && this.northWest == null && this.southEast == null && this.southWest == null;
}

/**
 * Return a number of elements
 *
 * @return (int) Number of elements
 */
QuadTree.prototype.getSize = function() {
	return this.nbElements;
}

/**
 * Return the depth
 *
 * @return (int) The depth
 */
QuadTree.prototype.getDepth = function() {
	return this.depth;
}

QuadTree.prototype.getCenter = function() {
	return this.center;
}

QuadTree.prototype.equals = function(tree) {
	return this.getCenter().equals(tree.getCenter());
}

QuadTree.prototype.getHeight = function() {
	return this.height;
}

QuadTree.prototype.getWidth = function() {
	return this.width;
}

QuadTree.prototype.getElements = function() {
	var elements = new Array();
	for(var i = 0; i < this.objects.length; i++) {
		elements.push(this.objects[i]);
	}
	return elements;
}

QuadTree.prototype.printRecursive = function() {
	if(this.isLeaf()) {
		console.log("New Cell");
		return;
	}
	if(this.southEast != null) {
		this.southEast.printRecursive();
	}
	if(this.northEast != null) {
		this.northEast.printRecursive();
	}
	if(this.southWest != null) {
		this.southWest.printRecursive();
	}
	if(this.northWest != null) {
		this.northWest.printRecursive();
	}
}

QuadTree.prototype.getNumberOfElementsInLeaf = function() {
	return this.objects.length;
}

QuadTree.prototype.getSumOfMasses = function() {
	return this.sumOfMasses;
}

QuadTree.prototype.getGravityCenter = function() {
	return this.gravityCenter;
}

/**
 * Return this object in string
 *
 * @return (String) This object in string formed
 */
QuadTree.prototype.toString = function() {
	return 	this.numberMaxElementsPerNode + "-" +
		this.center.toString() + "-" +
		this.width + "-" +
		this.height + "-" +
		this.nbElements + "-" +
		this.depth + "-" +
		this.southEast + "-" +
		this.northEast + "-" +
		this.southWest + "-" +
		this.northWest;
}
