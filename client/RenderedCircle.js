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
 * @param Point center
 * @param int radius
 * @param Material material
 */
function RenderedCircle(center, radius, material) {
	this.center = center;
	this.radius = radius;
	this.material = material;
}

/**
 * @return int
 */
RenderedCircle.prototype.getType = function() {
	return RENDERER_CIRCLE;
}

/**
 * @return Point
 */
RenderedCircle.prototype.getCenter = function() {
	return this.center;
}

/**
 * @return Point
 */
RenderedCircle.prototype.getRadius = function() {
	return this.radius;
}

/**
 * @return Material
 */
RenderedCircle.prototype.getMaterial = function() {
	return this.material;
}

/**
 * @return String
 */
RenderedCircle.prototype.toString = function() {
	return this.center.toString() + "-" + this.radius + "-" + this.material.toString();
}
