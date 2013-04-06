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

#include "VertexObject.h"
#include "constants.h"

#include <string.h>
#include <string>
#include <sstream>
using namespace std;

#ifdef CONFIG_ASSERT
#include <assert.h>
#endif

VertexObject::VertexObject() {
	m_debug = false;
}

void VertexObject::setSequence(char*value){
	strcpy(m_sequence,value);
	setKmerLength(strlen(m_sequence));

	m_parents[INDEX_A]=MARKER_NO;
	m_parents[INDEX_C]=MARKER_NO;
	m_parents[INDEX_G]=MARKER_NO;
	m_parents[INDEX_T]=MARKER_NO;

	m_children[INDEX_A]=MARKER_NO;
	m_children[INDEX_C]=MARKER_NO;
	m_children[INDEX_G]=MARKER_NO;
	m_children[INDEX_T]=MARKER_NO;
}

void VertexObject::setCoverage(uint32_t value){
	m_coverage=value;
}

uint32_t VertexObject::getCoverage()const{
	return m_coverage;
}

void VertexObject::writeContentInJSON(ostream*stream)const{
	(*stream)<<"{"<<endl;
	(*stream)<<"	\"sequence\": \""<<m_sequence<<"\","<<endl;
	(*stream)<<"	\"coverage\": "<<m_coverage<<","<<endl;
	(*stream)<<"	\"parents\": [";

	bool gotFirst=false;
	for(int i=0;i<4;i++){
		if(m_parents[i]==MARKER_YES){
			if(gotFirst)
				(*stream)<<", ";
			gotFirst=true;

			(*stream)<<"\""<<getCodeSymbol(i)<<"\"";
		}
	}

	(*stream)<<"],"<<endl;

	(*stream)<<"	\"children\": [";

	gotFirst=false;
	for(int i=0;i<4;i++){
		if(m_children[i]==MARKER_YES){
			if(gotFirst)
				(*stream)<<", ";
			gotFirst=true;

			(*stream)<<"\""<<getCodeSymbol(i)<<"\"";
		}
	}

	(*stream)<<"]"<<endl;
	(*stream)<<"}";
}

void VertexObject::addParent(char symbol){
	m_parents[getSymbolCode(symbol)]=MARKER_YES;
}

bool VertexObject::hasParentCode(int code) const{

	return m_parents[code] == MARKER_YES;
}

bool VertexObject::hasChildCode(int code) const{

	return m_children[code] == MARKER_YES;
}
bool VertexObject::hasParent(char symbol) const{

	return hasParentCode(getSymbolCode(symbol));
}

bool VertexObject::hasChild(char symbol) const{

	return hasChildCode(getSymbolCode(symbol));
}

void VertexObject::addChild(char symbol){
	m_children[getSymbolCode(symbol)]=MARKER_YES;
}

char VertexObject::getCodeSymbol(int code)const{
	if(code==INDEX_A)
		return SYMBOL_A;
	if(code==INDEX_C)
		return SYMBOL_C;
	if(code==INDEX_G)
		return SYMBOL_G;
	if(code==INDEX_T)
		return SYMBOL_T;

	return SYMBOL_A;
}

const char* VertexObject::getSequence()const{
	return m_sequence;
}

void VertexObject::getParents(vector<string>*parents)const{
	string sequence=m_sequence;
	string base=sequence.substr(0,sequence.length()-1);

	for(int i=0;i<4;i++){
		if(m_parents[i]==MARKER_YES){
			char symbol=getCodeSymbol(i);
			string otherObject=symbol+base;
			parents->push_back(otherObject);
		}
	}
}

void VertexObject::getChildren(vector<string>*children)const{
	string sequence=m_sequence;
	string base=sequence.substr(1,sequence.length()-1);

	for(int i=0;i<4;i++){
		if(m_children[i]==MARKER_YES){
			char symbol=getCodeSymbol(i);
			string otherObject=base+symbol;
			children->push_back(otherObject);
		}
	}
}

void VertexObject::writeContentInText(ostream*stream)const{
	(*stream)<<m_sequence<<";";
	(*stream)<<m_coverage<<";";

	for(int i=0;i<4;i++){
		if(m_parents[i]==MARKER_YES){
			(*stream) << getCodeSymbol(i);
		}
	}

	(*stream)<<";";

	for(int i=0;i<4;i++){
		if(m_children[i]==MARKER_YES){
			(*stream) << getCodeSymbol(i);
		}
	}
	(*stream)<<endl;
}

void VertexObject::morphToTwin(){
	getReverseComplement(m_sequence, m_sequence);

	char oldParents[ALPHABET_SIZE];
	memcpy(oldParents, m_parents, ALPHABET_SIZE);

	// old children become new parents
	for(int i=0;i < ALPHABET_SIZE; i++)
		m_parents[i] = MARKER_NO;

	for(int i = 0;i < ALPHABET_SIZE; i++){
		if(m_children[i] == MARKER_YES)
			m_parents[getComplementNucleotideIndex(i)] = MARKER_YES;
	}

	// old parents become new children
	for(int i=0;i < ALPHABET_SIZE; i++)
		m_children[i] = MARKER_NO;

	for(int i = 0;i < ALPHABET_SIZE; i++){
		if(oldParents[i] == MARKER_YES)
			m_children[getComplementNucleotideIndex(i)] = MARKER_YES;
	}
}

int VertexObject::getComplementNucleotideIndex(int i){
	switch(i){
		case INDEX_A:
			return INDEX_T;
		case INDEX_T:
			return INDEX_A;
		case INDEX_C:
			return INDEX_G;
		case INDEX_G:
			return INDEX_C;
	}

	return INDEX_A;
}

void VertexObject::getReverseComplement(const char * key, char * result){
	int i = 0;
	int kmerLength = strlen(key);

	// copy the data
	while(i < kmerLength){
		result[i] = key[i];
		i++;
	}

	i = 0;
	// inverse
	while(i < kmerLength / 2){
		int lastIndex = kmerLength - 1 - i;
		char last = result[lastIndex];

		result[lastIndex] = key[i];
		result[i] = last;
		i++;
	}

	// complement
	i = 0;

	while(i < kmerLength){
		result[i] = getComplementNucleotide(result[i]);
		i++;
	}

	result[kmerLength] = '\0';
}

char VertexObject::getComplementNucleotide(char a){
	switch(a){
		case SYMBOL_A:
			return SYMBOL_T;
		case SYMBOL_T:
			return SYMBOL_A;
		case SYMBOL_G:
			return SYMBOL_C;
		case SYMBOL_C:
			return SYMBOL_G;
	}

	return SYMBOL_A;
}

void VertexObject::load(const uint8_t * myBuffer) {
	int positionFromStart=0;

	pullSequence(m_sequence, myBuffer + positionFromStart);

#if 0
	cout << " load -> sequence is " << m_sequence << " from " << (void*) myBuffer;
	cout << " " << m_requiredBytesPerSequence << " bytes" << endl;
#endif

	setSequence(m_sequence);

	uint8_t friendInformation=0;

	positionFromStart += m_requiredBytesPerSequence;

// group disk I/O operations here
	char objectBufferForDisk[OBJECT_INFORMATION_LENGTH];
	memcpy(objectBufferForDisk,myBuffer+positionFromStart,OBJECT_INFORMATION_LENGTH);

// then copy stuff from our memory buffer

	int position=0;
	memcpy(&m_coverage,objectBufferForDisk+position,sizeof(uint32_t));
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

#if 0
	cout << "Coverage = " << getCoverage() << endl;
#endif

	for(int i=0;i<ALPHABET_SIZE;i++){
		if(parents[i]==MARKER_YES){
			addParent(getCodeSymbol(i));

#if 0
			cout << "Added parent " << getCodeSymbol(i) << endl;
#endif
		}
		if(children[i]==MARKER_YES){
			addChild(getCodeSymbol(i));

#if 0
			cout << "Added child " << getCodeSymbol(i) << endl;
#endif
		}
	}
}

void VertexObject::save(uint8_t * myBuffer) const {

	int positionFromStart = 0;

#if 0
	cout<<"Saving " << getSequence() << " " << getCoverage() << endl;
#endif

#ifdef CONFIG_ASSERT
	if(m_debug) {
		cout << "Saving this at " << (void*)myBuffer << " " << m_requiredBytesPerSequence << " bytes for sequence " << endl;
		cout << m_entrySize << " bytes total " << endl;
	}
#endif

	memset(myBuffer, 0, m_entrySize);

#if 0
	writeContentInText(&cout);
#endif

#ifdef CONFIG_ASSERT
	if(m_debug)
		cout << "Pushing sequence " << endl;
#endif

	pushSequence(myBuffer + positionFromStart, m_sequence);

	positionFromStart += m_requiredBytesPerSequence;

	// write coverage

	uint32_t coverage = getCoverage();

	memcpy(myBuffer + positionFromStart, &coverage, 1*sizeof(uint32_t));
	positionFromStart += sizeof(uint32_t);

#if 0
	cout << getSequence() << " " << getCoverage() << endl;
#endif

	// write edges
	uint64_t friends=0;
	int offset=0;
	for(int i=0;i<ALPHABET_SIZE;i++){
		if(hasParentCode(i)){
#if 0
			cout << " has parent " << getCodeSymbol(i) << endl;
#endif

			uint64_t mask=MARKER_YES;
			mask<<=(offset+i);
			friends|=mask;
		}
	}

	offset+=ALPHABET_SIZE;

	for(int i=0;i<ALPHABET_SIZE;i++){
		if(hasChildCode(i)){
			uint64_t mask=MARKER_YES;
			mask<<=(offset+i);
			friends|=mask;
		}
	}

	uint8_t informationToWrite=friends;

	memcpy(myBuffer + positionFromStart, &informationToWrite, 1*sizeof(uint8_t));

#ifdef CONFIG_ASSERT
	positionFromStart += sizeof(uint8_t);

	if(m_entrySize != positionFromStart)
		cout<< "Expected: " << m_entrySize << " Actual: " << positionFromStart << endl;
	assert(m_entrySize == positionFromStart);

	VertexObject dummy;
	dummy.setKmerLength(m_kmerLength);
	dummy.load(myBuffer);

	assert(getCoverage() == dummy.getCoverage());

	bool result = ( strcmp(getSequence(), dummy.getSequence()) == 0);

	if(!result) {
		cout << " Expected:" << getSequence() << endl;
		cout << " Actual:  " << dummy.getSequence() << endl;
	}
	assert(result);
#endif
}

void VertexObject::pullSequence(char * sequence, const uint8_t * myBuffer){

#if 0
	cout << " pullSequence myBuffer = " <<(void*) myBuffer << endl;
#endif

	int position=0;

// first, we only copy the sequence to compare it with what we are looking for
// we don't load the object meta-information if it's not a match

	uint8_t sequenceData[CONFIG_MAXKMERLENGTH];
	memcpy(sequenceData, myBuffer+position, m_requiredBytesPerSequence);

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

		sequence[nucleotidePosition] = getCodeSymbol(code);
	}

	sequence[m_kmerLength]='\0';

#if 0
	cout << " pullSequence result = " << sequence << endl;
#endif
}

void VertexObject::pushSequence(uint8_t*sequenceData, const char * buffer) const {

#if 0
	cout << " pushSequence -> " << buffer << " " << m_kmerLength << "sequenceData= " << (void*) sequenceData << endl;
#endif

	for(int nucleotidePosition=0; nucleotidePosition<(int)m_kmerLength; nucleotidePosition++) {

		char symbol=buffer[nucleotidePosition];
		int code=getSymbolCode(symbol);
#if 0
		cout << "Saving " << nucleotidePosition << " " << symbol << " " << code << endl;
#endif
		int bitPosition = nucleotidePosition * BITS_PER_NUCLEOTIDE;

		writeTwoBits(sequenceData, bitPosition, code);

#ifdef CONFIG_ASSERT
		int newCode = -1;
		readTwoBits(sequenceData, bitPosition, &newCode);

		assert(newCode == code);
#endif
	}
}

void VertexObject::writeTwoBits(uint8_t*sequenceData,int bitPosition,int code) const{

	int byteNumber=bitPosition/BITS_PER_BYTE;
	int positionInByte=bitPosition%BITS_PER_BYTE;

	uint64_t currentValue=sequenceData[byteNumber];

	uint64_t mask=code;
	mask<<=positionInByte;
	currentValue|=mask;

	sequenceData[byteNumber]=currentValue;

#ifdef CONFIG_ASSERT
	int newCode = -1;
	readTwoBits(sequenceData, bitPosition, &newCode);

	if(newCode != code)
		cout << " Expected " << code << " Actual " << newCode << endl;
	assert(newCode == code);
#endif
}

void VertexObject::readTwoBits(const uint8_t*sequenceData,int bitPosition,int*code)const{

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

int VertexObject::getSymbolCode(char symbol)const{
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

void VertexObject::setRequiredBytesPerObject(){
	int requiredBits=m_kmerLength*BITS_PER_NUCLEOTIDE;
	int requiredBytes=requiredBits/BITS_PER_BYTE;

	if(requiredBits%BITS_PER_BYTE!=0)
		requiredBytes++;

	m_requiredBytesPerSequence=requiredBytes;
	m_entrySize=m_requiredBytesPerSequence+sizeof(uint32_t)+sizeof(uint8_t);
}

int VertexObject::getEntrySize()const{
	return m_entrySize;
}

void VertexObject::setKmerLength(int kmerLength) {
	m_kmerLength = kmerLength;
	setRequiredBytesPerObject();
}

void VertexObject::loadFromLine(const char* buffer1) {
	char buffer[2*CONFIG_MAXKMERLENGTH];
	strcpy(buffer, buffer1);

	int available=strlen(buffer);
	buffer[m_kmerLength] = '\0';

	setSequence(buffer);

	buffer[m_kmerLength] = ';';

	int secondSeparator=m_kmerLength+1;

	while(buffer[secondSeparator]!=';')
		secondSeparator++;

	buffer[secondSeparator]='\0';

	istringstream inputObject(buffer+m_kmerLength+1);

	inputObject >> m_coverage;

	int useParents = 0;
	int useChildren = 1;
	int selection = useParents;

	for(int position=secondSeparator+1;position<available;position++){
		char operationCode= buffer[position];

		if(operationCode==';') {
			selection = useChildren;
		} else if(operationCode== SYMBOL_A) {
			if(selection == useParents)
				addParent(operationCode);
			else
				addChild(operationCode);
		} else if(operationCode== SYMBOL_C) {
			if(selection == useParents)
				addParent(operationCode);
			else
				addChild(operationCode);
		} else if(operationCode== SYMBOL_G) {
			if(selection == useParents)
				addParent(operationCode);
			else
				addChild(operationCode);
		} else if(operationCode== SYMBOL_T) {
			if(selection == useParents)
				addParent(operationCode);
			else
				addChild(operationCode);
		}
	}

	// TODO: group fwrite operations using a larger buffer
#if 0
	cout << " Saving entry to file now. " << m_entrySize << " bytes" << endl;
#endif
}

void VertexObject::debug(){
	m_debug = true;
}

bool VertexObject::operator<(VertexObject & object) const{
	return strcmp(getSequence(), object.getSequence()) < 0;
}
