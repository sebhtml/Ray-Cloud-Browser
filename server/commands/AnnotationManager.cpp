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

		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" map.dat section.dat SectionIndex"<<endl;
		cout<<endl;
		cout<<"SectionIndex is the index of the section in the server configuration."<<endl;

		return 0;
	}

	const char*mapFile=argv[1];
	const char*sectionFile=argv[2];
	int sectionIndex=atoi(argv[3]);

	AnnotationEngine annotationProcessor;

	return annotationProcessor.index(mapFile,sectionFile,sectionIndex);
}
