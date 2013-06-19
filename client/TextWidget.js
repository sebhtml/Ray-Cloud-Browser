/*
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
 * Créate a text widget for Ray Cloud Browser
 *
 * @author Jean-François Erdelyi
 */


/**
 * Construct a text widget
 *
 * @constructor
 */
function TextWidget(x, y, width, height, title, readOnly) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.title = title;
	this.readOnly = readOnly;

	this.moveBoxX = x + 20;
	this.moveBoxY = y;
	this.moveBoxWidth = width - 20;
	this.moveBoxHeight = 30;
	var type = "textarea";
	var textAreaHeight = 65;
	if(readOnly) {
		type = "textarea readonly";
		textAreaHeight = 45;
	}
	this.resetButton = new Button(x + 50 , y + height - 17, 50, 25, "Reset", false);
	this.submitButton = new Button(x + width - 50, y + height - 17, 50, 25, "Submit", false);
	var textWidgetBox = document.getElementById("textWidgetBox");

	var inner = textWidgetBox.innerHTML;
	var subString = inner.substring(4);
	var splitOfSubString = subString.split('"');
	this.listOfDiv = new Array();
	for(var i = 0; i < splitOfSubString.length; i++) {
		if(splitOfSubString[i] == " id=") {
			this.listOfDiv.push(splitOfSubString[i + 1]);
		}
	}
	this.contents = new Array();
	for(var i = 0; i < this.listOfDiv.length; i++) {
		this.contents.push(document.getElementById(this.listOfDiv[i]).value);
	}
	textWidgetBox.innerHTML = textWidgetBox.innerHTML + '<div id="' + title + '"><form><' + type + ' id="' + title + "TextArea" + '"></textarea></form></div>';
	for(var i = 0; i < this.listOfDiv.length; i++) {
		document.getElementById(this.listOfDiv[i]).value = this.contents[i];
	}
	this.div = document.getElementById(title);
	this.div.style.position = "absolute";
	this.div.style.left = (x + 10) + 'px';
	this.div.style.top = (y + 30) + 'px';

	this.textArea = document.getElementById(title + "TextArea");
	this.textArea.style.height = (height - textAreaHeight) + "px";
	this.textArea.style.width = (width - 22) + "px";
	this.textArea.style.resize = "none";

	this.closeButton = new Button(x + 10, y + 10, 20, 20, "X", false);
	this.hasChoice = false;
}

TextWidget.prototype.draw = function(context) {
	this.div = document.getElementById(this.title);
	this.textArea = document.getElementById(this.title + "TextArea");
	context.beginPath();
	context.font = 'bold ' + 12 + 'px Arial';
	context.fillStyle = "rgb(0,175,255)";
	context.strokeStyle = 'black';
	context.lineWidth = 1;
	context.textAlign = 'center';

	context.rect(this.x, this.y, this.width, this.height);
	context.fill();
	context.stroke();
	context.fillStyle = '#000000';
	context.fillText(this.title, this.x + this.width / 2, this.y + 20);
	context.closePath();
	if(!this.readOnly) {
		this.resetButton.draw(context);
		this.submitButton.draw(context);
	}
	this.closeButton.draw(context);
}

TextWidget.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
	this.moveBoxX += x;
	this.moveBoxY += y;
	this.div.style.left = (parseInt(this.div.style.left) + x) + 'px';
	this.div.style.top = (parseInt(this.div.style.top) + y) + 'px';

	this.resetButton.move(x, y);
	this.submitButton.move(x, y);
	this.closeButton.move(x, y);
}

TextWidget.prototype.handleMouseDown = function(x, y) {
	if(this.resetButton.handleMouseDown(x, y)) {
		this.textArea.value = "";
		this.resetButton.resetState();
	} else if(this.submitButton.handleMouseDown(x, y)) {
		this.hasChoice = true;
		this.submitButton.resetState();
	}
}

TextWidget.prototype.handleMouseDownMoveBox = function(x, y) {
	var x2 = this.moveBoxX + this.moveBoxWidth;
	var y2 = this.moveBoxY + this.moveBoxHeight;
	return !(x > x2 || x < this.moveBoxX || y > y2 || y < this.moveBoxY);
}

TextWidget.prototype.handleMouseDownCloseButton = function(x, y) {
	if(this.closeButton.handleMouseDown(x, y)) {
		this.kill();
	}
	return this.closeButton.getState();
}

TextWidget.prototype.kill = function() {
	document.getElementById(this.title).parentNode.removeChild(document.getElementById(this.title));
}

TextWidget.prototype.setContent = function(value) {
	this.textArea.value = value;
}

TextWidget.prototype.getHasChoice = function() {
	return this.hasChoice;
}

TextWidget.prototype.getContent = function() {
	return this.textArea.value;
}

TextWidget.prototype.resetState = function() {
	this.setContent("");
	this.hasChoice = false;
}

TextWidget.prototype.toString = function() {
	return "BOX : " + this.x + " - " + this.y + " - " + this.width + " - " + this.height + " - " + this.title + " - " + this.readOnly + " - " + this.getContent();
}