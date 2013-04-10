

/**
 * Construct a QuadTree
 * 
 * @param nbMaxNode : numbers of ellements max in this cell
 * @param center : contains center of this cell
 * @param w : the width of this cell
 * @param h : the height of this cell
 */
function QuadTree(nbMaxNode, center, w, h) {
	this.NB_MAX_NODE = nbMaxNode;
	this.center = center;
	this.w = w;
	this.h = h;

	this.southWest = null;
	this.northEast = null;
	this.southWest = null;
	this.northWest = null;

	this.points = new Array();
	this.objects = new Array();
}

/**
 * Insert ellement into this cell
 * 
 * @param point :
 * @param object ;
 */
QuadTree.prototype.insert = function(point, object) {
	this.points.push(point);
	this.objects.push(object);

	if(this.points.length > this.NB_MAX_NODE) {
		for(var i = 0; i < this.points.length; i++) {
			if(this.points[i].getX() < this.origin.getX()) {
				//South West
				if(this.points[i].getY() < this.origin.getY()) {
					if(this.southWest == null) {
						var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() - (this.h / 2));
						this.southWest = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.w / 2), (this.h / 2));
					}
					this.southWest.insert(this.point[i], this.objects[i]);

				//North West
				} else {
					if(this.northWest == null) {
						var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() - (this.h / 2));
						this.northWest = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.w / 2), (this.h / 2));
					}
					this.northWest.insert(this.point[i], this.objects[i]);
				}
			} else {
				//South East
				if(this.points[i].getY() < this.origin.getY()) {
					if(this.southEast == null) {
						var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() - (this.h / 2));
						this.southEast = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.w / 2), (this.h / 2));
					}
					this.southEast.insert(this.point[i], this.objects[i]);

				//North East
				} else {
					if(this.northEast == null) {
						var newOrigin = new Point(this.origin.getX() - (this.w / 2), this.origin.getY() - (this.h / 2));
						this.northEast = new QuadTree(this.NB_MAX_NODE, newOrigin, (this.w / 2), (this.h / 2));
					}
					this.northEast.insert(this.point[i], this.objects[i]);
				}
			}
		}
	}
}
