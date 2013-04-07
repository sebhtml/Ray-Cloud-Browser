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

#ifndef _constants_h
#define _constants_h

#define INDEX_A 0
#define INDEX_C 1
#define INDEX_G 2
#define INDEX_T 3

#define SYMBOL_A 'A'
#define SYMBOL_C 'C'
#define SYMBOL_G 'G'
#define SYMBOL_T 'T'

#define MARKER_NO 0
#define MARKER_YES 1

#define OFFSET_NULL 0
#define ALPHABET_SIZE 4

#if defined(POSIX)
#define CONFIG_POSIX

#elif defined(__linux__)
#define CONFIG_POSIX

#elif defined(__GNUC__)
#define CONFIG_POSIX

#elif defined(__APPLE__) || defined(MACOSX)
#define CONFIG_POSIX

#elif defined(__sparc__) || defined(__sun__)
#define CONFIG_POSIX

#elif defined(__unix__)
#define CONFIG_POSIX

#elif defined(__CYGWIN__)
#define CONFIG_POSIX

#elif defined(__sgi)
#define CONFIG_POSIX
#endif

// the maximum length of a object, measured in nucleotide
#define CONFIG_MAXKMERLENGTH 256

#define CONFIG_FILE "config.json"

// the size of the binary header
#define GRAPH_HEADER_LENGTH (sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t))

// the size of extra information of a object (coverage, parents, children)
#define OBJECT_INFORMATION_LENGTH (sizeof(uint32_t)+sizeof(uint8_t))

// number of bits in one byte
#define BITS_PER_BYTE 8

// number of bits per nucleotide
#define BITS_PER_NUCLEOTIDE 2



#endif

