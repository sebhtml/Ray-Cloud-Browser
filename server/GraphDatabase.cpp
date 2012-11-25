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

bool GraphDatabase::getObject(VertexObject*object,char*key){

	char*file=m_file;

	//cout<<"Searching for: "<<key<<endl;

	bool found=false;

	FILE*stream=fopen(file,"r");

	int format=0;
	int kmerLength=0;
	uint64_t entries=0;

	int errors=0;

	fread(&format,sizeof(int),1,stream);
	fread(&kmerLength,sizeof(int),1,stream);
	fread(&entries,sizeof(int),1,stream);

	int entrySize=kmerLength+sizeof(uint32_t)+4+4;

	int startingPosition=sizeof(int)+sizeof(int)+sizeof(uint64_t);

	int first=0;
	int last=entries-1;

	while(first<=last){
	
		int middle=first+(last-first)/2;

		//cout<<"First: "<<first<<" Last: "<<last<<endl;

		int middlePosition=startingPosition+middle*entrySize;

		int returnValue=fseek(stream,middlePosition,SEEK_SET);

		if(returnValue!=0)
			errors++;

		char sequence[300];
		uint32_t coverage;
		char parents[4];
		char children[4];

		fread(sequence,kmerLength,1,stream);
		fread(&coverage,sizeof(uint32_t),1,stream);
		fread(parents,4,1,stream);
		fread(children,4,1,stream);

		sequence[kmerLength]='\0';

		//cout<<"Entry: "<<sequence<<endl;

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

			//cout<<"On the right"<<endl;
			first=middle+1;

		}else if(comparisonResult<0){

			//cout<<"On the left"<<endl;
			last=middle-1;
		}
	}

	fclose(stream);

	return found;
}

void GraphDatabase::setDataFile(char*file){
	m_file=file;

	FILE*stream=fopen(file,"r");

	m_format=0;
	m_kmerLength=0;
	m_entries=0;

	fread(&m_format,sizeof(int),1,stream);
	fread(&m_kmerLength,sizeof(int),1,stream);
	fread(&m_entries,sizeof(int),1,stream);

	fclose(stream);

	m_map[INDEX_A]=SYMBOL_A;
	m_map[INDEX_C]=SYMBOL_C;
	m_map[INDEX_G]=SYMBOL_G;
	m_map[INDEX_T]=SYMBOL_T;
}

int GraphDatabase::getKmerLength(){
	return m_kmerLength;
}

char GraphDatabase::getSymbol(int code){
	return m_map[code];
}
