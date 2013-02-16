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

/**
 * The storage engine for annotations.
 */
class AnnotationEngine{

	GraphDatabase m_map;

	void getAnnotations(const char*key,vector<Annotation>*annotations)const;

public:

	void openAnnotationFileForMap(const char*file);
	void closeFile();

	void getLocations(const char*key,vector<LocationAnnotation>*annotations)const;

	void addLocation(const char*key,LocationAnnotation*annotation);
};

#endif

