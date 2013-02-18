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

#include "AnnotationReporter.h"

#include <storage/GraphDatabase.h>
#include <storage/AnnotationEngine.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

int AnnotationReporter::call(int argc,char**argv){

	if(argc!=2){
		cout<<"Get the status of annotations of a map file."<<endl;

		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" map.dat"<<endl;

		return 0;
	}

	const char*mapFile=argv[1];

	GraphDatabase graphReader;
	graphReader.openFile(mapFile);

	AnnotationEngine annotationEngine;
	annotationEngine.openAnnotationFileForMap(&graphReader,false);

	int kmerLength=graphReader.getKmerLength();
	uint64_t entries=annotationEngine.getEntries();
	int freeSpace=annotationEngine.getFreeBytes();

	const char*annotationFile=annotationEngine.getAnnotationFile();

	cout<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"<<endl;
	cout<<"<annotationManager>"<<endl;
	cout<<"<class>AnnotationEngine</class>"<<endl;
	cout<<"<mapFile>"<<mapFile<<"</mapFile>"<<endl;
	cout<<"<annotationFile>"<<annotationFile<<"</annotationFile>"<<endl;
	cout<<"<objects>"<<entries<<"</objects>"<<endl;
	cout<<"<availableBytesInHeap>"<<freeSpace<<"</availableBytesInHeap>"<<endl;
	cout<<"<kmerLength>"<<kmerLength<<"</kmerLength>"<<endl;
	cout<<"</annotationManager>"<<endl;

	graphReader.closeFile();
	annotationEngine.closeFile();

	return 0;
}
