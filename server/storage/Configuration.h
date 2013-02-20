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

#ifndef _Configuration_h
#define _Configuration_h

#include <JSONParser.h>

using namespace std;

/**
 * This is the class in front of the configuration.
 *
 * \author Sébastien Boisvert
 */
class Configuration{
	JSONParser m_parser;
	JSONNode*m_root;

	const JSONNode*getMap(int map)const;
	const JSONNode*getMaps()const;
	const JSONNode*getSections(int map)const;
	const char*getMapAttribute(int map,const char*key)const;
	const char*getSectionAttribute(int map,int section,const char*key)const;

	JSONNode*getMutableSections(int map);
	JSONNode*getMutableMap(int map);
	JSONNode*getMutableMaps();
public:
	Configuration();
	void open(const char*file);
	void close();
	const char*getMapFile(int map)const;
	const char*getSectionFile(int map,int section)const;
	const char*getMapName(int map)const;
	const char*getSectionName(int map,int section)const;

	int getNumberOfMaps()const;
	int getNumberOfSections(int map)const;

	void addMap(const char*name,const char*file);
	void addSection(int mapIndex,const char*name,const char*file);
	void printXML()const;
};

#endif

