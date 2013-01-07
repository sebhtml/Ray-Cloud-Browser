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

#include "JSONParser.h"
#include "Mapper.h"

#include <iostream>
#include <sstream>
using namespace std;

#include <string.h>

void JSONParser::parse(const char*file){

	m_mapper.enableReadOperations();

	char*content=(char*)m_mapper.mapFile(file);
	int start=0;
	m_file=file;
	m_fileSize=m_mapper.getFileSize();
	int end=m_fileSize-1;

	m_root.create(JSONNode_TYPE_OBJECT,content,start,end);

	m_mapper.unmapFile();
}

void JSONParser::printFile(){

	cout<<"File: "<<m_file<<" Size: "<<m_fileSize<<" bytes"<<endl;

	m_root.print(0);
}

JSONParser::JSONParser(){
}

JSONNode*JSONParser::getNode(){
	return &m_root;
}
