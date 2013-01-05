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

#ifndef _PathDatabase_h
#define _PathDatabase_h

#include "Mapper.h"
#include "constants.h"

#include <stdint.h>

#define PATH_FORMAT_VERSION 2345678989

/**
 * A class to search objects in a database file.
 *
 * \author Sébastien Boisvert
 */
class PathDatabase{

	bool m_active;

	char*m_data;

	Mapper m_mapper;

	uint64_t readInteger64(uint64_t offset);
	uint64_t getNameOffset(uint64_t entry);
	uint64_t getSequenceOffset(uint64_t entry);
	void terminateString(char*object);

public:
	PathDatabase();
	void openFile(const char*file);
	void closeFile();
	
	uint64_t getEntries();
	uint64_t getNameLength(uint64_t entry);
	uint64_t getSequenceLength(uint64_t entry);

	void getName(uint64_t path,char*outputName);

	void index(const char*input,const char*output);

	void debug();
	
	void getKmer(uint64_t path,int kmerLength,int offset,char*output);
};

#endif

