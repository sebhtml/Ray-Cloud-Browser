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

#ifndef _GraphDatabase_h
#define _GraphDatabase_h

#include "Mapper.h"
#include "VertexObject.h"
#include "constants.h"

#include <string>
using namespace std;

#include <stdint.h>

/**
 * A class to search kmers in a database file.
 * This class also implement the compiler for converting
 * ASCII Ray graph to Ray Cloud Browser open binary format.
 *
 * Basically, there is a header (magic, version, kmer length, entries)
 * and then sorted entries.
 *
 * A entry has a sequence, a coverage, parents, and children.
 *
 * Custom annotations are implemented elsewhere.
 *
 * \author Sébastien Boisvert
 */
class GraphDatabase{

	string m_fileName;

	uint64_t m_entries;
	uint32_t m_kmerLength;
	uint32_t m_magicNumber;
	uint32_t m_formatVersion;
	uint32_t m_expectedMagicNumber;

	int m_requiredBytesPerSequence;

	Mapper m_mapper;

	bool m_active;
	bool m_error;
	char m_codeSymbols[ALPHABET_SIZE];
	uint8_t*m_content;

	int m_entrySize;
	int m_startingPosition;

	void setRequiredBytesPerObject();
	void writeTwoBits(uint8_t*sequenceData,int bitPosition,int code);
	void readTwoBits(uint8_t*sequenceData,int bitPosition,int*code)const;
	int getSymbolCode(char symbol)const;
	char getSymbol(int code)const;

	void pullSequence(uint64_t index,char*sequence)const;

public:
	GraphDatabase();
	void openFile(const char*file);
	void closeFile();
	bool getObject(const char*key,VertexObject*object)const;
	bool getObjectIndex(const char*key,uint64_t*index)const;
	void getObjectWithIndex(uint64_t index,VertexObject*object)const;
	int getKmerLength()const;
	uint64_t getEntries()const;

	void index(const char*input,const char*output);

	const char*getFileName()const;
	bool hasError()const;
	const char * selectObject(const char*object1, const char*object2)const;
	int getFormatVersion()const;
};

#endif

