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

#include "LocationAnnotation.h"

#include <string.h>

#include <iostream>
using namespace std;

void LocationAnnotation::constructor(int section,int region,int location){
	m_section=section;
	m_region=region;
	m_location=location;
}

int LocationAnnotation::getSectionIndex()const{
	return m_section;
}

int LocationAnnotation::getRegionIndex()const{
	return m_region;
}

int LocationAnnotation::getLocationIndex()const{
	return m_location;
}

void LocationAnnotation::read(Annotation*object){
	int type=object->getType();

	if(type!=ANNOTATION_LOCATION)
		return;

	uint8_t*content=object->getContent();

	int expectedBytes=sizeof(uint8_t)+sizeof(uint8_t)+sizeof(uint16_t)+2*sizeof(uint32_t)+sizeof(uint64_t);

	int actualBytes=object->getBytes();

	if(expectedBytes>actualBytes)
		return;

	int position=0;

	memcpy(&m_section,content+position,sizeof(uint16_t));
	position+=sizeof(uint16_t);
	memcpy(&m_region,content+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);
	memcpy(&m_location,content+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);
}

void LocationAnnotation::write(Annotation*object)const{

	uint8_t*content=object->getContent();

	int position=0;

	memcpy(content+position,&m_section,sizeof(uint16_t));
	position+=sizeof(uint16_t);
	memcpy(content+position,&m_region,sizeof(uint32_t));
	position+=sizeof(uint32_t);
	memcpy(content+position,&m_location,sizeof(uint32_t));
	position+=sizeof(uint32_t);

	object->setType(ANNOTATION_LOCATION);
	object->setSize(position);
	object->setNextOffset(OFFSET_NULL);
}

void LocationAnnotation::printXML()const{
	cout<<"<annotation class=\"LocationAnnotation\"";
	cout<<" section=\""<<m_section<<"\"";
	cout<<" region=\""<<m_region<<"\"";
	cout<<" location=\""<<m_location<<"\"";
	cout<<" />"<<endl;
}
