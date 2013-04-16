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

tests.assertTrue("Remove empty", !quadTree.remove(centerObject, object));
quadTree.insert(centerObject, object);
tests.assertTrue("Remove", quadTree.remove(centerObject, object));
tests.assertTrue("Remove empty", !quadTree.remove(centerObject, object));

function testOverlap(tests) {
	quadTree = new QuadTree(5, new Point(1000, 1000), 2000, 2000);
	tests.assertTrue("Overlap in", quadTree.overlap(new Point(500, 500), 100, 100));
	tests.assertTrue("Overlap out", !quadTree.overlap(new Point(10000, 10000), 100, 100));
}

function testUpdate(tests) {
	var tabResult = new Array();
	var quadTree = new QuadTree(4, new Point(1000, 1000), 2000, 2000);

	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tests.assertTrue("Not true, quad tree is not empty", quadTree.size() == 0);

	quadTree.insert(new Point(0, 0), 391);
	quadTree.insert(new Point(5, 5), 5);

	quadTree.update(new Point(5, 5), new Point(25, 25), 5);
	var resultOldPoint = quadTree.query(new Point(5, 5), 0, 391);
	var resultNewPoint = quadTree.query(new Point(25, 25), 0, 391);
	tests.assertEquals("Not equals, old point is not undefined - case 1", undefined, resultOldPoint[0]);
	tests.assertEquals("Not equals, new point is not defined", 5, resultNewPoint[0]);

	quadTree.insert(new Point(10, 10), 10);
	quadTree.insert(new Point(15, 15), 15);
	quadTree.insert(new Point(20, 20), 20);
	quadTree.insert(new Point(25, 25), 25);

	tabResult = new Array();
	tabResult = quadTree.queryAll();
	tests.assertEquals("Not equals, tab of result size is not 6: " + tabResult, 6, tabResult.length);
	tests.assertEquals("Not equals, quad tree size is not 6: " + tabResult, 6, quadTree.size());

	var oldPoint = new Point(0, 0);
	quadTree.update(oldPoint, new Point(1500, 1500), 391);
	var resultNewPoint = quadTree.query(new Point(1500, 1500), 0, 391);
	tests.assertEquals("Not equals, new point is not defined", 391, resultNewPoint[0]);
	var resultOldPoint = quadTree.query(oldPoint, 0, 391);
	tests.assertEquals("Not equals, object for old point " + oldPoint.toString() + " is not undefined - case 2", 0, resultOldPoint.length);
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

	var result2 = smallQuadTree.query(new Point(width / 2, height / 2), width, height);
	tests.assertTrue("Tree with elements", result2.length > 0);
	tests.assertEquals("Size of tree", 4, smallQuadTree.size());
	tests.assertEquals("Size of tree", 4, result2.length);
}

function testBigTree(tests) {
	var width = 20000;
	var height = 20000;
	var stepping = 100;
	var tabResult = new Array();
	var k = 0;
	var center2 = new Point(width / 2, height / 2);
	var bigQuadTree = new QuadTree(16, center2, 20000, 20000);

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			bigQuadTree.insert(new Point(i, j), i + j);
		}
	}

	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.query(new Point(500, 500), 500, 500);
	tests.assertTrue("Not true, tab of result empty", tabResult.length != 0);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.query(center2, width, height);
	tests.assertEquals("Not equals, 40000 with size of tab of result", 40000, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.queryAll();
	tests.assertEquals("Not equals, 40000 with size of tab of result", 40000, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.query(new Point(1, 1), 0, 0);
	tests.assertEquals("Not equals, 0 with size of big tree", 0, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.query(new Point(0, 0), 0, 0);
	tests.assertEquals("Not equals, 1 with size of big tree", 1, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.queryCircle(new Point(1, 1), 0);
	tests.assertEquals("Not equals, queryCircle", 0, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.queryCircle(new Point(0, 0), 500000);
	tests.assertEquals("Not equals, queryCircle", 40000, tabResult.length);

	tabResult = new Array();
	tests.assertTrue("Not true, tab of result is not empty", tabResult.length == 0);
	tabResult = bigQuadTree.queryCircle(new Point(0, 0), 200);
	tests.assertTrue("Not true tab length = " + tabResult.length, tabResult.length > 0);

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			tests.assertTrue("Remove empty i: " + i + " j: " + j, bigQuadTree.remove(new Point(i, j), i + j));
		}
	}
}

function testsOnVeryLargeStructure(tests) {

	var treeCenter = new Point(0, 0);
	var halfWidth = 1000000000;
	var maximumNumberOfObjectsPerCell = 32;
	var tree = new QuadTree(maximumNumberOfObjectsPerCell, treeCenter, 2*halfWidth, 2*halfWidth)
	
	tests.assertEquals("testsOnVeryLargeStructure 001", 0, tree.size());

	var n = 10000;

	var points = new Array();

	for(var i = 0; i < n; i++) {
		var x = Math.random() * 2 * halfWidth;
		x -= halfWidth;
		var y = Math.random() * 2 * halfWidth;
		y -= halfWidth;
		
		var point = new Point(x, y);
		tree.insert(point, i);

		var elements = tree.queryCircle(point, 0);
		tests.assertEquals("testsOnVeryLargeStructure 002", 1, elements.length);
		tests.assertEquals("testsOnVeryLargeStructure 003", i, elements[0]);
		tests.assertEquals("testsOnVeryLargeStructure 088", i + 1, tree.size());

		points.push(point);
	}

	tests.assertEquals("testsOnVeryLargeStructure 128", n, tree.size());

	for(var i = 0; i < n; i++) {
		var oldPoint = points[i];
		var newPoint = new Point(oldPoint.getX() / 2, oldPoint.getY() / 2);
		tree.update(oldPoint, newPoint, i);

		var elements = tree.queryCircle(oldPoint, 0);
		tests.assertEquals("testsOnVeryLargeStructure 302", 0, elements.length);
		elements = tree.queryCircle(newPoint, 0);
		tests.assertEquals("testsOnVeryLargeStructure 342", 1, elements.length);
		tests.assertEquals("testsOnVeryLargeStructure 388", n, tree.size());
	}

	tests.assertEquals("testsOnVeryLargeStructure 488", n, tree.size());
}

testOverlap(tests);
testSmallTree(tests);
testBigTree(tests);
testUpdate(tests);
testsOnVeryLargeStructure(tests);
tests.showResults();

