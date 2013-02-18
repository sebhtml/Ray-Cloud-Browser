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

#include "MapDescriber.h"

#include <storage/GraphDatabase.h>
#include <storage/AnnotationEngine.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

int MapDescriber::call(int argc,char**argv){

	if(argc!=2){
		cout<<"Describe a map file."<<endl;
		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<"A map.dat file is usually generated from a sorted kmers.txt"<<endl;

		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" map.dat"<<endl;

		return 0;
	}

	const char*mapFile=argv[1];

	GraphDatabase graphReader;
	graphReader.openFile(mapFile);

	if(graphReader.hasError())
		return 1;

	int kmerLength=graphReader.getKmerLength();
	uint64_t entries=graphReader.getEntries();

	cout<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"<<endl;
	cout<<"<mapDescriber>"<<endl;
	cout<<"<class>GraphDatabase</class>"<<endl;
	cout<<"<mapFile>"<<mapFile<<"</mapFile>"<<endl;
	cout<<"<objects>"<<entries<<"</objects>"<<endl;
	cout<<"<kmerLength>"<<kmerLength<<"</kmerLength>"<<endl;
	cout<<"</mapDescriber>"<<endl;

	graphReader.closeFile();

	return 0;
}
