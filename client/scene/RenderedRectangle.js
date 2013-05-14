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
 * @param point
 * @param h
 * @param w
 * @param material
 */
function RenderedRectangle(point, height, width, material) {
	this.point = point;
	this.height = height;
	this.width = width;
	this.material = material;
}

/**
 * @return int
 */
RenderedRectangle.prototype.getType = function() {
	return RENDERER_RECTANGLE;
}

/**
 * @return int
 */
RenderedRectangle.prototype.getPoint = function() {
	return this.point;
}

/**
 * @return int
 */
RenderedRectangle.prototype.getHeight = function() {
	return this.height;
}

/**
 * @return int
 */
RenderedRectangle.prototype.getWidth = function() {
	return this.width;
}

/**
 * @return Material
 */
RenderedRectangle.prototype.getMaterial = function() {
	return this.material;
}

/**
 * @param context
 */
RenderedRectangle.prototype.drawRectangle = function(context) {
	context.rect(this.point.getX(), this.point.getY(), this.width, this.height);
	context.fillStyle = this.material.getFillStyle();
	context.lineWidth = this.material.getLineWidth();
	context.strokeStyle = this.material.getStrokeStyle();
}

/**
 * @return String
 */
RenderedRectangle.prototype.toString = function() {
	return this.point.toString() + "-" + this.height + "-" + this.width + "-" + this.material.toString();
}
