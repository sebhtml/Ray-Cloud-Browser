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

#include "RegionVisitor.h"

#include <storage/GraphDatabase.h>
#include <storage/PathDatabase.h>
#include <storage/Configuration.h>

#include <iostream>
using namespace std;

#include <stdlib.h>

/**
 * Required QUERY_STRING parameters: tag, section.
 */
bool RegionVisitor::call(const char*queryString){

	int mapIndex=0;
	bool foundMap=getValueAsInteger(queryString,"map",&mapIndex);

	if(!foundMap)
		return false;

	int sectionIndex=0;
	bool found=getValueAsInteger(queryString,"section",&sectionIndex);

	if(!found)
		return false;

	Configuration configuration;
	configuration.open(CONFIG_FILE);
	const char*buffer=configuration.getSectionFile(mapIndex,sectionIndex);

	if(buffer==NULL)
		return false;

// fail in silence
	if(!isAllowedFile(buffer))
		return false;

	char regionBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundRegion=getValue(queryString,"region",regionBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundRegion)
		return false;

	int region=atoi(regionBuffer);

	PathDatabase mock;
	mock.openFile(buffer);

	//mock.debug();
	
	int entries=mock.getEntries();

// invalid region
	if(!(region<entries))
		return false;

	const char*mapFile=configuration.getMapFile(mapIndex);
	GraphDatabase mapObject;
	mapObject.openFile(mapFile);
	int kmerLength=mapObject.getKmerLength();
	mapObject.closeFile();

	int minimumKmerLength=15;
	int maximumKmerLength=701;

	if(!(minimumKmerLength <= kmerLength && kmerLength <= maximumKmerLength))
		return false;

	char name[1024];
	mock.getName(region,name);
	int nucleotides=mock.getSequenceLength(region);

// kmer length is too long.
	if(!(kmerLength<=nucleotides))
		return false;

	int numberOfKmers=nucleotides-kmerLength+1;

	char locationBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundLocation=getValue(queryString,"location",locationBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);
	if(!foundLocation)
		return false;
	int location=atoi(locationBuffer);

	char readaheadBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundReadahead=getValue(queryString,"readahead",readaheadBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);
	if(!foundReadahead)
		return false;
	int readahead=atoi(readaheadBuffer);

// Now we are ready

	cout<<"{"<<endl;
	cout<<"\"map\": "<<mapIndex<<","<<endl;
	cout<<"\"section\": "<<sectionIndex<<","<<endl;
	cout<<"\"region\": "<<region<<","<<endl;
	cout<<"\"kmerLength\": "<<kmerLength<<","<<endl;
	cout<<"\"location\": "<<location<<","<<endl;
	cout<<"\"name\":\""<<name<<"\","<<endl;
	cout<<"\"nucleotides\":"<<nucleotides<<","<<endl;
	cout<<"\"readahead\": "<<readahead<<","<<endl;

	cout<<"\"vertices\": ["<<endl;

	int printed=0;

	char kmerSequence[512];

	int startingPlace=location-readahead/2;

	if(startingPlace<0)
		startingPlace=0;

	bool first=true;

	while(startingPlace<numberOfKmers && printed<readahead){

		mock.getKmer(region,kmerLength,startingPlace,kmerSequence);

		if(first)
			first=false;
		else
			cout<<","<<endl;

		cout<<"{\"position\":"<<startingPlace<<",\"value\":\""<<kmerSequence<<"\"}";

		startingPlace++;
		printed++;
	}

	cout<<"] }"<<endl;


	mock.closeFile();
	configuration.close();

	return true;
}
