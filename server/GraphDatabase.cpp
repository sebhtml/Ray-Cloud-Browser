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
#include <sstream>
#include <stdint.h>
using namespace std;

// TODO add error management for file operations

bool GraphDatabase::getObject(char*file,VertexObject*object,char*key){
	
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
	
		int middle=(last-first)/2;

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

		int comparisonResult=strcmp(key,sequence);
		if(comparisonResult==0){
			found=true;

			object->setSequence(sequence);
			object->setCoverage(coverage);

			break;
		}else if(comparisonResult>0){

			first=middle+1;

		}else if(comparisonResult<0){
			last=middle-1;
		}
	}

	fclose(stream);

	return found;
}