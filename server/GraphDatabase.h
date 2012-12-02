/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
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

#include <stdint.h>

#define GRAPH_FORMAT_VERSION 2345678987

/**
 * A class to search kmers in a database file.
 * \author Sébastien Boisvert
 */
class GraphDatabase{

	Mapper m_mapper;

	bool m_active;
	char m_codeSymbols[4];
	void*m_content;

	int m_entrySize;
	int m_startingPosition;

	int m_format;
	int m_kmerLength;
	uint64_t m_entries;

public:
	GraphDatabase();
	void openFile(char*file);
	void closeFile();
	bool getObject(const char*key,VertexObject*object);
	int getKmerLength();
	char getSymbol(int code);
};

#endif

