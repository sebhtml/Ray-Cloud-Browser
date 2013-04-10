/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Jean-François ERDELYI
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

function Assert = function() {
	this.nbTests = 0;
	this.nbFailTests = 0;
	this.nbSuccessTests = 0;
}

Assert.prototype.assertEquals = function(message, objectOne, objectTwo) {
	this.nbTests++;
	if(objectOne != objectTwo) {
		return this.fail(message); 
	}
	this.nbSuccessTests++;
	return true;
}

Assert.prototype.fail = function(message) {
	this.nbFailTests++;
	console.log(message);
	return false;
}

Assert.prototype.assertEquals = function(message, object) {
	this.nbTests++;
	if(!object) {
		return this.fail(message);
	}
	this.nbSuccessTests++;
	return true;
}

Assert.prototype.getNbTests = function() {
	return this.nbTests;
}

Assert.prototype.getNbFailTests = function() {
	return this.nbFailTests;
}

Assert.prototype.getNbSuccessTests = function() {
	return this.nbSuccessTests;
}