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

#ifndef _Annotation_h
#define _Annotation_h

#define ANNOTATION_LOCATION 0
#define ANNOTATION_TEXT 1

#include <stdint.h>

#define OFFSET_NULL 0
#define ANNOTATION_CONTENT_SIZE 256

/**
 * An annotation.
 *
 * \author Sébastien Boisvert
 */
class Annotation{
	uint8_t m_type;
	uint8_t m_size;
	uint8_t m_content[ANNOTATION_CONTENT_SIZE];
	uint64_t m_nextOffset;

public:

	void constructor(uint8_t type,uint8_t size,uint8_t*content,uint64_t nextOffset);

	uint8_t getType()const;
	uint8_t getSize()const;
	void setSize(uint8_t size);
	void setType(uint8_t type);

	uint8_t*getContent();
	uint64_t getNextOffset()const;

	void read(uint8_t*buffer);
	void write(uint8_t*buffer)const;

	int getBytes()const;
	void setNextOffset(uint64_t offset);
	void printXML()const;
};

#endif
