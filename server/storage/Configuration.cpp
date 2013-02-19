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

#include "Configuration.h"

#include <fstream>
using namespace std;

Configuration::Configuration(){
	m_root=NULL;
}

void Configuration::open(const char*file){

	ifstream f(file);
	bool exists=false;
	if(f)
		exists=true;
	f.close();
	if(!exists)
		return;

	m_parser.parse(file);

	m_root=m_parser.getNode();
}

void Configuration::close(){
	m_parser.destroy();
	m_root->destroy();
}

const char*Configuration::getMapFile(int map)const{

	const JSONNode*mapObject=getMap(map);

	if(mapObject==NULL)
		return NULL;

	return mapObject->getObjectValueForKey("file")->getString();
}

const JSONNode*Configuration::getMap(int map)const{

	const JSONNode*maps=getMaps();

	if(maps==NULL)
		return NULL;

	if(!(map<maps->getArraySize()))
		return NULL;

	return maps->getArrayElement(map);
}

const JSONNode*Configuration::getSections(int map)const{
	const JSONNode*mapObject=getMap(map);

	if(mapObject==NULL)
		return NULL;

	const JSONNode*sections=mapObject->getObjectValueForKey("sections");

	if(sections==NULL)
		return NULL;

	if(sections->getType()!=JSONNode_TYPE_ARRAY)
		return NULL;

	return sections;
}

const char*Configuration::getSectionFile(int map,int section)const{

	const JSONNode*sections=getSections(map);

	if(!(section<sections->getArraySize()))
		return NULL;

	const JSONNode*sectionObject=sections->getArrayElement(section);

	if(sectionObject==NULL)
		return NULL;

	const JSONNode*fileObject=sectionObject->getObjectValueForKey("file");

	if(fileObject==NULL)
		return NULL;

	return fileObject->getString();
}

const JSONNode*Configuration::getMaps()const{
	if(m_root==NULL)
		return NULL;

	if(m_root->getType()!=JSONNode_TYPE_OBJECT)
		return NULL;

	const JSONNode*maps=m_root->getObjectValueForKey("maps");

	if(maps==NULL)
		return NULL;

	if(maps->getType()!=JSONNode_TYPE_ARRAY)
		return NULL;

	return maps;
}

int Configuration::getNumberOfMaps()const{

	const JSONNode*maps=getMaps();

	if(maps==NULL)
		return 0;

	return maps->getArraySize();
}

int Configuration::getNumberOfSections(int map)const{

	const JSONNode*sections=getSections(map);

	if(sections==NULL)
		return 0;

	return sections->getArraySize();
}
