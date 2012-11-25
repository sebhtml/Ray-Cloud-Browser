/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
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

// TODO: maybe adding padding could enhance performance

#include "GraphDatabase.h"

#include <iostream>
#include <sstream>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
using namespace std;

/**
 * Create a graph database.
 * \author Sébastien Boisvert
 */
int main(int argc,char**argv){

	if(argc!=3){
		cout<<"Usage: "<<argv[0]<<" kmers.txt.sorted kmers.txt.dat"<<endl;
		cout<<endl;
		cout<<"You must run Ray with -write-kmers, which will generate a kmers.txt file"<<endl;
		cout<<"Then, you must create the kmers.txt.sorted file with:"<<endl;
		cout<<" cat kmers.txt|grep -v ^#|sort > kmers.txt.sorted"<<endl;

		return 0;
	}

	int indexA=INDEX_A;
	int indexC=INDEX_C;
	int indexG=INDEX_G;
	int indexT=INDEX_T;
	
	char symbolA=SYMBOL_A;
	char symbolC=SYMBOL_C;
	char symbolG=SYMBOL_G;
	char symbolT=SYMBOL_T;


	char*file=argv[1];
	char*binaryFile=argv[2];

	int kmerLength=0;
	uint64_t entries=0;

	char buffer[1024];

	FILE*stream=fopen(file,"r");
	int null=0;

// get the number of entries and the k-mer length
	while(!feof(stream)){

		buffer[0]='\0';

		char*value=fgets(buffer,1024,stream);

		if(value==NULL){
			null++;
		}

		if(strlen(buffer)>0){
			entries++;

			if(kmerLength==0){
				while(buffer[kmerLength]!=';'){
					kmerLength++;
				}
			}
		}

	}

	fclose(stream);

	stream=fopen(file,"r");

	cout<<"Entries: "<<entries<<" KmerLength: "<<kmerLength<<endl;

	FILE*output=fopen(binaryFile,"w");

	int formatVersion=GRAPH_FORMAT_VERSION;
	fwrite(&formatVersion,sizeof(int),1,output);
	fwrite(&kmerLength,sizeof(int),1,output);
	fwrite(&entries,sizeof(uint64_t),1,output);

	int no=MARKER_NO;
	int yes=MARKER_YES;

	for(uint64_t i=0;i<entries;i++){
		char*value=fgets(buffer,1024,stream);
		if(value==NULL)
			null++;

		//cout<<"Line: "<<buffer<<endl;

		int available=strlen(buffer);

		fwrite(buffer,kmerLength,1,output);

		int secondSeparator=kmerLength+1;

		while(buffer[secondSeparator]!=';')
			secondSeparator++;

		buffer[secondSeparator]='\0';

		//cout<<"Coverage: "<<buffer+kmerLength+1<<endl;
		istringstream inputObject(buffer+kmerLength+1);

		uint32_t coverage=0;
		inputObject>>coverage;

		//cout<<"Coverage: "<<coverage<<endl;

		fwrite(&coverage,sizeof(uint32_t),1,output);

		char parents[4];
		
		parents[indexA]=no;
		parents[indexC]=no;
		parents[indexG]=no;
		parents[indexT]=no;

		char children[4];

		children[indexA]=no;
		children[indexC]=no;
		children[indexG]=no;
		children[indexT]=no;

		char*selection=parents;

		for(int position=secondSeparator+1;position<available;position++){
			char operationCode= buffer[position];
			
			if(operationCode==';')
				selection=children;
			else if(operationCode==symbolA)
				selection[indexA]=yes;
			else if(operationCode==symbolC)
				selection[indexC]=yes;
			else if(operationCode==symbolG)
				selection[indexG]=yes;
			else if(operationCode==symbolT)
				selection[indexT]=yes;
		}

/*
		cout<<"========++"<<endl;

		for(int i=0;i<4;i++){
			cout<<" "<<(int)parents[i]<<endl;
		}

		for(int i=0;i<4;i++){
			cout<<" "<<(int)children[i]<<endl;
		}
*/


		fwrite(parents,4,1,output);
		fwrite(children,4,1,output);
	}

	fclose(output);
	fclose(stream);

	cout<<"Created "<<binaryFile<<endl;

	return 0;
}
