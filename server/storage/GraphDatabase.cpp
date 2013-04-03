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

// TODO: maybe adding padding could enhance performance

#include "GraphDatabase.h"

#include <stdio.h>
#include <string.h>
#include <stdint.h>

#include <iostream>
#include <sstream>
using namespace std;

#ifdef CONFIG_ASSERT
#include <assert.h>
#endif

/*
 * Some implementation-specific sizes.
 */

// the size of the binary header
#define GRAPH_HEADER_LENGTH (sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t))

// the size of extra information of a object (coverage, parents, children)
#define OBJECT_INFORMATION_LENGTH (sizeof(uint32_t)+sizeof(uint8_t))

// number of bits in one byte
#define BITS_PER_BYTE 8

// number of bits per nucleotide
#define BITS_PER_NUCLEOTIDE 2

// TODO add error management for file operations

bool GraphDatabase::getObject(const char*key,VertexObject*object)const{

	uint64_t index=0;
	bool found=getObjectIndex(key,&index);

	if(!found)
		return found;

	getObjectWithIndex(index,object);

	return found;
}

bool GraphDatabase::getObjectIndex(const char*key,uint64_t*index)const{
	bool found=false;

	if(!m_active)
		return found;

	if(m_error)
		return found;

	uint64_t first=0;
	uint64_t last=m_entries-1;
	int match=0;

	while(first<=last){
	
		uint64_t middle=first+(last-first)/2;

		char sequence[CONFIG_MAXKMERLENGTH];
		pullSequence(middle,sequence);

		int comparisonResult=strcmp(key,sequence);

		if(comparisonResult==match){
			(*index)=middle;
			found=true;
			break;

		}else if(comparisonResult>match){

			first=middle+1;

		}else if(comparisonResult<match){

			last=middle-1;
		}
	}

	return found;
}

void GraphDatabase::pullSequence(uint64_t middle,char*sequence)const{

	uint64_t middlePosition=m_startingPosition+middle*m_entrySize;
	const char*myBuffer=((char*)m_content)+middlePosition;
	int position=0;

// first, we only copy the sequence to compare it with what we are looking for
// we don't load the object meta-information if it's not a match

	uint8_t sequenceData[CONFIG_MAXKMERLENGTH];
	memcpy(sequenceData,myBuffer+position,m_requiredBytesPerSequence);

// convert the 2-bit format to the 1-byte-per-nucleotide format

	for(int nucleotidePosition=0;nucleotidePosition<(int)m_kmerLength;nucleotidePosition++){
		int bitPosition=nucleotidePosition*BITS_PER_NUCLEOTIDE;
		int code=-1;
		readTwoBits(sequenceData,bitPosition,&code);

#ifdef CONFIG_ASSERT
		assert(code!=-1);
		assert(code>=0);
		assert(code<ALPHABET_SIZE);
#endif

		sequence[nucleotidePosition]=m_codeSymbols[code];
	}

	sequence[m_kmerLength]='\0';
}

void GraphDatabase::getObjectWithIndex(uint64_t middle,VertexObject*object)const{

	if(!(middle<m_entries))
		return;

	char sequence[CONFIG_MAXKMERLENGTH];
	pullSequence(middle,sequence);

	uint32_t coverage=0;
	uint8_t friendInformation=0;

	uint64_t middlePosition=m_startingPosition+middle*m_entrySize;
	const char*myBuffer=((char*)m_content)+middlePosition;
	int positionFromStart=0;

	positionFromStart+=m_requiredBytesPerSequence;

// group disk I/O operations here
	char objectBufferForDisk[OBJECT_INFORMATION_LENGTH];
	memcpy(objectBufferForDisk,myBuffer+positionFromStart,OBJECT_INFORMATION_LENGTH);

// then copy stuff from our memory buffer

	int position=0;
	memcpy(&coverage,objectBufferForDisk+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);

	memcpy(&friendInformation,objectBufferForDisk+position,1*sizeof(uint8_t));

// finally, we build a VertexObject object with the information we extracted in the
// file

	char parents[ALPHABET_SIZE];
	char children[ALPHABET_SIZE];
	int offset=0;

	for(int i=0;i<ALPHABET_SIZE;i++){
		uint64_t value=friendInformation;

		int bit=offset+i;

		value<<=(BITS_PER_BYTE*sizeof(uint64_t)-1-bit);
		value>>=(BITS_PER_BYTE*sizeof(uint64_t)-1);

		parents[i]=value;
	}

	offset+=ALPHABET_SIZE;

	for(int i=0;i<ALPHABET_SIZE;i++){
		uint64_t value=friendInformation;

		int bit=offset+i;

		value<<=(BITS_PER_BYTE*sizeof(uint64_t)-1-bit);
		value>>=(BITS_PER_BYTE*sizeof(uint64_t)-1);

		children[i]=value;
	}

	object->setSequence(sequence);
	object->setCoverage(coverage);

	for(int i=0;i<ALPHABET_SIZE;i++){
		if(parents[i]==MARKER_YES){
			object->addParent(getSymbol(i));
		}
		if(children[i]==MARKER_YES){
			object->addChild(getSymbol(i));
		}
	}

}

/**
 * \see http://www.c.happycodings.com/Gnu-Linux/code6.html
 */
void GraphDatabase::openFile(const char*file){
	
	if(m_active)
		return;

	if(m_error)
		return;

	m_mapper.enableReadOperations();

	m_content=(uint8_t*)m_mapper.mapFile(file);

	if(m_content==NULL){
		cout<<"Error: can not map file "<<file<<endl;
		m_error=true;
		return;
	}

	m_active=true;

	m_fileName=file;

	char headerBufferForDisk[GRAPH_HEADER_LENGTH];

/*
 * Only do 1 single memcpy to fetch the header from the disk.
 */
	memcpy(headerBufferForDisk,m_content,GRAPH_HEADER_LENGTH);

	int position=0;

/*
 * Get information from header using our own copy.
 */
	memcpy(&m_magicNumber,headerBufferForDisk+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);
	memcpy(&m_formatVersion,headerBufferForDisk+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);
	memcpy(&m_kmerLength,headerBufferForDisk+position,sizeof(uint32_t));
	position+=sizeof(uint32_t);
	memcpy(&m_entries,headerBufferForDisk+position,sizeof(uint64_t));
	position+=sizeof(uint64_t);

	if(m_magicNumber!=m_expectedMagicNumber){
		cout<<"Error: "<<file<<" is not a map file."<<endl;
		m_error=true;
		return;
	}

	if(m_formatVersion!=m_expectedFormatVersion){
		cout<<"Error: the format version of "<<file<<" is not supported."<<endl;
		m_error=true;
		return;
	}

	setRequiredBytesPerObject();

	m_entrySize=m_requiredBytesPerSequence+sizeof(uint32_t)+sizeof(uint8_t);

	m_startingPosition=position;
}

void GraphDatabase::closeFile(){

	if(!m_active)
		return;

	m_mapper.unmapFile();

	m_active=false;
}

int GraphDatabase::getKmerLength()const{
	return m_kmerLength;
}

char GraphDatabase::getSymbol(int code)const{
	return m_codeSymbols[code];
}

GraphDatabase::GraphDatabase(){
	uint32_t GRAPH_MAGIC_NUMBER=2345678987;
	uint32_t GRAPH_FORMAT_VERSION=0;

	m_active=false;
	m_error=false;
	m_expectedMagicNumber=GRAPH_MAGIC_NUMBER;
	m_expectedFormatVersion=GRAPH_FORMAT_VERSION;

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;
}

void GraphDatabase::index(const char*inputFile,const char*outputFile){

	const char*file=inputFile;
	const char*binaryFile=outputFile;

	int indexA=INDEX_A;
	int indexC=INDEX_C;
	int indexG=INDEX_G;
	int indexT=INDEX_T;
	
	char symbolA=SYMBOL_A;
	char symbolC=SYMBOL_C;
	char symbolG=SYMBOL_G;
	char symbolT=SYMBOL_T;

	int kmerLength=0;
	uint64_t entries=0;

	char buffer[1024];

	FILE*stream=fopen(file,"r");
	int null=0;

// get the number of entries and the k-mer length
	while(!feof(stream)){

		buffer[0]='\0';

		char*value=fgets(buffer,1024,stream);

		if(value==NULL){
			null++;
		}

		if(strlen(buffer)>0 && buffer[0]=='#')
			continue;

		if(strlen(buffer)>0){
			entries++;

			if(kmerLength==0){
				while(buffer[kmerLength]!=';'){
					kmerLength++;
				}
			}
		}
	}

	fclose(stream);

	stream=fopen(file,"r");

	cout<<"Entries: "<<entries<<" KmerLength: "<<kmerLength<<endl;

	FILE*output=fopen(binaryFile,"w");

	m_magicNumber=m_expectedMagicNumber;
	m_formatVersion=m_expectedFormatVersion;
	m_kmerLength=kmerLength;
	m_entries=entries;

	setRequiredBytesPerObject();

	uint8_t sequenceData[CONFIG_MAXKMERLENGTH];

	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);
	fwrite(&m_kmerLength,sizeof(uint32_t),1,output);
	fwrite(&m_entries,sizeof(uint64_t),1,output);

	for(uint64_t i=0;i<entries;i++){
		char*value=fgets(buffer,1024,stream);
		if(value==NULL)
			null++;

		if(strlen(buffer)>0 && buffer[0]=='#')
			continue;

		//cout<<"Line: "<<buffer<<endl;

		int available=strlen(buffer);

		memset(sequenceData,0,CONFIG_MAXKMERLENGTH*sizeof(uint8_t));

		for(int nucleotidePosition=0;nucleotidePosition<(int)m_kmerLength;nucleotidePosition++){
			char symbol=buffer[nucleotidePosition];
			int code=getSymbolCode(symbol);
			int bitPosition=nucleotidePosition*BITS_PER_NUCLEOTIDE;

			writeTwoBits(sequenceData,bitPosition,code);

#ifdef CONFIG_ASSERT
			int testCode=-1;
			readTwoBits(sequenceData,bitPosition,&testCode);

			if(testCode!=code){
				cout<<"Expected: "<<code<<" Actual: "<<testCode<<" Symbol: "<<symbol<<endl;
			}
			assert(testCode==code);
#endif
		}

		fwrite(sequenceData,m_requiredBytesPerSequence,1,output);
		//fwrite(buffer,m_kmerLength,1,output);

		int secondSeparator=kmerLength+1;

		while(buffer[secondSeparator]!=';')
			secondSeparator++;

		buffer[secondSeparator]='\0';

		//cout<<"Coverage: "<<buffer+kmerLength+1<<endl;
		istringstream inputObject(buffer+kmerLength+1);

		uint32_t coverage=0;
		inputObject>>coverage;

		//cout<<"Coverage: "<<coverage<<endl;

		fwrite(&coverage,sizeof(uint32_t),1,output);

		char parents[ALPHABET_SIZE];
		
		parents[indexA]=MARKER_NO;
		parents[indexC]=MARKER_NO;
		parents[indexG]=MARKER_NO;
		parents[indexT]=MARKER_NO;

		char children[ALPHABET_SIZE];

		children[indexA]=MARKER_NO;
		children[indexC]=MARKER_NO;
		children[indexG]=MARKER_NO;
		children[indexT]=MARKER_NO;

		char*selection=parents;

		for(int position=secondSeparator+1;position<available;position++){
			char operationCode= buffer[position];
			
			if(operationCode==';')
				selection=children;
			else if(operationCode==symbolA)
				selection[indexA]=MARKER_YES;
			else if(operationCode==symbolC)
				selection[indexC]=MARKER_YES;
			else if(operationCode==symbolG)
				selection[indexG]=MARKER_YES;
			else if(operationCode==symbolT)
				selection[indexT]=MARKER_YES;
		}

		uint64_t friends=0;
		int offset=0;
		for(int i=0;i<ALPHABET_SIZE;i++){
			if(parents[i]==MARKER_YES){
				uint64_t mask=MARKER_YES;
				mask<<=(offset+i);
				friends|=mask;
			}
		}

		offset+=ALPHABET_SIZE;

		for(int i=0;i<ALPHABET_SIZE;i++){
			if(children[i]==MARKER_YES){
				uint64_t mask=MARKER_YES;
				mask<<=(offset+i);
				friends|=mask;
			}
		}

		uint8_t informationToWrite=friends;

		fwrite(&informationToWrite,1*sizeof(uint8_t),1,output);
	}

	fclose(output);
	fclose(stream);

	cout<<"Created "<<binaryFile<<endl;
}

uint64_t GraphDatabase::getEntries()const{
	return m_entries;
}

void GraphDatabase::setRequiredBytesPerObject(){
	int requiredBits=m_kmerLength*BITS_PER_NUCLEOTIDE;
	int requiredBytes=requiredBits/BITS_PER_BYTE;

	if(requiredBits%BITS_PER_BYTE!=0)
		requiredBytes++;

	m_requiredBytesPerSequence=requiredBytes;
}

void GraphDatabase::writeTwoBits(uint8_t*sequenceData,int bitPosition,int code){

	int byteNumber=bitPosition/BITS_PER_BYTE;
	int positionInByte=bitPosition%BITS_PER_BYTE;

	uint64_t currentValue=sequenceData[byteNumber];

	uint64_t mask=code;
	mask<<=positionInByte;
	currentValue|=mask;

	sequenceData[byteNumber]=currentValue;

}

void GraphDatabase::readTwoBits(uint8_t*sequenceData,int bitPosition,int*code)const{

	int byteNumber=bitPosition/BITS_PER_BYTE;
	int positionInByte=bitPosition%BITS_PER_BYTE;

	uint64_t currentValue=sequenceData[byteNumber];

	currentValue<<=(BITS_PER_BYTE*sizeof(uint64_t)-BITS_PER_NUCLEOTIDE-positionInByte);
	currentValue>>=(BITS_PER_BYTE*sizeof(uint64_t)-BITS_PER_NUCLEOTIDE);

#ifdef CONFIG_ASSERT
	assert(currentValue>=0);
	assert(currentValue<ALPHABET_SIZE);
#endif

	(*code)=currentValue;
}

int GraphDatabase::getSymbolCode(char symbol)const{
	switch (symbol){
		case SYMBOL_A:
			return INDEX_A;
		case SYMBOL_T:
			return INDEX_T;
		case SYMBOL_G:
			return INDEX_G;
		case SYMBOL_C:
			return INDEX_C;
	}

	return SYMBOL_A;
}

const char*GraphDatabase::getFileName()const{
	return m_fileName.c_str();
}

bool GraphDatabase::hasError()const{
	return m_error;
}
