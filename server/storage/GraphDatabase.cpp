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

#include "GraphDatabase.h"
#include "../constants.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#include <iostream>
#include <sstream>
#include <iomanip>
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

	uint8_t*myBuffer = getMemoryBuffer(index);

	object->save(myBuffer);
}

uint8_t* GraphDatabase::getMemoryBuffer(uint64_t index)const{

	uint64_t middlePosition=m_startingPosition + index*m_entrySize;
	return m_content + middlePosition;
}

void GraphDatabase::getObjectAtIndex(uint64_t index, VertexObject*object)const{

	if(!(index <m_entries))
		return;


	uint8_t*myBuffer=getMemoryBuffer(index);

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
	m_maximumLineLength = 0;

	m_active=false;
	m_error=false;
	m_expectedMagicNumber=2345678987;

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;

	m_content = NULL;

	m_verbosity = false;
}

void GraphDatabase::startProgress() {
	m_sorted = 0;
	m_lastProgress = 0;
	m_startingTime = time(NULL);
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

	startProgress();
	m_period = 2048;

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

			if(selectedKey == buffer) {
				m_entries++;

				printProgress("Counting entries", 1);
			}
		}
	}

	printProgress("Counting entries", 0);
	cout << endl;
	m_period = m_entries / 256;

	fclose(stream);

	stream=fopen(file,"r");

	if(m_verbosity){
		cout<<"Entries: "<< m_entries * 2 << endl;
		cout << "KmerLength: "<< m_kmerLength<<endl;
		cout << "Lexicographically-lower entries: " << m_entries <<endl;
	}

	FILE*output=fopen(binaryFile,"w");

	VertexObject mock;
	mock.setKmerLength(m_kmerLength);

	m_entrySize = mock.getEntrySize();

	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);
	fwrite(&m_kmerLength,sizeof(uint32_t),1,output);
	fwrite(&m_entries,sizeof(uint64_t),1,output);

	uint64_t i = 0;

	int bufferSize = 4194304;
	uint8_t*bigBuffer = (uint8_t*) malloc(bufferSize* sizeof(uint8_t));
	int positionInBuffer = 0;

	startProgress();

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

		entryForThisLine.save(bigBuffer + positionInBuffer);
		positionInBuffer += entryForThisLine.getEntrySize();

		if((bufferSize - positionInBuffer) < m_entrySize) {
			fwrite(bigBuffer, positionInBuffer, 1, output);
			positionInBuffer = 0;
		}

		printProgress("Writing entries", 1);
	}

	if(positionInBuffer != 0) {
		fwrite(bigBuffer, positionInBuffer, 1, output);
		positionInBuffer = 0;
	}

	printProgress("Writing entries", 0);
	cout << endl;

	fclose(output);
	fclose(stream);

	if(m_verbosity)
		cout<<"Created "<<binaryFile<<endl;

	sortEntries(binaryFile);

	free(bigBuffer);
	bigBuffer = NULL;
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

	uint64_t i = 0;

	VertexObject object1;
	getObjectAtIndex(i, &object1);
	i++;

	startProgress();

	while(i < m_entries){

		VertexObject object2;
		getObjectAtIndex(i, &object2);

		if(!(object1 <= object2)){

			m_sorted = m_entries;
			m_lastProgress = 0;
			printProgress("Checking entries", 0);
			cout << endl;

			return false;
		}

		object1 = object2;

		printProgress("Checking entries", 1);

		i ++;
	}

	printProgress("Checking entries", 0);
	cout << endl;

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

		if(valueAtI <= pivotValue) {
			swap(i, storeIndex);
			storeIndex ++;
		}

		i ++;
	}

	swap(storeIndex, right);

	return storeIndex;
}

/**
 * 0  1  2  3  4  5  6  7  8
 * 11 12 12 11 1  13 18 19 21
 *
 * <--------->
 * 4 elements
 * 4 - 0
 *
 * i = 4
 * j = 0
 */
void GraphDatabase::insertionSort(uint64_t left, uint64_t right){

#if 0
	cout << "insertionSort" << endl;
#endif

	for(uint64_t i = left; i<= right; i++) {
		VertexObject objectI;
		getObjectAtIndex(i, &objectI);

		// find the first element that is greater than our element
		for(uint64_t j = left; j < i; j++){

			VertexObject objectJ;
			getObjectAtIndex(j, &objectJ);

			if(objectI < objectJ){

				uint8_t * source = getMemoryBuffer(j);
				uint8_t * destination = getMemoryBuffer(j + 1);
				uint64_t count = i - j;
				memmove(destination, source, count * m_entrySize);

				objectI.save(source);
				break;
			}
		}
	}
}

/**
 * TODO this method outputs 64-bit random numbers only on POSIX systems.
 */
uint64_t GraphDatabase::getRandomNumber(uint64_t left, uint64_t right){

	uint64_t max = right - left;

	// we need a POSIX system to change that.
	uint64_t randomNumber = 42; 

#ifdef CONFIG_POSIX
	FILE*fp = fopen("/dev/random", "r");
	fread(&randomNumber, sizeof(uint64_t), 1, fp);
	fclose(fp);
#endif

	uint64_t value = left + ( randomNumber % max );

#ifdef CONFIG_ASSERT
	assert(value>=left);
	assert(value<=right);
#endif

	return value;
}

/**
 * use the median algorithm
 *
 * \see http://en.wikipedia.org/wiki/Quicksort
 */
uint64_t GraphDatabase::selectPivot(uint64_t left, uint64_t right) {

#ifdef CONFIG_POSIX1
	left = getRandomNumber(left, right);
	right = getRandomNumber(left, right);
	uint64_t middle = getRandomNumber(left, right);
#else
	uint64_t middle = (left + right) / 2;
#endif

	VertexObject leftValue;
	VertexObject rightValue;
	VertexObject middleValue;

	getObjectAtIndex(left, &leftValue);
	getObjectAtIndex(right, &rightValue);
	getObjectAtIndex(middle, &middleValue);

	if(leftValue < middleValue && middleValue < rightValue)
		return middle;

	if(middleValue < leftValue && leftValue < rightValue)
		return left;

	return right;
}

/**
 * \see http://en.wikipedia.org/wiki/Quicksort
 */
void GraphDatabase::quicksort(uint64_t left, uint64_t right){

	int count = right - left + 1;

	if(count == 0)
		return;

	if(count == 1){
		printProgress("Sorting entries", count);

		return;
	}

	int maximumForInsertionSort = 8;

	if(count <= maximumForInsertionSort) {
		insertionSort(left, right);

		printProgress("Sorting entries", count);

		return;
	}

	uint64_t pivotIndex = selectPivot(left, right);

	uint64_t pivotNewIndex = partition(left, right, pivotIndex);

	printProgress("Sorting entries", 1);

	if(pivotNewIndex != 0)
		quicksort(left, pivotNewIndex - 1);

	quicksort(pivotNewIndex + 1, right);
}

void GraphDatabase::printProgress(const char * step, uint64_t count) {

	if(count == 0){
		m_sorted = m_entries;
		m_lastProgress = 0;
	}

	m_sorted += count;

	if(m_lastProgress == m_sorted) {
		return;
	}

	if(m_sorted < m_lastProgress + m_period) {
		return;
	}

	ostringstream buffer;

	uint64_t elapsed = time(NULL) - m_startingTime;

	double progress = 100.0 * m_sorted / m_entries;

	uint64_t perSecond = 0;

	if(elapsed != 0)
		perSecond = m_sorted / elapsed;

	uint64_t remaining = m_entries - m_sorted;

	uint64_t remainingTime = 0;

	if(perSecond != 0)
		remainingTime = remaining / perSecond;

	buffer <<  step << " " << m_sorted << "/" << m_entries << " => ";
	buffer .setf(ios::fixed, ios::floatfield);
	buffer .precision(2);
	buffer << progress << "%";

	buffer << " Elapsed: ";
	printTime(&buffer, elapsed);
	buffer << " Remaining: ";
	printTime(&buffer, remainingTime);

	string content = buffer.str();

	cout << "\r" << content;

	if((int)content.length() > m_maximumLineLength)
		m_maximumLineLength = content.length();

	int spaces = m_maximumLineLength - content.length();

	while(spaces--)
		cout << " ";

	cout.flush();

	m_lastProgress = m_sorted;
}

void GraphDatabase::printTime(ostream*stream, uint64_t seconds) {
	uint64_t theSeconds = seconds % 60;

	uint64_t minutes = seconds / 60;
	uint64_t theMinutes = minutes % 60;

	uint64_t hours = minutes / 60;
	uint64_t theHours = hours % 24;

	uint64_t days = hours / 24;
	uint64_t theDays = days % 7;

	uint64_t weeks = days / 7;
	uint64_t theWeeks = weeks;

	bool hasPrevious = false;

	hasPrevious = printTimeUnits(stream, "week", theWeeks, hasPrevious, false);
	hasPrevious = printTimeUnits(stream, "day", theDays, hasPrevious, false);
	hasPrevious = printTimeUnits(stream, "hour", theHours, hasPrevious, false);
	hasPrevious = printTimeUnits(stream, "minute", theMinutes, hasPrevious, false);
	hasPrevious = printTimeUnits(stream, "second", theSeconds, hasPrevious, seconds == 0);
}

bool GraphDatabase::printTimeUnits(ostream * stream, const char * units, uint64_t value, bool hasPrevious, bool force){

	if(value > 0 || force) {
		if(hasPrevious)
			(*stream) << ", ";

		(*stream) << value << " " << units;
		if(value> 1)
			(*stream) << "s";

		return true;
	}

	return false;
}

void GraphDatabase::sortEntriesInFile(){

	startProgress();

	cout << "Starting quicksort" << endl;

	quicksort(0, m_entries - 1);

	printProgress("(4/4) Sorting entries", 0);

	cout << endl;

	cout << "Sorted entries" << endl;
}

void GraphDatabase::sortEntries(const char*file){

	m_mapper.enableWriteOperations();

	openFile(file);

	bool sorted = checkOrder();

	if(sorted) {
		if(m_verbosity)
			cout << "File is already sorted." << endl;
	} else {
		sortEntriesInFile();
	}

	closeFile();
}

void GraphDatabase::setVerbosity(){
	m_verbosity = true;
}
