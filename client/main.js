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

/*
 * Global settings for game and rendering frequencies.
 */
var renderingFrequency=24;
var gameFrequency=32;

var screen=new Screen(gameFrequency,renderingFrequency);

/*
 * Start the rendering.
 */

/**
 * \see http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
 */
window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / renderingFrequency);
    };
})();

function renderScene(){
	requestAnimFrame(renderScene);

	screen.draw();
}

window.onload=renderScene;

/*
 * Start the game engine.
 */

var iterateGame=function(){
	screen.iterate();
}

var periodInMilliSeconds=1000 / gameFrequency;

setInterval(iterateGame,periodInMilliSeconds);

// Bind keyboard events.
document.onkeydown=function(e){
	screen.processKeyboardEvent(e);
}

