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

#ifndef _AnnotationEngine_h
#define _AnnotationEngine_h

#include "GraphDatabase.h"
#include "Annotation.h"
#include "Mapper.h"
#include "LocationAnnotation.h"

#include <vector>
#include <string>
using namespace std;

/**
 * The storage engine for annotations.
 */
class AnnotationEngine{

	uint32_t m_magicNumber;
	uint32_t m_formatVersion;

	string m_fileName;
	GraphDatabase*m_map;

	bool m_enableWriteOperations;
	Mapper m_mapper;
	uint8_t*m_content;
	bool m_active;
	bool m_error;

	void getAnnotations(const char*key,vector<Annotation>*annotations)const;

	void checkFileAvailability();
	void growFile();
	void openFileForOperations();

	void registerObjectAnnotation(uint64_t objectIndex,uint64_t annotationOffset);
	void setHeapAddress(uint64_t address);
	uint64_t getHeapAddress()const;

	uint64_t getInteger64(uint64_t offset)const;
	void setInteger64(uint64_t offset,uint64_t value);
public:
	AnnotationEngine();

	void openAnnotationFileForMap(GraphDatabase*graph,bool enableWriteOperations);
	void closeFile();

	void getLocations(const char*key,vector<LocationAnnotation>*annotations)const;
	void addLocation(const char*key,LocationAnnotation*annotation);

	uint64_t getEntries()const;
	uint64_t getFreeBytes()const;
	const char*getFileName()const;
	bool hasError()const;
};

#endif

