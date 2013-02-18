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

#include "WebService.h"

#include <storage/GraphDatabase.h>
#include <storage/PathDatabase.h>

#include <stdlib.h>
#include <string.h>

#include <iostream>
#include <vector>
#include <string>
#include <set>
#include <map>
using namespace std;


/**
 * \see http://www.ietf.org/rfc/rfc4627.txt
 * ( The application/json Media Type for JavaScript Object Notation (JSON) )
 */
bool WebService::processQuery(const char*queryString){

	cout<<"X-Powered-By: Ray Cloud Browser by Ray Technologies"<<endl;
	cout<<"Access-Control-Allow-Origin: *"<<endl;
	cout<<("Content-type: application/json\n\n");

	if(queryString==NULL){
		cout<<"{ \"message\": \"Error: you must provide a QUERY_STRING.\" }"<<endl;

		return false;
	}

	char tag[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundTag=m_storeRequest.getValue(queryString,"tag",tag,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundTag){
		//cout<<"Object not found!"<<endl;
		return false;
	}

	return dispatchQuery(tag,queryString);
}

WebService::WebService(){

	registerAction("RAY_MESSAGE_TAG_GET_KMER_FROM_STORE",&m_storeRequest);
	registerAction("RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION",&m_regionVisitor);
	registerAction("RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE",&m_earlyExplorer);
	registerAction("RAY_MESSAGE_TAG_GET_MAPS",&m_mapList);
	registerAction("RAY_MESSAGE_TAG_GET_REGIONS",&m_regionClerk);
}

void WebService::registerAction(const char*actionName,WebAction*actionHandler){

	m_productManager[actionName]=actionHandler;
}

bool WebService::dispatchQuery(const char*tag,const char*queryString){

	if(m_productManager.count(tag)>0){
		WebAction*action=m_productManager[tag];
		return action->call(queryString);
	}

	int match=0;

	if(strcmp(tag,"RAY_MESSAGE_TAG_GET_MAP_INFORMATION")==match){
		return call_RAY_MESSAGE_TAG_GET_MAP_INFORMATION(queryString);
	}

	cout<<"{ \"message\": \"tag not serviced\" } "<<endl;

// unmatched message tag
	return false;
}

bool WebService::call_RAY_MESSAGE_TAG_GET_MAP_INFORMATION(const char*queryString){

	char dataFile[CONFIG_MAXIMUM_VALUE_LENGTH];

	bool foundMap=m_storeRequest.getValue(queryString,"map",dataFile,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundMap)
		return false;

// fail in silence
	if(!m_storeRequest.isAllowedFile(dataFile))
		return false;

	GraphDatabase database;
	database.openFile(dataFile);

	if(database.hasError())
		return false;

	cout<<"{"<<endl;
	cout<<"\"map\": \""<<dataFile<<"\","<<endl;
	cout<<"\"kmerLength\": "<<database.getKmerLength()<<","<<endl;
	cout<<"\"entries\": "<<database.getEntries()<<endl;
	cout<<"}"<<endl;

	database.closeFile();

	return true;
}


