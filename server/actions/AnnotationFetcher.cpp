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

#include "AnnotationFetcher.h"

#include <storage/GraphDatabase.h>
#include <storage/AnnotationEngine.h>
#include <storage/Configuration.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

bool AnnotationFetcher::call(const char*queryString){

	int mapIndex=0;
	bool foundMap=getValueAsInteger(queryString,"map",&mapIndex);

	if(!foundMap)
		return false;

	Configuration configuration;
	configuration.open(CONFIG_FILE);

	if(!(mapIndex<configuration.getNumberOfMaps()))
		return false;

	const char*dataFile=configuration.getMapFile(mapIndex);
	configuration.close();

// fail in silence
	if(!isAllowedFile(dataFile))
		return false;

	char requestedObject[CONFIG_MAXIMUM_VALUE_LENGTH];

	bool foundObject=getValue(queryString,"object",requestedObject,CONFIG_MAXIMUM_VALUE_LENGTH);
		
	if(!foundObject)
		return false;

	GraphDatabase graphReader;
	graphReader.openFile(dataFile);

	if(graphReader.hasError())
		return false;

	AnnotationEngine annotationEngine;
	annotationEngine.openAnnotationFileForMap(&graphReader,false);

	vector<Annotation> annotations;
	annotationEngine.getAnnotations(requestedObject,&annotations);

	cout<<"{"<<endl;
	cout<<"\"results\": ["<<endl;
	cout<<"{ \"object\": \""<<requestedObject<<"\","<<endl;
	cout<<"\"annotations\": ["<<endl;

	for(int i=0;i<(int)annotations.size();i++){

		Annotation*annotation=&(annotations[i]);

		if(annotation->getType()==ANNOTATION_LOCATION){
			LocationAnnotation locationAnnotation;
			locationAnnotation.read(annotation);
			locationAnnotation.printJSON();

			if(i!=(int)annotations.size()-1)
				cout<<",";
			cout<<endl;
		}
	}

	cout<<"]"<<endl;
	cout<<"}]}"<<endl;

	graphReader.closeFile();
	annotationEngine.closeFile();

	return 0;
}
