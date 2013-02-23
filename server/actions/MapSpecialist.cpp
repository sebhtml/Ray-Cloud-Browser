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

#include "MapSpecialist.h"

#include <storage/GraphDatabase.h>
#include <storage/Configuration.h>

#include <iostream>
using namespace std;

bool MapSpecialist::call(const char*queryString){

	int mapIndex=0;
	bool foundMap=getValueAsInteger(queryString,"map",&mapIndex);

	if(!foundMap)
		return false;

	Configuration configuration;
	configuration.open(CONFIG_FILE);

	int numberOfMaps=configuration.getNumberOfMaps();

	if(!(mapIndex<numberOfMaps))
		return false;

	const char*dataFile=configuration.getMapFile(mapIndex);

// fail in silence
	if(!isAllowedFile(dataFile))
		return false;

	GraphDatabase database;
	database.openFile(dataFile);

	if(database.hasError())
		return false;

	cout<<"{"<<endl;
	cout<<"\"map\": "<<mapIndex<<","<<endl;
	cout<<"\"sequenceLength\": "<<database.getKmerLength()<<","<<endl;
	cout<<"\"sequences\": "<<database.getEntries()<<endl;
	cout<<"}"<<endl;

	database.closeFile();
	configuration.close();

	return true;
}


