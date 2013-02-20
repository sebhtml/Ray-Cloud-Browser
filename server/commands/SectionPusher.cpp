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

#include "SectionPusher.h"

#include <storage/PathDatabase.h>
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

int SectionPusher::call(int argc,char**argv){

	if(argc!=5){
		cout<<"Add a section to a configuration file."<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" config.json mapIndex \"section name\" section.dat"<<endl;
		return 0;
	}

	int argument=0;
	argument++;

	const char*file=argv[argument++];
	int mapIndex=atoi(argv[argument++]);
	const char*sectionName=argv[argument++];
	const char*sectionFile=argv[argument++];

	PathDatabase test;
	test.openFile(sectionFile);
	bool error=test.hasError();
	test.closeFile();

	if(error){
		return 1;
	}

	Configuration configuration;
	configuration.open(file);

	int maps=configuration.getNumberOfMaps();

	if(!(mapIndex<maps)){
		cout<<"Error: "<<mapIndex<<" is not a valid map index."<<endl;
		return 1;
	}

	configuration.addSection(mapIndex,sectionName,sectionFile);

	cout<<"Added section to "<<file<<endl;
	cout<<"New configuration: "<<endl;
	cout<<endl;

	configuration.printXML();
	configuration.close();

	return 0;
}
