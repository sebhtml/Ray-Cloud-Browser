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
 * Minimum coverage to display
 * TODO: add this in the user interface instead
 */
var CONFIG_MINIMUM_COVERAGE_TO_DISPLAY=10;

/**
 * The server to use for all web services.
 */
var CONFIG_WEB_SERVER="../server/";
//var CONFIG_WEB_SERVER="http://ec2-107-20-98-120.compute-1.amazonaws.com/server/";


// messaging service configuration

var messageValue=0;
var messageSymbols=new Object();
var RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE]="GET_FIRST_KMER_FROM_STORE";
var RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY]="GET_FIRST_KMER_FROM_STORE_REPLY";
var RAY_MESSAGE_TAG_GET_KMER_LENGTH=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_LENGTH]="GET_KMER_LENGTH";
var RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_LENGTH_REPLY]="GET_KMER_LENGTH_REPLY";
var RAY_MESSAGE_TAG_ADD_KMER=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_ADD_KMER]="ADD_KMER";
var RAY_MESSAGE_TAG_GET_KMER_FROM_STORE=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]="getSequenceAttributes";
var RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY]="GET_KMER_FROM_STORE_REPLY";
var RAY_MESSAGE_TAG_GET_MAPS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS]="getMaps";
var RAY_MESSAGE_TAG_GET_MAPS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS_REPLY]="GET_MAPS_REPLY";
var RAY_MESSAGE_TAG_GET_REGIONS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS]="getRegions";
var RAY_MESSAGE_TAG_GET_REGIONS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS_REPLY]="GET_REGIONS_REPLY";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]="getMapAttributes";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY]="GET_MAP_INFORMATION_REPLY";
var RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION]="getSequencesAroundLocation";
var RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY]="GET_REGION_KMER_AT_LOCATION_REPLY";

var messageReplies=new Object();
messageReplies[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]=RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_REGIONS]=RAY_MESSAGE_TAG_GET_REGIONS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_MAPS]=RAY_MESSAGE_TAG_GET_MAPS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION]=RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY;
