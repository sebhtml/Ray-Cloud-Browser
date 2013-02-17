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

#include "AnnotationManager.h"

#include <storage/GraphDatabase.h>
#include <storage/PathDatabase.h>
#include <storage/AnnotationEngine.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

/**
 * Create a graph database.
 * \author Sébastien Boisvert
 */
int AnnotationManager::call(int argc,char**argv){

	if(argc!=4){
		cout<<"Create a reverse-index for annotations."<<endl;

		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" map.dat section.dat SectionIndex"<<endl;
		cout<<endl;
		cout<<"SectionIndex is the index of the section in the server configuration."<<endl;

		return 0;
	}

	const char*mapFile=argv[1];
	const char*sectionFile=argv[2];
	int sectionIndex=atoi(argv[3]);

	GraphDatabase graphReader;
	graphReader.openFile(mapFile);

	AnnotationEngine annotationEngine;
	annotationEngine.openAnnotationFileForMap(&graphReader);

	PathDatabase pathReader;
	pathReader.openFile(sectionFile);

	int kmerLength=graphReader.getKmerLength();

	uint64_t regions=pathReader.getEntries();

	uint64_t regionIndex=0;

#if 0
	cout<<"Section: "<<sectionIndex<<" Objects: "<<regions<<endl;
#endif

	while(regionIndex<regions){

		int regionLength=pathReader.getSequenceLength(regionIndex)-kmerLength+1;

		char sequence[1024];

		for(int locationIndex=0;locationIndex<regionLength;locationIndex++){

			pathReader.getKmer(regionIndex,kmerLength,locationIndex,sequence);

			LocationAnnotation locationObject;
			locationObject.constructor(sectionIndex,regionIndex,locationIndex);

			annotationEngine.addLocation(sequence,&locationObject);

#if 0
			if(locationIndex%1000!=0)
				continue;

			cout<<"DEBUG Object: "<<sequence;
			cout<<" Section: "<<sectionIndex<<" Region: "<<regionIndex;
			cout<<" Location: "<<locationIndex<<endl;
#endif
		}

		regionIndex++;
	}

	graphReader.closeFile();
	pathReader.closeFile();
	annotationEngine.closeFile();

	return 0;
}
