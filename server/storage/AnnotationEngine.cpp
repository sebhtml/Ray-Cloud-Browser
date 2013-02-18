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

#include "AnnotationEngine.h"
#include "Mapper.h"

#include <fstream>
using namespace std;

#include <string.h>

#define OFFSET_MAGIC_NUMBER 0
#define OFFSET_FORMAT_VERSION ( sizeof(uint32_t) )
#define OFFSET_ENTRIES ( sizeof(uint32_t)+sizeof(uint32_t) )
#define OFFSET_HEAP ( sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t) )
#define OFFSET_BUCKETS ( sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t)+sizeof(uint64_t) )

void AnnotationEngine::getAnnotations(const char*key,vector<Annotation>*annotations)const{
}

void AnnotationEngine::openAnnotationFileForMap(GraphDatabase*graph,bool enableWriteOperations){

	m_map=graph;

	if(m_map->hasError())
		return;

	m_enableWriteOperations=enableWriteOperations;

	m_magicNumber=0x87332cee;
	m_formatVersion=0;

	m_fileName=m_map->getFileName();
	m_fileName+="-Annotations";

	checkFileAvailability();

	openFileForOperations();
	
	uint32_t magicNumber=0;
	memcpy(&magicNumber,m_content+OFFSET_MAGIC_NUMBER,sizeof(uint32_t));

	if(m_magicNumber!=magicNumber){
		cout<<"Error: "<<m_fileName<<" is not an annotation file."<<endl;
		closeFile();
		return;
	}

	uint32_t formatVersion=0;
	memcpy(&formatVersion,m_content+OFFSET_FORMAT_VERSION,sizeof(uint32_t));

	if(m_formatVersion!=formatVersion){
		cout<<"Error: "<<m_fileName<<" is a annotation file, but the format version does not match available implementations."<<endl;
		closeFile();
		return;
	}
}

void AnnotationEngine::closeFile(){

	if(!m_active)
		return;

	m_mapper.unmapFile();
	m_active=false;
}

void AnnotationEngine::getLocations(const char*key,vector<LocationAnnotation>*annotations)const{

	if(!m_active)
		return;
}

void AnnotationEngine::addLocation(const char*key,LocationAnnotation*annotation){

	if(!m_active)
		return;

	if(!m_enableWriteOperations)
		return;

#if 0
	cout<<"<addLocation object=\""<<key<<"\"";
	annotation->print();
#endif

	uint64_t index=0;
	bool found=m_map->getObjectIndex(key,&index);

	if(!found)
		return;

	Annotation internalAnnotation;
	annotation->write(&internalAnnotation);

	uint64_t requiredBytes=internalAnnotation.getBytes();

	if(requiredBytes>getFreeBytes()){

		growFile();
	}

	uint64_t heap=getHeapAddress();
	internalAnnotation.write(m_content+heap);
	setHeapAddress(heap+requiredBytes);

	registerObjectAnnotation(index,heap);
}

void AnnotationEngine::registerObjectAnnotation(uint64_t objectIndex,uint64_t newAnnotationOffset){

	uint64_t bucketAddress=OFFSET_BUCKETS+objectIndex*sizeof(uint64_t);

	uint64_t annotationAddress=getInteger64(bucketAddress);

// this is the first annotation for this object

	if(annotationAddress==OFFSET_NULL){

		setInteger64(bucketAddress,newAnnotationOffset);
		return;
	}

// append the annotation to the list

// find the last annotation of the object
	Annotation annotation;
	annotation.read(m_content+annotationAddress);

	uint64_t nextAddress=annotation.getNextOffset();

	while(nextAddress!=OFFSET_NULL){

		annotationAddress=nextAddress;
		annotation.read(m_content+annotationAddress);
		nextAddress=annotation.getNextOffset();
	}

// append the annotation here
	annotation.setNextOffset(newAnnotationOffset);
	annotation.write(m_content+annotationAddress); /* write-back operation */
}

void AnnotationEngine::checkFileAvailability(){

	ifstream f(m_fileName.c_str());

	bool fileIsThere=false;

	if(f)
		fileIsThere=true;

	f.close();

	if(fileIsThere)
		return;

	FILE*output=fopen(m_fileName.c_str(),"w");

	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);

	uint64_t entries=m_map->getEntries();
	uint64_t heap=0;

	fwrite(&entries,sizeof(uint64_t),1,output);
	fwrite(&heap,sizeof(uint64_t),1,output);

	uint64_t offset=OFFSET_NULL;
	uint64_t index=0;

	while(index<entries){

		fwrite(&offset,sizeof(uint64_t),1,output);

		index++;
	}

	fclose(output);

	bool oldWriteMode=m_enableWriteOperations;

	m_enableWriteOperations=true;

	openFileForOperations();

	heap=m_mapper.getFileSize();

	setHeapAddress(heap);

	closeFile();

	m_enableWriteOperations=oldWriteMode;
}

void AnnotationEngine::growFile(){

	#define BYTES_PER_OPERATION 1024

	m_mapper.unmapFile();

	int bytesOfAdd=1024*BYTES_PER_OPERATION;

	FILE*output=fopen(m_fileName.c_str(),"a");
	
	char oneKibibyte[BYTES_PER_OPERATION];
	memset(oneKibibyte,0,BYTES_PER_OPERATION);

	int steps=bytesOfAdd/BYTES_PER_OPERATION;

	while(steps--){
		fwrite(oneKibibyte,1,BYTES_PER_OPERATION,output);
	}

	fclose(output);

	openFileForOperations();
}

void AnnotationEngine::openFileForOperations(){
	m_active=false;

	m_mapper.enableReadOperations();

	if(m_enableWriteOperations){
		m_mapper.enableWriteOperations();
	}

	m_content=(uint8_t*)m_mapper.mapFile(m_fileName.c_str());

	if(m_content==NULL)
		return;

	m_active=true;
}

uint64_t AnnotationEngine::getEntries()const{
	uint64_t entries=0;
	memcpy(&entries,m_content+OFFSET_ENTRIES,sizeof(uint64_t));
	return entries;
}

uint64_t AnnotationEngine::getFreeBytes()const{

	uint64_t heap=getHeapAddress();

	uint64_t totalBytes=m_mapper.getFileSize();

	return totalBytes-heap;
}

const char*AnnotationEngine::getFileName()const{
	return m_fileName.c_str();
}

AnnotationEngine::AnnotationEngine(){
	m_error=false;
	m_active=false;
}

bool AnnotationEngine::hasError()const{
	return m_error;
}

uint64_t AnnotationEngine::getHeapAddress()const{

	return getInteger64(OFFSET_HEAP);
}

void AnnotationEngine::setHeapAddress(uint64_t address){

	setInteger64(OFFSET_HEAP,address);
}

void AnnotationEngine::setInteger64(uint64_t offset,uint64_t value){

	memcpy(m_content+offset,&value,sizeof(uint64_t));
}

uint64_t AnnotationEngine::getInteger64(uint64_t offset)const{
	uint64_t value=0;
	memcpy(&value,m_content+offset,sizeof(uint64_t));
	return value;
}
