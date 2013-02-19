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

#include "Client.h"

#include <iostream>
#include <map>
#include <string>
using namespace std;

void Client::showUsage(){

	cout<<"This is the command dispatcher"<<endl;
	cout<<"Author: Sébastien Boisvert"<<endl;
	cout<<endl;
	cout<<"Commands named create* change information in storage buckets"<<endl;
	cout<<"Commands named describe* perform read-only operations on storage buckets"<<endl;
	cout<<endl;
	cout<<"Available commands"<<endl;
	cout<<endl;

	for(map<string,CommandInterface*>::iterator i=m_dispatcher.begin();
		i!=m_dispatcher.end();i++){

		cout<<PROGRAM_NAME<<" "<<i->first<<endl;
	}
}

void Client::registerAction(const char*actionName,CommandInterface*actionHandler){

	m_dispatcher[actionName]=actionHandler;
}

int Client::call(int argc,char**argv){

	if(argc==1){
		showUsage();
		return 0;
	}

	string command=argv[1];

	if(m_dispatcher.count(command)==0){
		cout<<"Command "<<command<<" is not available"<<endl;
		showUsage();
		return 0;
	}

	int newCount=argc-1;
	char**newArguments=argv+1;

	CommandInterface*handler=m_dispatcher[command];

	handler->call(newCount,newArguments);

	return 0;
}

Client::Client(){

	registerAction("create-section",&m_pathHelper);
	registerAction("create-map",&m_graphManager);
	registerAction("create-map-annotations-with-section",&m_annotationManager);
	registerAction("describe-map-object",&m_objectFetcher);
	registerAction("describe-map-object-annotations",&m_objectAnnotationList);
	registerAction("describe-map-annotations",&m_annotationReporter);
	registerAction("describe-map-with-region",&m_explorer);
	registerAction("describe-map",&m_mapDescriber);
	registerAction("describe-section",&m_pathProbe);
	registerAction("describe-json-file",&m_parser);
	registerAction("describe-map-objects",&m_graphExporter);
	registerAction("describe-configuration",&m_configurationReader);
}
