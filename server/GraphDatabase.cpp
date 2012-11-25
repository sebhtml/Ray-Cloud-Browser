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
#include <iostream>
#include <sstream>
#include <stdint.h>
using namespace std;

// TODO add error management for file operations

bool GraphDatabase::getObject(char*key,VertexObject*object){

	bool found=false;

	if(!m_active)
		return found;

	int errors=0;

	uint64_t first=0;
	uint64_t last=m_entries-1;

	while(first<=last){
	
		uint64_t middle=first+(last-first)/2;

		uint64_t middlePosition=m_startingPosition+middle*m_entrySize;

		int returnValue=fseek(m_stream,middlePosition,SEEK_SET);

		if(returnValue!=0)
			errors++;

		char sequence[300];
		uint32_t coverage;
		char parents[4];
		char children[4];

/*
 * TODO: to only 1 fread in a buffer, then do 4 operations on the buffer.
 * Probably not necessary because fread is buffered.
 */
		fread(sequence,m_kmerLength,1,m_stream);
		fread(&coverage,sizeof(uint32_t),1,m_stream);
		fread(parents,4,1,m_stream);
		fread(children,4,1,m_stream);

		sequence[m_kmerLength]='\0';

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

void GraphDatabase::open(char*file){
	
	if(m_active)
		return;

	m_file=file;

	m_stream=fopen(m_file,"r");

	m_format=0;
	m_kmerLength=0;
	m_entries=0;

	fread(&m_format,sizeof(int),1,m_stream);
	fread(&m_kmerLength,sizeof(int),1,m_stream);
	fread(&m_entries,sizeof(int),1,m_stream);

	m_map[INDEX_A]=SYMBOL_A;
	m_map[INDEX_C]=SYMBOL_C;
	m_map[INDEX_G]=SYMBOL_G;
	m_map[INDEX_T]=SYMBOL_T;

	m_entrySize=m_kmerLength+sizeof(uint32_t)+4+4;

	m_startingPosition=sizeof(int)+sizeof(int)+sizeof(uint64_t);

	m_active=true;
}

void GraphDatabase::close(){

	if(!m_active)
		return;

	fclose(m_stream);

	m_active=false;
}

int GraphDatabase::getKmerLength(){
	return m_kmerLength;
}

char GraphDatabase::getSymbol(int code){
	return m_map[code];
}

GraphDatabase::GraphDatabase(){
	m_active=false;
}

