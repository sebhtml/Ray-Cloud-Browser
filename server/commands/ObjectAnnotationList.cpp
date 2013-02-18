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

#include "ObjectAnnotationList.h"

#include <storage/GraphDatabase.h>
#include <storage/AnnotationEngine.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

int ObjectAnnotationList::call(int argc,char**argv){

	if(argc!=3){
		cout<<"Get annotations of a map object."<<endl;

		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" map.dat key"<<endl;

		return 0;
	}

	const char*mapFile=argv[1];
	const char*object=argv[2];

	GraphDatabase graphReader;
	graphReader.openFile(mapFile);

	if(graphReader.hasError())
		return 1;

	AnnotationEngine annotationEngine;
	annotationEngine.openAnnotationFileForMap(&graphReader,false);

	vector<Annotation> annotations;
	annotationEngine.getAnnotations(object,&annotations);

	cout<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>"<<endl;
	cout<<"<ObjectAnnotationList>"<<endl;
	cout<<"<object>"<<object<<"</object>"<<endl;
	cout<<"<annotations>"<<endl;

	for(int i=0;i<(int)annotations.size();i++){

		Annotation*annotation=&(annotations[i]);

		if(annotation->getType()==ANNOTATION_LOCATION){
			LocationAnnotation locationAnnotation;
			locationAnnotation.read(annotation);
			locationAnnotation.printXML();
		}
	}

	cout<<"</annotations>"<<endl;
	cout<<"</ObjectAnnotationList>"<<endl;

	graphReader.closeFile();
	annotationEngine.closeFile();

	return 0;
}
