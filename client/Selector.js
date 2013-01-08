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
 * This is the panel that selects:
 * - map
 * - section
 * - region
 * - location
 *
 * \author Sébastien Boisvert
 */
function Selector(x,y,width,height,dataStore){

	this.dataStore=dataStore;
	var width=width;
	var height=height;

	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;

	var step=0;

	this.SLAVE_MODE_PULL_MAPS=step++;
	this.SLAVE_MODE_SELECT_MAP=step++;
	this.SLAVE_MODE_SELECT_SECTION=step++;
	this.SLAVE_MOVE_SELECT_REGION=step++;
	this.SLAVE_MODE_SELECT_LOCATION=step++;

	this.state=this.SLAVE_MODE_PULL_MAPS;

	this.objects=[];

	this.requestedMaps=false;
}

/**
 * Since this method is called several times per second,
 * we'll use it as a progress thread.
 */
Selector.prototype.draw=function(context){

	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height );
	context.fillStyle = '#FFF8F9';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

// some granularity
	if(this.state==this.SLAVE_MODE_PULL_MAPS){

		//console.log("SLAVE_MODE_PULL_MAPS is done");

		if(!this.requestedMaps){
			var message=new Message(RAY_MESSAGE_TAG_GET_MAPS,this,this.dataStore,null);

			//console.log("Sending RAY_MESSAGE_TAG_GET_MAPS");

			this.receivedMaps=false;
			this.requestedMaps=true;

			this.dataStore.receiveAndProcessMessage(message);

		}else if(this.receivedMaps){

			//console.log("Creating widget for selecting map");
			//console.log(this.mapChoices);

			this.mapWidget=new SelectionWidget(this.x,this.y,this.width,this.height,"Select map",this.mapChoices);

			this.objects.push(this.mapWidget);

			this.state=this.SLAVE_MODE_SELECT_MAP;

		}

	}else if(this.state==this.SLAVE_MODE_SELECT_MAP){

		//console.log("SLAVE_MODE_SELECT_MAP");

		this.mapWidget.draw(context);
	}
}

Selector.prototype.handleMouseDown=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	return false;
}

Selector.prototype.handleMouseMove=function(x,y){

	this.mouseX=x;
	this.mouseY=y;

	return false;
}

Selector.prototype.handleMouseUp=function(x,y){

}

Selector.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;

	for(var item in this.objects){
		this.objects[item].move(x,y);
	}
}

Selector.prototype.receiveAndProcessMessage=function(message){

	if(message.getTag()==RAY_MESSAGE_TAG_GET_MAPS_REPLY){

		//console.log("Selector received RAY_MESSAGE_TAG_GET_MAPS_REPLY");
		//console.log(message.getContent());

		this.mapChoices=message.getContent()["maps"];

		this.receivedMaps=true;
	}
}

Selector.prototype.receiveMessageFromTheWeb=function(message){
	this.receiveAndProcessMessage(message);
}
