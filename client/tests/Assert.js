/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013 Jean-François ERDELYI
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
 * Construct a Assert object
 * 
 * @constructor
 */
function Assert() {
	this.nbTests = 0;
	this.nbFailedTests = 0;
	this.nbSuccessfullTests = 0;
}


/**
 * Used to compare two object 
 * 
 * @param message Message print if the test is failed
 * @param objectOne The first object to compare
 * @param objectTwo The second object to compare
 *
 * @return Boolean : true if the test is ok
 */
Assert.prototype.assertEquals = function(message, objectOne, objectTwo) {
	this.nbTests++;
	if(objectOne != objectTwo) {
		return this.fail(message); 
	}
	this.nbSuccessfullTests++;
	return true;
}


/**
 * Used to incremented by one the number of failed tests
 * 
 * @param message Message print
 * 
 * @return Boolean : false 
 */
Assert.prototype.fail = function(message) {
	this.nbFailedTests++;
	console.log(message);
	return false;
}


/**
 * Used to test if condition is true
 * 
 * @param message Message print if the test is failed
 * @param condition Condition to test
 *
 * @return Boolean : true if the test is ok
 */
Assert.prototype.assertTrue = function(message, condition) {
	this.nbTests++;
	if(!condition) {
		return this.fail(message);
	}
	this.nbSuccessfullTests++;
	return true;
}


/**
 * Return the number of passed tests
 *
 * @return Integer : number of passed test 
 */
Assert.prototype.getNbTests = function() {
	return this.nbTests;
}


/**
 * Return the number of failed tests
 *
 * @return Integer : number of test failed
 */
Assert.prototype.getNbFailedTests = function() {
	return this.nbFailedTests;
}


/**
 * Return the number of successfull tests
 *
 * @return Integer : number of test passed
 */
Assert.prototype.getNbSuccessfullTests = function() {
	return this.nbSuccessfullTests;
}