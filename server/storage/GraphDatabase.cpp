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

		VertexObject entry;
		getObjectAtIndex(middle, &entry);

		const char * sequence = entry.getSequence();

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

void GraphDatabase::setObjectAtIndex(uint64_t index, VertexObject*object){

	if(!(index < m_entries))
		return;

#if 0
	cout << "setObjectAtIndex index " << index << " m_entrySize " << m_entrySize << endl;
#endif

	uint64_t middlePosition=m_startingPosition+index*m_entrySize;

#if 0
	cout << "Position in file " << middlePosition << endl;
#endif

	uint8_t*myBuffer=m_content + middlePosition;

#if 0
	cout << "saving object at " << (void*) myBuffer << " object is " << (void*)object << endl;

	object->debug();
#endif
	object->save(myBuffer);
}

void GraphDatabase::getObjectAtIndex(uint64_t index, VertexObject*object)const{

	if(!(index <m_entries))
		return;

	uint64_t middlePosition=m_startingPosition + index*m_entrySize;
	uint8_t*myBuffer=m_content + middlePosition;

#if 0
	cout << " getObjectAtIndex m_content " << (void*) m_content << " index " << index << " m_startingPosition " << m_startingPosition <<endl;
#endif

#if 0
	cout << " m_content = " << (void*) m_content << endl;
	cout << " getObjectAtIndex myBuffer = " << (void*) myBuffer << endl;
#endif

	object->setKmerLength(m_kmerLength);
	object->load(myBuffer);
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

#if 0
	cout << " m_content = " << (void*)m_content << endl;
#endif

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

	VertexObject mock;
	mock.setKmerLength(m_kmerLength);
	m_entrySize = mock.getEntrySize();

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

GraphDatabase::GraphDatabase(){
	m_active=false;
	m_error=false;
	m_expectedMagicNumber=2345678987;

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;

	m_content = NULL;
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

	VertexObject mock;
	mock.setKmerLength(m_kmerLength);

	m_entrySize = mock.getEntrySize();

	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);
	fwrite(&m_kmerLength,sizeof(uint32_t),1,output);
	fwrite(&m_entries,sizeof(uint64_t),1,output);

	uint64_t i = 0;

	uint8_t bufferForEntry[2 * CONFIG_MAXKMERLENGTH];

	while(i < entriesInFile) {

		char*value=fgets(buffer,1024,stream);
		if(value==NULL)
			null++;

		if(strlen(buffer)>0 && buffer[0]=='#')
			continue;

		i ++;

		VertexObject entryForThisLine;
		entryForThisLine.setKmerLength(m_kmerLength);
		entryForThisLine.loadFromLine(buffer);

		const char* sequence = entryForThisLine.getSequence();
		entryForThisLine.getReverseComplement(sequence, reverseComplementSequence);
		const char*selectedKey= selectObject(sequence, reverseComplementSequence);

		if(selectedKey != sequence){
			continue;
		}

		entryForThisLine.save(bufferForEntry);

#if 0
		cout << " m_entrySize= " << m_entrySize << endl;
#endif
		fwrite(bufferForEntry, m_entrySize, 1, output);
	}

	fclose(output);
	fclose(stream);

	cout<<"Created "<<binaryFile<<endl;

	sortEntries(binaryFile);
}

uint64_t GraphDatabase::getEntries()const{

	return m_entries;
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
#if 0
			cout << sequence1 << " and " << sequence2 << " break strict ordering" << endl;
#endif
			return false;
		}

		object1 = object2;
		i ++;
	}

	return true;
}

/**
 * \see http://en.wikipedia.org/wiki/Quicksort
 */
void GraphDatabase::swap(uint64_t index1, uint64_t index2){

#if 0
	cout << "swap " << index1 << " " << index2 << endl;

	cout << "getObjectAtIndex " << index1 << endl;
#endif

	VertexObject value1;
	getObjectAtIndex(index1, &value1);

#if 0
	cout << "getObjectAtIndex " << index2 << endl;
#endif

	VertexObject value2;
	getObjectAtIndex(index2, &value2);

#if 0
	cout << "setObjectAtIndex " << index1 << endl;
#endif

	setObjectAtIndex(index1, &value2);
	setObjectAtIndex(index2, &value1);
}

/**
 * \see http://en.wikipedia.org/wiki/Quicksort
 */
uint64_t GraphDatabase::partition(uint64_t left, uint64_t right, uint64_t pivotIndex) {
	VertexObject pivotValue;
	getObjectAtIndex(pivotIndex, &pivotValue);

#if 0
	cout << "swapping pivot on the right" << endl;
#endif

	swap(pivotIndex, right);

	uint64_t storeIndex = left;

	uint64_t i = left;
	while(i <= right - 1) {
		VertexObject valueAtI;
		getObjectAtIndex(i, &valueAtI);

		if(strcmp(valueAtI.getSequence(), pivotValue.getSequence()) <= 0) {
			swap(i, storeIndex);
			storeIndex ++;
		}

		i ++;
	}

	swap(storeIndex, right);

	return storeIndex;
}

/**
 * \see http://en.wikipedia.org/wiki/Quicksort
 */
void GraphDatabase::quicksort(uint64_t left, uint64_t right){

	if(!(left < right))
		return;

	uint64_t pivotIndex = left + (right - left) / 2;

#if 0
	cout << "quicksort left= " << left << " right= " << right << " pivot= " << pivotIndex << endl;
#endif

	uint64_t pivotNewIndex = partition(left, right, pivotIndex);

#if 0
	cout << "pivotNewIndex = " << pivotNewIndex << endl;
#endif

	if(pivotNewIndex != 0)
		quicksort(left, pivotNewIndex - 1);

	quicksort(pivotNewIndex + 1, right);
}

void GraphDatabase::sortEntriesInFile(){
	cout << "Sorting " << m_entries << " entries in file" << endl;

	quicksort(0, m_entries - 1);
}

void GraphDatabase::sortEntries(const char*file){

	m_mapper.enableWriteOperations();

	openFile(file);

	cout << "Verifying order" << endl;

	bool sorted = checkOrder();

	if(sorted) {
		cout << "File is already sorted." << endl;
	} else {
#if 0
		cout << "Need to sort entries" << endl;
#endif
		sortEntriesInFile();
	}

	closeFile();
}
