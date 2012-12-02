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

#include "GraphDatabase.h"

#include <stdlib.h>
#include <string.h>
#include <iostream>
#include <vector>
#include <string>
#include <set>
using namespace std;

bool getValue(const char*query,const char*name,char*value){
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
			int count=endingPosition-i;

			//cout<<"Value= "<<query+startingPosition<<endl;

			memcpy(value,query+startingPosition,count);
			return true;
		}
	}
	
	return false;
}

int main(int argc,char**argv){

	char*queryString=getenv("QUERY_STRING");

	cout<<("Content-type: text/html\n\n");

	if(queryString==NULL){
		return 0;
	}


	//cout<<"QUERY_STRING= "<<queryString<<endl;

	const char*dataFile="Database.dat";
	char key[300];
	bool foundObject=getValue(queryString,"object",key);

	if(!foundObject){
		//cout<<"Object not found!"<<endl;
		return 0;

	}

	GraphDatabase database;
	database.openFile(dataFile);

	int maximumToVisit=64;
	vector<string> productionQueue;
	set<string> visited;
	int head=0;

	string first=key;

	productionQueue.push_back(first);

	cout<<"{"<<endl;

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

	cout<<"}"<<endl;

	database.closeFile();

	return 0;
}
