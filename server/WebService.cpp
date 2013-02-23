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

#include "WebService.h"

#include <iostream>
using namespace std;

/**
 * The application/json Media Type for JavaScript Object Notation (JSON) is returned.
 * See this for information:
 *
 * \see http://www.ietf.org/rfc/rfc4627.txt
 *
 * For the HTTP response, see:
 *
 * \see http://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html
 */
bool WebService::processQuery(const char*queryString){

	const char CRLF[]="\r\n";

	cout<<"X-Powered-By: Ray Cloud Browser by Ray Technologies";
	cout<<CRLF;
	cout<<"Access-Control-Allow-Origin: *";
	cout<<CRLF;
	cout<<("Content-type: application/json");
	cout<<CRLF;
	cout<<CRLF;

	if(queryString==NULL){
		cout<<"{ \"message\": \"Error: you must provide a QUERY_STRING.\" }"<<endl;

		return false;
	}

	char tag[CONFIG_MAXIMUM_VALUE_LENGTH];
	bool foundTag=m_storeRequest.getValue(queryString,"action",tag,CONFIG_MAXIMUM_VALUE_LENGTH);

	if(!foundTag){
		//cout<<"Object not found!"<<endl;
		return false;
	}

	return dispatchQuery(tag,queryString);
}

WebService::WebService(){

	registerAction("getSequenceAttributes",&m_storeRequest);
	registerAction("getSequencesAroundLocation",&m_regionVisitor);
	registerAction("getMaps",&m_mapList);
	registerAction("getRegions",&m_regionClerk);
	registerAction("getMapAttributes",&m_mapSpecialist);
	registerAction("getSequenceAnnotations",&m_annotationFetcher);

// deprecated API calls:
	registerAction("GET_FIRST_KMER_FROM_STORE",&m_earlyExplorer);
}

void WebService::registerAction(const char*actionName,WebAction*actionHandler){

	m_productManager[actionName]=actionHandler;
}

bool WebService::dispatchQuery(const char*tag,const char*queryString){

	if(m_productManager.count(tag)>0){
		WebAction*action=m_productManager[tag];
		return action->call(queryString);
	}

	cout<<"{ \"message\": \"tag not serviced\" } "<<endl;

// unmatched message tag
	return false;
}


