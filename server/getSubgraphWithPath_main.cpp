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
#include <sstream>
#include <map>
#include <set>
#include <string>
#include <fstream>
using namespace std;

void addKey(map<string,int>*objectsToProcess,string*sequenceKey,int distance,int maximumDistance,set<string>*visited){

	if(visited->count(*sequenceKey)>0)
		return;

	if(distance>maximumDistance)
		return;

	if(objectsToProcess->count(*sequenceKey)>0)
		return;

	(*objectsToProcess)[*sequenceKey]=distance;
}

int main(int argc,char**argv){

	if(argc!=4){
		cout<<"Usage: "<<argv[0]<<" kmers.dat sequence.fasta maximumDistance"<<endl;
		return 0;
	}

	char*dataFile=argv[1];
	char*sequenceFile=argv[2];
	int maximumDistance=atoi(argv[3]);

	GraphDatabase database;
	database.openFile(dataFile);

	int kmerLength=database.getKmerLength();

	char buffer[1024];

	ostringstream bigSequence;

	ifstream input(sequenceFile);

	while(!input.eof()){
		input.getline(buffer,1024);

		if(buffer[0]=='>')
			continue;

		bigSequence<<buffer;
	}

	input.close();

	string mySequence=bigSequence.str();

	const char*origin=mySequence.c_str();

	int count=mySequence.length()-kmerLength+1;

	map<string,int> objectsToProcess;
	set<string> visited;

	for(int i=0;i<count;i++){

		char key[300];

		memcpy(key,origin+i,kmerLength);
		key[kmerLength]='\0';

		int actualDistance=0;

		if(actualDistance> maximumDistance)
			continue;
	
		VertexObject vertex;
		bool found = database.getObject(key,&vertex);

		if(found){

			string sequence;
			vertex.getSequence(&sequence);

			addKey(&objectsToProcess,&sequence,actualDistance,maximumDistance,&visited);

			vector<string> parentKeys;
			vertex.getParents(&parentKeys);

			for(vector<string>::iterator i=parentKeys.begin();
				i!=parentKeys.end();i++){

				string sequenceKey=*i;

				addKey(&objectsToProcess,&sequenceKey,actualDistance+1,maximumDistance,&visited);
			}

			vector<string> childKeys;
			vertex.getChildren(&childKeys);

			for(vector<string>::iterator i=childKeys.begin();
				i!=childKeys.end();i++){

				string sequenceKey=*i;

				addKey(&objectsToProcess,&sequenceKey,actualDistance+1,maximumDistance,&visited);
			}

		}
	}

	cout<<"{"<<endl;

	bool first=false;

	while(objectsToProcess.size()>0){

		map<string,int> nextObjectsToProcess;

		for(map<string,int>::iterator i=objectsToProcess.begin();
			i!=objectsToProcess.end();i++){

			string myKey=i->first;

			if(visited.count(myKey)>0)
				continue;

			int actualDistance=i->second;
			const char*key=myKey.c_str();

			VertexObject vertex;
			bool found = database.getObject(key,&vertex);

			if(!found)
				continue;

			if(!first){
				first=true;
			}else{
				cout<<",";
			}

			cout<<endl;

			cout<<"\""<<key<<"\": ";
			vertex.writeContentInJSON(&cout);

			visited.insert(myKey);

			vector<string> parentKeys;
			vertex.getParents(&parentKeys);

			for(vector<string>::iterator i=parentKeys.begin();
				i!=parentKeys.end();i++){

				string sequenceKey=*i;

				addKey(&nextObjectsToProcess,&sequenceKey,actualDistance+1,maximumDistance,&visited);
			}

			vector<string> childKeys;
			vertex.getChildren(&childKeys);

			for(vector<string>::iterator i=childKeys.begin();
				i!=childKeys.end();i++){

				string sequenceKey=*i;

				addKey(&nextObjectsToProcess,&sequenceKey,actualDistance+1,maximumDistance,&visited);
			}

		}

		objectsToProcess=nextObjectsToProcess;

	}

	cout<<endl;
	cout<<"}"<<endl;

	database.closeFile();

	return 0;
}
