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

function testBigTree(tests) {
	var width = 20000;
	var height = 20000;
	var stepping = 100;

	var center2 = new Point(width / 2, height / 2);
	var bigQuadTree = new QuadTree(16, center2, 20000, 20000);

	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			bigQuadTree.insert(new Point(i, j), i + j);
		}
	}
	for(var i = 0; i < width; i += stepping) {
		for(var j = 0; j < height; j += stepping) {
			tests.assertTrue("	FAIL : Remove empty", !bigQuadTree.remove(new Point(i, j), i + j));
		}
	}
}
testBigTree(tests);
tests.showResults();
