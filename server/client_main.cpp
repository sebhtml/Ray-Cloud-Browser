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

#include <commands/ObjectFetcher.h>
#include <commands/GraphManager.h>

#include <iostream>
#include <map>
#include <string>
using namespace std;

void showUsage(map<string,CommandInterface*>&dispatcher){
	cout<<endl;
	cout<<"Available commands"<<endl;
	for(map<string,CommandInterface*>::iterator i=dispatcher.begin();
		i!=dispatcher.end();i++){

		cout<<PROGRAM_NAME<<" "<<i->first<<endl;
	}
}

int main(int argc,char**argv){

	map<string,CommandInterface*> dispatcher;

	ObjectFetcher objectFetcher;
	GraphManager graphManager;

	dispatcher["commandLineClient"]=&objectFetcher;
	dispatcher["createGraphDatabase"]=&graphManager;

	if(argc==1){
		showUsage(dispatcher);
		return 0;
	}

	string command=argv[1];

	if(dispatcher.count(command)==0){
		cout<<"Command "<<command<<" is not available"<<endl;
		showUsage(dispatcher);
		return 0;
	}

	int newCount=argc-1;
	char**newArguments=argv+1;

	CommandInterface*handler=dispatcher[command];

	handler->call(newCount,newArguments);

	return 0;
}
