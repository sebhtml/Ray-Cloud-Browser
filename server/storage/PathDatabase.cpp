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
	
	if(m_active)
		return;

	m_mapper.enableReadOperations();

	m_data=(char*)m_mapper.mapFile(file);

	if(m_data==NULL){
		cout<<"Error: can not map "<<file<<endl;
		m_error=true;
		return;
	}

	m_active=true;

	uint32_t magic=readInteger32(0);
	uint32_t format=readInteger32(sizeof(uint32_t));

	if(magic!=m_expectedMagicNumber){
		cout<<"Error: "<<file<<" is not a section file."<<endl;
		m_error=true;
		closeFile();
	}else if(format!=m_expectedFormatVersion){
		cout<<"Error: incorrect format version for "<<file<<endl;
		m_error=true;
		closeFile();
	}
}

void PathDatabase::closeFile(){

	if(!m_active)
		return;

	m_active=false;

	m_mapper.unmapFile();

}

uint32_t PathDatabase::readInteger32(uint64_t offset){
	if(!m_active)
		return 0;

	uint32_t value;

// skip magic number
	memcpy(&value,m_data+offset,sizeof(uint32_t));

	return value;
}

uint64_t PathDatabase::readInteger64(uint64_t offset){
	if(!m_active)
		return 0;

	uint64_t value;

// skip magic number
	memcpy(&value,m_data+offset,sizeof(uint64_t));

	return value;
}

uint64_t PathDatabase::getEntries(){
	if(!m_active)
		return 0;

	return readInteger64(sizeof(uint32_t)+sizeof(uint32_t));
}

uint64_t PathDatabase::getSequenceOffset(uint64_t entry){
	if(!m_active)
		return 0;

	uint64_t offset=0;
	offset+=sizeof(uint32_t); // magic
	offset+=sizeof(uint32_t); // format
	offset+=sizeof(uint64_t); // entries
	offset+=entry*4*sizeof(uint64_t); // previous entries
	offset+=2*sizeof(uint64_t); // offset within self.

	return readInteger64(offset);
}

uint64_t PathDatabase::getNameOffset(uint64_t entry){
	if(!m_active)
		return 0;

	uint64_t offset=0;
	offset+=sizeof(uint32_t); // magic
	offset+=sizeof(uint32_t); // format
	offset+=sizeof(uint64_t); // entries
	offset+=entry*4*sizeof(uint64_t); // previous entries
	offset+=0*sizeof(uint64_t); // offset within self.

	return readInteger64(offset);
}

uint64_t PathDatabase::getNameLength(uint64_t entry){
	if(!m_active)
		return 0;

	uint64_t offset=0;
	offset+=sizeof(uint32_t); // magic
	offset+=sizeof(uint32_t); // format
	offset+=sizeof(uint64_t); // entries
	offset+=entry*4*sizeof(uint64_t); // previous entries
	offset+=1*sizeof(uint64_t); // offset within self.

	return readInteger64(offset);
}

uint64_t PathDatabase::getSequenceLength(uint64_t entry){
	if(!m_active)
		return 0;

	uint64_t offset=(sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t)+4*sizeof(uint64_t)*entry+3*sizeof(uint64_t));

	return readInteger64(offset);
}

void PathDatabase::getName(uint64_t path,char*outputName){

	if(!m_active)
		return;

	uint64_t nameOffset=getNameOffset(path);
	uint64_t nameLength=getNameLength(path);

	memcpy(outputName,m_data+nameOffset,nameLength);

	outputName[nameLength]='\0';
}

void PathDatabase::getKmer(uint64_t path,int kmerLength,int offset,char*output){

	if(!m_active)
		return;

	uint64_t sequenceOffset=getSequenceOffset(path);
	uint64_t sequenceLength=getSequenceLength(path);

	int numberOfKmers=sequenceLength-kmerLength+1;

// this is an error
	if(offset>=numberOfKmers){
		return;
	}

	memcpy(output,m_data+sequenceOffset+offset,kmerLength);

	output[kmerLength]='\0';
}

void PathDatabase::terminateString(char*object){
}

PathDatabase::PathDatabase(){
	m_active=false;
	m_error=false;

	uint32_t PATH_MAGIC_NUMBER=2345678989;
	uint32_t PATH_FORMAT_VERSION=0;

	m_expectedMagicNumber=PATH_MAGIC_NUMBER;
	m_expectedFormatVersion=PATH_FORMAT_VERSION;
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

	offset+=1*sizeof(uint32_t); // magic number
	offset+=1*sizeof(uint32_t); // format
	offset+=1*sizeof(uint64_t); // entries
	offset+=entries*4*sizeof(uint64_t); // meta-data

	for(uint64_t j=0;j<entries;j++){

		int i=list[j][0];

		int headerLength=headerLengths[i];
		int sequenceLength=sequenceLengths[i];

		binaryNameStarts[i]=offset;
		offset+=headerLength;
		binarySequenceStarts[i]=offset;
		offset+=sequenceLength;

/*
		cout<<"Entry #"<<j<<" origin: "<<i;
		cout<<" HeaderStart: "<<headerStarts[i]<<" Binary: "<<binaryNameStarts[j];
		cout<<" HeaderLength: "<<headerLengths[i];
		cout<<" SequenceStart: "<<sequenceStarts[i]<<" Binary: "<<binarySequenceStarts[j];
		cout<<" SequenceLength: "<<sequenceLength<<endl;
*/
	}

// At this point, we have all the offsets ready to be dumped in a file


	FILE*outputStream=fopen(output,"w");

	uint32_t magicNumber=m_expectedMagicNumber;
	uint32_t format=m_expectedFormatVersion;

	fwrite(&magicNumber,sizeof(uint32_t),1,outputStream);
	fwrite(&format,sizeof(uint32_t),1,outputStream);

	fwrite(&entries,sizeof(uint64_t),1,outputStream);
	
	for(uint64_t j=0;j<entries;j++){

		uint64_t i=list[j][0];

		//uint64_t binaryHeaderStart=binaryNameStarts[i];
		uint64_t binaryHeaderLength=headerLengths[i];

		fwrite(&(binaryNameStarts[i]),sizeof(uint64_t),1,outputStream);
		fwrite(&binaryHeaderLength,sizeof(uint64_t),1,outputStream);
		fwrite(&(binarySequenceStarts[i]),sizeof(uint64_t),1,outputStream);
		fwrite(&(sequenceLengths[i]),sizeof(uint64_t),1,outputStream);

#if 0
		cout<<"Entry "<<i<<" Head.start: "<<binaryNameStarts[i];
		cout<<" Head.length: "<<headerLengths[i];
		cout<<" Body.start: "<<binarySequenceStarts[i];
		cout<<" Body.length: "<<sequenceLengths[i]<<endl;
#endif
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

void PathDatabase::debug(){

	uint64_t offset=0;

	cout<<"--- Ray Technologies ---"<<endl;
	cout<<endl;

	cout<<"Magic: "<<readInteger64(offset)<<endl;
	offset+=sizeof(uint64_t);

	cout<<"Objects: "<<readInteger64(offset)<<endl;
	offset+=sizeof(uint64_t);

	uint64_t entries=getEntries();

	uint64_t i=0;

	while(i<entries){

		cout<<"	["<<i<<"]";

		cout<<"	"<<readInteger64(offset);
		offset+=sizeof(uint64_t);
		cout<<"	"<<readInteger64(offset);
		offset+=sizeof(uint64_t);
		cout<<"	"<<readInteger64(offset);
		offset+=sizeof(uint64_t);
		cout<<"	"<<readInteger64(offset);
		offset+=sizeof(uint64_t);

		char name[1024];

		getName(i,name);

		cout<<"	name="<<name;
		

		char kmer[301];
		getKmer(i,31,0,kmer);
		cout<<"	sequence="<<kmer<<"...";
		cout<<endl;

		i++;
	}
}

bool PathDatabase::hasError()const{
	return m_error;
}
