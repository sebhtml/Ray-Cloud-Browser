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

#ifndef _LocationAnnotation_h
#define _LocationAnnotation_h

#include "Annotation.h"

#include <stdint.h>

/**
 * An annotation for a location.
 *
 * \author Sébastien Boisvert
 */
class LocationAnnotation{

	uint32_t m_region;
	uint32_t m_location;
	uint16_t m_section;

public:

	void constructor(int section,int region,int location);

	int getSectionIndex()const;
	int getRegionIndex()const;
	int getLocationIndex()const;

	void read(Annotation*object);
	void write(Annotation*object)const;

	void printXML()const;
	void printJSON()const;
};

#endif

