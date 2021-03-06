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
 * @param String strokeStyle
 * @param int lineWidth
 * @param String fillStyle
 * @param String font
 * @param String align
 */
function Material(strokeStyle, lineWidth, fillStyle, font, align) {
	this.strokeStyle = strokeStyle;
	this.lineWidth = lineWidth;
	this.fillStyle = fillStyle;
	this.font = font;
	this.align = align;
}


/**
 * @return String
 */
Material.prototype.getStrokeStyle = function() {
	return this.strokeStyle;
}

/**
 * @return int
 */
Material.prototype.getLineWidth = function() {
	return this.lineWidth;
}

/**
 * @return String
 */
Material.prototype.getFillStyle = function() {
	return this.fillStyle;
}

/**
 * @return String
 */
Material.prototype.getFont = function() {
	return this.font;
}

/**
 * @return String
 */
Material.prototype.getAlign = function() {
	return this.align;
}

/**
 * @param Object context
 */
Material.prototype.startRendering = function(context) {
	context.beginPath();
}

/**
 * @param Object context
 */
Material.prototype.stopRendering = function(context) {
	context.lineWidth = this.lineWidth;
	context.strokeStyle = this.strokeStyle;
	context.fillStyle = this.fillStyle;
	if(this.strokeStyle != "") {
		context.stroke();
	}
	if(this.fillStyle != "") {
		context.fill();
	}
}

/**
 * @return String
 */
Material.prototype.toString = function() {
	return this.strokeStyle + "-" + this.lineWidth + "-" + this.fillStyle + "-" + this.font;
}

