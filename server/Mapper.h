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

#ifndef _Mapper
#define _Mapper

#include "constants.h"

#include <stdint.h>

/**
 *
 * A portable file mapper implementation.
 *
 * \author Sébastien Boisvert
 */
class Mapper{

#ifdef OS_POSIX
	int m_protection;
	bool m_read;
	bool m_write;
	uint64_t m_fileSize;
	int m_stream;
	int m_flags;
#endif

	bool m_mapped;
	const char*m_file;
	void*m_content;

public:
	Mapper();
	void enableReadOperations();
	void enableWriteOperations();
	void*mapFile(const char*file);
	void unmapFile();
	uint64_t getFileSize();
};


#endif
