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

#ifndef _WebService_h
#define _WebService_h

#include <actions/StoreRequest.h>

/**
 * The Ray Cloud Browser web service.
 * This is used by the interface with the HTTP GET method.
 *
 * QUERY_STRING for the supported services with method GET:
 *
 * - list maps: 
 *   	tag=RAY_MESSAGE_TAG_GET_MAPS
 *
 * - start somewhere hard-coded:
 *   	tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE&depth=32
 *
 * - get kmers from a map:
 *   	tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&map=kmers.txt.dat&object=ACGACCGGCGACCTGGGTGTAAAGCTGAGCGAAACGCTCTGCCGAGCGAAAATCGGCAGAA&depth=512
 *
 * - get a list of regions:
 *   	tag=RAY_MESSAGE_TAG_GET_REGIONS&section=Contigs.fasta.dat
 *
 * - get kmers from a region:
 *	tag=RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION&section=Contigs.fasta.dat&region=0&location=34&kmerLength=31&readahead=512
 *
 * Development server: 
 *
 * http://localhost/~seb/Ray-Cloud-Browser/server/RayCloudBrowser.cgi
 *
 * \author Sébastien Boisvert
 */
class WebService{

	StoreRequest m_storeRequest;

	bool dispatchQuery(const char*tag,const char*queryString);

	bool call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_REGIONS(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_MAPS(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_REGION_KMER_AT_LOCATION(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_MAP_INFORMATION(const char*queryString);

public:
	WebService();
	bool processQuery(const char*queryString);

};

#endif
