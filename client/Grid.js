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

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

function Grid(step){

	this.cells=new Object();
	this.step=step;

	this.keyCells=new Object();
}

Grid.prototype.removeEntry=function(key){
	
	if(!(key in this.keyCells)){
		return;
	}

	var cells=this.keyCells[key];

/*
 * The object can be in more than 1 cell.
 */
	for(i in cells){
		delete cells[i][key];
	}

/*
 * The object is not stored anymore.
 */
	this.keyCells[key]=new Array();
}

Grid.prototype.addEntry=function(key,centerX,centerY,width,height){

	//console.log("addEntry "+key+" "+centerX+" "+centerY+" "+width+" "+height);

	var cells=this.getCells(centerX,centerY,width,height);
	var keyCells=new Array();

	//console.log(cells.length+" cells to process");
	for(i in cells){
		var cell=cells[i];

/*
 * Store the fact that the object with key is in the
 * cell.
 */
		cell[key]=4096;

		//console.log("Added "+key);
		keyCells.push(cell);
	}

	this.keyCells[key]=keyCells;
}

Grid.prototype.getEntries=function(centerX,centerY,width,height){


	var cells=this.getCells(centerX,centerY,width,height);
	var entries=new Object();

	//console.log(cells.length+" cells to scan");

	var i=0;

	//console.log(cells2);

	while(i<cells.length){
		var cell=cells[i];
		for(key in cell){
			if(!(key in entries) && cell.hasOwnProperty(key) && cell[key]==4096){
				entries[key]=1;

				//console.log("Fetched from cell: "+key+" value= "+cell[key]);
			}
		}

		i++;
	}

	//console.log("Got "+added+" hits");

/* 
 * Convert the result in an array.
 */
	var values=new Array();

	for(i in entries){
		values.push(i);
	}

	return values;
}

Grid.prototype.getCells=function(centerX,centerY,width,height){

	//console.log("getCells"+" "+centerX+" "+centerY+" "+width+" "+height);

	var minX=Math.floor(centerX-width/2);
	minX=minX - minX%this.step;
	var maxX=Math.floor(centerX+width/2);
	maxX=maxX- maxX%this.step+this.step;
	var minY=Math.floor(centerY-height/2);
	minY=minY - minY%this.step;
	var maxY=Math.floor(centerY+height/2);
	maxY=maxY - maxY%this.step+this.step;
	
	var cells=new Array();

	//console.log("Range "+minX+" "+maxX+" "+minY+" "+maxY);

	var i=minX;
	while(i<=maxX){
		var j=minY;

		if(!(i in this.cells)){
			this.cells[i]=new Object();
		}

		while(j<=maxY){
			
			if(!(j in this.cells[i])){
				this.cells[i][j]=new Object();
			}

			var cell=this.cells[i][j];

			cells.push(cell);

			j+=this.step;
		}

		i+=this.step;
	}

	return cells;
}
