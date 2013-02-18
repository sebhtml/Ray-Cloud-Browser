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

#include "Annotation.h"

#include <iostream>
using namespace std;

#include <string.h>

void Annotation::constructor(uint8_t type,uint8_t size,uint8_t*content,uint64_t nextOffset){
	m_type=type;
	m_size=size;
	memcpy(m_content,content,m_size);
	m_nextOffset=nextOffset;
}

uint8_t Annotation::getType()const{
	return m_type;
}

uint8_t Annotation::getSize()const{
	return m_size;
}

void Annotation::setSize(uint8_t size){
	m_size=size;
}

void Annotation::setType(uint8_t type){
	m_type=type;
}

uint8_t*Annotation::getContent(){
	return m_content;
}

uint64_t Annotation::getNextOffset()const{
	return m_nextOffset;
}

void Annotation::read(uint8_t*buffer){
	int position=0;

	memcpy(&m_type,buffer+position,sizeof(uint8_t));
	position+=sizeof(uint8_t);
	memcpy(&m_size,buffer+position,sizeof(uint8_t));
	position+=sizeof(uint8_t);
	memcpy(m_content,buffer+position,m_size);
	position+=m_size;
	memcpy(&m_nextOffset,buffer+position,sizeof(uint64_t));
	position+=sizeof(uint64_t);
}

void Annotation::write(uint8_t*buffer)const{
	int position=0;

	memcpy(buffer+position,&m_type,sizeof(uint8_t));
	position+=sizeof(uint8_t);
	memcpy(buffer+position,&m_size,sizeof(uint8_t));
	position+=sizeof(uint8_t);
	memcpy(buffer+position,m_content,m_size);
	position+=m_size;
	memcpy(buffer+position,&m_nextOffset,sizeof(uint64_t));
	position+=sizeof(uint64_t);
}

int Annotation::getBytes()const{
	return sizeof(uint8_t)+sizeof(uint8_t)+m_size*sizeof(uint8_t)+sizeof(uint64_t);
}

void Annotation::setNextOffset(uint64_t offset){
	m_nextOffset=offset;
}

void Annotation::printXML()const{
	cout<<"<object class=\"Annotation\"";
	cout<<" type=\""<<(int)m_type<<"\"";
	cout<<" size=\""<<(int)m_size<<"\"";
	cout<<" content=\""<<"..."<<"\"";
	cout<<" nextOffset=\""<<m_nextOffset<<"\"";
	cout<<" /> ";

	cout<<endl;
}
