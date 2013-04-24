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
 * @author: Jean-François Erdelyi
 */

/**
 * @constructor
 *
 * @param Point pointA
 * @param Point pointB
 * @param Material material
 */
function RenderedLine(pointA, pointB, material) {
	this.pointA = pointA;
	this.pointB = pointB;
	this.material = material;
}

/**
 * @return int
 */
RenderedLine.prototype.getType = function() {
	return RENDERER_LINE;
}

/**
 * @return Point
 */
RenderedLine.prototype.getPointA = function() {
	return this.pointA;
}

/**
 * @return Point
 */
RenderedLine.prototype.getPointB = function() {
	return this.pointB;
}

/**
 * @return Material
 */
RenderedLine.prototype.getMaterial = function() {
	return this.material;
}

/**
 * @param Object context
 */
RenderedLine.prototype.drawLine = function(context) {
	context.moveTo(this.pointA.getX(), this.pointA.getY());
	context.lineTo(this.pointB.getX(), this.pointB.getY());
}

/**
 * @return String
 */
RenderedLine.prototype.toString = function() {
	return this.pointA.toString() + "-" + this.pointB.toString() + "-" + this.material.toString();
}
