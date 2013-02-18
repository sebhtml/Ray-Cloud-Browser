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
#include "JSONParser.h"

#include <actions/WebAction.h>
#include <actions/StoreRequest.h>
#include <actions/RegionVisitor.h>

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
}

bool WebService::dispatchQuery(const char*tag,const char*queryString){

	map<string,WebAction*> productManager;

	StoreRequest storeRequest;
	productManager["RAY_MESSAGE_TAG_GET_KMER_FROM_STORE"]=&storeRequest;

	RegionVisitor regionVisitor;
	productManager["RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION"]=&regionVisitor;

	if(productManager.count(tag)>0){
		WebAction*action=productManager[tag];
		return action->call(queryString);
	}

	int match=0;

	if(strcmp(tag,"RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE")==match){
		return call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(queryString);
	}else if(strcmp(tag,"RAY_MESSAGE_TAG_GET_MAPS")==match){
		return call_RAY_MESSAGE_TAG_GET_MAPS(queryString);
	}else if(strcmp(tag,"RAY_MESSAGE_TAG_GET_REGIONS")==match){
		return call_RAY_MESSAGE_TAG_GET_REGIONS(queryString);
	}else if(strcmp(tag,"RAY_MESSAGE_TAG_GET_MAP_INFORMATION")==match){
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



/**
 * Parameters needed in QUERY_STRING: tag, depth.
 */
bool WebService::call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(const char*queryString){

	cout<<"{ \"message\": \"none\" }"<<endl;

	return true;
}

/**
 * QUERY_STRING parameters: tag.
 */
bool WebService::call_RAY_MESSAGE_TAG_GET_MAPS(const char*queryString){

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

/**
 * Required QUERY_STRING parameters: tag, section.
 */
bool WebService::call_RAY_MESSAGE_TAG_GET_REGIONS(const char*queryString){

	char buffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool found=m_storeRequest.getValue(queryString,"section",buffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!found)
		return false;

// fail in silence
	if(!m_storeRequest.isAllowedFile(buffer))
		return false;

	PathDatabase mock;
	mock.openFile(buffer);

	//mock.debug();
	
	cout<<"{ \"section\": \""<<buffer<<"\","<<endl;

	int entries=mock.getEntries();

	char firstBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundFirst=m_storeRequest.getValue(queryString,"first",firstBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundFirst)
		return false;

	int first=atoi(firstBuffer);

	if(first<0)
		first=0;

	if(first>=entries)
		first=entries-1;

	char readaheadBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundReadahead=m_storeRequest.getValue(queryString,"readahead",readaheadBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundReadahead)
		return false;

	int readahead=atoi(readaheadBuffer);

	cout<<"\"count\": "<<entries<<","<<endl;
	cout<<"\"first\": "<<first<<","<<endl;
	cout<<"\"readahead\": "<<readahead<<","<<endl;

	cout<<"\"regions\": ["<<endl;

	char name[1024];

	bool discardSpaces=false;
	
	bool isFirst=true;

	int printed=0;

	for(int i=first;i<entries;i++){

		if(printed>=readahead)
			break;

		if(isFirst){
			isFirst=false;
		}else{
			cout<<","<<endl;
		}

		mock.getName(i,name);

		int theLength=strlen(name);
		int nucleotides=mock.getSequenceLength(i);

		cout<<"{\"name\":\"";

// only take the first token if configured as such

		for(int j=0;j<theLength;j++){
			if(name[j]==' ' && discardSpaces)
				break;

			cout<<name[j];
		}

		cout<<"\", \"nucleotides\":"<<nucleotides<<"}";

		printed++;
	}

	cout<<" ] }"<<endl;

	mock.closeFile();

	return true;
}


