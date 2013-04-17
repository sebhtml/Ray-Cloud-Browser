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
 * @param String text
 * @param Material material
 */
function RenderedText(center, text, material) {
	this.center = center;
	this.text = text;
	this.material = material;
}

/**
 * @return int
 */
RenderedText.prototype.getType = function() {
	return RENDERER_TEXT;
}

/**
 * @return Point
 */
RenderedText.prototype.getCenter = function() {
	return this.center;
}

/**
 * @return String
 */
RenderedText.prototype.getText = function() {
	return this.text;
}

/**
 * @return Material
 */
RenderedText.prototype.getMaterial = function() {
	return this.material;
}

/**
 * @param Object context
 */
RenderedText.prototype.drawText = function(context) {
	context.fillStyle = this.material.getFillStyle();
	context.font = this.material.getFont();
	context.textAlign = this.material.getAlign();
	context.fillText(this.text, this.center.getX(), this.center.getY());
}

/**
 * @return String
 */
RenderedText.prototype.toString = function() {
	return this.center.toString() + "-" + this.text + "-" + this.material.toString();
}
