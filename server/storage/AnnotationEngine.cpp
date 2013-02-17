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

#include "AnnotationEngine.h"

void AnnotationEngine::getAnnotations(const char*key,vector<Annotation>*annotations)const{
}

void AnnotationEngine::openAnnotationFileForMap(GraphDatabase*graph){
	m_map=graph;
}

void AnnotationEngine::closeFile(){
}

void AnnotationEngine::getLocations(const char*key,vector<LocationAnnotation>*annotations)const{
}

void AnnotationEngine::addLocation(const char*key,LocationAnnotation*annotation){

	cout<<"<addLocation object=\""<<key<<"\"";
	annotation->print();

	uint64_t index=0;
	bool found=m_map->getObjectIndex(key,&index);

	if(found){
		cout<<" index=\""<<index<<"\"";
	}

	cout<<" />"<<endl;
}
