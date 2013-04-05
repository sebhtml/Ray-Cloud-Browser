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
#include "../constants.h"

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

const char * GraphDatabase::selectObject(const char*object1, const char*object2) const{
	if(m_formatVersion == 0)
		return object1;

	if(strcmp(object1, object2) < 0)
		return object1;

	return object2;
}

bool GraphDatabase::getObject(const char*key,VertexObject*object)const{

	uint64_t index=0;

	char reverseComplementSequence[CONFIG_MAXKMERLENGTH];
	object->getReverseComplement(key, reverseComplementSequence);
	const char * selectedKey = selectObject(key, reverseComplementSequence);

	bool found=getObjectIndex(selectedKey, &index);

	if(!found)
		return found;

	getObjectAtIndex(index, object);

	if(selectedKey != key)
		object->morphToTwin();

	return found;
}

/*
 * \param key is the lexicographically lower key
 */
bool GraphDatabase::getObjectIndex(const char*key,uint64_t*index)const{
	bool found=false;

	if(!m_active)
		return found;

	if(m_error)
		return found;

	uint64_t first=0;
	uint64_t last=m_entries-1;

/*
 * Version 1 stores only the lexicographically lower k-mers
 */
	if(m_formatVersion >= 1)
		last = m_entries - 1;

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

void GraphDatabase::setObjectAtIndex(uint64_t index, VertexObject*object){

	if(!(index < m_entries))
		return;

	char sequence[CONFIG_MAXKMERLENGTH];
	pullSequence(index, sequence);

	uint32_t coverage=0;
	uint8_t friendInformation=0;

	uint64_t middlePosition=m_startingPosition+index*m_entrySize;
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

void GraphDatabase::getObjectAtIndex(uint64_t index, VertexObject*object)const{

	if(!(index <m_entries))
		return;

	char sequence[CONFIG_MAXKMERLENGTH];
	pullSequence(index, sequence);

	uint32_t coverage=0;
	uint8_t friendInformation=0;

	uint64_t middlePosition=m_startingPosition + index*m_entrySize;
	const char*myBuffer=((char*)m_content)+ middlePosition;
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

	if(m_formatVersion!=0 && m_formatVersion != 1){
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
	m_active=false;
	m_error=false;
	m_expectedMagicNumber=2345678987;

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;
}

void GraphDatabase::index(const char*inputFile,const char*outputFile){

	m_magicNumber=m_expectedMagicNumber;
	m_formatVersion = 1;

	const char*file=inputFile;
	const char*binaryFile=outputFile;

	m_kmerLength=0;
	m_entries=0;
	uint64_t entriesInFile = 0;

	char buffer[1024];
	char reverseComplementSequence[CONFIG_MAXKMERLENGTH];
	VertexObject dummy;

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

			entriesInFile ++;

			if(m_kmerLength==0){
				while(buffer[m_kmerLength]!=';'){
					m_kmerLength++;
				}
			}

			buffer[m_kmerLength] = '\0';

			dummy.getReverseComplement(buffer, reverseComplementSequence);
			const char*selectedKey = selectObject(buffer, reverseComplementSequence);

			if(selectedKey == buffer)
				m_entries++;
		}
	}

	fclose(stream);

	stream=fopen(file,"r");

	cout<<"Entries: "<< m_entries * 2 <<" KmerLength: "<< m_kmerLength<<endl;
	cout << m_entries << " are lexicographically-lower"<<endl;
	cout << "will read " << entriesInFile << " entries from input file" << endl;

	FILE*output=fopen(binaryFile,"w");

	setRequiredBytesPerObject();

	uint8_t sequenceData[CONFIG_MAXKMERLENGTH];

	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);
	fwrite(&m_kmerLength,sizeof(uint32_t),1,output);
	fwrite(&m_entries,sizeof(uint64_t),1,output);

	uint64_t i = 0;

	while(i < entriesInFile) {

		char*value=fgets(buffer,1024,stream);
		if(value==NULL)
			null++;

		if(strlen(buffer)>0 && buffer[0]=='#')
			continue;

		i ++;

		int available=strlen(buffer);

		buffer[m_kmerLength] = '\0';
		dummy.getReverseComplement(buffer, reverseComplementSequence);
		const char*selectedKey= selectObject(buffer, reverseComplementSequence);

		if(selectedKey != buffer){
			continue;
		}

		buffer[m_kmerLength] = ';';

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

		int secondSeparator=m_kmerLength+1;

		while(buffer[secondSeparator]!=';')
			secondSeparator++;

		buffer[secondSeparator]='\0';

		istringstream inputObject(buffer+m_kmerLength+1);

		uint32_t coverage=0;
		inputObject>>coverage;

		fwrite(&coverage,sizeof(uint32_t),1,output);

		char parents[ALPHABET_SIZE];
		
		parents[INDEX_A]=MARKER_NO;
		parents[INDEX_C]=MARKER_NO;
		parents[INDEX_G]=MARKER_NO;
		parents[INDEX_T]=MARKER_NO;

		char children[ALPHABET_SIZE];

		children[INDEX_A]=MARKER_NO;
		children[INDEX_C]=MARKER_NO;
		children[INDEX_G]=MARKER_NO;
		children[INDEX_T]=MARKER_NO;

		char*selection=parents;

		for(int position=secondSeparator+1;position<available;position++){
			char operationCode= buffer[position];
			
			if(operationCode==';')
				selection=children;
			else if(operationCode== SYMBOL_A)
				selection[INDEX_A]=MARKER_YES;
			else if(operationCode== SYMBOL_C)
				selection[INDEX_C]=MARKER_YES;
			else if(operationCode== SYMBOL_G)
				selection[INDEX_G]=MARKER_YES;
			else if(operationCode== SYMBOL_T)
				selection[INDEX_T]=MARKER_YES;
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

	sortEntries(binaryFile);
}

uint64_t GraphDatabase::getEntries()const{

/**
 * Format version 1 stores only the lexicographically lower
 * objects.
 */
	if(m_formatVersion >= 1)
		return m_entries * 2;

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

int GraphDatabase::getFormatVersion()const{
	return m_formatVersion;
}

bool GraphDatabase::checkOrder(){

	uint64_t entriesInFile = m_entries ;

	uint64_t i = 0;

	VertexObject object1;
	getObjectAtIndex(i, &object1);
	i++;

	while(i < entriesInFile){

		VertexObject object2;
		getObjectAtIndex(i, &object2);

		const char*sequence1 = object1.getSequence();
		const char*sequence2 = object2.getSequence();

		if(!(strcmp(sequence1, sequence2) < 0)){
			cout << sequence1 << " and " << sequence2 << " break strict ordering" << endl;
			return false;
		}

		object1 = object2;
		i ++;
	}

	return true;
}

void GraphDatabase::sortEntriesInFile(){
	cout << "Sorting " << m_entries << " entries in file" << endl;
}

void GraphDatabase::sortEntries(const char*file){

	openFile(file);

	cout << "Verifying order" << endl;

	bool sorted = checkOrder();

	if(sorted){
		cout << "File is already sorted." << endl;
	}else {

		sortEntriesInFile();
	}

	closeFile();
}
