/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013 Sébastien Boisvert
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

#include "GraphExporter.h"

#include <storage/GraphDatabase.h>

#include <iostream>
using namespace std;

int GraphExporter::call(int argc,char**argv){

	if(argc!=2){
		cout<<"Generate a text dump of a packed graph."<<endl;
		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;
		cout<<"The index must be generated with "<<PROGRAM_NAME<<" createGraphDatabase"<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" kmers.dat"<<endl;
		return 0;
	}

	char*dataFile=argv[1];

	GraphDatabase database;
	database.openFile(dataFile);

	uint64_t entries=database.getEntries();
	uint64_t index=0;

	cout<<"# "<<entries<<" objects"<<endl;
	while(index<entries){
		VertexObject object;
		database.getObjectWithIndex(index,&object);
		object.writeContentInText(&cout);
		index++;
	}

	database.closeFile();

	return 0;
}
