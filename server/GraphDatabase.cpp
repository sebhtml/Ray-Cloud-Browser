/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
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

#include "GraphDatabase.h"

#include <stdio.h>
#include <string.h>
#include <stdint.h>

#include <iostream>
#include <sstream>
using namespace std;

// TODO add error management for file operations

bool GraphDatabase::getObject(const char*key,VertexObject*object){

	bool found=false;

	if(!m_active)
		return found;

	uint64_t first=0;
	uint64_t last=m_entries-1;

	while(first<=last){
	
		uint64_t middle=first+(last-first)/2;

		uint64_t middlePosition=m_startingPosition+middle*m_entrySize;

		char sequence[300];
		uint32_t coverage;
		char parents[4];
		char children[4];

		char*myBuffer=((char*)m_content)+middlePosition;

		memcpy(sequence,myBuffer,m_kmerLength);
		sequence[m_kmerLength]='\0';

		memcpy(&coverage,myBuffer+m_kmerLength,sizeof(uint32_t));
		memcpy(parents,myBuffer+m_kmerLength+sizeof(uint32_t),4);
		memcpy(children,myBuffer+m_kmerLength+sizeof(uint32_t)+4,4);

		int comparisonResult=strcmp(key,sequence);

		if(comparisonResult==0){
			found=true;

			object->setSequence(sequence);
			object->setCoverage(coverage);

			for(int i=0;i<4;i++){
				if(parents[i]==MARKER_YES){
					object->addParent(getSymbol(i));
				}
				if(children[i]==MARKER_YES){
					object->addChild(getSymbol(i));
				}
			}

			break;
		}else if(comparisonResult>0){

			first=middle+1;

		}else if(comparisonResult<0){

			last=middle-1;
		}
	}

	return found;
}

/**
 * \see http://www.c.happycodings.com/Gnu-Linux/code6.html
 */
void GraphDatabase::openFile(const char*file){
	
	if(m_active)
		return;

	m_mapper.enableReadOperations();
	m_content=m_mapper.mapFile(file);

	memcpy(&m_format,(char*)m_content,sizeof(uint32_t));
	memcpy(&m_kmerLength,((char*)m_content)+sizeof(uint32_t),sizeof(uint32_t));
	memcpy(&m_entries,((char*)m_content)+sizeof(uint32_t)+sizeof(uint32_t),sizeof(uint64_t));

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;

	m_entrySize=m_kmerLength+sizeof(uint32_t)+4+4;

	m_startingPosition=sizeof(int)+sizeof(int)+sizeof(uint64_t);

	m_active=true;
}

void GraphDatabase::closeFile(){

	if(!m_active)
		return;

	m_mapper.unmapFile();

	m_active=false;
}

int GraphDatabase::getKmerLength(){
	return m_kmerLength;
}

char GraphDatabase::getSymbol(int code){
	return m_codeSymbols[code];
}

GraphDatabase::GraphDatabase(){
	m_active=false;
}

