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
#include "GraphDatabase.h"
#include "JSONParser.h"

#include <stdlib.h>
#include <string.h>

#include <iostream>
#include <vector>
#include <string>
#include <set>
using namespace std;


#define CONFIG_MAXIMUM_VALUE_LENGTH 256
#define CONFIG_MAXIMUM_OBJECTS_TO_PROCESS 4096

bool WebService::getValue(const char*query,const char*name,char*value,int maximumValueLength){
	for(int i=0;i<(int)strlen(query);i++){
		bool match=true;

		//cout<<"Query+i: "<<query+i<<endl;
		//cout<<"Name:    "<<name<<endl;

		for(int j=0;j<(int)strlen(name);j++){
			if(query[i+j]!=name[j]){
				match=false;
				break;
			}
		}

		//cout<<"Match: "<<match<<endl;

		if(match){
			int startingPosition=i+strlen(name)+1;
			int endingPosition=startingPosition;
			while(endingPosition<(int)strlen(query)){
				if(query[endingPosition]=='&')
					break;
				endingPosition++;
			}
			int count=endingPosition-startingPosition;

/* somebody is trying to break in */

			if(count>maximumValueLength)
				return false;

			//cout<<"Value= "<<query+startingPosition<<endl;
			//cout<<"Count= "<<count<<endl;

			memcpy(value,query+startingPosition,count);
			value[count]='\0';

			return true;
		}
	}
	
	return false;
}

/**
 * \see http://www.ietf.org/rfc/rfc4627.txt
 * ( The application/json Media Type for JavaScript Object Notation (JSON) )
 */
bool WebService::processQuery(const char*queryString){

	cout<<("Content-type: application/json\n\n");

	//cout<<("Content-type: text/html\n\n");

	if(queryString==NULL){
		return false;
	}

	//cout<<"QUERY_STRING= "<<queryString<<endl;


	char tag[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundTag=getValue(queryString,"tag",tag,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundTag){
		//cout<<"Object not found!"<<endl;
		return false;
	}

	return dispatchQuery(tag,queryString);
}

WebService::WebService(){
}

bool WebService::dispatchQuery(const char*tag,const char*queryString){

	int match=0;

	if(strcmp(tag,"RAY_MESSAGE_TAG_GET_KMER_FROM_STORE")==match){
		return call_RAY_MESSAGE_TAG_GET_KMER_FROM_STORE(queryString);
	}else if(strcmp(tag,"RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE")==match){
		return call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(queryString);
	}else if(strcmp(tag,"RAY_MESSAGE_TAG_GET_MAPS")==match){
		return call_RAY_MESSAGE_TAG_GET_MAPS(queryString);
	}

	cout<<"{ \"message\": \"tag not serviced\" } "<<endl;

// unmatched message tag
	return false;
}

/**
 * Required parameters in QUERY_STRING: tag, object, depth.
 */
bool WebService::call_RAY_MESSAGE_TAG_GET_KMER_FROM_STORE(const char*queryString){

	const char*dataFile="kmers.txt.dat";
	char requestedObject[CONFIG_MAXIMUM_VALUE_LENGTH];

	const char*key=NULL;

	//cout<<"Tag: "<<tag<<endl;

	bool foundObject=getValue(queryString,"object",requestedObject,CONFIG_MAXIMUM_VALUE_LENGTH);
		
	if(!foundObject)
		return false;

	key=requestedObject;

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

	cout<<"\"object\": \""<<key<<"\","<<endl;
	cout<<"\"vertices\": {"<<endl;

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

		cout<<"\""<<object<<"\": ";
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

	cout<<"}}"<<endl;

	database.closeFile();

	return true;
}

/**
 * Parameters needed in QUERY_STRING: tag, depth.
 */
bool WebService::call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(const char*queryString){

	const char*startingPoint="ACGCCCGGCACGACCGGCGACCTGGGTGTAAAGCTGAGCGAAACGCTCTGCCGAGCGAAAA";

	const char*dataFile="kmers.txt.dat";

	const char*key=NULL;

	//cout<<"Tag: "<<tag<<endl;

	key=startingPoint;

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

	cout<<"\"object\": \""<<key<<"\","<<endl;
	cout<<"\"vertices\": {"<<endl;

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

		cout<<"\""<<object<<"\": ";
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

	cout<<"}}"<<endl;

	database.closeFile();

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