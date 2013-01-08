/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
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
 * A selection widget.
 *
 * \author Sébastien Boisvert
 */
function SelectionWidget(x,y,width,height,title,choices){
	this.x=x;
	this.y=y;
	this.title=title;
	this.choices=choices;

	this.offset=0;
	this.displayed=10;

	this.width=width;
	this.height=height;

	var buttonDimension=25;

	this.previousButton=new Button(this.x+this.width/2-buttonDimension/2-2,
		this.y+this.height-40,
		buttonDimension,buttonDimension,"<<",false);

	this.nextButton=new Button(this.x+this.width/2+buttonDimension/2+2,
		this.y+this.height-40,
		buttonDimension,buttonDimension,">>",false);

	this.okButton=new Button(this.x+this.width-buttonDimension/2-2,
		this.y+this.height-buttonDimension/2-2,
		buttonDimension,buttonDimension,"OK",false);
}

SelectionWidget.prototype.draw=function(context){

	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height );
	context.fillStyle = '#FFF8F9';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	context.fillStyle    = '#000000';
	context.font         = 'bold '+this.fontSize+'px Arial';
	context.fillText(this.title, this.x+this.width/5,this.y+20);

// show choices
	var i=0;

	context.fillStyle    = '#000000';
	context.font         = ''+this.fontSize+'px Arial';

	while(i<this.choices.length){

		context.fillText(this.choices[i]["name"]+" ("+this.choices[i]["file"]+")", this.x+10,this.y+50+i*10);
		i++;
	}

	this.previousButton.draw(context,null);
	this.nextButton.draw(context,null);
	this.okButton.draw(context,null);
}

SelectionWidget.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;

	this.previousButton.move(x,y);
	this.nextButton.move(x,y);
	this.okButton.move(x,y);
}
