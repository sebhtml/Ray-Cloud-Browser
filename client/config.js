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
 * The frequency at which the canvas is rendered.
 * This is not used if requestAnimationFrame is available.
 */
var CONFIG_RENDERING_FREQUENCY=24;

/**
 * The frequency at which the game runs.
 */
var CONFIG_GAME_FREQUENCY=32;

/**
 * The pull frequency.
 */
var CONFIG_PULL_FREQUENCY=64;

/**
 * The server to use for all web services.
 */
//var CONFIG_WEB_SERVER="../server/";
var CONFIG_WEB_SERVER="http://ec2-54-242-197-219.compute-1.amazonaws.com/~sebhtml/Ray-Cloud-Browser/server/";

