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

#ifndef _VertexObject_h
#define _VertexObject_h

#include "constants.h"

#include <stdint.h>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

/**
 * An object found in the database.
 * \author Sébastien Boisvert
 */
class VertexObject{
	uint32_t m_coverage;
	char m_sequence[CONFIG_MAXKMERLENGTH];
	char m_parents[ALPHABET_SIZE];
	char m_children[ALPHABET_SIZE];
	int m_kmerLength;
	int m_entrySize;
	int m_requiredBytesPerSequence;
	bool m_debug;
	
	int getComplementNucleotideIndex(int i);
	char getComplementNucleotide(char a);

	void pullSequence(char * sequence, const uint8_t * myBuffer);
	void pushSequence(uint8_t*sequenceData, const char * buffer)const;

	void readTwoBits(const uint8_t*sequenceData,int bitPosition,int*code)const;
	void writeTwoBits(uint8_t*sequenceData,int bitPosition,int code) const ;

	void setRequiredBytesPerObject();

public:

	VertexObject();

	void setSequence(char*value);
	void setCoverage(uint32_t value);
	uint32_t getCoverage()const ;
	const char* getSequence()const;
	void getParents(vector<string>*parents)const;
	void getChildren(vector<string>*children)const;

	void writeContentInJSON(ostream*stream)const;
	void writeContentInText(ostream*stream)const;

	void addParent(char symbol);
	void addChild(char symbol);
	int getSymbolCode(char symbol)const;
	char getCodeSymbol(int code)const;

	void getReverseComplement(const char * key, char * result);
	void morphToTwin();
	bool hasParent(char symbol) const;
	bool hasChild(char symbol) const;
	bool hasParentCode(int code) const;
	bool hasChildCode(int code) const;

	void load(const uint8_t * myBuffer);
	void save(uint8_t * myBuffer) const;

	int getEntrySize()const;
	void setKmerLength(int kmerLength);
	void loadFromLine(const char* buffer);
	void debug();
};

#endif
