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
 * Implementation of Barnes Hut Algorithm
 *
 * @author Jean-François Erdelyi
 *
 * @see http://arborjs.org/docs/barnes-hut
 */

/**
 * Construct a BarnesHutAlgorithm
 *
 * @constructor
 *
 * @param teta (float)
 */
function BarnesHutAlgorithm(teta) {
	this.gravitationalForce = -10;
	this.teta = teta;
}


/**
 * Compute the Newton force
 *
 * @param pointA (Point)
 * @param massA (int)
 * @param pointB (Point)
 * @param massB (int)
 *
 * @return (Point)
 */
BarnesHutAlgorithm.prototype.computeNewtonForce = function(pointA, massA, pointB, massB) {
	if(pointA.equals(pointB)) {
		return new Point(0, 0);
	}
	var vector = new Point(pointB.getX(), pointB.getY());
	var vectorNorm = Math.sqrt(Math.pow(vector.getX(), 2) + Math.pow(vector.getY(), 2));
	var force = -this.gravitationalForce * massA * massB / Math.pow(vectorNorm, 2);

	vector.substract(pointA);
	vector.divideBy(vectorNorm);
	vector.multiplyBy(force);

	return vector;
}


/**
 * Compute the approximation of Barnes Hut
 *
 * @param object (Object)
 * @param point (Point)
 * @param mass (int)
 * @param quadTree (QuadTree)
 * @param force (Point)
 */
BarnesHutAlgorithm.prototype.approximateForce = function(object, point, mass, quadTree, force) {
	var widthOfQuadTree = quadTree.getWidth();
	var distance = Math.sqrt(Math.pow(quadTree.getGravityCenter().getX() - point.getX(), 2) + Math.pow(quadTree.getGravityCenter().getY() - point.getY(), 2));
	var widthTimesWidth = widthOfQuadTree;

	//We can approximate because the node sufficiently far from the center
	if(widthTimesWidth / distance < this.teta) {
		var newForce = this.computeNewtonForce(point, mass, quadTree.getGravityCenter(), quadTree.getSumOfMasses() * mass);
		force.add(newForce);

	//We can't approximate and the QuadTree is a leaf
	} else if(quadTree.isLeaf()) {
		var points = quadTree.getPoints();
		var objects = quadTree.getObjects();
		for(var i = 0; i < points.length; i++) {
			if(object == objects[i] && point.equals(points[i])) {
				continue;
			}
			var newForce = this.computeNewtonForce(point, mass, points[i], mass);
			force.add(newForce);
		}

	//We can't approximate and the QuadTree is not a leaf
	} else {
		if(quadTree.getSouthEast() != null) {
			this.approximateForce(object, point, mass, quadTree.getSouthEast(), force);
		}
		if(quadTree.getNorthEast() != null) {
			this.approximateForce(object, point, mass, quadTree.getNorthEast(), force);
		}
		if(quadTree.getSouthWest() != null) {
			this.approximateForce(object, point, mass, quadTree.getSouthWest(), force);
		}
		if(quadTree.getNorthWest() != null) {
			this.approximateForce(object, point, mass, quadTree.getNorthWest(), force);
		}
	}
}


