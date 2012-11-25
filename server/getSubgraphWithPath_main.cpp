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

#include <string.h>
#include <iostream>
#include <sstream>
#include <fstream>
using namespace std;

int main(int argc,char**argv){

	if(argc!=3){
		cout<<"Usage: "<<argv[0]<<" kmers.dat sequence.fasta"<<endl;
		return 0;
	}

	char*dataFile=argv[1];
	char*sequenceFile=argv[2];

	GraphDatabase database;
	database.setDataFile(dataFile);

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

	//cout<<"Sequence: "<<mySequence<<endl;
	//

	int count=mySequence.length()-kmerLength+1;
	cout<<"{"<<endl;

	bool first=false;

	for(int i=0;i<count;i++){

		char key[300];

		memcpy(key,origin+i,kmerLength);
		key[kmerLength]='\0';

	
		VertexObject vertex;
		bool found = database.getObject(&vertex,key);

		if(found){

			if(!first){
				first=true;
			}else{
				cout<<",";
			}

			cout<<endl;

			cout<<"\""<<key<<"\": ";
			vertex.writeContentInJSON(&cout);
		}
	}

	cout<<endl;
	cout<<"}"<<endl;

	return 0;
}
