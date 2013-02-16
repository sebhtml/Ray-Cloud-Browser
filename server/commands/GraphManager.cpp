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

#include "GraphManager.h"

#include <GraphDatabase.h>

#include <iostream>
using namespace std;

/**
 * Create a graph database.
 * \author Sébastien Boisvert
 */
int GraphManager::call(int argc,char**argv){

	if(argc!=3){
		cout<<"Create an binary read-only index on a Ray-compatible kmers.txt for fast queries"<<endl;

		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;

		cout<<"Usage: "<<PROGRAM_NAME<<" "<<argv[0]<<" kmers.txt.sorted kmers.txt.dat"<<endl;
		cout<<endl;
		cout<<"You must run Ray with -write-kmers, which will generate a kmers.txt file"<<endl;
		cout<<"Then, you must create the kmers.txt.sorted file with:"<<endl;
		cout<<" cat kmers.txt|sort -T . > kmers.txt.sorted"<<endl;

		return 0;
	}

	const char*file=argv[1];
	const char*binaryFile=argv[2];

	GraphDatabase mock;
	mock.index(file,binaryFile);

	return 0;
}
