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

/**
 * The Ray Cloud Browser web service.
 * This is used by the interface with the HTTP GET method.
 *
 * services with method GET: (the address can be different depending on the deployment)
 *
 * - GET /~seb/Ray-Cloud-Browser/server/RayCloudBrowser.webServer.cgi?tag=RAY_MESSAGE_TAG_GET_MAPS HTTP/1.1
 * - GET /~seb/Ray-Cloud-Browser/server/RayCloudBrowser.webServer.cgi?tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE&depth=32 HTTP/1.1
 * - GET /~seb/Ray-Cloud-Browser/server/RayCloudBrowser.webServer.cgi?tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&object=ACGACCGGCGACCTGGGTGTAAAGCTGAGCGAAACGCTCTGCCGAGCGAAAATCGGCAGAA&depth=512 HTTP/1.1
 *
 * - http://localhost/~seb/Ray-Cloud-Browser/server/RayCloudBrowser.webServer.cgi?tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&object=ACGACCGGCGACCTGGGTGTAAAGCTGAGCGAAACGCTCTGCCGAGCGAAAATCGGCAGAA&depth=512
 *
 * \author Sébastien Boisvert
 */
class WebService{

	bool getValue(const char*query,const char*name,char*value,int maximumValueLength);
	bool dispatchQuery(const char*tag,const char*queryString);

	bool call_RAY_MESSAGE_TAG_GET_KMER_FROM_STORE(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE(const char*queryString);
	bool call_RAY_MESSAGE_TAG_GET_MAPS(const char*queryString);

public:
	WebService();
	bool processQuery(const char*queryString);

};

#endif
