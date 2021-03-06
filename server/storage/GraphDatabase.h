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
#include <time.h>

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

	time_t m_startingTime;
	uint64_t m_entries;
	uint32_t m_kmerLength;
	uint32_t m_magicNumber;
	uint32_t m_formatVersion;
	uint32_t m_expectedMagicNumber;
	bool m_verbosity;
	uint64_t m_sorted;
	uint64_t m_lastProgress;
	uint64_t m_period;
	int m_maximumLineLength;

	Mapper m_mapper;

	bool m_active;
	bool m_error;
	char m_codeSymbols[ALPHABET_SIZE];
	uint8_t*m_content;

	int m_entrySize;
	int m_startingPosition;

	void sortEntriesInFile();
	void sortEntries(const char*file);
	bool checkOrder();

	void swap(uint64_t index1, uint64_t index2);
	uint64_t partition(uint64_t left, uint64_t right, uint64_t pivotIndex);
	void quicksort(uint64_t left, uint64_t right);
	uint64_t selectPivot(uint64_t left, uint64_t right);

	uint64_t getRandomNumber(uint64_t left, uint64_t right);

	void setObjectAtIndex(uint64_t index,VertexObject*object);
	void insertionSort(uint64_t left, uint64_t right);
	uint8_t* getMemoryBuffer(uint64_t index)const;
	void printProgress(const char * step, uint64_t count);
	void startProgress();
	void printTime(ostream * stream, uint64_t seconds);
	bool printTimeUnits(ostream * stream, const char * units, uint64_t value, bool hasPrevious, bool force);

public:

	GraphDatabase();
	void openFile(const char*file);
	void closeFile();
	bool getObject(const char*key,VertexObject*object)const;
	bool getObjectIndex(const char*key,uint64_t*index)const;
	void getObjectAtIndex(uint64_t index,VertexObject*object)const;
	int getKmerLength()const;
	uint64_t getEntries()const;

	void index(const char*input,const char*output);

	const char*getFileName()const;
	bool hasError()const;
	const char * selectObject(const char*object1, const char*object2)const;
	int getFormatVersion()const;
	void setVerbosity();
};

#endif

