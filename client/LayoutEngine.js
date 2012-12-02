/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
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
 * This class is responsible of the layout.
 *
 * \author Sébastien Boisvert
 */
function LayoutEngine(){
}

LayoutEngine.prototype.applyGoodLayout=function(vertex1,vertex2){
	var yRange=100;

	if(!vertex1.hasPosition()){
		vertex1.setX(vertex2.getX()-80);
		vertex1.setY(vertex2.getY()+Math.random()*yRange-yRange/2);

		vertex1.setPosition();
	}


	if(!vertex2.hasPosition()){
		vertex2.setX(vertex1.getX()+80);
		vertex2.setY(vertex1.getY()+Math.random()*yRange-yRange/2);

		vertex2.setPosition();
	}

}

LayoutEngine.prototype.setPositionOfFirstObject=function(vertex1){

	vertex1.setX(100);
	vertex1.setY(400);
}
