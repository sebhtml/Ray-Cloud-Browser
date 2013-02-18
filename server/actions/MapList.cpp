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

#include "MapList.h"

#include <JSONParser.h>

#include <iostream>
using namespace std;

/**
 * QUERY_STRING parameters: tag.
 */
bool MapList::call(const char*queryString){

// We make sure that the configuration is valid...
	const char*configuration="config.json";
	JSONParser parser;
	parser.parse(configuration);

	//parser.printFile();

	//JSONNode*node=parser.getNode();

// just dump directly the json file
	Mapper theMapper;

	theMapper.enableReadOperations();

	char*content=(char*)theMapper.mapFile(configuration);
	cout<<content;

	theMapper.unmapFile();

	return true;
}


