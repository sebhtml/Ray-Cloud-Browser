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

#include "RegionClerk.h"

#include <storage/PathDatabase.h>

#include <iostream>
using namespace std;

#include <stdlib.h>
#include <string.h>

/**
 * Required QUERY_STRING parameters: tag, section.
 */
bool RegionClerk::call(const char*queryString){

	char buffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool found=getValue(queryString,"section",buffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!found)
		return false;

// fail in silence
	if(!isAllowedFile(buffer))
		return false;

	PathDatabase mock;
	mock.openFile(buffer);

	//mock.debug();

	cout<<"{ \"section\": \""<<buffer<<"\","<<endl;

	int entries=mock.getEntries();

	char firstBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundFirst=getValue(queryString,"first",firstBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundFirst)
		return false;

	int first=atoi(firstBuffer);

	if(first<0)
		first=0;

	if(first>=entries)
		first=entries-1;

	char readaheadBuffer[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundReadahead=getValue(queryString,"readahead",readaheadBuffer,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundReadahead)
		return false;

	int readahead=atoi(readaheadBuffer);

	cout<<"\"count\": "<<entries<<","<<endl;
	cout<<"\"first\": "<<first<<","<<endl;
	cout<<"\"readahead\": "<<readahead<<","<<endl;

	cout<<"\"regions\": ["<<endl;

	char name[1024];

	bool discardSpaces=false;

	bool isFirst=true;

	int printed=0;

	for(int i=first;i<entries;i++){

		if(printed>=readahead)
			break;

		if(isFirst){
			isFirst=false;
		}else{
			cout<<","<<endl;
		}

		mock.getName(i,name);

		int theLength=strlen(name);
		int nucleotides=mock.getSequenceLength(i);

		cout<<"{\"name\":\"";

// only take the first token if configured as such

		for(int j=0;j<theLength;j++){
			if(name[j]==' ' && discardSpaces)
				break;

			cout<<name[j];
		}

		cout<<"\", \"nucleotides\":"<<nucleotides<<"}";

		printed++;
	}

	cout<<" ] }"<<endl;

	mock.closeFile();

	return true;
}


