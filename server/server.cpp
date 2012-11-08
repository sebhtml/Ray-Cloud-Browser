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

#include <stdlib.h>
#include <stdio.h>
#include <iostream>
using namespace std;

/*
 * Add new lines in the produced json ?
 */
#define CONFIG_NEW_LINES
//#define CONFIG_HTTP_METHOD_POST

#ifdef CONFIG_NEW_LINES
#define pushNewLine() \
cout<<endl
#else
#define pushNewLine()
#endif

int main(int argc,char**argv){

	//char*queryString=getenv("QUERY_STRING");

#ifdef CONFIG_HTTP_METHOD_POST
	char*requestMethod=getenv("REQUEST_METHOD");
	int contentLength=atoi(getenv("CONTENT_LENGTH"));
	char*postData=(char*)malloc(contentLength+1);
	size_t values=fread(postData,1,contentLength,stdin);
#endif

/*
 * For the content type:
 *
 * \see http://stackoverflow.com/questions/477816/the-right-json-content-type
 * \see http://www.ietf.org/rfc/rfc4627.txt
 */

	cout<<("Content-type: application/json\n\n");

/*
 * Process the query.
 * The query is like:
 *
 * /Ray-Cloud-Browser/server/server.cgi?messageTag=RAY_HTTP_TAG_GET_KMER_INFORMATION&object=CCTCGCCCAGCAGCACTTGCGGTCGCGCCCG
 *
 * The returned json:
 *
 * \see http://json.org/
 *
 * {
 *   "messageTag": "RAY_MPI_GET_KMER_INFORMATION_REPLY",
 *   "object": "CCTCGCCCAGCAGCACTTGCGGTCGCGCCCG",
 *   "found": true,
 *   "coverage": 123,
 *   "parents": [ "A", "T" ],
 *   "children": [ "G", "C" ]
 * }
 *
 */

#ifdef CONFIG_HTTP_METHOD_POST
	free(postData);
#endif

	cout<<"{";
	pushNewLine();
	cout<<"    \"messageTag\": \"RAY_HTTP_TAG_GET_KMER_INFORMATION_REPLY\",";
	pushNewLine();
	cout<<"    \"object\": \"CCTCGCCCAGCAGCACTTGCGGTCGCGCCCG\",";
	pushNewLine();
	cout<<"    \"found\": true,";
	pushNewLine();
	cout<<"    \"coverage\": 123,";
	pushNewLine();
	cout<<"    \"parents\": [ \"A\", \"T\" ],";
	pushNewLine();
	cout<<"    \"children\": [ \"G\", \"C\" ]";
	pushNewLine();
	cout<<"}";
	pushNewLine();

	return EXIT_SUCCESS;
}
