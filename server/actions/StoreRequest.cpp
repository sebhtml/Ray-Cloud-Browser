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

#include "StoreRequest.h"

#include <storage/GraphDatabase.h>
#include <storage/Configuration.h>

#include <iostream>
#include <vector>
#include <set>
using namespace std;

#include <stdlib.h>

/**
 * Required parameters in QUERY_STRING: tag, object, depth.
 */
bool StoreRequest::call(const char*queryString){

	int mapIndex=0;
	bool foundMap=getValueAsInteger(queryString,"map",&mapIndex);

	if(!foundMap)
		return false;

	Configuration configuration;
	configuration.open(CONFIG_FILE);

	int numberOfMaps=configuration.getNumberOfMaps();

	if(!(mapIndex<numberOfMaps))
		return false;

	const char*dataFile=configuration.getMapFile(mapIndex);

// fail in silence
	if(!isAllowedFile(dataFile))
		return false;

	char requestedObject[CONFIG_MAXIMUM_VALUE_LENGTH];

	bool foundObject=getValue(queryString,"object",requestedObject,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundObject)
		return false;

	const char*key=requestedObject;

	if(key==NULL)
		return false;

	GraphDatabase database;
	database.openFile(dataFile);

	int maximumToVisit=CONFIG_MAXIMUM_OBJECTS_TO_PROCESS;

	char depth[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundDepth=getValue(queryString,"depth",depth,CONFIG_MAXIMUM_VALUE_LENGTH);

/*
 * Use the requested depth.
 */
	if(foundDepth){
		int theDepth=atoi(depth);

		if(theDepth<=CONFIG_MAXIMUM_OBJECTS_TO_PROCESS)
			maximumToVisit=theDepth;
	}

	vector<string> productionQueue;
	set<string> visited;
	int head=0;

	string first=key;

	productionQueue.push_back(first);

	cout<<"{"<<endl;

	cout<<"\"map\": "<<mapIndex<<","<<endl;
	cout<<"\"object\": \""<<key<<"\","<<endl;
	cout<<"\"vertices\": ["<<endl;

	bool printedFirst=false;

	while(head<(int)productionQueue.size() && (int)visited.size()<maximumToVisit){

		string*stringObject=&(productionQueue[head]);

		head++;
		visited.insert(*stringObject);

		const char*object=stringObject->c_str();

		VertexObject vertex;
		bool found = database.getObject(object,&vertex);

		if(!found)
			continue;

		if(printedFirst){
			cout<<","<<endl;
		}

		vertex.writeContentInJSON(&cout);

		vector<string> friends;
		vertex.getParents(&friends);
		vertex.getChildren(&friends);

		for(int i=0;i<(int)friends.size();i++){
			string*friendObject=&(friends[i]);

			if(visited.count(*friendObject)>0)
				continue;

			productionQueue.push_back(*friendObject);
		}

		printedFirst=true;
	}

	cout<<"]}"<<endl;

	database.closeFile();
	configuration.close();

	return true;
}
