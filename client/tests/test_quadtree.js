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

var tests = new Assert();

var center = new Point(10, 10);
var quadTree = new QuadTree(4, center, 40, 40);

var centerObject = new Point(2, 2);
var object = new QuadTree(4, center, 20, 20);

tests.assertTrue("	FAIL : Remove empty", !quadTree.remove(centerObject, object));
quadTree.insert(centerObject, object);
tests.assertTrue("	FAIL : Remove", quadTree.remove(centerObject, object));
tests.assertTrue("	FAIL : Remove empty", !quadTree.remove(centerObject, object));

function testOverlap(tests) {
	quadTree = new QuadTree(5, new Point(1000, 1000), 2000, 2000);
	tests.assertTrue("	FAIL : overlap", quadTree.overlap(new Point(500, 500), 100, 100));
	tests.assertTrue("	FAIL : overlap", !quadTree.overlap(new Point(10000, 10000), 100, 100));
}

function testSmallTree(tests) {
	var width = 200;
	var height = 200;
	var stepping = 100;
	var elementsPerCell = 2;

	var center2 = new Point(width / 2, height / 2);
	var smallQuadTree = new QuadTree(elementsPerCell, center2, width, height);

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			smallQuadTree.insert(new Point(i, j), i + j);
		}
	}

	var result = smallQuadTree.queryAll();
	tests.assertTrue("Tree with elements", result.length > 0);

	var result2 = smallQuadTree.query(new Point(width / 2, height / 2, width, height));
	tests.assertTrue("Tree with elements", result2.length > 0);
	tests.assertEquals("Size of tree", 4, smallQuadTree.size());
	tests.assertEquals("Size of tree", 4, result2.length);
	//smallQuadTree.printStatus();
}

function testBigTree(tests) {
	var width = 20000;
	var height = 20000;
	var stepping = 100;
	var tabPoint = new Array();
	var k = 0;

	var center2 = new Point(width / 2, height / 2);
	var bigQuadTree = new QuadTree(16, center2, 20000, 20000);

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			bigQuadTree.insert(new Point(i, j), i + j);
		}
	}

	tests.assertTrue("	FAIL : query is not empty", tabPoint.length == 0);
	tabPoint = bigQuadTree.query(new Point(500, 500), 500, 500);
	//console.log(tabPoint);
	tests.assertTrue("	FAIL : query is empty", tabPoint.length != 0);

	return;

	tabPoint = new Array();
	tests.assertTrue("	FAIL : query is not empty", tabPoint.length == 0);
	tabPoint = bigQuadTree.queryAll();
	console.log(tabPoint);
	tests.assertTrue("	FAIL : query is not full", tabPoint.length == 200 * 200);

	return;

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			tests.assertTrue("	FAIL : fail query all", tabPoint[k] == i + j);
			k++
		}
	}

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			tests.assertTrue("	FAIL : Remove empty", !bigQuadTree.remove(new Point(i, j), i + j));
		}
	}
}
testOverlap(tests);
testSmallTree(tests);
testBigTree(tests);
tests.showResults();
