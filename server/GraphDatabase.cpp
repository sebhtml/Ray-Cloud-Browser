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


// TODO: maybe adding padding could enhance performance


#include "GraphDatabase.h"

#include <stdio.h>
#include <string.h>
#include <stdint.h>

#include <iostream>
#include <sstream>
using namespace std;

// TODO add error management for file operations

bool GraphDatabase::getObject(const char*key,VertexObject*object){

	bool found=false;

	if(!m_active)
		return found;

	uint64_t first=0;
	uint64_t last=m_entries-1;

	while(first<=last){
	
		uint64_t middle=first+(last-first)/2;

		uint64_t middlePosition=m_startingPosition+middle*m_entrySize;

		char sequence[300];
		uint32_t coverage;
		char parents[4];
		char children[4];

		char*myBuffer=((char*)m_content)+middlePosition;

		memcpy(sequence,myBuffer,m_kmerLength);
		sequence[m_kmerLength]='\0';

		memcpy(&coverage,myBuffer+m_kmerLength,sizeof(uint32_t));
		memcpy(parents,myBuffer+m_kmerLength+sizeof(uint32_t),4);
		memcpy(children,myBuffer+m_kmerLength+sizeof(uint32_t)+4,4);

		int comparisonResult=strcmp(key,sequence);

		if(comparisonResult==0){
			found=true;

			object->setSequence(sequence);
			object->setCoverage(coverage);

			for(int i=0;i<4;i++){
				if(parents[i]==MARKER_YES){
					object->addParent(getSymbol(i));
				}
				if(children[i]==MARKER_YES){
					object->addChild(getSymbol(i));
				}
			}

			break;
		}else if(comparisonResult>0){

			first=middle+1;

		}else if(comparisonResult<0){

			last=middle-1;
		}
	}

	return found;
}

/**
 * \see http://www.c.happycodings.com/Gnu-Linux/code6.html
 */
void GraphDatabase::openFile(const char*file){
	
	if(m_active)
		return;

	m_mapper.enableReadOperations();
	m_content=m_mapper.mapFile(file);

	memcpy(&m_format,(char*)m_content,sizeof(uint32_t));
	memcpy(&m_kmerLength,((char*)m_content)+sizeof(uint32_t),sizeof(uint32_t));
	memcpy(&m_entries,((char*)m_content)+sizeof(uint32_t)+sizeof(uint32_t),sizeof(uint64_t));

	m_codeSymbols[INDEX_A]=SYMBOL_A;
	m_codeSymbols[INDEX_C]=SYMBOL_C;
	m_codeSymbols[INDEX_G]=SYMBOL_G;
	m_codeSymbols[INDEX_T]=SYMBOL_T;

	m_entrySize=m_kmerLength+sizeof(uint32_t)+4+4;

	m_startingPosition=sizeof(int)+sizeof(int)+sizeof(uint64_t);

	m_active=true;
}

void GraphDatabase::closeFile(){

	if(!m_active)
		return;

	m_mapper.unmapFile();

	m_active=false;
}

int GraphDatabase::getKmerLength(){
	return m_kmerLength;
}

char GraphDatabase::getSymbol(int code){
	return m_codeSymbols[code];
}

GraphDatabase::GraphDatabase(){
	m_active=false;
}


void GraphDatabase::index(const char*inputFile,const char*outputFile){

	const char*file=inputFile;
	const char*binaryFile=outputFile;

	int indexA=INDEX_A;
	int indexC=INDEX_C;
	int indexG=INDEX_G;
	int indexT=INDEX_T;
	
	char symbolA=SYMBOL_A;
	char symbolC=SYMBOL_C;
	char symbolG=SYMBOL_G;
	char symbolT=SYMBOL_T;


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

}

uint64_t GraphDatabase::getEntries(){
	return m_entries;
}
