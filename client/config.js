/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
 *  Copyright (C) 2013  Jean-François Erdelyi
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
 * Minimum coverage to display
 * TODO: add this in the user interface instead
 */
var CONFIG_MINIMUM_COVERAGE_TO_DISPLAY=10;

/**
 * The server to use for all web services.
 */
var CONFIG_WEB_SERVER="../server/";
//var CONFIG_WEB_SERVER="http://browser.cloud.raytrek.com/server/"


/**
 * Debug level
 */
var CONFIG_DEBUG_NONE = 0;
var CONFIG_DEBUG_FPS_SIMPLE = 1;
var CONFIG_DEBUG_FPS_FULL = 2;
var CONFIG_DEBUG_QUADTREE = 3;
var CONFIG_DEBUG_FORCES = 4;
var CONFIG_DEBUG_REQUEST = 5;

// messaging service configuration

var messageValue=0;
var messageSymbols=new Object();
var messageActions=new Object();
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
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]="RAY_MESSAGE_TAG_GET_KMER_FROM_STORE";
messageActions[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]="getSequenceAttributes";
var RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY]="GET_KMER_FROM_STORE_REPLY";
var RAY_MESSAGE_TAG_GET_MAPS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS]="RAY_MESSAGE_TAG_GET_MAPS";
messageActions[RAY_MESSAGE_TAG_GET_MAPS]="getMaps";
var RAY_MESSAGE_TAG_GET_MAPS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAPS_REPLY]="GET_MAPS_REPLY";
var RAY_MESSAGE_TAG_GET_REGIONS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS]="RAY_MESSAGE_TAG_GET_REGIONS";
messageActions[RAY_MESSAGE_TAG_GET_REGIONS]="getRegions";
var RAY_MESSAGE_TAG_GET_REGIONS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGIONS_REPLY]="GET_REGIONS_REPLY";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]="RAY_MESSAGE_TAG_GET_MAP_INFORMATION";
messageActions[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]="getMapAttributes";
var RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY]="GET_MAP_INFORMATION_REPLY";
var RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION]="RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION";
messageActions[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION]="getSequencesAroundLocation";
var RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY]="GET_REGION_KMER_AT_LOCATION_REPLY";
var RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS]="RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS";
messageActions[RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS]="getSequenceAnnotations";
var RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS_REPLY=messageValue++;
messageSymbols[RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS_REPLY]="RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS_REPLY";

var messageReplies=new Object();
messageReplies[RAY_MESSAGE_TAG_GET_MAP_INFORMATION]=RAY_MESSAGE_TAG_GET_MAP_INFORMATION_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_REGIONS]=RAY_MESSAGE_TAG_GET_REGIONS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_MAPS]=RAY_MESSAGE_TAG_GET_MAPS_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE]=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION]=RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION_REPLY;
messageReplies[RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS]=RAY_MESSAGE_TAG_GET_OBJECT_ANNOTATIONS_REPLY;
