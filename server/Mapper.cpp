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

#include "Mapper.h"

#include <stdlib.h>
#include <iostream>
using namespace std;

#if defined(__linux__)
#define OS_POSIX

#elif defined(__GNUC__)
#define OS_POSIX

#elif defined(__APPLE__) || defined(MACOSX)
#define OS_POSIX

#elif defined(__sparc__) || defined(__sun__)
#define OS_POSIX

#elif defined(__unix__)
#define OS_POSIX

#elif defined(__CYGWIN__)
#define OS_POSIX

#elif defined(__sgi)
#define OS_POSIX

#endif


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
}

void*Mapper::mapFile(char*file){

	if(m_mapped)
		return m_content;

	m_file=file;

	m_stream=open(m_file,O_RDONLY);
	m_fileSize=lseek(m_stream,0,SEEK_END);
	
	m_content=mmap(NULL,m_fileSize,PROT_READ,MAP_SHARED,m_stream,0);

	m_mapped=true;

	if(m_content==MAP_FAILED){
		cout<<"Error: can not map file."<<endl;
		return NULL;
	}

	return m_content;
}

void Mapper::unmapFile(){

	if(!m_mapped)
		return;

	munmap(m_content,m_fileSize);
	close(m_stream);

	m_mapped=false;
}
