/*
*  Ray Cloud Browser: interactively skim processed genomics data with energy
*  Copyright (C) 2012, 2013 Sébastien Boisvert
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


/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

/**
* The client code
*
* \author Sébastien Boisvert
*/
function Client() {
	/*
	* Global settings for game and rendering frequencies.
	*/
	var renderingFrequency = CONFIG_RENDERING_FREQUENCY;
	var gameFrequency = CONFIG_GAME_FREQUENCY;
	var init = false;
	/*
	* The variable can not be called screen because
	* of a bug in Microsoft Internet Explorer 9.
	*/
	var programScreen = new Screen(gameFrequency, renderingFrequency);
	/**
	* \see http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
	*/
	window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback){
				window.setTimeout(callback, 1000 / renderingFrequency);
			};
	})();
	function renderScene() {
		if(!init) {
			var periodInMilliSeconds = 1000 / gameFrequency;
			iterateGameEngine(periodInMilliSeconds);
			periodInMilliSeconds = 1000 / renderingFrequency;
			iterateRendering(periodInMilliSeconds);
			init = true;
		}
		requestAnimFrame(renderScene);
	}
	/*
	* Start the game engine.
	*/
	var iterateGameEngine = function(period) {
		if(!this.gamePeriod) {
			this.gamePeriod = period;
		}
		setTimeout(iterateGameEngine, this.gamePeriod);
		programScreen.iterate();
	}
	/*
	* Start the rendering.
	*/
	var iterateRendering = function(period) {
		if(!this.renderingPeriod) {
			this.renderingPeriod = period;
		}
		setTimeout(iterateRendering, this.renderingPeriod);
		programScreen.draw();
	}
	window.onload = renderScene;
	/*
	* Bind keyboard events.
	*/
	document.onkeydown = function(e) {
		programScreen.processKeyboardEvent(e);
	}
}
