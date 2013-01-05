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

#include "PathDatabase.h"
#include "Mapper.h"

#include <stdio.h>
#include <string.h>
#include <stdint.h>

#ifdef CONFIG_ASSERT
#include <assert.h>
#endif

#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>
using namespace std;

using namespace std;

bool myFunction(const vector<int>&a,const vector<int>&b){
	return a[1]>b[1];
}



void PathDatabase::openFile(const char*file){
	
}

void PathDatabase::closeFile(){

}

PathDatabase::PathDatabase(){
	m_active=false;
}

void PathDatabase::index(const char*input,const char*output){

	const char*file=input;

	Mapper mapper;
	mapper.enableReadOperations();
	char*array=(char*)mapper.mapFile(file);

	uint64_t bytes=mapper.getFileSize();

	cout<<"Mapped "<<bytes<<" bytes."<<endl;

	uint64_t entries=0;

	uint64_t i=0;

	while(i<bytes){

		if((i==0 && array[i]=='>') || (array[i-1]=='\n' && array[i]=='>'))
			entries++;

		i++;
	}

	cout<<"Found "<<entries<<" entries in input file."<<endl;

// for each entry, we need to obtain the length of the header and
// the length of the sequence. Any newline is discarded.

	vector<uint64_t> headerLengths;
	vector<uint64_t> sequenceLengths;
	vector<uint64_t> headerStarts;
	vector<uint64_t> sequenceStarts;

	headerLengths.resize(entries);
	sequenceLengths.resize(entries);
	headerStarts.resize(entries);
	sequenceStarts.resize(entries);

	for(uint64_t i=0;i<entries;i++){
		headerLengths[i]=0;
		sequenceLengths[i]=0;
		headerStarts[i]=0;
		sequenceStarts[i]=0;
	}

	i=0;

	int currentEntry=0;

	int HEADER=0;
	int SEQUENCE=1;

	int section=HEADER;
	
	while(i<bytes){
		
		if((i==0 && array[i]=='>') || (array[i-1]=='\n' && array[i]=='>')){

			if(i!=0){
				currentEntry++;
				section=HEADER;
			}

			headerStarts[currentEntry]=i+1;

		}else if(array[i]!='\n'){
			if(section==HEADER){
				headerLengths[currentEntry]++;
			} else if(section==SEQUENCE){
				sequenceLengths[currentEntry]++;
			}
		}else{// we have a new line

			if(section==HEADER){
				section=SEQUENCE;

				sequenceStarts[currentEntry]=i+1;
			}
		}

		i++;
	}

	vector<vector<int> > list;

	for(uint64_t i=0;i<entries;i++){

		int sequenceLength=sequenceLengths[i];

		vector<int> item;
		item.push_back(i);
		item.push_back(sequenceLength);

		list.push_back(item);
	}

	sort(list.begin(),list.end(),myFunction);

	vector<uint64_t>binaryNameStarts;
	vector<uint64_t>binarySequenceStarts;

	binaryNameStarts.resize(entries);
	binarySequenceStarts.resize(entries);

	uint64_t offset=0;

	offset+=sizeof(uint64_t); // magic number
	offset+=sizeof(uint64_t); // entries
	offset+=sizeof(uint64_t)*entries; // meta-data

	for(uint64_t j=0;j<entries;j++){

		int i=list[j][0];

		int headerLength=headerLengths[i];
		int sequenceLength=sequenceLengths[i];

		binaryNameStarts[j]=offset;
		offset+=headerLength;
		binarySequenceStarts[j]=offset;
		offset+=sequenceLength;

/*
		cout<<"Entry #"<<i;
		cout<<" HeaderStart: "<<headerStarts[i];
		cout<<" HeaderLength: "<<headerLengths[i];
		cout<<" SequenceStart: "<<sequenceStarts[i];
		cout<<" SequenceLength: "<<sequenceLength<<endl;
*/
	}

// At this point, we have all the offsets ready to be dumped in a file


	FILE*outputStream=fopen(output,"w");

	uint64_t magicNumber=PATH_FORMAT_VERSION;

	fwrite(&magicNumber,sizeof(uint64_t),1,outputStream);
	fwrite(&entries,sizeof(uint64_t),1,outputStream);
	
	for(uint64_t i=0;i<entries;i++){

		fwrite(&(binaryNameStarts[i]),sizeof(uint64_t),1,outputStream);
		fwrite(&(headerLengths[i]),sizeof(uint64_t),1,outputStream);
		fwrite(&(binarySequenceStarts[i]),sizeof(uint64_t),1,outputStream);
		fwrite(&(sequenceLengths[i]),sizeof(uint64_t),1,outputStream);
	}

// now we dump the data

	for(uint64_t j=0;j<entries;j++){

		int i=list[j][0];

		int headerLength=headerLengths[i];
		int sequenceLength=sequenceLengths[i];
		
		uint64_t sourceHeaderOffset=headerStarts[i];
		uint64_t sourceSequenceOffset=sequenceStarts[i];

		int dumped=0;

// dump the header
		while(dumped<headerLength){

#ifdef CONFIG_ASSERT
			assert(sourceHeaderOffset<bytes);
#endif

			if(array[sourceHeaderOffset]!='\n'){

				fwrite(array+sourceHeaderOffset,sizeof(char),1,outputStream);
				dumped++;
			}

			sourceHeaderOffset++;
		}

		//continue;

// dump the sequence

		dumped=0;

		while(dumped<sequenceLength){

#ifdef CONFIG_ASSERT
			assert(sourceSequenceOffset<bytes);
#endif

			if(array[sourceSequenceOffset]!='\n'){

				fwrite(array+sourceSequenceOffset,sizeof(char),1,outputStream);
				dumped++;
			}

			sourceSequenceOffset++;
		}
	}

	fclose(outputStream);



	mapper.unmapFile();


}
