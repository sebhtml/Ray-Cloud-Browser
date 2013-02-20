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

#include "MapPusher.h"

#include <storage/GraphDatabase.h>
#include <storage/Configuration.h>

#include <stdlib.h>
#include <string.h>
#include <iostream>
#include <sstream>
#include <map>
#include <set>
#include <string>
#include <fstream>
using namespace std;

int MapPusher::call(int argc,char**argv){

	if(argc!=4){
		cout<<"Add a map to a configuration file."<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" config.json \"map name\" map.dat"<<endl;
		return 0;
	}

	const char*file=argv[1];

	const char*mapName=argv[2];
	const char*mapFile=argv[3];

	GraphDatabase test;
	test.openFile(mapFile);
	bool error=test.hasError();
	test.closeFile();

	if(error){
		cout<<"Error: "<<mapFile<<" is not a map file."<<endl;
		return 1;
	}

	Configuration configuration;
	configuration.open(file);

	configuration.addMap(mapName,mapFile);

	cout<<"Added map to "<<file<<endl;
	cout<<"New configuration: "<<endl;

	configuration.printXML();

	configuration.close();

	return 0;
}
