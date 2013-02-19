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

#include "MapList.h"

#include <JSONParser.h>
#include <storage/Configuration.h>

#include <iostream>
using namespace std;

/**
 * QUERY_STRING parameters: tag.
 */
bool MapList::call(const char*queryString){

// We make sure that the configuration is valid...
	Configuration configuration;
	configuration.open(CONFIG_FILE);

	cout<<"{\"maps\": ["<<endl;

	int numberOfMaps=configuration.getNumberOfMaps();

	for(int i=0;i<numberOfMaps;i++){
		cout<<"{	\"name\": \""<<configuration.getMapName(i)<<"\","<<endl;

		int numberOfSections=configuration.getNumberOfSections(i);

		cout<<"	\"sections\": ["<<endl;

		for(int j=0;j<numberOfSections;j++){
			cout<<"		{ \"name\": \""<<configuration.getSectionName(i,j)<<"\", ";
			cout<<" \"file\": \""<<configuration.getSectionFile(i,j)<<"\"}";
			if(j!=numberOfSections-1)
				cout<<",";
			cout<<endl;
		}

		cout<<"] }";

		if(i!=numberOfMaps-1)
			cout<<",";

		cout<<endl;
	}

	cout<<"]}"<<endl;
	return true;
}
