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

#include "Mapper.h"

#include <stdlib.h>
#include <iostream>
using namespace std;

#ifdef OS_POSIX
#include <unistd.h>
#endif

#ifdef _POSIX_MAPPED_FILES

/* POSIX stuff */
#include <sys/mman.h> /* mmap and munmap */
#include <sys/fcntl.h> /* open and close */
#include <sys/unistd.h> /* lseek */

#endif

Mapper::Mapper(){
	m_mapped=false;
	m_content=NULL;

	m_write=false;
	m_read=false;
}

void Mapper::enableWriteOperations(){
	m_write=true;
}

void Mapper::enableReadOperations(){
	m_read=true;
}

void*Mapper::mapFile(const char*file){

	if(m_mapped)
		return m_content;

	#ifdef OS_POSIX

	if(m_write && m_read){
		m_protection=PROT_READ|PROT_WRITE;
	}else if(m_write){
		m_protection=PROT_WRITE;
	}else if(m_read){
		m_protection=PROT_READ;
	}else{
		m_protection=PROT_NONE;
	}

	m_file=file;

	m_stream=open(m_file,O_RDONLY);
	m_fileSize=lseek(m_stream,0,SEEK_END);
	
	m_flags=MAP_SHARED;

	m_content=mmap(NULL,m_fileSize,m_protection,m_flags,m_stream,0);

	m_mapped=true;

	if(m_content==MAP_FAILED){
		cout<<"Error: can not map file."<<endl;
		return NULL;
	}

	#endif

	return m_content;
}

void Mapper::unmapFile(){

	if(!m_mapped)
		return;

	munmap(m_content,m_fileSize);
	close(m_stream);

	m_mapped=false;
}

uint64_t Mapper::getFileSize(){
	return m_fileSize;
}

