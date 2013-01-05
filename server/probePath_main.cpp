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

#include "PathDatabase.h"

#include <iostream>
#include <string>
using namespace std;

#include <stdio.h>
#include <stdlib.h>

/**
 * Inspect a graph database
 *
 * \author Sébastien Boisvert
 */
int main(int argc,char**argv){

	if(argc==1){
		cout<<"Operate a indexed fasta file with various commands"<<endl;
		cout<<"Author: Sébastien Boisvert"<<endl;
		cout<<endl;


		cout<<"Usages:"<<endl;
		cout<<argv[0]<<" info Contigs.fasta.dat"<<endl;
		cout<<argv[0]<<" debug Contigs.fasta.dat"<<endl;
		cout<<argv[0]<<" getPathMetaData Contigs.fasta.dat 44"<<endl;
		cout<<endl;

		return 0;
	}

	string operation=argv[1];

	if(operation=="info"){

		if(argc!=3){
			cout<<"You must provide a file"<<endl;
			return 1;
		}

		const char*file=argv[2];

		PathDatabase mock;

		mock.openFile(file);

		uint64_t entries=mock.getEntries();

		cout<<"File: "<<file<<endl;
		cout<<"Entries: "<<entries<<endl;

		mock.closeFile();

	}else if(operation=="getPathMetaData"){

		if(argc!=4){
			cout<<"You must provide a file and a path number"<<endl;
			return 1;
		}

		const char*file=argv[2];

		int path=atoi(argv[3]);

		PathDatabase mock;

		mock.openFile(file);

		uint64_t nameLength=mock.getNameLength(path);

		uint64_t sequenceLength=mock.getSequenceLength(path);

		uint64_t entries=mock.getEntries();

		char name[1024];

		mock.getName(path,name);

		char sequence[300];

		int kmerLength=31;
		int offset=0;
		mock.getKmer(path,kmerLength,offset,sequence);

		cout<<"File: "<<file<<endl;
		cout<<"Entries: "<<entries<<endl;
		cout<<"PathNumber: "<<path<<endl;
		cout<<"Name: "<<name<<endl;
		cout<<"NameLength: "<<nameLength<<endl;
		cout<<"Sequence: "<<sequence<<"..."<<endl;
		cout<<"SequenceLength: "<<sequenceLength<<endl;
	
		mock.closeFile();

	}else if(operation=="debug"){

	
		if(argc!=3){
			cout<<"You must provide a file"<<endl;
			return 1;
		}

		const char*file=argv[2];

		PathDatabase mock;

		mock.openFile(file);

		mock.debug();

		mock.closeFile();
	
	}

	return EXIT_SUCCESS;
}
